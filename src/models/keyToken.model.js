"use strict";

const { Schema, model } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Key";
const COLLECTION_NAME = "Keys";

// Declare the Schema of the Mongo model
const keyTokenSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Shop",
        },
        privateKey: {
            type: String,
            require: true,
        },
        publicKey: {
            type: String,
            required: true,
        },
        // refresh token da duoc su dung
        refreshTokensUsed: {
            type: Array,
            default: [],
        },
        refreshToken: {
            type: String,
            required: true,
        },
    },
    {
        collection: COLLECTION_NAME,
        timestamps: true,
    }
);

//Export the model
module.exports = model(DOCUMENT_NAME, keyTokenSchema);
