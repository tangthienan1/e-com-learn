"use strict";

const {
    product,
    electronic,
    clothing,
    furniture,
} = require("../../models/product.model");

const findAllDraftsForShop = async ({ query, limit, skip }) => {
    return await product
        .find(query)
        .populate("product_shop", "name email -_id") // take name + email except id
        .sort({ updateAt: -1 }) // latest first sorting
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
};

module.exports = {
    findAllDraftsForShop,
};
