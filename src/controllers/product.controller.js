"use strict";

const ProductServiceV2 = require("../services/product.service.v2");
const { SuccessResponse } = require("../core/success.response");

class ProductController {
    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Create new Product success!",
            metadata: await ProductServiceV2.createProduct(
                req.body.product_type,
                {
                    ...req.body,
                    product_shop: req.user.userId,
                }
            ),
        }).send(res);
    };

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Update Product success!",
            metadata: await ProductServiceV2.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    // QUERY //
    /**
     * @description Get all Drafts for shop
     * @param {Number} limit
     * @param {Number} skip
     * @return {JSON}
     */
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list Draft success!",
            metadata: await ProductServiceV2.findAllDraftsForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    /**
     * @description Get all Published for shop
     * @param {Number} limit
     * @param {Number} skip
     * @return {JSON}
     */
    getAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list Publish success!",
            metadata: await ProductServiceV2.findAllPublishForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list getAllPublishShop success!",
            metadata: await ProductServiceV2.searchProducts(req.params),
        }).send(res);
    };
    // END QUERY //
}

module.exports = new ProductController();
