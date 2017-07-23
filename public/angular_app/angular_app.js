var app = angular.module('angularTable', ['nvd3', 'angularUtils.directives.dirPagination','angularMoment']);


app.controller('APPController1', function ($scope, $http) {
    console.log('start APPController1');

    $scope.users = []; //declare an empty array


    $http.get('/api/getNewUsersList').success(function (response) {
        $scope.users = response;  //ajax request to fetch data into $scope.data
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

});


app.controller('APPController2', function ($scope, $http) {
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


    $scope.ban_popup = function () {

        $('#Banning_PopUp').modal('show');
    }

    $scope.authorize_popup = function () {

        $('#Authorize_User_PopUp').modal('show');
    }


});


app.controller('AllUsersController', function ($scope, $http) {
    console.log('start AllUsersController');

    $scope.users = []; //declare an empty array

    $http.get('/api/getActiveUsersList').success(function (response) {
        $scope.users = response;  //ajax request to fetch data into $scope.data
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


});


app.controller('pieChartCtrl', function ($scope, $http) {
    console.log('start pieChartCtrl');

    var used_key;
    var unused_key;


    $http.get('/api/getPieChartKeys').success(function (response) {
        //ajax request to fetch data into $scope.data

        used_key = response[0];
        unused_key = response[1];

        $scope.chart_used_keys = response[0];
        $scope.chart_all_keys = response[1];


        /* Chart options */
        $scope.options = {

            chart: {
                type: 'pieChart',
                height: 450,
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
        $scope.data = [
            {
                key: "Used keys",
                y: used_key
            },
            {
                key: "Unused keys",
                y: unused_key
            }
        ];


    });


});

app.controller('ActivationKeysController', function ($scope, $http) {
console.log('start ActivationKeysController');
    $scope.activation_keys_list = []; //declare an empty array
    $scope.exported_keys__files_list=[]; //declare an empty array to store exported files

    $http.get('/api/getAllActivationKeysList').success(function (response) {
        $scope.activation_keys_list = response;  //ajax request to fetch data into $scope.data
    });

    $scope.sort = function (keyname) {
        console.log("Sort Function");
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    };


    $http.get('/api/getAllExportedKeysFiles').success(function (response) {
        console.log('getAllExportedKeysFiles success');
        $scope.exported_keys__files_list = response;  //ajax request to fetch data into $scope.data
    });


    $scope.getAllExportedKeysFiles;


    $scope.getAllExportedKeysFiles= function(){

    };

    $scope.getUsersByActivationKey = function (activation_key) {

        console.log('Users by activation key: ' + activation_key.activation_keys);

        $http.post('/api/getUsersByActivationKey', activation_key).success(function (response) {
            $scope.users_by_key_list = response;  //ajax request to fetch data into $scope.data
            $scope.user_activation_key = activation_key.activation_keys;
        }).error(function (error) {
            // error
            console.log(JSON.stringify("Failed to get t&c: " + error));
        });

    };


    $scope.generateUUID = function (key_number) {


        if (parseInt(key_number) > 1000) {

            $('#Maximum_Size_UUID_PopUp').modal('show');

        } else {

            params = {'key_number': key_number}

            $http.post('/api/getGeneratedUUID', params).success(function (response) {
                $scope.generated_uuid = response;  //ajax request to fetch data into $scope.data

            }).error(function (error) {
                // error
                console.log(JSON.stringify("Failed to get t&c: " + error));
            });
        }
    }


    $scope.resetUUID = function () {

        params = {'key_number': 1}

        $http.post('/api/resetGeneratedUUID', params).success(function (response) {
            $scope.generated_uuid = response;  //ajax request to fetch data into $scope.data
            $scope.keys_number='';
        }).error(function (error) {
            // error
            console.log(JSON.stringify("Failed to get t&c: " + error));
            $scope.keys_number='';
        });

    }

    $scope.validateUUID = function (case_number) {

        if (case_number == 0) {


            $('#Validate_UUID_PopUp').modal('show');
        } else if (case_number == 1) {

            params = {'token': '5647'}

            $http.post('/api/validateGeneratedUUID', params).success(function (response) {
                //  $scope.generated_uuid = response;  //ajax request to fetch data into $scope.data
                console.log("validateUUID: " + response);

                if(response==='done'){

                    $('#Validate_UUID_PopUp').modal('hide');

                    $scope.activation_keys_list = []; //declare an empty array

                    $scope.resetUUID();


                    $http.get('/api/getAllActivationKeysList').success(function (response) {
                        $scope.activation_keys_list = response;  //ajax request to fetch data into $scope.data
                    });

                }

            }).error(function (error) {
                // error
                console.log(JSON.stringify("Failed to get t&c: " + error));
            });


        }
    }



    $scope.exportUUID = function (export_key_number) {

        params = {'export_number': export_key_number}

        $http.post('/api/exportUuid', params).success(function (response) {
            console.log('export UUID response: '+response);
            $scope.export_keys_number='';
        }).error(function (error) {
            // error
            console.log(JSON.stringify("Failed to get t&c: " + error));
            $scope.export_keys_number='';
        });

    }


});


