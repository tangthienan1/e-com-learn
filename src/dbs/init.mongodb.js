"use strict";

const mongoose = require("mongoose");
const {
    db: { host, port, name },
} = require("../configs/config.mongodb");
const connectString = `mongodb://${host}:${port}/${name}`;

const { countConnect } = require("../helpers/check.connect");

console.log("connectString:", connectString);

// This is Singleton pattern which help to create a single instance, init once and use whole life.
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
            .then((_) =>
                console.log(`Connected Mongodb Success!!`, countConnect())
            )
            .catch((err) => console.log(`Error db Connected!`));
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }

        return Database.instance;
    }
}

const instanceMongoDb = Database.getInstance();

module.exports = instanceMongoDb;
