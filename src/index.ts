// Core Bot Creation
// const tbotapi = require('node-telegram-bot-api');
const token = "362547656:AAGAl4o2TvPiXEg1HN4XN5C-zf10xdeuRNk";
// const TelegramBot = new tbotapi(token, {polling: true});

import TelegramBot = require("node-telegram-bot-api");
import { HypeResponses } from "./bot-modules/hype-responses/hype-responses";

const MyTelegramBot = new TelegramBot(token, { polling: true });

new HypeResponses(MyTelegramBot);

// Test Echo Commands
MyTelegramBot.onText(/\/echo (.+)/, (msg: any, match: any): void => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  MyTelegramBot.sendMessage(chatId, resp);
});
