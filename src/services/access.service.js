"use strict";

const bcrypt = require("bcryptjs");

const KeyTokenService = require("./keyToken.service");

const shopModel = require("../models/shop.model");
const ShopService = require("./shop.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData, getKeyPair } = require("../utils");
const {
    BadRequestError,
    AuthFailureError,
    ForbiddenError,
} = require("../core/error.response");

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

    static handlerRefreshToken = async ({ keyStore, user, refreshToken }) => {
        /**
         * 1  - check if keyStore.refreshTokenUsed includes(refreshToken)
         * 1' - if yes => deleteKeyById(userId)
         * 2  - check if keyStore.refreshToken !== refreshToken
         * 2' - if yes => throw AuthFailureError("...")
         */
        const { userId, email } = user;

        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError(
                "Something wrong happened !! pls re-login"
            );
        }

        if (keyStore.refreshToken !== refreshToken)
            throw new AuthFailureError("Shop not registered");

        const foundShop = await findShopByEmail({ email });

        if (!foundShop) throw new AuthFailureError("Shop not registered 64");

        // create 1 cap moi
        const tokens = await createTokenPair(
            { userId, email },
            keyStore.publicKey,
            keyStore.privateKey
        );

        // update token
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokensUsed: refreshToken, // da duoc su dung de lay token moi roi
            },
        });

        return {
            user,
            tokens,
        };
    };

    static login = async ({ email, password, refreshToken = null }) => {
        /** Login
         * 1 - check email in dbs
         * 2 - match password
         * 3 - create AT & RT and save
         * 4 - generate tokens
         * 5 - get data return login
         * @param {*} param0
         */

        // 1
        const foundedShop = await ShopService.findShopByEmail({ email });
        if (!foundedShop) throw new BadRequestError("Shop not registered 100");

        // 2
        const matchedPassword = bcrypt.compare(password, foundedShop.password);
        if (!matchedPassword)
            throw new AuthFailureError("Authentication Error");

        // 3
        const { privateKey, publicKey } = getKeyPair();

        // 4
        const { _id: userId } = foundedShop;

        // create Token as JWT
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
        const holderShop = await ShopService.findShopByEmail(email);

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
             * privateKey: stored on client side (not on server side), this used for sign token
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
                    shop: getIn({
                        fields: ["_id", "name", "email"],
                        object: newShop,
                    }),
                    tokens,
                },
            };
        }

        return {
            code: 200,
            metadata: null,
        };
    };
}

module.exports = AccessService;
