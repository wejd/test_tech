var app = angular.module('angularTable', ['nvd3', 'angularUtils.directives.dirPagination', 'angularMoment']);


app.controller('AllUsersController', function($scope, $http, $window) {
    console.log('start AllUsersController');

    $scope.users = []; //declare an empty array

    var UserToBan;
    var UserToAuthorize;

    $http.get('/api/getAllUsersList').success(function(response) {
        console.log(response)
        $scope.users = response.rows; //ajax request to fetch data into $scope.data
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

            $http.get('/api/getAllUsersList').success(function(response) {
                $scope.users = response; //ajax request to fetch data into $scope.data
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

            $http.get('/api/getAllUsersList').success(function(response) {
                $scope.users = response; //ajax request to fetch data into $scope.data
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

    $scope.getUsernfo = function(user) {

        console.log('Users Id: ' + user.user_id);
        console.log('Users Email: ' + user.email);

        $http.post('/get_user_info', user).success(function(response) {

            console.log("getUsernfo post response: " + response.success + " and its id is: " + response.user_id);

            $window.location.href = "/user_info_dashboard";


        }).error(function(error) {
            // error
            console.log(JSON.stringify("Failed to get t&c: " + error));
        });

    };


});