"use strict";

const {
    product,
    electronic,
    clothing,
    furniture,
} = require("../../models/product.model");
const { Types } = require("mongoose");

const findAllDraftsForShop = async ({ product_shop, limit, skip }) => {
    const query = { product_shop, isDraft: true };
    return await queryProduct({ query, limit, skip });
};

const findAllPublishForShop = async ({ product_shop, limit, skip }) => {
    const query = { product_shop, isPublished: true };
    return await queryProduct({ query, limit, skip });
};

const searchProductByUser = async ({ keySearch }) => {
    const regexSearch = new RegExp(keySearch);
    const results = await product
        .find(
            {
                isPublished: true,
                $text: { $search: regexSearch },
            },
            { score: { $meta: "textScore" } }
        )
        .lean();

    return results;
};

const queryProduct = async ({ query, limit, skip }) => {
    return await product
        .find(query)
        .populate("product_shop", "name email -_id") // take name + email except id
        .sort({ updateAt: -1 }) // latest first sorting
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
};

const publishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
    });

    if (!foundShop) return;

    foundShop.isDraft = false;
    foundShop.isPublished = true;
    const { modifiedCount } = await foundShop.updateOne(foundShop);

    return modifiedCount;
};

const unPublishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
    });

    if (!foundShop) return;

    foundShop.isDraft = true;
    foundShop.isPublished = false;
    const { modifiedCount } = await foundShop.updateOne(foundShop);

    return modifiedCount;
};

module.exports = {
    findAllDraftsForShop,
    findAllPublishForShop,
    publishProductByShop,
    unPublishProductByShop,
    searchProductByUser,
};
