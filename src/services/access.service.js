"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError } = require("../core/error.response");

const RoleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
};

class AccessService {
    static signUp = async ({ name, email, password }) => {
        //.lean() return a pure js object which lighter than without lean() ~30 times
        const holderShop = await shopModel.findOne({ email }).lean();

        if (holderShop) {
            throw new BadRequestError("Error: Shop already registered!");
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newShop = await shopModel.create({
            name,
            email,
            password: passwordHash,
            roles: [RoleShop.SHOP],
        });

        if (newShop) {
            // created privateKey, publicKey base on asymmetric cryptography

            /**
             * privateKey: stored on user side (not on server side), this used for sign token
             * publicKey: stored on server side, this used for verify token
             * Ex: incase Hacker connect to our db, they just have publicKey which use for verification only.
             */

            /**
             * This is the hardcore privateKey, publicKey version
             * -->
             * const { privateKey, publicKey } = crypto.generateKeyPairSync(
             *     "rsa",
             *     {
             *         modulusLength: 4096,
             *         publicKeyEncoding: {
             *             type: "pkcs1",
             *             format: "pem",
             *         },
             *         privateKeyEncoding: {
             *             type: "pkcs1",
             *             format: "pem",
             *         },
             *     }
             * );
             */

            const privateKey = crypto.randomBytes(64).toString("hex");
            const publicKey = crypto.randomBytes(64).toString("hex");

            console.log({ privateKey, publicKey }); // save to collection KeyStore

            /**
             * privateKey, publicKey format: {
             *   privateKey: '17054c0ad1b5ac3ef4ac0d787abacf90aab8f117079aacc12f5a3f5e26f038aa2fbc48d5c9b0fd178e0f899620a4a4f08bd0dd61c4cb5556b4b5321040199171',
             *   publicKey: 'a596ef6047a921b9f2159c15bf01e4e22f995f36ed18f40bfd67dd38e6752f2a85b5a3e0acbf51cf53707a7743bc337e4178bd43072cc46a64f76a723413a8f5'
             * }
             */

            /**
             * publicKey: rsa format - cannot store to mongodb
             * publicKeyString: publicKey.string()
             * publicKeyObject: encode publicKeyString to publicKey
             */

            // Store key to mongoDb
            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey,
            });

            if (!keyStore) {
                // throw new BadRequestError('Error: ')
                return {
                    code: "xxxx",
                    message: "keyStore error",
                };
            }

            // created token pair
            const tokens = await createTokenPair(
                { userId: newShop._id, email },
                publicKey,
                privateKey
            );

            console.log(`Token created Success::`, tokens);

            return {
                code: 201,
                metadata: {
                    shop: getInfoData({
                        fields: ["_id", "name", "email"],
                        object: newShop,
                    }),
                    tokens,
                },
            };
            // const tokens = await
        }

        return {
            code: 200,
            metadata: null,
        };
    };
}

module.exports = AccessService;
