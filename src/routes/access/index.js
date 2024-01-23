"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

// signUP
router.post("/shop/signup", asyncHandler(accessController.signUp));
router.post("/shop/login", asyncHandler(accessController.login));

// authentication //
router.use(authentication);
////////////////////
router.post("/shop/logout", asyncHandler(accessController.logout));
router.post(
    "/shop/handlerRefreshToken",
    asyncHandler(accessController.handlerRefreshToken)
);

router.get("/health", (req, res, next) => {
    return res.status(200).json({
        status: OK,
    });
});
module.exports = router;
