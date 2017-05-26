import TelegramBot = require("node-telegram-bot-api");

const hypeReplies: string[] = [
  "HYPE",
  "HYYYYYYPE",
  "LET ME CHECK MY WATCH... IT'S HYPE TIME",
  "FUCKING HYPE",
  "GET HYPE",
  "WHEN YOU STARE INTO THE HYPE, THE HYPE STARES BACK",
  "I AM SO HYPE",
  "LET THERE BE HYPE",
  "THERE CAN ONLY BE HYPE",
  "HYPE HYPE HYPE HYPE HYPE",
  "TURN UP THE HYPE",
  "ALL THAT REMAINS IS HYPE",
  "I AM THE HYPE",
  "HYPE",
  "HYPE HYPE HYPE HYPE HYPE HYPE HYPE HYPE HYPE HYPE HYPE HYPE",
  "HYPE HYPE HYPE",
  "GOTTA CHECK MY HYPE WATCH, ITS HYPE TIME",
  "HYPE TRAIN ACTIVATED",
  "HYYYYYYYYPPPPPPPPEEEEEE",
  "GET HYPE",
  "SO MUCH HYPE",
  "HYYYYYYYYYYPE",
  "hypehypehypehypehypehype",
  "HYYYYYYPE",
  "HYPE HYPE",
  "HYPE",
  "hype."
];

export class HypeResponses {
  private HBot: TelegramBot;

  constructor(botReference: TelegramBot) {
    this.HBot = botReference;
    this.setBasicHypeResponses();
  }

  private setBasicHypeResponses(): void {
    this.HBot.onText(/h+y+p+e+/i, (msg: any, match: any): void => {
      this.HBot.sendMessage(msg.chat.id, this.hypeReply());
    });
  }

  private hypeReply(): string {
    return hypeReplies[Math.floor(Math.random() * hypeReplies.length)];
  }
}
