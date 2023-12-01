"use strict";

const mongoose = require("mongoose");

const connectString = `m`;

mongoose.connect();

// This is Singleton pattern which help to create a single instance, init one time and use whole life.
class Database {
    constructor() {
        this.connect();
    }

    connect() {
        if (1 === 0) {
            mongoose.set("debug", true);
            mongoose.set("debug", { color: true });
        }

        mongoose
            .connect(connectString)
            .then((_) => console.log(`Connected Mongodb Success!!`))
            .catch((err) => console.log(`Error Connected!`));
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }

        return Database.instance
    }
}

const instanceMongoDb = Database.getInstance();

module.exports = instanceMongoDb
