var app = angular.module('app', ['ngQueue']);
app.controller('main', function ($scope, $queue) {
    $scope.data = [];
    $scope.isSocketRunning = false;

    var myCallback = function (item) {
        console.log(item);
        console.log(myQueue.size());
        var currentDate = new Date();
        $scope.convertToObj(item, currentDate.getTime());
    },
        options = {
            delay: 1000, //delay 2 seconds between processing items
            paused: true, //start out paused
            complete: function () { console.log('complete!'); }
        };

    // create an instance of a queue
    // note that the first argument - a callback to be used on each item - is required
    var myQueue = $queue.queue(myCallback, options);

    // myQueue.add('item 1'); //add one item
    // myQueue.addEach(['item 2', 'item 3']); //add multiple items

    myQueue.start(); //must call start() if queue starts paused


    $scope.timeDifference = function (current, previous) {

        var msPerMinute = 60 * 1000;
        var msPerHour = msPerMinute * 60;
        var msPerDay = msPerHour * 24;
        var msPerMonth = msPerDay * 30;
        var msPerYear = msPerDay * 365;

        var elapsed = current - previous;

        if (elapsed < msPerMinute) {
            return Math.round(elapsed / 1000) + ' seconds ago';
        }

        else if (elapsed < msPerHour) {
            return Math.round(elapsed / msPerMinute) + ' minutes ago';
        }

        else if (elapsed < msPerDay) {
            return Math.round(elapsed / msPerHour) + ' hours ago';
        }

        else if (elapsed < msPerMonth) {
            return 'approximately ' + Math.round(elapsed / msPerDay) + ' days ago';
        }

        else if (elapsed < msPerYear) {
            return 'approximately ' + Math.round(elapsed / msPerMonth) + ' months ago';
        }

        else {
            return 'approximately ' + Math.round(elapsed / msPerYear) + ' years ago';
        }
    };

    $scope.convertToObj = function (array, timestamp) {
        //console.log(array);

        let displayObj = {}, tempObj = {};
        var ts = timestamp; // new Date().getTime();

        array.map((item, index) => { tempObj[item[0]] = item[1]; });
        Object.entries(tempObj).forEach(
            ([key, value]) => {
                console.log(key);
                console.log(value);
                $scope.$apply(function () {
                    var isKeyPresent = false;
                    $scope.data.map(function(value1, index){
                        if(Object.keys(value1).indexOf(key) > -1){
                            isKeyPresent = true;
                            keyIndex = index;
                        }
                    });
                    if (isKeyPresent) {
                        var cs = $scope.data[keyIndex][key].cs;
                        if ($scope.data[keyIndex][key].cv != value)
                            cs = ($scope.data[keyIndex][key].cv - value) > 0 ? -1 : 1;
                        
                        $scope.data[keyIndex][key].cs = cs;
                        $scope.data[keyIndex][key].cv = value;
                        $scope.data[keyIndex][key].ts = ts;

                    } else {
                        var obj = {};
                        obj[key] = { cv: value, cs: 0, ts: ts };
                        $scope.data.push(obj);
                    }
                });
            });
    };

    $scope.socket = new WebSocket("ws://stocks.mnet.website");;

    $scope.getStockName = function (obj) {
        return Object.keys(obj)[0];
    };

    $scope.getStockInfo = function (obj) {
        return obj[Object.keys(obj)[0]].cv;
    };

    $scope.getStockTimeStatus = function (obj) {
        return $scope.timeDifference(new Date(), new Date(obj[Object.keys(obj)[0]].ts));
    };

    $scope.getStockStyle = function (obj) {
        if (obj[Object.keys(obj)[0]].cs === '' || obj[Object.keys(obj)[0]].cs === 'new' || obj[Object.keys(obj)[0]].cs === 0) {
            return 'stock-info';
        } else {
            if (obj[Object.keys(obj)[0]].cs > 0) {
                return 'stock-success';
            } else {
                return 'stock-danger';
            }
        }
    }


    $scope.start = function () {
        window.location.reload();
    }

    $scope.close = function () {
        $scope.socket.close();
        $scope.isSocketRunning = false;
    }

    $scope.openSocket = function () {
        var socket = new WebSocket("ws://stocks.mnet.website");
    };

    $scope.socket.onopen = function (event) {
        $scope.isSocketRunning = true;
    };

    $scope.socket.onmessage = function () {
        myQueue.add(JSON.parse(event.data));
    };

    $scope.socket.onerror = function (event) {
        console.log(event);
    }

    $scope.socket.onclose = function (event) {
        alert('Press start button to start fetching realtime data.');
    }

    $scope.$on('$destroy', function (event) {
        $scope.socket.close();
    });


});