"use strict";

const JWT = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const KeyTokenService = require("../services/keyToken.service");

const HEADER = {
    API_KEY: "x-api-key",
    CLIENT_ID: "x-client-id",
    AUTHORIZATION: "authorization",
    REFRESHTOKEN: "x-rtoken-id",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // accessToken
        /**
         * privateKey not stored in db, it just use 1 time when signin or login success, privateKey created and push to browser (look like session)
         */
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: "2 days",
        });

        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: "7 days",
        });

        //

        // jwt verify the token by the cooperation key
        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.error(`error verify::`, err);
            } else {
                console.log(`decode verify::`, decode);
            }
        });

        return { accessToken, refreshToken };
    } catch (error) {}
};

const authentication = asyncHandler(async (req, res, next) => {
    /**
     * 1 - Check userId missing?
     * 2 - get accessToken
     * 3 - verifyToken
     * 4 - check user in dbs
     * 5 - check keyStore with this userId?
     * 6 - return next()
     */

    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new AuthFailureError("Invalid Request!");

    // 2
    const keyStore = await KeyTokenService.findByUserId(userId);
    if (!keyStore) throw new NotFoundError("Not found keyStore");
    console.log({ keyStore });

    // 3
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new AuthFailureError("Invalid Request");

    // 4
    try {
        console.log("testttt", accessToken);
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId)
            throw new AuthFailureError("Invalid UserId");
        req.keyStore = keyStore;
        req.user = decodeUser;
        return next();
    } catch (error) {
        throw error;
    }
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
    /**
     * 1 - Check userId missing?
     * 2 - get accessToken
     * 3 - check if refresh token exist => accessToken is expired
     * 3'- verifyToken
     * 4 - check user in dbs
     * 5 - check keyStore with this userId?
     * 6 - return next()
     */

    // 1
    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new AuthFailureError("Invalid Request!");

    // 2
    const keyStore = await KeyTokenService.findByUserId(userId);
    if (!keyStore) throw new NotFoundError("Not found keyStore");
    console.log({ keyStore });

    // 3
    if (req.headers[HEADER.REFRESHTOKEN]) {
        try {
            const refreshToken = req.headers[HEADER.REFRESHTOKEN];
            console.log({ refreshToken });
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
            console.log({ decodeUser });
            if (userId !== decodeUser.userId)
                throw new AuthFailureError("Invalid UserId");
            req.keyStore = keyStore;
            req.user = decodeUser;
            req.refreshToken = refreshToken;
            return next();
        } catch (error) {
            throw error;
        }
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new AuthFailureError("Invalid Request");

    // 4
    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId)
            throw new AuthFailureError("Invalid UserId");
        req.keyStore = keyStore;
        req.user = decodeUser;
        return next();
    } catch (error) {
        throw error;
    }
});

const verifyJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret);
};

module.exports = {
    createTokenPair,
    authentication,
    authenticationV2,
    verifyJWT,
};
