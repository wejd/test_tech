var app = angular.module('angularTable', ['nvd3', 'angularUtils.directives.dirPagination','angularMoment']);


app.controller('UserInfoController', function ($scope, $http, $window) {
    console.log('start UserInfoController');

    var UserToBan;
    var UserToAuthorize;
    users_by_devices_list=[];

    $http.get('/api/getUserInfo').success(function (response) {

        $scope.user_info=response[0];

        $http.get('/api/getUserDeviceInfo').success(function (response) {

            if(response.length==0){

                $scope.user_log_status={'log_status':'Logged Out'};

                $scope.user_device_info={'device_info':'N/A','device_id':'N/A'};
            }else{
                $scope.user_log_status={'log_status':'Logged In'};
                $scope.users_by_devices_list=response;
            }


        });

    });


    $scope.sort = function (keyname) {
        console.log("Sort Function");
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }


    $scope.ban_user = function () {

        console.log('Users Id: ' + UserToBan.user_id);
        console.log('Users Email: ' + UserToBan.email);

        params = {'user_id': UserToBan.user_id}

        $http.post('/api/banUser',params).success(function (response) {

           console.log("ban_user post response: "+response.success+" and its id is: "+response.user_id);

            $('#Banning_PopUp').modal('hide');

            $http.get('/api/getUserInfo').success(function (response) {

                $scope.user_info=response[0];

            });

        }).error(function (error) {
            // error
            console.log(JSON.stringify("Failed to get ban_user response: " + error));
        });

    }

    $scope.authorize_user = function () {

        console.log('Users Id: ' + UserToAuthorize.user_id);
        console.log('Users Email: ' + UserToAuthorize.email);

        params = {'user_id': UserToAuthorize.user_id}

        $http.post('/api/authorizeUser',params).success(function (response) {

            console.log("authorize User post response: "+response.success+" and its id is: "+response.user_id);

            $('#Authorize_User_PopUp').modal('hide');

            $http.get('/api/getUserInfo').success(function (response) {

                $scope.user_info=response[0];

            });

        }).error(function (error) {
            // error
            console.log(JSON.stringify("Failed to get ban_user response: " + error));
        });

    }

    $scope.ban_popup = function (user) {
        console.log('Users Id: ' + user.user_id);
        console.log('Users Email: ' + user.email);
        UserToBan= user;
        $('#Banning_PopUp').modal('show');
    }

    $scope.authorize_popup = function (user) {
        console.log('Users Id: ' + user.user_id);
        console.log('Users Email: ' + user.email);
        UserToAuthorize=user;
        $('#Authorize_User_PopUp').modal('show');
    }

    $scope.getUserActivationKeyInfo = function (user_info) {

        console.log('Activation key: ' + user_info.activationKey);


        $http.post('/get_activation_key_info', user_info).success(function (response) {


            $window.location.href="/user_activation_key_info_dashboard";


        }).error(function (error) {
            // error
            console.log(JSON.stringify("Failed to get t&c: " + error));
        });

    };


});




