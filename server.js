// Load required packages
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var ejs = require('ejs');
var path = require('path');
var validator = require('express-validator');
var session = require('express-session');
var passport = require('passport');

var userController = require('./controllers/user');
var authController = require('./controllers/auth');



var index = require('./routes/index')
var engine = require('ejs-locals');
var flash = require('connect-flash');


/**
 *  part 1- launch database creation and add some data
 */
var models = require('./models');
var initSchema = function() {
   // models.user.create({ email: 'wejd@gmail.com', password: "U2FsdGVkX19Upph/T+cWdbnxAFEfZAUPfGTU1n0MXko=" });

}
var lunchDatabaseCreationForce = function() {
    models.sequelize.sync({ force: true }).then(function() { // in case we need to reload database config
        console.log('tables created');
        initSchema();
        console.log('rows created');
    });
}

lunchDatabaseCreationForce()

/**
 *  part1 - ends
 */


// Create our Express application
var app = express();

// Set view engine to ejs
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// Use the body-parser package in our application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Use express session support since OAuth2orize requires it
app.use(session({
    secret: 'Super Secret Session Key',
    saveUninitialized: true,
    resave: true
}));
// others
app.use(favicon(__dirname + '/public/skideev_icon_logo.png'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(validator);
// Use the passport package in our application
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.use('/', index);

// Create our Express router



// Start the server
app.listen(process.env.PORT || 3000)


module.exports = app;