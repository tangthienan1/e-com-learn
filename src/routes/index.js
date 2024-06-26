"use strict";

const express = require("express");
const { verifyApiKey, permission } = require("../auth/checkAuth");
const router = express.Router();

// verifyApiKey to check if x-api-key exist then req.apiKey = find
router.use(verifyApiKey);

// check permission which map from x-api-key
router.use(permission("0000"));

router.use("/v1/api/product", require("./product"));
router.use("/v1/api", require("./access"));

router.get("/health", (req, res, next) => {
    return res.status(200).json("OK!");
});

module.exports = router;
