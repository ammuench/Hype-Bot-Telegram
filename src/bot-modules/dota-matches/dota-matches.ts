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
        .then((matchString: string) => {
          this.MyTelegramBot.sendMessage(msg.chat.id, matchString, { parse_mode: "HTML", disable_web_page_preview: true });
        });
    });

    this.MyTelegramBot.onText(/\/dotastrim/i, (msg: any, match: any): void => {
      this.MyTelegramBot.sendMessage(msg.chat.id, "Fetching Live Dota 2 streams...!");
      this.getDotaLiveStreams()
        .then(
        (streams: any[]) => {
          let messageText: string = "<b>Live Dota 2 Streams</b>\n==============================\n";
          for (let i: number = 0; i < 5; i++) {
            messageText += "<i>" + streams[i].channel.status + "</i>\n";
            messageText += "    - <a href=\"" + streams[i].channel.url + "\">Watch @" + streams[i].channel.name + "\'s Stream</a>\n";
          }
          this.MyTelegramBot.sendMessage(msg.chat.id, messageText, { parse_mode: "HTML", disable_web_page_preview: true });
        },
        (error: any) => {
          this.MyTelegramBot.sendMessage(msg.chat.id, error, { parse_mode: "HTML", disable_web_page_preview: true });
        }
        );
    });
  }

  private liveGames(): Promise<string> {
    return new Promise((resolve: any, reject: any) => {
      try {
        GosuAPI.fetchMatchUrls("dota2", null, (fetchError, urls) => {
          let matchesString = "<b>Current Live Dota 2 Matches</b>\n==============================\n";
          GosuAPI.parseMatches(urls, (parseError, matches) => {
            if (!parseError) {
              for (const match of matches) {
                if (match.status === "Live") {
                  matchesString += `\n<b>${match.home.name}</b> vs <b>${match.away.name}</b>\n${match.rounds} (<a href="${match.url}">Link</a>)`;
                }
              }
              resolve(matchesString);
            } else {
              const error = "<i>Error fetching match URLs from service</i>";
              reject(error);
            }
          });
        });
      } catch (e) {
        const error = "<i>Error fetching match URLs from service</i>";
        reject(error);
      }
    });
  }

  private getDotaLiveStreams(): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      const twitchURL: string = "https://api.twitch.tv/kraken/streams?game=Dota%202&client_id=xmrewln6tf1uwgvdwqbofprp8mqxqk";
      const request = require("request");
      request.get(twitchURL, (error: any, response: any, body: any) => {
        if (response) {
          resolve(JSON.parse(response.body).streams);
        } else if (error) {
          reject(error);
        } else {
          reject("An unknown error occurred while getting data from Twitch");
        }
      });
    });
  }
}
