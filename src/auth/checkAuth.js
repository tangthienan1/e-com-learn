"use strict";

const { findApiKeyByKey } = require("../services/apiKey.service.js");

const HEADER = {
    API_KEY: "x-api-key",
    AUTHORIZATION: "authorization",
};

const verifyApiKey = async (req, res, next) => {
    try {
        const key = req.headers[HEADER.API_KEY]?.toString();
        if (!key) {
            return res.status(403).json({
                message: "Forbidden Error",
            });
        }

        const apiKey = await findApiKeyByKey(key);
        if (!apiKey) {
            return res.status(403).json({
                message: "Forbidden Error",
            });
        }
        req.apiKey = apiKey;
        return next();
    } catch (error) {
        console.log(error);
    }
};

const permission = (permission) => {
    return (req, res, next) => {
        if (!req.apiKey.permissions) {
            return res.status(403).json({
                message: "permission denied",
            });
        }

        const validPermission = req.apiKey.permissions.includes(permission);
        if (!validPermission) {
            return res.status(403).json({
                message: "permission denied",
            });
        }

        return next();
    };
};

module.exports = {
    verifyApiKey,
    permission,
};
