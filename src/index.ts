// Core Bot Creation
import TelegramBot = require("node-telegram-bot-api");
import { TextResponses } from "./bot-modules/text-responses/text-responses";
import { TextCommands } from "./bot-modules/text-commands/text-commands";
import { DotaMatches } from "./bot-modules/dota-matches/dota-matches";

const token = "362547656:AAGAl4o2TvPiXEg1HN4XN5C-zf10xdeuRNk";
const MyTelegramBot = new TelegramBot(token, { polling: true });

new TextResponses(MyTelegramBot);
new TextCommands(MyTelegramBot);
new DotaMatches(MyTelegramBot);
