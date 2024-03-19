"use strict";

const _ = require("lodash");
const crypto = require("crypto");

const getInfoData = ({ fields = [], object = {} }) => {
    return _.pick(object, fields);
};

const getKeyPair = () => {
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
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");
    return { privateKey, publicKey };
};

module.exports = {
    getInfoData,
    getKeyPair,
};
