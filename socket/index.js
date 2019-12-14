//scrolle b sheddat ride vaqti unread message darim

const cityGroupId = 12;

var express = require("express");
var config = require("../config");
var path = require("path");
var cookieParser = require("cookie-parser");
var emitter = require("socket.io-emitter")(config.redis);

var mongoose = require("../Repo/MongoRepository");

var messageModel = require("../Schemas/Message");
var messageRepository = new mongoose.repository(messageModel);

var userConnectionModel = require("../Schemas/UserConnection");
var userConnectionRepository = new mongoose.repository(userConnectionModel);

var fileObject = require("../Schemas/FileObject");
var fileRepository = new mongoose.repository(fileObject);

var chatModel = require("../Schemas/Chat");
var chatRepository = new mongoose.repository(chatModel);

const TypeMessage = require("../Schemas/TypeMessageObject");
const OperatorUnit = require("../Schemas/OperatorUnit");
const UserType = require("../Schemas/TypeUser");
const ForwardObject = require("../Schemas/ForwardObject");
const SeenObject = require("../Schemas/MessageSeenObject");
const ReciveObject = require("../Schemas/MessageRecieveObject");
const BlockObject = require("../Schemas/BlockObject");
const FileType = require("../Schemas/FileType");
const Score = require("../Schemas/Score");

var User = require("../Schemas/User");
var tokenService = require("../tokenService/tokenService");

var socketIO = require("socket.io");
io = socketIO();
var app = express();
app.io = io;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/")));

io.on("connection", function(socket) {
  socket.token = socket.handshake.query.token;

  var data = tokenService.verifyToken(socket.token);

  if (!data) {
    socket.disconnect();
    return;
  }

  socket.userId = data.userId;

  if (socket.userId % 2 == 1) {
    socket.join(cityGroupId);
  }

  userConnectionRepository.FindByCondition(
    { userId: socket.userId },
    (err, connection) => {
      if (err) {
        return;
      }

      if (connection.length == 0) {
        var newConnection = new userConnectionModel({
          userId: socket.userId,
          chatIds: new Array(),
          connectionId: socket.id,
          lastSeen: new Date()
        });
        newConnection.save();
      } else {
        connection[0].connectionId = socket.id;
        socket.finalLastSeen = connection[0].lastSeen;
        connection[0].lastSeen = null;
        connection[0].chatIds.forEach(chatId => {
          socket.join(chatId);
          emitter.to(chatId).emit("user status", {
            status: true,
            chatId: chatId,
            userId: socket.userId
          });
        });
        connection[0].save();
      }
    }
  );

  ///// error
  var error = function(errorMessage) {
    socket.emit("error", errorMessage);
  };

  ///// chat
  socket.on("create chat", function(data) {
    chatRepository.FindByCondition(
      {
        $or: [
          { starterId: data.recieverId, recieverId: socket.userId },
          { starterId: socket.userId, recieverId: data.recieverId }
        ]
      },
      function(err, chats) {
        if (err) {
          error("Error in loading data");
          return;
        }

        if (chats.length == 1) {
          var soc = io.sockets.connected[data.recieverId];
          if (soc) {
            soc.join(chats[0].id);
            soc.disconnect();
          }
          emitter.to(chats[0].id).emit("make chat", chats[0]);
        } else {
          // switch (data.messageType) {
          //   case 1:
          //     typeMessage = TypeMassage.Page_Page;
          //     break;
          //   case 2:
          //     typeMessage = TypeMassage.Page_User;
          //     break;
          //   case 3:
          //     typeMessage = TypeMassage.Operator_User;
          //     break;
          //   case 4:
          //     typeMessage = TypeMassage.Operator_Page;
          //     break;
          //   case 5:
          //     typeMessage = TypeMassage.Operator_Operator;
          //     break;
          //   case 6:
          //     typeMessage = TypeMassage.Unit_Unit;
          //     break;
          //   default:
          //     throw err;
          // }

          // switch (data.senderType) {
          //   case 1:
          //     SType = UserType.User;
          //     break;
          //   case 2:
          //     SType = UserType.Page;
          //     break;
          //   case 3:
          //     SType = UserType.Operator;
          //     break;
          //   default:
          //     throw err;
          // }

          // switch (data.recieverType) {
          //   case 1:
          //     RType = UserType.User;
          //     break;
          //   case 2:
          //     RType = UserType.Page;
          //     break;
          //   case 3:
          //     RType = UserType.Operator;
          //     break;
          //   default:
          //     throw err;
          // }

          // switch (data.operatorUnit) {
          //   case 1:
          //     unit = OperatorUnit.city;
          //     break;
          //   case 2:
          //     unit = OperatorUnit.chat;
          //     break;
          //   case 3:
          //     unit = OperatorUnit.service;
          //     break;
          //   case 4:
          //     unit = OperatorUnit.transport;
          //     break;
          // }
          var starterName, recieverName;
          User.getUserName(socket.userId, function(username) {
            starterName = username;
            User.getUserName(data.recieverId, function(username) {
              recieverName = username;
              var newChat = new chatModel({
                typeMessage:
                  data.messageType == 3
                    ? TypeMessage.Operator_User
                    : TypeMessage.User_User,
                modifyDate: Date.now(),
                senderType: 0,
                recieverType: 0,
                createdDate: Date.now(),
                unit: 0,
                starterId: socket.userId,
                starterName: starterName,
                recieverId: data.recieverId,
                recieverName:
                  recieverName == null ? "چت با پشتیبانی" : recieverName,
                blockObjects: new Array(),
                ScoreAverage: 0,
                cost: 0
              });
              chatRepository
                .Insert(newChat, function(err) {
                  if (err) {
                    error("Error in saving data");
                    return;
                  }
                })
                .then(() => {
                  userConnectionModel
                    .find(
                      {
                        $or: [
                          { userId: newChat.starterId },
                          { userId: newChat.recieverId }
                        ]
                      },
                      (err, connections) => {
                        connections.forEach(connection => {
                          if (!connection) {
                            var newConnection = new userConnectionModel({
                              userId: newChat.recieverId,
                              chatIds: new Array(),
                              connectionId: socket.id,
                              lastSeen: new Date()
                            });
                            newConnection.chats.push(newChat.chatId);
                            var soc =
                              io.sockets.connected[connection.connectionId];
                            if (soc) {
                              soc.join(newChat.id);
                            }
                            newConnection.save();
                          } else {
                            connection.chatIds.push(newChat.id);
                            var soc =
                              io.sockets.connected[connection.connectionId];
                            if (soc) {
                              soc.join(newChat.id);
                            }
                            connection.save();
                          }
                        });
                      }
                    )
                    .then(() => {
                      emitter.to(newChat.id).emit("make chat", newChat);
                    });
                });
            });
          });
        }
      }
    );
  });

  socket.on("select chat", function(data) {
    console.log(data);

    var userId;
    var count;
    var objects = [];
    var skip = 0,
      limit = 0;

    chatModel.findById(data.chatId, function(err, chat) {
      userId =
        chat.starterId == socket.userId ? chat.recieverId : chat.starterId;

      userConnectionModel.find({ userId: userId }, function(err, connection) {
        socket.emit("user last seen", connection[0].lastSeen);
        messageModel.countDocuments({ chatId: data.chatId }, function(err, c) {
          count = c;
          if (data.unreadCount > 20) {
            skip = count - data.unreadCount;
            limit = data.unreadCount;
          } else if (data.unreadCount <= 20 && data.unreadCount > 0) {
            skip = count - 20;
            limit = 20;
          } else {
            skip = count - data.count < 20 ? 0 : count - data.count - 20;
            limit = count - data.count < 20 ? count - data.count : 20;
          }

          messageRepository.FindByCondition(
            { chatId: data.chatId },
            (err, messages) => {
              if (err) {
                // error("Error in loading data");
                // return;
              }

              if (count - data.count > 0) {
                messages.forEach(message => {
                  if (
                    message.seenObject.findIndex(
                      m => m.seenId == socket.userId
                    ) == -1 &&
                    message.senderId != socket.userId
                  ) {
                    message.seenObject.push(
                      new SeenObject({
                        seenId: socket.userId,
                        createdDate: Date.now()
                      })
                    );

                    objects.push({
                      messageId: message._id,
                      seenObject: message.seenObject,
                      chatId: message.chatId
                    });
                  }

                  if (
                    message.recieveObject.findIndex(
                      m => m.recieverId == socket.userId
                    ) == -1 &&
                    message.senderId != socket.userId
                  ) {
                    message.recieveObject.push(
                      new ReciveObject({
                        recieverId: socket.userId,
                        createdDate: Date.now()
                      })
                    );
                  }
                });

                socket.emit("load messages", messages);
                emitter.to(data.chatId).emit("seen", objects);

                messages.forEach(message => {
                  message.save();
                });
              }
            },
            {
              skip: skip,
              limit: limit
            }
          );
        });
      });
    });
  });

  socket.on("get history", function(messageType) {
    var chats = new Array();
    var chatObjects = [];
    if (messageType == 3) {
      chatRepository
        .FindByCondition(
          { starterId: socket.userId, typeMessage: 3 },
          (err, c) => {
            if (err) {
              error("Error in loading data");
              return;
            }

            chats = c;

            chats.forEach(chat => {
              var userId =
                chat.starterId == socket.userId
                  ? chat.recieverId
                  : chat.starterId;

              userConnectionRepository.FindByCondition(
                { userId: userId },
                function(err, doc) {
                  chat.lastSeen = doc[0].lastSeen;
                },
                {
                  select: "lastSeen"
                }
              );

              messageModel.countDocuments({ chatId: chatId }, function(
                err,
                count
              ) {
                chat.unreadCount = count;
              });
            });
          }
        )
        .then(() => {
          socket.emit("load chats", chats);
        });
    } else {
      chatRepository.FindByCondition(
        { $or: [{ starterId: socket.userId }, { recieverId: socket.userId }] },
        (err, c) => {
          if (err) {
            error("Error in loading data");
            return;
          }
          chats = c;

          var i = 0;
          chats.forEach(chat => {
            var userId =
              chat.starterId == socket.userId
                ? chat.recieverId
                : chat.starterId;

            userConnectionModel
              .find({ userId: userId }, function(err, doc) {
                i++;
                chat.lastSeen = doc[0].lastSeen;
                messageModel.find(
                  {
                    chatId: chat._id,
                    senderId: { $ne: socket.userId }
                  },
                  function(err, messages) {
                    var counter = 0;
                    messages.forEach(msg => {
                      if (
                        msg.seenObject.findIndex(
                          m => m.seenId == socket.userId
                        ) == -1
                      ) {
                        counter++;
                      }
                    });
                    chatObjects.push({ chat: chat, unreadCount: counter });
                    if (i == chatObjects.length) {
                      socket.emit("load chats", chatObjects);
                    }
                  }
                );
              })
              .select("lastSeen");
          });
        }
      );
    }
  });

  socket.on("send message", function(data) {
    if (data.text == null && data.location == null && data.fileObject == null) {
      error("Cannot Send Empty Message");
      return;
    }

    User.getUserName(socket.userId, function(username) {
      var newMessage = new messageModel({
        chatId: data.chatId,
        senderId: socket.userId,
        senderName: username,
        text: data.text,
        location: data.location,
        fileObject: data.fileObject
      });

      newMessage.save(() => {
        emitter.to(newMessage.chatId).emit("new message", newMessage);
        if (data.type == 3) {
          emitter.to(cityGroupId).emit("new request", newMessage);
        }
      });
    });
  });

  socket.on("reply message", function(data) {
    if (data.text == null) {
      error("Cannot Send Empty Message");
      return;
    }

    var replyMessage;
    messageRepository
      .FindById(data.forwardMessageId, function(err, reply) {
        replyMessage = reply;
        if (replyMessage.forward) replyMessage.forward = null;
      })
      .then(() => {
        User.getUserName(socket.userId, function(username) {
          var newMessage = new messageModel({
            chatId: data.chatId,
            senderId: socket.userId,
            senderName: username,
            text: data.text,
            location: data.location,
            fileObject: data.fileObject,
            forward: new ForwardObject({
              isReplied: true,
              message: replyMessage
            })
          });

          emitter.to(newMessage.chatId).emit("new reply", newMessage);

          newMessage.save();
        });
      });
  });

  socket.on("forward message", function(data) {
    User.getUserName(socket.userId, function(username) {
      var newMessage = new messageModel({
        chatId: data.chatId,
        senderId: socket.userId,
        senderName: username,
        text: data.message.text,
        location: data.message.location,
        fileObject: data.message.fileObject,
        forward: new ForwardObject({
          isReplied: false,
          userId:
            data.message.forward && !data.message.forward.isReplied
              ? data.message.forward.userId
              : data.message.senderId
        })
      });

      newMessage.save(() => {
        emitter.to(data.chatId).emit("new forward", {
          message: newMessage,
          user: data.message.senderName
        });
      });
    });
  });

  socket.on("edit message", function(data) {
    messageRepository.FindById(data.messageId, function(err, message) {
      if (err) {
        error("Error in loading data");
        return;
      }

      if (!message) {
        error("cannot find message");
        return;
      }

      message.text = data.text;
      messageRepository.Update({ id: data.messageId }, message);

      emitter.to(message.chatId).emit("edited message", message);
    });
  });

  socket.on("recieve message", function(messageId) {
    messageModel.findById(messageId, function(err, message) {
      if (err) {
        error("Error in loading data");
        return;
      }

      if (!message) {
        error("");
        return;
      }

      message.recieveObject.push(
        new ReciveObject({
          recieverId: socket.userId,
          createdDate: Date.now()
        })
      );

      emitter.to(message.chatId).emit("recieve", [
        {
          messageId: message._id,
          recieveObject: message.recieveObject,
          chatId: message.chatId
        }
      ]);

      message.save();
    });
  });

  socket.on("seen message", function(messageId) {
    messageRepository.FindById(messageId, function(err, message) {
      if (err) {
        error("Error in loading data");
        return;
      }

      if (!message) {
        error("cannot find message");
        return;
      }

      message.recieveObject.push(
        new ReciveObject({
          recieverId: socket.userId,
          createdDate: Date.now()
        })
      );

      message.seenObject.push(
        new SeenObject({
          seenId: socket.userId,
          createdDate: Date.now()
        })
      );

      emitter.to(message.chatId).emit("seen", [
        {
          messageId: message._id,
          seenObject: message.seenObject,
          chatId: message.chatId
        }
      ]);

      message.save();
    });
  });

  socket.on("unread messages", function(chatId) {
    userConnectionRepository.FindByCondition(
      { userId: socket.userId },
      function(err, connection) {
        var time = connection[0].lastSeen;
        messageRepository.FindByCondition(
          {
            chatId: chatId,
            senderId: { $ne: socket.userId },
            createdDate: { $gte: time }
          },
          function(err, messages) {
            socket.emit("unread", messages);
          }
        );
      }
    );
  });

  ///// file
  socket.on("upload file", function(data) {
    var fileType;

    switch (data.fileType) {
      case 1:
        fileType = FileType.voice;
        break;
      case 2:
        fileType = FileType.image;
        break;
      case 3:
        fileType = FileType.file;
        break;
      case 4:
        fileType = FileType.video;
        break;
    }

    var newFile = new fileObject({
      fileType: fileType,
      caption: data.caption,
      fileName: data.fileName,
      fileSize: fileSize,
      // set destinationUrl
      destinationUrl: ""
    });

    fileRepository.Insert(newFile);
  });

  socket.on("download file", function(data) {
    var file = fileRepository.FindByCondition({ fileName: data.fileName });
    // return file.destinationUrl
  });

  ///// user
  socket.on("block user", function(data) {
    chatRepository.FindById(data.chatId, function(err, chat) {
      if (err) {
        // error("Error in loading data");
        // return;
      }

      if (!chat) {
        error("cannot find chat");
        return;
      }

      const index = chat.blockObjects.findIndex(
        m => m.status == true && m.blockerId == socket.userId
      );
      if (index == -1) {
        var blockObject = new BlockObject({
          blockerId: socket.userId,
          isStarter: socket.userId == chat.starterId,
          isForever: data.type == 2 ? true : false,
          expireDate: new Date().setDate(new Date().getDate() + data.days),
          status: true
        });

        emitter
          .to(data.chatId)
          .emit("block", { chatId: data.chatId, block: blockObject });

        chat.blockObjects.push(blockObject);
        chat.save();
      }
    });
  });

  socket.on("unblock user", function(chatId) {
    chatRepository.FindById(chatId, function(err, chat) {
      if (err) {
        error("Error in loading data");
        return;
      }

      if (!chat) {
        error("cannot find chat");
        return;
      }

      chat.blockObjects.forEach(obj => {
        if (obj.status == true && obj.blockerId == socket.userId) {
          obj.status = false;
          emitter.to(chatId).emit("unblock", {
            chatId: chatId,
            blockId: obj._id
          });
          chat.markModified("blockObjects");
          chat.save(function(err) {
            if (err) return handleError(err);
          });
        }
      });
    });
  });

  socket.on("user banned", function(data) {
    UserBannedRepository.FindById(data.userId, function(err, userBanned) {
      if (err) {
        error("Error in loading data");
        return;
      }

      if (!userBanned) {
        error("cannot find userBanned");
        return;
      }

      var userBanned = new UserBannedModel({
        createdDate: Date.now,
        //userId :data.userId, user or page => owner is enough.
        ownerId: data.ownerId,
        operatorId: data.operatorId,
        userType: data.userType,
        expireDate: data.expireDate,
        status: data.status
      });

      UserBannedRepository.Insert(userBanned);
    });
  });

  socket.on("search users", function(data) {
    User.searchUsers(data, result => {
      socket.emit("users", result);
    });
  });

  socket.on("get user name", function(userId) {
    var username = User.getUserName(userId);
    socket.emit("username", userId, username);
  });

  ///// operator-user

  socket.on("accept request", function(chatId) {
    var systemMessage = new messageModel({
      text: "اپراتور شماره " + socket.userId + " در حال پاسخگویی است",
      chatId: chatId,
      senderId: -1,
      isNotification: true
    });

    emitter
      .to(cityGroupId)
      .emit("hide request", { chatId: chatId, userId: socket.userId });
    emitter.to(chatId).emit("new message", systemMessage);
    socket.join(chatId);
    // socket.emit("enter chat", chatId);

    userConnectionModel.find({ userId: socket.userId }, function(
      err,
      connection
    ) {
      connection[0].chatIds.push(chatId);
      connection[0].save();
    });

    systemMessage.save();
    chatModel.findById(chatId, function(err, chat) {
      chat.recieverId = socket.userId;
      chat.save();
    });
  });

  socket.on("leave chat", function(chatId) {
    socket.leave(chatId);

    var systemMessage = new messageModel({
      text: "امتیاز بدهید",
      chatId: chatId,
      senderId: socket.userId,
      isNotification: true
    });

    emitter.to(chatId).emit("new message", systemMessage);

    //این یکی توی کلاینت تعریف نشده باید تعریف بشه///////
    socket.emit("leave chat", chatId);
    ///////////////////////////////////////////////////////
    systemMessage.save();
    chatModel.findById(chatId, function(err, chat) {
      chat.recieverId = null;
      chat.save();
    });

    userConnectionModel.find({ userId: socket.userId }, function(
      err,
      connection
    ) {
      const index = connection[0].chatIds.findIndex(m => m == chatId);
      connection[0].chatIds.splice(index, 1);
      connection[0].save();
    });
  });

  socket.on("score", function(data) {
    var newScore = new Score({
      chatId: data.chatId,
      userId: socket.userId,
      operatorId: data.operatorId,
      score: data.score
    });

    var scoreAverage = 0;
    Score.find({ operatorId: data.operatorId }, (err, scores) => {
      scores.forEach(score => {
        scoreAverage = scoreAverage + score.score;
      });
      socket.emit("score", (scoreAverage + data.score) / (scores.length + 1));
    }).select("score");

    newScore.save();
  });

  /// disconnect
  socket.on("disconnect", function() {
    userConnectionModel
      .find({ userId: socket.userId }, function(err, userConnection) {
        userConnection[0].lastSeen = new Date();
        userConnection[0].connectionId = null;
        userConnection[0].chatIds.forEach(chatId => {
          emitter.to(chatId).emit("user status", {
            status: false,
            chatId: chatId,
            userId: socket.userId
          });
        });
        userConnection[0].save();
      })
      .then(() => {
        socket.disconnect();
      });
  });
});

module.exports = app;
