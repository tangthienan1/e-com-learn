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
            return {
                code: "xxxx",
                message: "keyStore error",
            };
        }
    };

    static findByUserId = async (userId) => {
        return await keyTokenModel
            .findOne({ user: new Mongoose.Types.ObjectId(userId) })
            .lean();
    };

    static removeKeyById = async (id) => {
        return await keyTokenModel.deleteOne(id);
    };

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keyTokenModel.findOne({ refreshTokensUsed: refreshToken });
    };

    static findByRefreshToken = async (refreshToken) => {
        return await keyTokenModel.findOne({ refreshToken });
    };

    static deleteKeyById = async (userId) => {
        return await keyTokenModel.deleteOne({ user: userId });
    };
}

module.exports = KeyTokenService;
