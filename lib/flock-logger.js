/*!
 * flock-logger
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var fs = require('fs'),
    path = require('path');


/**
 * Initialize Logger
 *
 * @api public
 */

function Logger() {

}
/**
 * Logger methods
 */
Logger.prototype = {

    /**
     * Logger Model Initialization
     *
     * @return {Logger}
     * @api public
     */
    initModel: function() {
        var self = this;

        if (self.mongoose) {
            self.mongoose.model('Log', new self.mongoose.Schema({
                level:{
                    type: String,
                    trim: true
                },
                message: {
                    type: String,
                    trim: true
                },
                created: {
                    type: Date,
                    default: Date.now
                },
            }));
        }

        return self;
    },

    /**
     * Logger Routes Initialization
     *
     * @return {Logger}
     * @api public
     */
    initRoutes: function() {
        var self = this;

        self.app.get('/logger/filterByDateMessage', function(req, res) {
            var reqDate=req.param('reqDate')
            var reqMessage=req.param('reqMessage')
            var condition={$and:[]}

            if(reqdate){
                var filterDate=new Date(reqDate)
                condition.$and.push({"created": {"$gte": filterDate
                    ,"$lt": new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate()+1)}})
            }
            if(reqMessage){
                condition.$and.push({message: new RegExp(reqMessage,'i')})
            }

            self.mongoose.models.Log.find(condition).sort('-created').exec(function(err, logs) {
                if (err) {
                    res.render('error', {
                        status: 500
                    });
                } else {
                    res.jsonp(logs);
                }
            });
        });

        self.app.get('/logger/show', function(req, res) {
            self.mongoose.models.Log.find().sort('-created').exec(function(err, logs) {
                if (err) {
                    res.render('error', {
                        status: 500
                    });
                } else {
                    res.jsonp(logs);
                }
            });
        });

        return self;
    },

    /**
     * Initializng
     *
     * @param {Express} app
     * @param {Passport} passport
     * @param {Mongoose} mongoose
     * @return {Logger}
     * @api public
     */
    init: function(app, passport, mongoose) {
        var self = this;

        //Checking for valid init 
        if (!app || !passport || !mongoose) {
            throw new Error('Logger Could not Initialize!');
        }

        //Setting app global variables
        self.app = app;
        self.passport = passport;
        self.mongoose = mongoose;

        //Initializing Module Functionality
        self.initRoutes();
        self.initModel();

        return this;
    },

    /**
     * Log message
     *
     * @param {String} message
     * @param {String} level
     * @return {Logger}
     * @api public
     */

    log: function(level,message) {
        var self = this;
        var log = new self.mongoose.models.Log();
        console.log("Type:" + level)
        if (arguments.length === 1){
            log.level="info"
            log.message = level
        }else{
            log.level=level || "info"
            log.message = message
        }
        log.save();
        return this;
    },

    /**
     * print message
     *
     * @param {String} message
     * @param {String} type
     * @return {Logger}
     * @api public
     */
    print:function(message,type) {
        console.log(type+":"+message);
        return this;
    }

}

var logger = module.exports = exports = new Logger;
