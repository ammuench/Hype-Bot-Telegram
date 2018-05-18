// Vendor Libs
import * as Firebase from 'firebase-admin';
const FirebaseCredentials = require('../firebase-credentials.json');
import * as TelegramBot from 'node-telegram-bot-api';

// Import Modules
import { DotaMatches } from './modules/dota-matches';
import { TheDarkWebProfessor } from './modules/jordan';
import { Karma } from './modules/karma';
import { TextResponses } from './modules/text-responses';

const token = '362547656:AAGAl4o2TvPiXEg1HN4XN5C-zf10xdeuRNk';
const MyTelegramBot = new TelegramBot(token, { polling: true });

Firebase.initializeApp({
    credential: Firebase.credential.cert(FirebaseCredentials),
});

const db = Firebase.firestore();

new TextResponses(MyTelegramBot);
new Karma(MyTelegramBot, db);
new DotaMatches(MyTelegramBot);
new TheDarkWebProfessor(MyTelegramBot);
