var app = angular.module('angularTable', ['nvd3', 'angularUtils.directives.dirPagination', 'angularMoment']);


app.controller('UserActivationKeyInfoController', function($scope, $http, $window) {
    console.log('start UserInfoController');
    users_by_key_list = []; //declare an empty array
    var users_list_lenght;
    var user_key_available_number;
    var user_activation_key;
    var UserToBan;
    var UserToAuthorize;


    $http.get('/api/getUserActivationKeyInfo').success(function(response) {

        $scope.users_by_key_list = response; //ajax request to fetch data into $scope.data

        //  $scope.user_activation_key = users_by_key_list[0].activation_keys;
        users_list_lenght = response.length;
        user_key_available_number = (3 - users_list_lenght);
        user_activation_key = response[0].activation_key;
        $scope.users_list_lenght = users_list_lenght;
        $scope.total_possible_users_list_lenght = 3;
        $scope.user_activation_key = user_activation_key;
        console.log("users_by_key_list length: " + users_list_lenght);
        console.log("users_by_key_list Key: " + user_activation_key);

        params = response;

        $http.post('/api/getUsersDeviceInfo', params).success(function(response) {

            for (j = 0; j < $scope.users_by_key_list.length; j++) {
                $scope.users_by_key_list[j].isLogged = "false";

                for (i = 0; i < response.length; i++) {

                    console.log("user at id: " + response[i].user_id + " is logged");

                    if ($scope.users_by_key_list[j].user_id == response[i].user_id) {

                        $scope.users_by_key_list[j].isLogged = "true";

                    }
                }

                console.log("users_by_key_list: user_id: " + $scope.users_by_key_list[j].user_id + " isLogged: " + $scope.users_by_key_list[j].isLogged);
            }





        });


        // Chart Colors
        var colorArray = ['#ff9933', '#33cc00', '#FFFF00', '#00FFFF'];

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
                x: function(d) {
                    return d.key;
                },
                y: function(d) {
                    return d.y;
                },
                color: function(d, i) {
                    return colorArray[i];
                },

                showLabels: true,
                duration: 500,
                labelThreshold: 0.01,
                labelSunbeamLayout: true,
                tooltip: {
                    valueFormatter: function(d, i) {
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
                key: "Active",
                y: users_list_lenght
            },
            {
                key: "Available",
                y: user_key_available_number
            }
        ];


    });


    $scope.sort = function(keyname) {
        console.log("Sort Function");
        $scope.sortKey = keyname; //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }


    $scope.ban_user = function() {

        console.log('Users Id: ' + UserToBan.user_id);
        console.log('Users Email: ' + UserToBan.email);

        params = { 'user_id': UserToBan.user_id }

        $http.post('/api/banUser', params).success(function(response) {

            console.log("ban_user post response: " + response.success + " and its id is: " + response.user_id);

            $('#Banning_PopUp').modal('hide');

            $http.get('/api/getUserInfo').success(function(response) {

                $scope.user_info = response[0];

            });

        }).error(function(error) {
            // error
            console.log(JSON.stringify("Failed to get ban_user response: " + error));
        });

    }

    $scope.authorize_user = function() {

        console.log('Users Id: ' + UserToAuthorize.user_id);
        console.log('Users Email: ' + UserToAuthorize.email);

        params = { 'user_id': UserToAuthorize.user_id }

        $http.post('/api/authorizeUser', params).success(function(response) {

            console.log("authorize User post response: " + response.success + " and its id is: " + response.user_id);

            $('#Authorize_User_PopUp').modal('hide');

            $http.get('/api/getUserInfo').success(function(response) {

                $scope.user_info = response[0];

            });

        }).error(function(error) {
            // error
            console.log(JSON.stringify("Failed to get ban_user response: " + error));
        });

    }

    $scope.ban_popup = function(user) {
        console.log('Users Id: ' + user.user_id);
        console.log('Users Email: ' + user.email);
        UserToBan = user;
        $('#Banning_PopUp').modal('show');
    }

    $scope.authorize_popup = function(user) {
        console.log('Users Id: ' + user.user_id);
        console.log('Users Email: ' + user.email);
        UserToAuthorize = user;
        $('#Authorize_User_PopUp').modal('show');
    }

    $scope.getUserActivationKeyInfo = function(user_info) {

        console.log('Activation key: ' + user_info.activationKey);


        $http.post('/get_activation_key_info', user_info).success(function(response) {


            $window.location.href = "/user_activation_key_info_dashboard";


        }).error(function(error) {
            // error
            console.log(JSON.stringify("Failed to get t&c: " + error));
        });

    };


});