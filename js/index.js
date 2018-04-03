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

    // parse data received from socket to perform required parsing and converting it to array of objects to represent on UI
    $scope.convertToObj = function (array, timestamp) {
        //console.log(array);

        let displayObj = {}, tempObj = {};
        var timeStamp = timestamp; // new Date().getTime();

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
                        var difference = $scope.data[keyIndex][key].difference;
                        if ($scope.data[keyIndex][key].currentValue != value)
                        difference = ($scope.data[keyIndex][key].currentValue - value) > 0 ? -1 : 1;
                        
                        $scope.data[keyIndex][key].difference = difference;
                        $scope.data[keyIndex][key].currentValue = value;
                        $scope.data[keyIndex][key].timeStamp = timeStamp;

                    } else {
                        var obj = {};
                        obj[key] = { currentValue: value, difference: 0, timeStamp: timeStamp };
                        $scope.data.push(obj);
                    }
                });
            });
    };

    // open socket connection
    $scope.socket = new WebSocket("ws://stocks.mnet.website");;

    // return stock name
    $scope.getStockName = function (obj) {
        return Object.keys(obj)[0];
    };

    // return stock value
    $scope.getStockInfo = function (obj) {
        return obj[Object.keys(obj)[0]].currentValue;
    };

    // user readable time history
    $scope.getStockTimeStatus = function (obj) {
        return $scope.timeDifference(new Date(), new Date(obj[Object.keys(obj)[0]].timeStamp));
    };

    // choose bg color depend on the stock value difference from previous one
    $scope.getStockStyle = function (obj) {
        if (obj[Object.keys(obj)[0]].difference === 0) {
            return 'stock-info';
        } else {
            return obj[Object.keys(obj)[0]].difference > 0 ? 'stock-success' : 'stock-danger';
        }
    }


    // open socket connection
    $scope.start = function () {
        window.location.reload();
    }

    // close socket connection
    $scope.close = function () {
        $scope.socket.close();
        $scope.isSocketRunning = false;
    }

    // open socket to receive live stock updates 
    $scope.openSocket = function () {
        var socket = new WebSocket("ws://stocks.mnet.website");
    };

    // callback called on opening of socket
    $scope.socket.onopen = function (event) {
        $scope.isSocketRunning = true;
    };

    // callback called on recieving of message from socket connection
    $scope.socket.onmessage = function () {
        myQueue.add(JSON.parse(event.data));
    };

    // callback called if get error on opening socket
    $scope.socket.onerror = function (event) {
        console.log(event);
    }

    // callback called on closing of socket
    $scope.socket.onclose = function (event) {
        alert('Press start button to start fetching realtime data.');
    }


    // close the socket before unloading page
    $scope.$on('$destroy', function (event) {
        $scope.socket.close();
    });


});