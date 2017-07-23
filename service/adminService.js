/**
 * Created by abdelhamid on 18/02/2016.
 */
var express = require('express');
//var connection = require('./../dbconnector/dbconnector')();
var http = require('http');


var pg = require('pg');
pg.defaults.ssl = false;
var config = require('./../config/dbconfig.json');
var conString = config.App.conString;
var models = require('./../models');
var CryptoJS = require("crypto-js");

var updateAdminLoginDate = function(admin, callback) {
    console.log('adin updateAdminLoginDate ', admin)
    dateLastLogin = admin.last_login
    var adminToUpdate = admin

    adminToUpdate.last_login = new Date()

    adminToUpdate.last_connection = dateLastLogin


    models.admin.findOne({ where: { id: admin.id } }).then(function(userToUpdate) {

        userToUpdate.update(adminToUpdate).then(function(result) {
            console.log('************************* result')
            if (!result) {
                console.log(' eroor while performing requestupdate admin time log ', log)
                callback(false)
            } else {
                callback({ success: 'admin log date ok', admin_id: admin.id });
            }
        });

    });


}

var changeAdminPassword = function(admin_id, old_password, new_password, callback) {
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query("SELECT * FROM admins WHERE id = $1", [admin_id], function(err, rows) {
            if (!err) {



                if (!((CryptoJS.AES.decrypt(rows.rows[0].admin_password.toString(), 'a4f8071f-c873-4447-8ee2-a4f8071f-c873-4447-8ee2').toString(CryptoJS.enc.Utf8)) == old_password)) {
                    callback({ success: 'invalid password' });

                }

                updateAdminPaswword(admin_id, new_password, function(updatedAdmin) {

                    console.log('updated')
                });

            } else {
                console.log('Error while performing admin login date updating Query. ' + err);

            }



        });
        ok()

    });




}


var updateAdminPaswword = function(admin_id, new_password, callback) {
    passwordCypher = CryptoJS.AES.encrypt(new_password.toString(), 'a4f8071f-c873-4447-8ee2-a4f8071f-c873-4447-8ee2').toString();
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query("UPDATE  admins SET admin_password= $1 where id=$2", [passwordCypher, admin_id], function(err, rows) {


            if (!err) {
                console.log("admin password changed successfully");
                callback({ success: 'password changed' });
            } else {
                console.log('Error while performing admin login date updating Query.');
                return "false";
            }
        });

        ok()
    });


}

// Query new users from table users
var getAdminLastLogin = function(admin_id, callback) {


    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query("SELECT * FROM admins WHERE id = $1", [admin_id], function(err, rows) {
            if (!err) {
                console.log("getAdminLastLogin");
                callback(rows.rows[0]);
            } else {
                console.log('getAdminLastLogin : Error while performing Query.');
            }



        });
        ok()
    })




};






// Function to get CurrentTime to insert into table
function getUTCDateTime_for_db() {

    var date = new Date();

    var hour = date.getUTCHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getUTCMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getUTCSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getUTCFullYear();

    var month = date.getUTCMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getUTCDate();
    day = (day < 10 ? "0" : "") + day;



    time = year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
    console.log("getUTCDateTime_for_db: " + time);
    return time;

}


exports.updateAdminLoginDate = updateAdminLoginDate;

exports.changeAdminPassword = changeAdminPassword;