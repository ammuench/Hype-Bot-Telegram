// Core Bot Creation
// const tbotapi = require('node-telegram-bot-api');
const token = "362547656:AAGAl4o2TvPiXEg1HN4XN5C-zf10xdeuRNk";
// const TelegramBot = new tbotapi(token, {polling: true});

import TelegramBot = require("node-telegram-bot-api");
import { HypeResponses } from "./bot-modules/hype-responses/hype-responses";
import { DotaMatches } from "./bot-modules/dota-matches/dota-matches";

const MyTelegramBot = new TelegramBot(token, { polling: true });

new HypeResponses(MyTelegramBot);
new DotaMatches(MyTelegramBot);

// Test Echo Commands
MyTelegramBot.onText(/\/echo (.+)/, (msg: any, match: any): void => {
  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"
  MyTelegramBot.sendMessage(chatId, resp);
});
