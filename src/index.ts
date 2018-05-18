// Vendor Libs
const config = require('../config.json');

import * as Firebase from 'firebase-admin';
const FirebaseCredentials = require('../firebase-credentials.json');
import * as TelegramBot from 'node-telegram-bot-api';

// Import Modules
import { DotaMatches } from './modules/dota-matches';
import { TheDarkWebProfessor } from './modules/jordan';
import { Karma } from './modules/karma';
import { MTGSearch } from './modules/mtg-search';
import { TextResponses } from './modules/text-responses';

const token = config.BOT_TOKEN;

const MyTelegramBot = new TelegramBot(token, { polling: true });

Firebase.initializeApp({
    credential: Firebase.credential.cert(FirebaseCredentials),
});

const db = Firebase.firestore();

new TextResponses(MyTelegramBot);
new Karma(MyTelegramBot, db);
new DotaMatches(MyTelegramBot);
new TheDarkWebProfessor(MyTelegramBot);
new MTGSearch(MyTelegramBot);
