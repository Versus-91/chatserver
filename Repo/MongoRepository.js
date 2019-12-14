const config = require('../config');
const mongoose = require('mongoose');

var dbURI = "mongodb://" +
    encodeURIComponent(config.db.username) + ":" +
    encodeURIComponent(config.db.password) + "@" +
    config.db.host + ":" +
    config.db.port + "/" +
    config.db.name;

class repository {

    constructor(collection) {
        this.collection = collection;
    }

    async FindAll(callback, filter = {
        'select': null,
        'skip': null,
        'limit': null,
        'sort': null
    }) {
        await this.collection.find({}, callback)
            .select(filter.select)
            .skip(filter.skip)
            .limit(filter.limit)
            .sort(filter.sort);
    }

    async FindById(id, callback, filter = {
        'select': null,
        'skip': null,
        'limit': null,
        'sort': null
    }) {
        await this.collection.findById(id, callback)
            .select(filter.select)
            .skip(filter.skip)
            .limit(filter.limit)
            .sort(filter.sort);
    }

    async FindByCondition(query, callback, filter = {
        'select': null,
        'skip': null,
        'limit': null,
        'sort': null
    }) {
        await this.collection.find(query, callback)
            .select(filter.select)
            .skip(filter.skip)
            .limit(filter.limit)
            .sort(filter.sort);
    }

    async Insert(docs) {
        await this.collection.create(docs, (err) => {
            if (err)
                throw err;
        });
    }

    async Update(query, doc) {
        this.collection.updateOne()
        await this.collection.updateOne(query, doc, (err) => {
            if (err)
                throw err;
        //console.log(doc);           
        });
    }

    async Remove(query = {}) {
        await this.collection.deleteOne(query, (err) => {
            if (err)
                throw err;
        });
    }

    async IsExist(query, callback) {
        await this.collection.exists(query, callback);
    }

    async Count(query, callback) {
        await this.collection.countDocuments(query, callback);
    }
}

module.exports = {
    repository
};