var stompClient = null;
var userName = null;
var userList = [];
var username = null;

// sets connect
function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    if (connected) {
        $("#conversation").show();
    } else {
        $("#conversation").hide();
    }
    $("#greetings").html("");
}

// connect to the server
function connect() {
    if (!isEmptyUserName()) {
        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            setConnected(true);
            console.log('Connected: ' + frame);
            // stompClient.send("/app/users", {}, JSON.stringify({'userName': $("#userName").val()}));
            stompClient.send("/app/users",
                {},
                JSON.stringify({'userName': $("#userName").val()}));

            stompClient.subscribe('/topic/info', function (message) {
                alert(message.body);
            })
            // stompClient.subscribe('/topic/info', function (message) {
            //     alert(message.body);
            //     userList = JSON.parse(message.body);
            //     // showUsers(JSON.parse(message.body));
            // });

            userList.push($("#userName").val());
            showUsers(userList);
            stompClient.subscribe('/topic/greetings', function (message) {
                showGreeting(JSON.parse(message.body).content);
            });
        });
    }
}

function isEmptyUserName() {
    userName = document.getElementById("userName").value;
    return (userName == null || userName.length === 0);
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.send("/app/users/delete", {}, JSON.stringify({'userName': $("#userName").val()}));
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}

function sendName() {
    var value = JSON.stringify({'userName': $("#userName").val(), 'message': $("#message").val()});
    stompClient.send("/app/hello", {}, value);
}


// var userList = null;
// for (var i in message) {
//     userList = message[i].userName;
// }
// $("#users").append("<tr><td>" + userList + "</td></tr>");
function showUsers(message) {

    for (var i in message) {
        userList = message[i].userName;
    }
    $("#users").append("<tr><td>" + userList + "</td></tr>");


    //  var users = message.map(function(element) {
   //      return element.userName;
   //  });
   //
   // users.forEach(function(element) {
   //      $('#users').append("<tr><td>" + element + "</td></tr>");
   //  });

    // message.forEach(function(element) {
    //     var div = document.createElement("div");
    //     div.innerHTML = "<tr><td>" + element.userName + "</td></tr>";
    //     var users = document.getElementById("users");
    //     return users.appendChild(div);
    // });


    // $("#users").append("<tr><td>" + userList + "</td></tr>");
}

function showGreeting(message) {
    $("#greetings").append("<tr><td>" + message + "</td></tr>");
}

$(function () {
        $("form").on('submit', function (e) {
            e.preventDefault();
        });
        $("#connect").click(function () {
            connect();
        });
        $("#disconnect").click(function () {
            disconnect();
        });
        $("#send").click(function () {
            sendName();
        });

    }
);