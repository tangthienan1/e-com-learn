"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

// authentication //
router.use(authentication);
////////////////////

router.post("", asyncHandler(productController.createProduct));
router.post("/publish/:id", asyncHandler(productController.createProduct));

// QUERY //
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop));
router.get(
    "/published/all",
    asyncHandler(productController.getAllPublishForShop)
);

module.exports = router;
