/** 
数据库连接

*/


const mongoose = require('mongoose')
const config = require('../config/config')

const dbURI = config.database

mongoose.Promise = global.Promise
mongoose.connect(dbURI, { useNewUrlParser: true })

mongoose.connection.on('connected', function () {
    console.log('Mongoose connected to ' + dbURI)
})
mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error: ' + err)
})
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected')
})

// Shutdown处理
const gracefulShutdown = function (msg, callback) {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected through ' + msg)
        callback()
    })
}

// For nodemon restarts
process.once('SIGUSR2', function () {
    gracefulShutdown('nodemon restart', function () {
        process.kill(process.pid, 'SIGUSR2')
    })
})

// For app termination
process.on('SIGINT', function () {
    gracefulShutdown('app termination', function () {
        process.exit(0)
    })
})

// For Heroku app termination
process.on('SIGTERM', function () {
    gracefulShutdown('Heroku app termination', function () {
        process.exit(0)
    })
})

// Bring in your schemas & models
require('./category')
require('./content')
require('./user')
require('./userinfo')
require("./file");
require("./follow")
require("./favorite")
require("./emailvalidation");
require("./verification");

