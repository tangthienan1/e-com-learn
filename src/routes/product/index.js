"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

router.get(
    "/search/:keySearch",
    asyncHandler(productController.getListSearchProduct)
);
router.get("", asyncHandler(productController.findAllProducts));
router.get("/:product_id", asyncHandler(productController.findProduct));

// authentication //
router.use(authentication);
////////////////////

router.post("", asyncHandler(productController.createProduct));
router.post(
    "/publish/:id",
    asyncHandler(productController.publishProductByShop)
);

// QUERY //
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop));
router.get(
    "/published/all",
    asyncHandler(productController.getAllPublishForShop)
);

module.exports = router;
