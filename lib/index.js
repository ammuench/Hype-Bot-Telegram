"use strict";
exports.__esModule = true;
var token = "362547656:AAGAl4o2TvPiXEg1HN4XN5C-zf10xdeuRNk";
var TelegramBot = require("node-telegram-bot-api");
var hype_1 = require("./hype");
var MyTelegramBot = new TelegramBot(token, { polling: true });
MyTelegramBot.onText(/hype/i, function (msg, match) {
    console.log(msg);
    var hype = new hype_1.HYPE();
    MyTelegramBot.sendMessage(msg.chat.id, hype.hypeReply());
});
MyTelegramBot.onText(/\/echo (.+)/, function (msg, match) {
    console.log(msg);
    var chatId = msg.chat.id;
    var resp = match[1];
    MyTelegramBot.sendMessage(chatId, resp);
});
