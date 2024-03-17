const apiKeyModel = require("../models/apiKey.model");

const findApiKeyByKey = async (key) => {
    const objKey = await apiKeyModel.findOne({ key, status: true }).lean();
    return objKey;
};

module.exports = {
    findApiKeyByKey,
};
