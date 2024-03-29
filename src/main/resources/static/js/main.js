'use strict';
var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var disconnectForm = document.querySelector('#disconnectSubmit');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var userListArea = document.querySelector('#userListArea');
var connectingElement = document.querySelector('.connecting');

var userList = [];
var stompClient = null;
var username = null;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {
    username = document.querySelector('#name').value.trim();
    if (username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');
        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.send("/app/chat.deleteUser",
            {},
            JSON.stringify({sender: username})
        );
        stompClient.disconnect();
    }
    window.location.reload();
    console.log("Disconnected456");
}

function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public', onMessageReceived);
    // Tell your username to the server
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    );
    connectingElement.classList.add('hidden');
}


function updateUserList() {
    return stompClient.subscribe('/app/chat.allUsers', getUsers);
}

function getUsers(payload) {
    userList = JSON.parse(payload.body);
    while (userListArea.firstChild) {
        userListArea.removeChild(userListArea.firstChild);
        userListArea.innerHTML = '';
    }
    renderUsers(userList);
}

    function renderUsers(userList) {
        console.log('this is userList', userList);
        userList.forEach(callbackUser);
    }


    function callbackUser(user) {
    console.log('this is user', user);
        var li = document.createElement('li');
        li.innerText = user;
        console.log('this is li', li);
        li.className = 'user_item';
        var ul = document.getElementById('userListArea');
        console.log('this is ul', ul);

        var input = document.getElementById('message');
        li.addEventListener('click', function () {
                input.value = `${user} `;
            }
        )
        ul.appendChild(li);
    }

    function changedUserListAfterJoin(user) {
        if (!userList.includes(user)) {
            userList = updateUserList();
            userListArea.append(userList);
        }
    }

    function changedUserListAfterLeft(user) {
        if (userList.includes(user)) {
            userList = updateUserList();
            userListArea.append(userList);
        }
    }

    function onError(error) {
        connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
        connectingElement.style.color = 'red';
    }

    function sendMessage(event) {
        var messageContent = messageInput.value.trim();
        if (messageContent && stompClient) {
            var chatMessage = {
                sender: username,
                content: messageInput.value,
                type: 'CHAT'
            };
            stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
            messageInput.value = '';
        }
        event.preventDefault();
    }

    function onMessageReceived(payload) {
        var message = JSON.parse(payload.body);
        var messageElement = document.createElement('li');
        if (message.type === 'JOIN') {
            messageElement.classList.add('event-message');
            message.content = message.sender + ' joined!';
            changedUserListAfterJoin(message.sender);
        } else if (message.type === 'LEAVE') {
            messageElement.classList.add('event-message');
            message.content = message.sender + ' left!';
            changedUserListAfterLeft(message.sender);
        } else {
            messageElement.classList.add('chat-message');
            var avatarElement = document.createElement('i');
            if (message && message.sender && message.sender[0]) {
                var avatarText = document.createTextNode(message.sender[0]);
            }
            avatarElement.appendChild(avatarText);
            avatarElement.style['background-color'] = getAvatarColor(message.sender);
            messageElement.appendChild(avatarElement);
            var usernameElement = document.createElement('span');
            var usernameText = document.createTextNode(message.sender);
            usernameElement.appendChild(usernameText);
            messageElement.appendChild(usernameElement);
        }
        var textElement = document.createElement('p');
        var messageText = document.createTextNode(message.content);
        textElement.appendChild(messageText);
        messageElement.appendChild(textElement);
        messageArea.appendChild(messageElement);
        messageArea.scrollTop = messageArea.scrollHeight;
    }

    function getAvatarColor(messageSender) {
        var hash = 0;
        for (var i = 0; i < messageSender.length; i++) {
            hash = 31 * hash + messageSender.charCodeAt(i);
        }
        var index = Math.abs(hash % colors.length);
        return colors[index];
    }

    window.addEventListener('beforeunload', disconnect, false);
    usernameForm.addEventListener('submit', connect, true);
    disconnectForm.addEventListener('click', disconnect, true);
    messageForm.addEventListener('submit', sendMessage, true);
