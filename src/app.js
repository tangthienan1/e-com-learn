const compression = require('compression')
const express = require('express')
const { default: helmet } = require('helmet')
const morgan = require('morgan')
const app = express()

// init middlewares
app.use(morgan("dev")) // Lib to print log to user, have multiple choice as "compile", "common", "short", "tiny", "dev"
app.use(helmet()) // prevent user read what technologies we use on header like express,... through ex: curl 'http://localhost:3055/' --include
app.use(compression()) //zip payload 

// init db
require('./dbs/init.mongodb')

// init routes

app.get('/', (req, res, next)=>{
    return res.status(200).json({
        message: 'welcome'
    })
})

// handling error

module.exports = app