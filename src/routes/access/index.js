"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

// signUP
router.post("/shop/signup", asyncHandler(accessController.signUp));
router.post("/shop/login", asyncHandler(accessController.login));

// authentication - this step complete req.keystore = keyStore and req.user = decodeUser
router.use(authenticationV2);
////////////////////

router.post("/shop/logout", asyncHandler(accessController.logout));

// use keyStore and decodeUser foo handleRefreshToken
router.post(
    "/shop/handlerRefreshToken",
    asyncHandler(accessController.handlerRefreshToken)
);

module.exports = router;
