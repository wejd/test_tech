var app = angular.module('angularTable', ['nvd3', 'angularUtils.directives.dirPagination','angularMoment']);


app.controller('APPController0', function ($scope, $http,$window) {

    $http.get('/api/getAdminDate').success(function (response) {
        //ajax request to fetch data into $scope.data
        console.log("getAdminDate: "+response.admin_name);
        console.log("getAdminDate: "+response.admin_last_login);
        $scope.admin_name=response.admin_name;
        $scope.admin_login_time = response.admin_last_login;
    });


});

app.controller('APPController1', function ($scope, $http,$window) {
    console.log('start APPController1');

    $scope.users = []; //declare an empty array




    $http.get('/api/getNewUsersList').success(function (response) {
        $scope.users = response;  //ajax request to fetch data into $scope.data
for(i=0;i<response.length;i++) {
    console.log(i+" -Date Registered: " + response[i].date_registred);
}
    });


    $scope.sort = function (keyname) {
        console.log("Sort Function");
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }


    $scope.ban_popup = function () {

        $('#Banning_PopUp').modal('show');
    }

    $scope.authorize_popup = function () {

        $('#Authorize_User_PopUp').modal('show');
    }

    $scope.getUserInfo = function (user) {

        console.log('APPController1 Users Id: ' + user.user_id);
        console.log('APPController1 Users Email: ' + user.email);

        $http.post('/get_user_info', user).success(function (response) {

            console.log("getUsernfo post response: "+response.success+" and its id is: "+response.user_id);

            $window.location.href="/user_info_dashboard";

        }).error(function (error) {
            // error
            console.log(JSON.stringify("Failed to get t&c: " + error));
        });

    };

});


app.controller('APPController2', function ($scope, $http,$window) {
    console.log('start APPController2');

    $scope.users2 = []; //declare an empty array


    $http.get('/api/getActiveUsersList').success(function (response) {
        $scope.users2 = response;  //ajax request to fetch data into $scope.data
    });


    $scope.sort = function (keyname) {
        console.log("Sort Function");
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    $scope.getUserInfo = function (user) {

        console.log('APPController2 Users Id: ' + user.user_id);
        console.log('APPController2 Users Email: ' + user.email);

        $http.post('/get_user_info', user).success(function (response) {

            console.log("getUsernfo post response: "+response.success+" and its id is: "+response.user_id);

            $window.location.href="/user_info_dashboard";


        }).error(function (error) {
            // error
            console.log(JSON.stringify("Failed to get t&c: " + error));
        });

    };


    $scope.ban_popup = function () {

        $('#Banning_PopUp').modal('show');
    }

    $scope.authorize_popup = function () {

        $('#Authorize_User_PopUp').modal('show');
    }



});


app.controller('APPControllerBannedUsers', function ($scope, $http,$window) {
    console.log('start APPControllerBannedUsers');

    $scope.banned_users = []; //declare an empty array

    $http.get('/api/getBannedUsersList').success(function (response) {
        $scope.banned_users = response;  //ajax request to fetch data into $scope.data
    });


    $scope.sort = function (keyname) {
        console.log("Sort Function");
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    $scope.getUserInfo = function (user) {

        console.log('APPControllerBannedUsers Users Id: ' + user.user_id);
        console.log('APPControllerBannedUsers Users Email: ' + user.email);

        $http.post('/get_user_info', user).success(function (response) {

            console.log("getUsernfo post response: "+response.success+" and its id is: "+response.user_id);

            $window.location.href="/user_info_dashboard";


        }).error(function (error) {
            // error
            console.log(JSON.stringify("Failed to get t&c: " + error));
        });

    };




});


app.controller('pieChartCtrl', function ($scope, $http) {
    console.log('start pieChartCtrl');

    var used_key;
    var unused_key;
    var exported_keys;
    var none_exported_keys;

    $http.get('/api/getPieChartKeys').success(function (response) {
        //ajax request to fetch data into $scope.data

        used_key = response.usedkeys;
        unused_key = response.unused_keys;
        exported_keys = response.exported_keys;
        none_exported_keys = response.none_exported_keys;


        $scope.chart_used_keys = used_key;
        $scope.chart_all_keys = used_key+unused_key;

        $scope.chart_exported_keys = exported_keys;
        $scope.chart_all_generated_keys = exported_keys+none_exported_keys;

        // Chart Colors
        var colorArray = ['#c600ff', '#cc0086', '#FFFF00', '#00FFFF'];

        $scope.colorFunction = function() {
            return function(d, i) {
                return colorArray[i];
            };
        }

        /* Chart options */
        $scope.options1 = {

            chart: {
                type: 'pieChart',
                height: 350,
                x: function (d) {
                    return d.key;
                },
                y: function (d) {
                    return d.y;
                },
            color:function(d,i){
                return colorArray[i];
            }
            ,

                showLabels: true,
                duration: 500,
                labelThreshold: 0.01,
                labelSunbeamLayout: true,
                tooltip:{
                    valueFormatter:function (d,i) {
                        return d;
                    }
                },
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            }

        };

        /* Chart data */
        $scope.data1 = [

            {
                key: "Exported",
                y: exported_keys
            }
            ,
            {
                key: "Not exported",
                y: none_exported_keys
            }
        ];

        $scope.options2 = {

            chart: {
                type: 'pieChart',
                height: 350,
                x: function (d) {
                    return d.key;
                },
                y: function (d) {
                    return d.y;
                },
                showLabels: true,
                duration: 500,
                labelThreshold: 0.01,
                labelSunbeamLayout: true,
                tooltip:{
                    valueFormatter:function (d,i) {
                        return d;
                    }
                },
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            }

        };



        /* Chart data */
        $scope.data2 = [
            {
                key: "Used",
                y: used_key
            },
            {
                key: "Unused",
                y: unused_key
            }

        ];


    });


});



