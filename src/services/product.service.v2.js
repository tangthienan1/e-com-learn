"use strict";

const { BadRequestError } = require("../core/error.response");
const {
    product,
    clothing,
    electronic,
    furniture,
} = require("../models/product.model");
const { findAllDraftsForShop } = require("../models/repositories/product.repo");

// define Factory class to create product
class ProductFactory {
    static productRegistry = {}; // key - class

    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef;
    }

    static async createProduct(type, payload) {
        const ProductClass = ProductFactory.productRegistry[type];
        if (!ProductClass)
            throw new BadRequestError(`Invalid Product Types ${type}`);

        return new ProductClass(payload).createProduct();
    }

    // query //
    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true };
        const result = await findAllDraftsForShop({ query, limit, skip });
        console.log("findall", result);
        return result;
    }
}

// define base product class
class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_shop,
        product_attributes,
    }) {
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_quantity = product_quantity;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
    }

    // create new product
    async createProduct(product_id) {
        return await product.create({ ...this, _id: product_id });
    }
}

// Define sub-class for different product types Clothing
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newClothing)
            throw new BadRequestError("Create new Clothing unsuccessfully");

        const newProduct = await super.createProduct(newClothing._id);
        if (!newProduct)
            throw new BadRequestError("Create new Product unsuccessfully");

        return newProduct;
    }
}

// Define sub-class for different product types Electronics
class Electronics extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newElectronic)
            throw new BadRequestError("Create new Electronics unsuccessfully");

        const newProduct = await super.createProduct(newElectronic._id);
        if (!newProduct)
            throw new BadRequestError("Create new Product unsuccessfully");

        return newProduct;
    }
}

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newFurniture)
            throw new BadRequestError("Create new Furniture unsuccessfully");

        const newProduct = await super.createProduct(newFurniture._id);
        if (!newProduct)
            throw new BadRequestError("Create new Product unsuccessfully");

        return newProduct;
    }
}

// register product types
ProductFactory.registerProductType("Electronics", Electronics);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
