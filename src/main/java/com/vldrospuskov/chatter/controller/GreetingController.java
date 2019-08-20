package com.vldrospuskov.chatter.controller;

import com.vldrospuskov.chatter.model.Content;
import com.vldrospuskov.chatter.model.User;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.HtmlUtils;

import java.util.ArrayList;
import java.util.List;

@Controller
public class GreetingController {

    private List<String> userNames = new ArrayList<>();
    private List<User> userList = new ArrayList<>();

    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    public Content message(User user) throws Exception {
        Thread.sleep(1000);
        return new Content(HtmlUtils.htmlEscape(user.getUserName() + ": " + user.getMessage().getText()
                + " | " + user.getMessage().getDate()));
    }

    @MessageMapping("/users")
    @SendTo("/topic/info")
    public List<User> addUser(User user) {
        userList.add(user);
        return userList;
    }

    @MessageMapping("/users/delete")
    @SendTo("/topic/info")
    public List<User> deleteUser(User user) {
        userList.remove(user);
        return userList;
    }

}
