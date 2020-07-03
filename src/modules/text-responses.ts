import TelegramBot = require('node-telegram-bot-api');
import { hypeResponses } from '../helpers/hype-responses';

export class TextResponses {
  private HBot: TelegramBot;

  constructor(botReference: TelegramBot) {
    this.HBot = botReference;
    this.setBasicHypeResponses();
    this.setBasicTextCommands();
  }

  private setBasicHypeResponses(): void {
    this.HBot.onText(/h+y+p+e+/i, (msg: any, match: any): void => {
      this.HBot.sendMessage(msg.chat.id, hypeResponses[Math.floor(Math.random() * hypeResponses.length)]);
    });
  }

  private setBasicTextCommands(): void {
    this.HBot.onText(/^\/shrug/i, (msg: any, match: any): void => {
      this.HBot.sendMessage(msg.chat.id, '¯\\_(ツ)_/¯');
    });

    this.HBot.onText(/(russia|russian|dotka|vodka)/gi, (msg, match) => {
      this.HBot.sendMessage(msg.chat.id, 'REALLL SOVIETTTT DAAAAAMAAAAAAAAAGGGGGEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
    });

    this.HBot.onText(/(stalin)|(trotsky)|(lenin)/gi, (msg, match) => {
      this.HBot.sendMessage(msg.chat.id, "The USSR wasn't that bad okayyyy")
    });

    this.HBot.onText(/(uwu)|(owo)/, (msg, match) => {
      this.HBot.sendMessage(msg.chat.id, '( ᵘ ꒳ ᵘ ✼)');
    });
  }
}
