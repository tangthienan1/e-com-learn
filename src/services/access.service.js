"use strict";

const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const KeyTokenService = require("./keyToken.service");
const { findByEmail } = require("./shop.service");

const shopModel = require("../models/shop.model");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData, getKeyPair } = require("../utils");
const {
    BadRequestError,
    AuthFailureError,
    ForbiddenError,
} = require("../core/error.response");
const keyTokenModel = require("../models/keyToken.model");

const RoleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
};

class AccessService {
    /**
     * check this token used?
     */

    static handlerRefreshToken = async (refreshToken) => {
        console.log("32 refreshtoken", refreshToken);
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(
            refreshToken
        );

        console.log({ foundToken });

        if (foundToken) {
            // decode xem hacker la ai? vi refresh token chi duoc dung 1 lan de tao lai refreshToken
            const { userId, email } = await verifyJWT(
                refreshToken,
                foundToken.privateKey
            );

            console.log({ userId, email });
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError(
                "Something wrong happened !! pls re-login"
            );
        }

        const holderToken = await KeyTokenService.findByRefreshToken(
            refreshToken
        );
        if (!holderToken) throw new AuthFailureError("Shop not registered 53");

        // verify Token
        const { userId, email } = await verifyJWT(
            refreshToken,
            holderToken.privateKey
        );
        console.log("[2]--", { userId, email });

        // check UserId
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new AuthFailureError("Shop not registered 64");

        // create 1 cap moi
        const tokens = await createTokenPair(
            { userId, email },
            holderToken.publicKey,
            holderToken.privateKey
        );

        // update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokensUsed: refreshToken, // da duoc su dung de lay token moi roi
            },
        });

        return {
            user: { userId, email },
            tokens,
        };
    };

    /** Login
     * 1 - check email in dbs
     * 2 - match password
     * 3 - create AT & RT and save
     * 4 - generate tokens
     * 5 - get data return login
     * @param {*} param0
     */
    static login = async ({ email, password, refreshToken = null }) => {
        // 1
        const foundedShop = await findByEmail({ email });
        if (!foundedShop) throw new BadRequestError("Shop not registered 100");

        // 2
        const match = bcrypt.compare(password, foundedShop.password);
        if (!match) throw new AuthFailureError("Authentication Error");

        // 3
        const { privateKey, publicKey } = getKeyPair();

        // 4
        const { _id: userId } = foundedShop;
        const tokens = await createTokenPair(
            { userId, email },
            publicKey,
            privateKey
        );

        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            userId,
            privateKey,
            publicKey,
        });

        // 5
        return {
            metadata: {
                shop: getInfoData({
                    fields: ["_id", "name", "email"],
                    object: foundedShop,
                }),
                tokens,
            },
        };
    };

    static logout = async (keyStore) => {
        try {
            const delKey = await KeyTokenService.removeKeyById(keyStore._id);
            return delKey;
        } catch (error) {
            throw error;
        }
    };

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

            const { privateKey, publicKey } = getKeyPair();
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
