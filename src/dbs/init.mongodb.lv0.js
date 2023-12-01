'use strict'

//require: when require, this module is catch, and mongoose is not have any other call later!.
const mongoose = require('mongoose')


const connectString =`mongoose://localhost:...`

mongoose.connect(connectString).then(_ => console.log("connect success!")).catch(err=> console.log("Error Connected!"))

// dev
if(1 === 0){
    mongoose.set('debug', true)
    mongoose.set('debug', {color: true})
}

module.export = mongoose

/**
 * In JS, the require help us to cache the mongoose module, so it's not being called later.
 * BUT, in Java or PHP, the connect open means mongoose can call tons of time every time we connect to DB.
 */

