var app = angular.module('app',['ngQueue']);
app.controller('main', function($scope, $queue){
    $scope.data = [];
    $scope.isSocketRunning = false;

    var myCallback = function(item) {
        console.log(item);
        console.log(myQueue.size());
        var currentDate = new Date();
        $scope.convertToObj(item, currentDate.getTime());
    },
    options = {
        delay: 1000, //delay 2 seconds between processing items
        paused: true, //start out paused
        complete: function() { console.log('complete!'); }
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
             return Math.round(elapsed/1000) + ' seconds ago';   
        }
        
        else if (elapsed < msPerHour) {
             return Math.round(elapsed/msPerMinute) + ' minutes ago';   
        }
        
        else if (elapsed < msPerDay ) {
             return Math.round(elapsed/msPerHour ) + ' hours ago';   
        }
    
        else if (elapsed < msPerMonth) {
             return 'approximately ' + Math.round(elapsed/msPerDay) + ' days ago';   
        }
        
        else if (elapsed < msPerYear) {
             return 'approximately ' + Math.round(elapsed/msPerMonth) + ' months ago';   
        }
        
        else {
             return 'approximately ' + Math.round(elapsed/msPerYear ) + ' years ago';   
        }
    };

    $scope.convertToObj = function(array, timestamp){
        //console.log(array);
        array.map(function (singleArr) {  
            var stockObj = {};
            var temp = {currentValue : singleArr[1],currentStatus : 'new'};
            temp.timestamp = timestamp;
            stockObj[singleArr[0]] = temp;
            //console.log(stockObj);
            
            if(!$scope.data.length){
                $scope.$apply(function(){
                    $scope.data.push(stockObj);
                });
            }else{
                var isKeyPresent = false;
                var keyIndex = -1;
                $scope.data.map(function(value, index){
                    if(Object.keys(value).indexOf(singleArr[0]) > -1){
                        isKeyPresent = true;
                        keyIndex = index;
                    }
                });
                $scope.$apply(function(){
                    if(isKeyPresent){
                        var timestamp = new Date();
                        $scope.data[keyIndex][singleArr[0]].currentStatus = singleArr[1] - $scope.data[keyIndex][singleArr[0]].currentValue;
                        $scope.data[keyIndex][singleArr[0]].currentValue = singleArr[1];
                        $scope.data[keyIndex][singleArr[0]].timestamp = timestamp.getTime();
                    }else{
                        $scope.data.push(stockObj);
                    }
                });
                // "[{"aapl":{"currentValue":73.80890335438494,"currentStatus":""},"$$hashKey":"object:3"},{"aapl":{"currentValue":117.95394619539131,"currentStatus":""},"$$hashKey":"object:5"},{"tck":{"currentValue":21.95869109643661,"currentStatus":""},"$$hashKey":"object:7"},{"ebr":{"currentValue":40.04712696600692,"currentStatus":""},"$$hashKey":"object:9"}]"
            }
        });
    };

    $scope.socket = new WebSocket("ws://stocks.mnet.website");;

    $scope.getStockName = function(obj){
        return Object.keys(obj)[0];
    };

    $scope.getStockInfo = function(obj){
        return obj[Object.keys(obj)[0]].currentValue;
    };

    $scope.getStockTimeStatus = function(obj){
        return $scope.timeDifference(new Date(), new Date(obj[Object.keys(obj)[0]].timestamp));
    };

    $scope.getStockStyle = function(obj){
        if(obj[Object.keys(obj)[0]].currentStatus === '' || obj[Object.keys(obj)[0]].currentStatus === 'new'){
            return 'bg-info';
        }else{
            if(obj[Object.keys(obj)[0]].currentStatus > 0){
                return 'bg-success';
            }else{
                return 'bg-danger';
            }
        }
    }


    $scope.start = function(){
        window.location.reload();
    }

    $scope.close = function(){
        $scope.socket.close();
        $scope.isSocketRunning = false;
    }

    $scope.openSocket = function(){
        var socket = new WebSocket("ws://stocks.mnet.website");
    };

    $scope.socket.onopen = function(event){
        $scope.isSocketRunning = true;
        //console.log(event);
        //alert('onOpen');
    };

    $scope.socket.onmessage = function(){
        myQueue.add(JSON.parse(event.data));
        //var currentDate = new Date();
        //$scope.convertToObj(JSON.parse(event.data), currentDate.getTime());
    };

    $scope.socket.onerror = function(event){
        console.log(event);
        //alert('onError');
    }

    $scope.socket.onclose = function(event){
        //console.log(event);
        alert('Press start button to start fetching realtime data.');
    }

    $scope.$on('$destroy', function(event) {
        $scope.socket.close();
    });

    
});