// Load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy
var LocalStrategy = require('passport-local').Strategy;
var User = require('./../models/user');


var pg = require('pg');
pg.defaults.ssl = false;
var config = require('./../config/dbconfig.json');
var conString = config.App.conString;
var models = require('./../models');
var userService = require('./../service/usersService')

var CryptoJS = require("crypto-js");
var adminService = require('./../service/adminService');
passport.serializeUser(function(user, done) {


    done(null, user); //for admn auth
});



// used to deserialize the user
passport.deserializeUser(function(user, done) {
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {
            return console.error('could not connect to the database ' + err);
        }

        if (user.role == 'admin') {

            dbclient.query("select * from admins where id = $1", [user.id], function(err, rows) { //for admn auth
                if (!err) {
                    done(err, rows.rows[0]);
                } else {
                    done(false)
                }


            });
        } else {
            dbclient.query("select * from users where id = $1", [user.id], function(err, rows) { //for admn auth
                if (!err) {
                    done(err, rows.rows[0]);
                } else {
                    done(false)
                }


            });
        }



        ok(); //release to the pool
    });

});
passport.use(new BasicStrategy(
    function(username, password, callback) {
        console.log('inside isAuthenticated')
        models.user.findOne({ where: { username: username } }).then(function(user) {

            if (!user) { return callback(false); }

            // No user found with that username
            if (!user) { return callback(null, false); }
            user = user.dataValues
                // Make sure the password is correct

            userService.checkPassword(user.password, password, function(isMatch) {


                // Password did not match
                if (!isMatch) { return callback(null, false); }

                // Success
                return callback(null, user);
            });
        });
    }
));

passport.use('client-basic', new BasicStrategy(
    function(username, password, callback) {
        models.client.findOne({ where: { idClient: username } }).then(function(client) {
            if (!client) { return callback(false); }

            // No client found with that id or bad password
            if (!client || client.secret !== password) { return callback(null, false); }

            // Success
            return callback(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    function(accessToken, callback) {
        console.log('inside bearer ')
        models.token.findOne({ where: { value: accessToken } }).then(function(token) {
            if (!token) { return callback(false); }

            // No token found
            if (!token) { return callback(null, false); }

            models.user.findOne({ where: { id: token.userId } }).then(function(user) {
                if (!user) { return callback(false); }

                // No user found
                if (!user) { return callback(null, false); }

                // Simple example with no scope
                callback(null, user, { scope: '*' });
            });
        });
    }
));
var rsacrypt = require("./../utils/rsacrypt.js");
var NodeRSA = require('node-rsa');
var rsaEncrypter = new NodeRSA('-----BEGIN PRIVATE KEY-----\n' +
    'MIIBVQIBADANBgkqhkiG9w0BAQEFAASCAT8wggE7AgEAAkEAg1gWEYZI63BnCnvp\n' +
    '4/XCg7FXvF9YP6f87zMwF3gBXImAG6mCcfCmOZWY34wGLnm8L4yhF65HVxVeJ0hs\n' +
    '9cyuCwIDAQABAkBojIpsgq6ysnNi9gXUjkC6YUUMTfzKFucQZHeIht7Wj/yjHk9A\n' +
    'Rb10rIzE0Gp6kZz8r94H9qV9ijrV+0aoAooxAiEAwIT/wrZMCgW5gQDFzJyb68NP\n' +
    'TFlhTXXoai5fHER2N+kCIQCupyHeUoS9DNTyLiOysTgHDLHgU/IsfOLZxqjwGcEx\n' +
    '0wIgOeWFeQwTsAvqrrYJxi/u4CcbaO2USpRD8fLCHaElIEkCIQCNH1kbhnvhMiwi\n' +
    '4CtSKSaHc7eK9um5DtRSedZp47WapwIhAKvAoJMRA5Wv+t2tSAElvp3jFXbpcOcx\n' +
    'hM0PM3Dn/JK9\n' +
    '-----END PRIVATE KEY-----');

passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        console.log('inside local-login auth')
        models.user.findOne({ where: { username: req.body.username } }).then(function(user) {

            if (!user) { return done(false) }

            // No user found with that username
            if (!user) { done(false) }
            user = user.dataValues
                // Make sure the password is correct
            console.log('user . password ', user.password)
            console.log('req.body  password ', req.body.password)
            userService.checkPassword(rsaEncrypter, user.password, req.body.password, function(isMatch) {


                // Password did not match
                if (!isMatch) { return done(false) }

                // Success

                return done(user)


            })
        })

    }))

passport.use('local-login-admin', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form


        console.log('verifying user');
        models.user.findOne({ where: { email: email } }).then(function(rows) {
            // connection.query("SELECT * FROM users WHERE admin_name = ?", admin_name, function(err, rows) {

            if (!rows)
                return done(null);


            //console.log(CryptoJS.AES.decrypt(rows.dataValues.password.toString(), 'a4f8071f-c873-4447-8ee2-a4f8071f-c873-4447-8ee2').toString(CryptoJS.enc.Utf8))
            
           // if (!((CryptoJS.AES.decrypt(rows.dataValues.password.toString(), 'a4f8071f-c873-4447-8ee2-a4f8071f-c873-4447-8ee2').toString(CryptoJS.enc.Utf8)) == password)) {
if (!(rows.dataValues.password.toString() == password)) {
                return done(null, false);
            }



 return done(null, rows.dataValues);


        });




    }));



exports.isAuthenticated = passport.authenticate(['basic', 'bearer'], { session: false });
exports.isClientAuthenticated = passport.authenticate('client-basic', { session: false });
exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });
exports.isLocalStategie = passport.authenticate('local-login', { session: true });