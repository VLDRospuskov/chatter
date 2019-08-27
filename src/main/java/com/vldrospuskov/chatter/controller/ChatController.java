package com.vldrospuskov.chatter.controller;

import com.vldrospuskov.chatter.model.ChatMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.messaging.simp.user.SimpUser;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.stereotype.Controller;

import java.util.*;

@Controller
public class ChatController {

    ArrayList<String> userList = new ArrayList<String>( Arrays.asList("alex", "brian", "charles") );

    @Autowired private SimpUserRegistry simpUserRegistry;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage,
                               SimpMessageHeaderAccessor headerAccessor) {
        // Add username in web socket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        for (String key: sessionAttributes.keySet()) {
            userList.add(String.valueOf(sessionAttributes.get(key)));
        }
        return chatMessage;
    }

    @SubscribeMapping("/chat.allUsers")
    public List<String> getUsers() {
        return userList;
    }

    @MessageMapping("/chat.deleteUser")
    @SendTo("/topic/public")
    public List<String> deleteUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().remove("username", chatMessage.getSender());
        String sender = chatMessage.getSender();
        userList.remove(sender);
        return userList;
    }

}
