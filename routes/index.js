var express = require('express');
var router = express.Router();

var userService = require('./../service/usersService');

var adminService = require('./../service/adminService');



var passport = require('passport');

var shortid = require('shortid');

var path = require('path');

var fileSystem = require('fs');

var moment = require('moment-timezone');


var uuidList = [];


// The Global variable to store the user id
var user_info_id;
// The Global variable to store the user activation key to get info later
var user_activation_key_info;

var users_by_activation_keys = [];

router.get('/admin',function(req,res,next){

userService.getAllUserList(function(usersList){
res.json(usersList.rows);
})
})
router.get('/isconnected',function(req, res, next){
	   if (req.isAuthenticated()) {
       res.send('CONNECTED')
	   
    }else{
		res.send('NOT CONNECTED')
	}
})
router.get('/login', function(req, res, next) {

		if(req.params){
		req.body=req.params
		}
		if(req.query){
			req.body=req.query
		}
        console.log('*----*-*-*-*-*-*-*-*-*', req.body)

        passport.authenticate('local-login-admin', function(err, user, message) {
            console.log('user ', user)
            if (err) {

                console.log(err)

                return res.send('FAILED')
            }
            if (!user) {

                console.log("y a pas de duer")

                

                return res.send('FAILED');;
            }

            console.log(' user in routerµ.post login', user)
            req.logIn(user, function(err) {

                return res.send('SUCCESS')
            })


        })

        (req, res, next);
    },
    function(err, req, res, next) {
        // failure in login test route
        console.log('failed to oauth ', err)
        return res.send('FAILED');
    }
);

var PythonShell = require('python-shell');

router.get('/subscribe', function(req,res, next){
console.log('------------', req.query)
var options = {
  
 
  pythonOptions: ['-u'],
  
  args: [req.query.password]
};

PythonShell.run('test.py', {args:[req.query.password]}, function (err, results) {
  if (err) {console.log(err)};
  // results is an array consisting of messages collected during execution
  console.log('*******', results)
  req.query.script=results.toString();
  userService.adduser(req.query,function(userAdded){
	if(userAdded){
		res.send('SUCCESS')
	}else{
		res.send('FAILED');
	}
  })
 
});

}
)
router.get('/api/changeAllUsernameToEmail', function(req, res, next) {

    userService.changeAllUsernameToEmail(function(result) {
        res.send('ok')
    })
})


/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.isAuthenticated()) {
        res.render('dashboard')

    } else {
        res.render('login', { message: "Skideev Administrator Login" });

    }


});


// express get request

//getNewUsers
router.get('/api/getNewUsersList', isLoggedIn, function(req, res) {


    return userService.getNewUserList(function(rows) {
        console.log('/api/getNewUsersList', rows)


        res.send(rows)



    });

});


//logout function
router.get('/logout', function(req, res) {
    //req.session.destroy();
    req.logout();
    res.send('DISCONNECTED')
});

//verifiy if user is connected or not
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    //   return next();
    console.log('user disconected')
    return res.redirect('/');


}

module.exports = router;