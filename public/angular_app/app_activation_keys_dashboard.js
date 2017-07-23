var app = angular.module('angularTable', ['nvd3', 'angularUtils.directives.dirPagination', 'ngFileSaver', 'angularMoment']);


app.controller('ActivationKeysController', ['FileSaver', 'Blob', '$scope', '$http', MainFucntion]);


function MainFucntion(FileSaver, Blob, $scope, $http) {
    console.log('start ActivationKeysController');

    activation_keys_list = []; //declare an empty array
    exported_keys__files_list = []; //declare an empty array to store exported files

    $http.get('/api/getAllActivationKeysList').success(function(response) {
        $scope.activation_keys_list = response; //ajax request to fetch data into $scope.data

        ExportedKeysPieChartStats($scope, $http);
    });

    $scope.sort = function(keyname) {
        console.log("Sort Function");
        $scope.sortKey = keyname; //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    };


    $http.get('/api/getAllExportedKeysFiles').success(function(response) {
        console.log('getAllExportedKeysFiles success');
        $scope.exported_keys__files_list = response; //ajax request to fetch data into $scope.data
    });

    //******************************************************
    $http.get('/api/getListActivationKeyForWebUser').success(function(response) {
        console.log('list activation key for the web users ' + response);
        $scope.Activation_key_list_for_web_user = response; //ajax request to fetch data into $scope.data
    });

    //******************************************************

    $scope.getUsersByActivationKey = function(activation_key) {

        console.log('Users by activation key: ' + activation_key.activation_key);

        $http.post('/api/getUsersByActivationKey', activation_key).success(function(response) {
            $scope.users_by_key_list = response; //ajax request to fetch data into $scope.data
            $scope.user_activation_key = activation_key.activation_keys;
        }).error(function(error) {
            // error
            console.log(JSON.stringify("Failed to get t&c: " + error));
        });

    };


    $scope.generateUUID = function(key_number) {


        if (parseInt(key_number) > 1000) {

            $('#Maximum_Size_UUID_PopUp').modal('show');

        } else {

            params = { 'key_number': key_number }

            $http.post('/api/getGeneratedUUID', params).success(function(response) {
                $scope.generated_uuid = response; //ajax request to fetch data into $scope.data

            }).error(function(error) {
                // error
                console.log(JSON.stringify("Failed to get t&c: " + error));
            });
        }
    }


    $scope.resetUUID = function() {

        params = { 'key_number': 1 }

        $http.post('/api/resetGeneratedUUID', params).success(function(response) {
            $scope.generated_uuid = response; //ajax request to fetch data into $scope.data
            $scope.keys_number = '';
        }).error(function(error) {
            // error
            console.log(JSON.stringify("Failed to get t&c: " + error));
            $scope.keys_number = '';
        });

    }

    $scope.validateUUID = function(case_number) {

        if (case_number == 0) {


            $('#Validate_UUID_PopUp').modal('show');
        } else if (case_number == 1) {

            params = { 'token': '5647' }

            $http.post('/api/validateGeneratedUUID', params).success(function(response) {
                //  $scope.generated_uuid = response;  //ajax request to fetch data into $scope.data
                console.log("validateUUID: " + response);

                if (response === 'done') {

                    $('#Validate_UUID_PopUp').modal('hide');

                    $scope.activation_keys_list = []; //declare an empty array

                    $scope.resetUUID();


                    $http.get('/api/getAllActivationKeysList').success(function(response) {
                        $scope.activation_keys_list = response; //ajax request to fetch data into $scope.data
                    });

                }

            }).error(function(error) {
                // error
                console.log(JSON.stringify("Failed to get t&c: " + error));
            });


        }
    }


    $scope.exportUUID = function(export_key_number) {

        if (export_key_number > 0) {

            params = { 'export_number': export_key_number }

            $http.post('/api/exportUuid', params, { responseType: "arraybuffer" }).success(function(response, status, headers) {

                var filename = headers('File-Name');
                console.log('headers File-Name: ' + filename);

                if (filename === null) {
                    $('#Maximum_None_Exported_keys_PopUp').modal('show');
                    $scope.export_keys_number = '';

                } else {
                    var blob = new Blob([response], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                    FileSaver.saveAs(blob, filename);

                    $scope.export_keys_number = '';


                    $http.get('/api/getAllExportedKeysFiles').success(function(response) {
                        console.log('getAllExportedKeysFiles success');
                        $scope.exported_keys__files_list = response; //ajax request to fetch data into $scope.data

                        $http.get('/api/getAllActivationKeysList').success(function(response) {
                            $scope.activation_keys_list = response; //ajax request to fetch data into $scope.data

                            ExportedKeysPieChartStats($scope, $http);
                        });

                        $scope.sort = function(keyname) {
                            console.log("Sort Function");
                            $scope.sortKey = keyname; //set the sortKey to the param passed
                            $scope.reverse = !$scope.reverse; //if true make it false and vice versa
                        };


                    });
                }


            }).error(function(error) {
                // error
                console.log(JSON.stringify("Failed to get t&c: " + error));
                $scope.export_keys_number = '';
            });
        } else {
            $('#Invalid_Exported_keys_PopUp').modal('show');
            $scope.export_keys_number = '';

        }
    }


    $scope.downloadExportedFile = function(exported_file) {

        console.log('downloadExportedFile: ' + exported_file.exported_filename);

        $http.post('/api/downloadExportedFile', exported_file, { responseType: "arraybuffer" }).success(function(response, status, headers) {
            //console.log(response);
            var type = headers('Content-Type');
            console.log('Headers: ' + type);
            var blob = new Blob([response], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            FileSaver.saveAs(blob, exported_file.exported_filename);

        }).error(function(error) {
            // error
            console.log(JSON.stringify("Failed to download file: " + error));
        });

    };


};



function ExportedKeysPieChartStats($scope, $http) {

    console.log('ExportedKeysPieChartStats function called');

    var exported_keys;
    var not_exported_keys;


    $http.get('/api/getExportedKeysStats').success(function(response) {
        //ajax request to fetch data into $scope.data

        exported_keys = response[0];
        not_exported_keys = response[1];

        console.log('exported_keys: ' + exported_keys);
        console.log('exported_keys: ' + not_exported_keys);

        $scope.exported_keys = exported_keys;
        $scope.all_keys = not_exported_keys + exported_keys;


        /* Chart options */
        $scope.options = {

            chart: {
                type: 'pieChart',
                height: 350,
                x: function(d) {
                    return d.key;
                },
                y: function(d) {
                    return d.y;
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
        $scope.data = [{
                key: "Exported",
                y: exported_keys
            },
            {
                key: "Not exported",
                y: not_exported_keys
            }
        ];


    });

}