"use strict";

const keyTokenModel = require("../models/keyToken.model");
const Mongoose = require("mongoose");

class KeyTokenService {
    static createKeyToken = async ({
        userId,
        publicKey,
        privateKey,
        refreshToken,
    }) => {
        try {
            /** Easy way
             * const tokens = await keyTokenModel.create({
             *     user: userId,
             *     publicKey,
             *     privateKey
             * });
             * return tokens ? tokens.publicKey : null
             */

            const filter = { user: userId },
                update = {
                    publicKey,
                    privateKey,
                    refreshTokenUsed: [],
                    refreshToken,
                },
                // upsert: true => replace if exist
                // new: true => create if not exist
                options = { upsert: true, new: true };

            const tokens = await keyTokenModel.findOneAndUpdate(
                filter,
                update,
                options
            );

            return tokens && tokens.publicKey;
        } catch (err) {
            return err;
        }
    };

    static findByUserId = async (userId) => {
        return await keyTokenModel
            .findOne({ user: new Mongoose.Types.ObjectId(userId) })
            .lean();
    };

    static removeKeyById = async (id) => {
        return await keyTokenModel.findByIdAndDelete(id);
    };
}

module.exports = KeyTokenService;
