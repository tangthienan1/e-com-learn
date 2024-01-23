"use strict";

const JWT = require("jsonwebtoken");
const crypto = require("crypto");

const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
});

console.log({ privateKey, publicKey });

const token = JWT.sign({ userId: 123, roles: ["test"] }, publicKey, {
    algorithm: "RS256",
    expiresIn: "2 days",
});

console.log(`Sign token::`, token);

JWT.verify(token, privateKey, (err, decode) => console.log(decode));
