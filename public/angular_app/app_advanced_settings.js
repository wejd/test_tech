var app = angular.module('angularTable', ['nvd3', 'angularUtils.directives.dirPagination','angularMoment']);




app.controller('APPControllerAdvancedSettings', function ($scope, $http) {

    $scope.changePassword =function(old_password,new_password,confirm_new_password){

        if(new_password==confirm_new_password){

            params = {'old_password': old_password,'new_password':new_password}

            $http.post('/api/changeAdminPassword', params).success(function (response) {
              console.log("change Password response: "+response.success);  //ajax request to fetch data into $scope.data

                if(response.success=="password changed"){

                    $('#Password_changed_PopUp').modal('show');

                }else{

                    $('#Password_not_changed_PopUp').modal('show');
                }

            }).error(function (error) {
                // error
                console.log(JSON.stringify("Failed to get t&c: " + error));
            });


        }else{

            $('#Password_not_match_PopUp').modal('show');
        }

        $scope.old_password="";
        $scope.new_password="";
        $scope.confirm_new_password="";

    }


});


