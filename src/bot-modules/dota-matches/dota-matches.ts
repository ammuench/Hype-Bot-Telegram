import TelegramBot = require("node-telegram-bot-api");
import * as GosuAPI from "gosugamers-api";

export class DotaMatches {
  private MyTelegramBot: TelegramBot;

  constructor(botReference: TelegramBot) {
    this.MyTelegramBot = botReference;
    this.setBasicHypeResponses();
  }

  private setBasicHypeResponses(): void {
    this.MyTelegramBot.onText(/\/dotalive/i, (msg: any, match: any): void => {
      this.MyTelegramBot.sendMessage(msg.chat.id, "Fetching Live Dota 2 matches...!");
      this.liveGames()
        .then((matchStrings) => {
          for (let i = 0, len = matchStrings.length; i < len; i++) {
            const hideNotification = (i > 0);
            this.MyTelegramBot.sendMessage(msg.chat.id, matchStrings[i], { parse_mode: "HTML", disable_web_page_preview: true, disable_notification: hideNotification });
          }
        });
    })
  }

  private liveGames(): Promise<string> {
    return new Promise((resolve: any, reject: any) => {
      try {
        GosuAPI.fetchMatchUrls("dota2", null, (err, urls) => {
          const matchArray = ["<b>Current Live Dota 2 Matches</b>"];
          GosuAPI.parseMatches(urls, (err, matches) => {
            if (!err) {
              for (let match of matches) {
                if (match.status === "Live") {
                  matchArray.push(`<b>${match.home.name}</b> vs <b>${match.away.name}</b> -- ${match.rounds} (<a href="${match.url}">Link</a>)`);
                }
              }
              console.log(matchArray);
              resolve(matchArray);
            } else {
              const error = ["<i>Error fetching match URLs from service</i>"];
              reject(error);
            }
          })
        });
      } catch (e) {
        const error = ["<i>Error fetching match URLs from service</i>"];
        reject(error);
      }
    })
  }
}
