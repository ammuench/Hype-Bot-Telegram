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
        .then((matchString) => {
          this.MyTelegramBot.sendMessage(msg.chat.id, matchString, { parse_mode: "HTML", disable_web_page_preview: true});
        });
    })
  }

  private liveGames(): Promise<string> {
    return new Promise((resolve: any, reject: any) => {
      try {
        GosuAPI.fetchMatchUrls("dota2", null, (err, urls) => {
          let matchesString = "<b>Current Live Dota 2 Matches</b>\n==============================\n";
          GosuAPI.parseMatches(urls, (err, matches) => {
            if (!err) {
              for (let match of matches) {
                if (match.status === "Live") {
                  matchesString += `\n<b>${match.home.name}</b> vs <b>${match.away.name}</b>\n${match.rounds} (<a href="${match.url}">Link</a>)`;
                }
              }
              resolve(matchesString);
            } else {
              const error = "<i>Error fetching match URLs from service</i>";
              reject(error);
            }
          })
        });
      } catch (e) {
        const error = "<i>Error fetching match URLs from service</i>";
        reject(error);
      }
    })
  }
}
