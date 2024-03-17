"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

// authenticationV2 //
router.use(authenticationV2);
////////////////////
router.post("", asyncHandler(productController.createProduct));

// QUERY //
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop));

module.exports = router;
