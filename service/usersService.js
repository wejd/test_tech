/**
 * Created by abdelhamid on 18/02/2016.
 */
var express = require('express');
//var connection = require('./../dbconnector/dbconnector')();
var http = require('http');

var XLSX = require('./../utils/write_xls');

var pg = require('pg');
pg.defaults.ssl = false;
var config = require('./../config/dbconfig.json');
var conString = config.App.conString;
var models = require('./../models');
var CryptoJS = require("crypto-js");


var cryptoConfig = require('./../config/cryptConf')
var addUserService = function(req, res, cb) {
    var result;
    req.body.username = req.body.email
    models.user.create(req.body).then(function(userInserted) {
        cb(rows)
    })


};
var adduser = function(user, cb) {

    //user.password = CryptoJS.AES.encrypt(user.password,'a4f8071f-c873-4447-8ee2-a4f8071f-c873-4447-8ee2').toString(;
	console.log('***********',user.password)
		models.user.findOne({where:{email: user.email}}).then(function(userFound){
				
			if(userFound){
				return cb(null)
		
			}else{
						 models.user.create(user).then(function(userCreated) {
        return cb(userCreated)
    });
			}
		
		})

   

};

// Query new users from table users
var getNewUserList = function(cb) {

    // We show only user registred the last 7 days
    //var newUserDateCritera = getNewUserDateCritera();
    var newUserDateCritera = new Date();
    newUserDateCritera.setDate(newUserDateCritera.getDate() - 7);


    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query("Select USR.id, USR.name, USR.email, USR.date_registred, USRACK.user_id, USRACK.activation_key_id,ack.id, ack.activation_key FROM activation_keys as ACK, users_activation_keys as USRACK, users as USR where USR.date_registred >= $1 and USR.date_registred <= now() and USRACK.user_id=USR.id and USRACK.activation_key_id=ack.id", [newUserDateCritera], function(erreur, rows) {



            if (!erreur) {
                console.log("getNewUserList", rows.rows);
                return cb(rows.rows);
            } else {
                console.log('getNewUserList Error while performing admin login date updating Query.', err);
                return cb([])
            }
        });

        ok()
    });


};

// Query active users from table users
var getActiveUserList = function(cb) {

    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query("SELECT distinct USR.id, USR.name, USR.email, USR.date_registred, USRDEV.user_id, USRACK.user_id, USRACK.activation_key_id, ack.id, ack.activation_key FROM users_devices as USRDEV, activation_keys as ACK, users as USR, users_activation_keys as USRACK where USRDEV.user_id::integer=USR.id and USRACK.activation_key_id=ack.id and USRACK.user_id=USR.id", function(err, rows) {


            if (!err) {
                console.log("getActiveUserList");
                cb(rows.rows);
            } else {
                console.log('getActiveUserList : Error while performing Query: ' + err);
                return cb([])
            }
        });

        ok()
    });


};

// Query active users from table users
var getBannedUserList = function(cb) {
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query("SELECT USR.id, USR.name, USR.email, USR.date_registred, USRACK.user_id, USRACK.activation_key_id, ack.id, ack.activation_key FROM activation_keys as ACK, users as USR, users_activation_keys as USRACK where USRACK.activation_key_id=ack.id and USRACK.user_id=USR.id and USR.banned=1 ", function(err, rows) {



            if (!err) {
                console.log("getBannedUserList");
                cb(rows.rows);
            } else {
                console.log('getBannedUserList : Error while performing Query: ' + err);
                cb([])
            }
        });

        ok();
    });



};


// Query all users from table users
var getAllUserList = function(cb) {
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query("SELECT * FROM users", function(err, rows) {


            if (!err) {
                console.log("getAllUserList");;
                cb(rows);
            } else {
                console.log('getAllUserList Error while performing admin login date updating Query.');
                return "false";
            }
        });

        ok()
    });



};


var getUserInfo = function(user_id, callback) {

    console.log("getUserInfo: " + user_id);
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query("SELECT * FROM users as USR, activation_keys as ACK,users_activation_keys as USRACK WHERE USRACK.user_id=USR.id and USRACK.activation_key_id=ack.id and USR.id=$1", [user_id], function(err, rows) {


            if (!err) {
                console.log("user info successfully");
                callback(rows.rows);
            } else {
                console.log('getUserInfo Error while performing admin login date updating Query.');
                return "false";
            }
        });

        ok()
    });



}

var getUsersDeviceInfo = function(users_by_key_list, callback) {

    users_ids = [];

    for (i = 0; i < users_by_key_list.length; i++) {

        users_ids[i] = users_by_key_list[i].user_id;
        console.log("user id: " + users_ids[i]);
    }

    console.log("getUserInfo: " + users_ids);
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query("SELECT * FROM users_devices as USRDEV WHERE USRDEV.user_id IN ($1)", [users_ids], function(err, rows) {


            if (!err) {
                console.log("user device info successfully: " + rows.length);
                callback(rows);
            } else {
                console.log('getUsersDeviceInfo Error while performing admin login date updating Query.');
                return "false";
            }
        });

        ok()
    });


}

var getUserDeviceInfo = function(user_info_id, callback) {

    console.log("getUserInfo: " + user_info_id);
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query("SELECT * FROM users_devices as USRDEV WHERE USRDEV.user_id=$1", [user_info_id], function(err, rows) {


            if (!err) {
                console.log("user device info successfully");
                callback(rows.rows);
            } else {
                console.log('getUserDeviceInfo Error while performing admin login date updating Query.');
                return "false";
            }
        });

        ok()
    });


}

var banUser = function(user_id, callback) {
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query("UPDATE users as USR SET USR.banned=1 where USR.user_id=$1", [user_id], function(err, rows) {


            if (!err) {
                console.log("user banned successfully");
                callback({ success: 'user banned', user_id: user_id });
            } else {
                console.log('banUser Error while performing admin login date updating Query.');
                return "false";
            }
        });

        ok()
    });



}

var authorizeUser = function(user_id, callback) {
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query("UPDATE users as USR SET USR.banned=0 where USR.user_id=$1", [user_id], function(err, rows) {


            if (!err) {
                console.log("user authorized successfully");
                callback({ success: 'user authorized', user_id: user_id });
            } else {
                console.log('authorizeUser Error while performing admin login date updating Query.');
                return "false";
            }
        });

        ok()
    });



}


//update
var updateUserService = function(req, res, cb) {
    var result;
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query("update  users  set $1 where id = $2", [req.body, req.body.id], function(err, rows) {


            if (!err) {
                cb(rows);

                console.log('updated')
            } else {
                console.log('updateUserService Error while performing admin login date updating Query.');
                return "false";
            }
        });

        ok()
    });



};

// Query all activation_keys from table users
var getAllActivationKeys = function(cb) {
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query("SELECT A.id, A.activation_key ,count(B.user_id) AS active_users,A.exported from activation_keys AS A LEFT JOIN users_activation_keys AS B ON (A.id=B.activation_key_id) where A.is_web_key =0 GROUP BY A.id ", function(err, rows) {


            if (!err) {

                cb(rows.rows);
            } else {
                console.log('getAllActivationKeys :Error while performing Query.');
                cb([])
            }

        });

        ok()
    });



};
//**********************************************************

var getActivationKeyForWebUsers = function(cb) {
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query("SELECT A.id, count(B.user_id) AS active_users,A.exported , A.activation_key from activation_keys AS A LEFT JOIN users_activation_keys AS B ON ( A.id=B.activation_key_id) where A.is_web_key =1 GROUP BY A.id ", function(err, rows) {


            if (!err) {

                cb(rows.rows);
            } else {
                console.log('getActivationKeyForWebUsers : Error while performing Query.');
                return "false";
            }

        });

        ok()
    });





}

//*********************************************************

// Query all activation_keys from table users
var getUsersByActivationKey = function(req, res, cb) {

    var activation_key = req.body.activation_key;
    // var active_users_number = req.body.active_users;

    console.log("Request body activation_key: ", activation_key);
    //  console.log("Request body active_users_number: " + active_users_number);

    //  var query = 'SELECT USR.date_registred, USR.email  from activation_keys as AK, users_activation_keys as USRAK, users as USR where AK.activation_keys=? and USRAK.activation_key_id=AK.id_keys and USRAK.user_id=USR.id ';


    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query("SELECT * from activation_keys as AK, users_activation_keys as USRAK, users as USR where AK.activation_key=$1  and USRAK.activation_key_id=AK.id and USRAK.user_id=USR.id", [activation_key], function(err, rows) {


            if (!err) {

                console.log('usersService JS : Query success: ', rows.rows);
                cb(rows.rows);
            } else {
                console.log('getUsersByActivationKey : Error while performing Query.' + err);
                return "false";
            }
        });

        ok()
    });




};


// BULK Insert Activation Keys (Multiple insert at once)
var insertActivationKeys = function(uuidList, res, cb) {

    var values = ''

    for (i = 0; i < uuidList.length; i++) {
        // array.push([value(i)])
        values = values + "('" + uuidList[i].id + "',0,0),"
            // values.push((uuidList[i].id));

    }
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }
        values = values.slice(0, values.length - 1)
        console.log('values to add ', values)
        dbclient.query("INSERT INTO activation_keys(activation_key,exported,is_web_key) VALUES " + values, function(err, rows) {

            if (!err) {
                console.log('insertActivationKeys JS : Query success: ');
                cb('done');
            } else {
                console.log('insertActivationKeys : Error while performing Query: ', err);
                return "false";
            }
        });

        ok()
    });


};


// Export a number of activation keys from data base to .xslsx file
var exportActivationKeys = function(req, res, cb) {

    var export_number = req.body.export_number;
    console.log("Export key number: " + export_number);

    // Check if the exported keys in table is more than the entry
    var none_exported_keys_query_number = ' SELECT *   from activation_keys where activation_keys.exported=0 and activation_keys.is_web_key =0 ';
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query(none_exported_keys_query_number, function(err, result) {


            if (!err) {

                console.log('non exported activation keys number: ', result.rowCount)

                if (export_number <= result.rowCount) {


                    var none_exported_keys_query_array = 'SELECT ack.id,ack.activation_key from activation_keys As ACK WHERE ACK.exported=0 and ACK.is_web_key =0 LIMIT ' + export_number;
                    pg.connect(conString, function(err, dbclient, ok) {

                        if (err) {

                            return console.error('could not connect to the database ' + err);
                        }

                        dbclient.query(none_exported_keys_query_array, function(err, rows) {


                            if (!err) {
                                var id_values = [];
                                var activation_keys_values = [];
                                var value_to_update = ""

                                for (i = 0; i < rows.rows.length; i++) {

                                    console.log("none_exported_keys_query_array: id: " + rows.rows[i].id);
                                    console.log("none_exported_keys_query_array: activation key" + rows.rows[i].activation_key);
                                    value_to_update = rows.rows[i].id + ',' + value_to_update
                                    id_values.push([rows.rows[i].id]);
                                    activation_keys_values.push([rows.rows[i].activation_key]);

                                }
                                value_to_update = '(' + value_to_update.slice(0, value_to_update.length - 1) + ')'
                                updateNoneExportedKeys(value_to_update, activation_keys_values, cb);

                            } else {
                                console.log('exportActivationKeys 1Error while performing admin login date updating Query.', err);
                                return "false";
                            }
                        });

                        ok()
                    });



                } else {

                    console.log('Entry Value is more than none exported keys in table.');
                    cb('unavailable_none_exported_keys');
                    return;
                }
            } else {
                console.log('exportActivationKeys 2 Error while performing admin login date updating Query.');
                return "false";
            }
        });

        ok()
    });




};


function updateNoneExportedKeys(id_values, activation_keys_values, cb) {

    var sqlQuery = 'UPDATE activation_keys  SET exported=1 where id IN ' + id_values;
    console.log(' updateNoneExportedKeys id_values ', id_values)
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query(sqlQuery, function(err, rows) {


            if (!err) {
                console.log('updateNoneExportedKeys JS : Query success: ');
                console.log("Export to xlsx");
                console.log("DATA table length: " + rows.affectedRows);

                var export_data = [];
                for (i = 0; i < activation_keys_values.length; i++) {
                    export_data.push(['Your Activation Key is:', activation_keys_values[i]]);

                }
                exportAndInsertKeys(export_data, cb);
            } else {
                console.log('updateNoneExportedKeys Error while performing admin login date updating Query.', err);
                return "false";
            }
        });

        ok()
    });




}


function exportAndInsertKeys(string_Array, cb) {

    var ws_name = "exportedKeys";
    var wb = new XLSX.Workbook(),
        ws = XLSX.sheet_from_array_of_arrays(string_Array);

    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;

    console.log('date for xls: ' + getUTCDateTime_for_xls());
    var filename = 'activation_keys_' + getUTCDateTime_for_xls() + '.xlsx';
    /* write file */
    var filePath = 'exported_activation_keys_files/' + filename;
    XLSX.WriteFile(wb, filePath);


    var sql = "INSERT INTO exported_files(exported_filename,export_date) VALUES ($1,$2)";
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query(sql, [filename, new Date()], function(err, rows) {


            if (!err) {
                console.log('insert Exported Key File Data IntoTable JS : Query success: ');
                cb(filePath, filename);
            } else {
                console.log('exportAndInsertKeys Error while performing admin login date updating Query.');
                return "false";
            }
        });

        ok()
    });


}


// Get Exported keys Files

var getAllExportedKeysFiles = function(cb) {

    var query = 'SELECT EF.exported_filename, EF.export_date  from exported_files as EF';
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query(query, function(err, rows) {


            if (!err) {
                console.log('getAllExportedKeysFiles JS : Query success: ');
                cb(rows.rows);
            } else {
                console.log('getAllExportedKeysFiles Error while performing admin login date updating Query.');
                return "false";
            }
        });

        ok()
    });




};


// Query all activation_keys from table users
var downloadExportedFile = function(req, res, cb) {

    var exported_file_name = req.body.exported_filename;

    console.log("exported_file_name: " + exported_file_name);

    cb('start download file: ' + exported_file_name);


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

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}

// Function to get CurrentTime to generate .xls file
function getUTCDateTime_for_xls() {

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

    return year + month + day + "_" + hour + "_" + min + "_UTC";

}


///////////////////
// Get Used Keys and Unused keys
var getPieChartKey = function(cb) {

    var usedActivationKeys_Query = "SELECT  count(distinct USRACK.activation_key_id)  FROM users_activation_keys As USRACK ";
    var none_exported_keys_query = " SELECT *  from activation_keys where activation_keys.exported=0  and activation_keys.is_web_key=0";
    var exported_keys_query = ' SELECT * from activation_keys where activation_keys.exported=1 and activation_keys.is_web_key=0';

    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query(none_exported_keys_query, function(err, rows) {


            if (err) throw err
            none_exported_keys_number = rows.rowCount
            pg.connect(conString, function(err, dbclient, ok) {

                if (err) {

                    return console.error('could not connect to the database ' + err);
                }

                dbclient.query(exported_keys_query, function(err, rows) {


                    if (err) throw err;
                    exported_keys_number = rows.rowCount;

                    pg.connect(conString, function(err, dbclient, ok) {

                        if (err) {

                            return console.error('could not connect to the database ' + err);
                        }

                        dbclient.query(usedActivationKeys_Query, function(err, rows) {



                            if (err) throw err;

                            used_Keys_Number = rows.rowCount;
                            unUsed_Keys_Number = exported_keys_number - used_Keys_Number;


                            var result = {
                                none_exported_keys: none_exported_keys_number,
                                exported_keys: exported_keys_number,
                                usedkeys: used_Keys_Number,
                                unused_keys: unUsed_Keys_Number
                            }
                            console.log('v getPieChartKey ', result)
                            cb(result);
                        });

                        ok()
                    });

                });

                ok()
            });
        });

        ok()
    });

    // First SQL Query



};

// Get Exported Keys and NotExported keys
var getExportedKeysStats = function(cb) {

    var none_exported_keys_query = ' SELECT *  from activation_keys where activation_keys.exported=0 and activation_keys.is_web_key=0';
    var exported_keys_query = ' SELECT *  from activation_keys where activation_keys.exported=1 and activation_keys.is_web_key=0';
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query(none_exported_keys_query, function(err, non_exported_rows) {


            if (!err) {
                none_exported_keys_number = non_exported_rows.rowCount;
                pg.connect(conString, function(err, dbclient, ok) {

                    if (err) {

                        return console.error('could not connect to the database ' + err);
                    }

                    dbclient.query(exported_keys_query, function(err, result) {


                        if (!err) {

                            exported_keys_number = result.rowCount;

                            var rows = [exported_keys_number, none_exported_keys_number];
                            cb(rows);

                        } else {

                            console.log('getExportedKeysStats :Error while performing Query.');
                            return "false";
                        }
                    });

                    ok()
                });


            } else {
                console.log('getExportedKeysStats Error while performing admin login date updating Query.');
                return "false";
            }
        });

        ok()
    });


};



function getNewUserDateCritera() {

    var tomorrow = new Date();
    console.log('get New User Date Critera: current date: ' + tomorrow.getUTCDate());

    tomorrow.setDate(tomorrow.getUTCDate() - 7);

    var year = tomorrow.getUTCFullYear();

    var month = tomorrow.getUTCMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = tomorrow.getUTCDate();
    day = (day < 10 ? "0" : "") + day;

    theDate = year + ":" + month + ":" + day;

    console.log('get New User Date Critera: last date: ' + theDate);
    return theDate;
}


/**
 * function that ypdate all rows username columne to match the email :
 * we only neeed this function in the first launch of out application 
 * @param cb
 */
var changeAllUsernameToEmail = function(cb) {
    console.log('Outside pg connect')
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query("update users set username = email", function(err, rows) {
            if (err) {
                console.log('erruer', err)
            }

            return cb(rows.rows);

        });

        ok();
    });


}


/**
 * function that return all users
 * @param cb
 */
var returnAllUserList = function(cb) {
    console.log('Outside pg connect')
    pg.connect(conString, function(err, dbclient, ok) {

        if (err) {

            return console.error('could not connect to the database ' + err);
        }

        dbclient.query("SELECT * FROM activation_keys as ACK, users as USR, users_activation_keys as USRACK where USRACK.user_id=USR.id and USRACK.activation_key_id=ack.id", function(err, rows) {
            if (err) {
                console.log('erruer', err)
            }

            return cb(rows.rows);

        });

        ok();
    });


}





var aescrypt = require("./../utils/aescrypt.js");

var _ = require('./../utils/utils')._;


var shortid = require('shortid');



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

var checkPassword = function(rsaEncrypter, dbPassword, androidPassword, cb) {


    console.log('check password');

    if (androidPassword.length == 0) {

        console.log('android password empty');

        cb(null);

    } else {

        // Decrypt the password send from android app


        buffer = androidPassword





        //  Trim the password to remove empty characters
        thePasswordFromMobileApp = buffer

        // Decrypt the password from DataBase
        var thePasswordFromdb = aescrypt(dbPassword);
        //  Trim the password to remove empty characters
        thePasswordFromdb = thePasswordFromdb.trim();


        // Compare the two password
        var theLocalCompare = thePasswordFromMobileApp.localeCompare(thePasswordFromdb);

        if (theLocalCompare == 0) {

            // res.json({success: "1", userid: userID, message: "user logged in", username: userEmail});

            cb(true)
        } else {
            console.log('Wrong password : Access denied');

            cb(null);
        }


    }

}


exports.getNewUserList = getNewUserList;
exports.getActiveUserList = getActiveUserList;
exports.getBannedUserList = getBannedUserList;
exports.getAllUserList = getAllUserList;
exports.getUserInfo = getUserInfo;
exports.getUserDeviceInfo = getUserDeviceInfo;
exports.getUsersDeviceInfo = getUsersDeviceInfo;
exports.banUser = banUser;
exports.authorizeUser = authorizeUser;


exports.getAllActivationKeys = getAllActivationKeys;
exports.getUsersByActivationKey = getUsersByActivationKey;
exports.getAllExportedKeysFiles = getAllExportedKeysFiles;

exports.downloadExportedFile = downloadExportedFile;
exports.insertActivationKeys = insertActivationKeys;

exports.exportActivationKeys = exportActivationKeys;
getActivationKeyForWebUsers
exports.addUserService = addUserService;
exports.adduser=adduser;

exports.updateUserService = updateUserService;

exports.getPieChartKey = getPieChartKey;
exports.getExportedKeysStats = getExportedKeysStats;
exports.getActivationKeyForWebUsers = getActivationKeyForWebUsers;
exports.changeAllUsernameToEmail = changeAllUsernameToEmail;
exports.checkPassword = checkPassword;
exports.returnAllUserList = returnAllUserList;