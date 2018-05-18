import * as TelegramBot from 'node-telegram-bot-api';
import { Card, Cards } from 'scryfall-sdk';

export class MTGSearch {
  private HBot: TelegramBot;

  constructor(botReference: TelegramBot) {
    this.HBot = botReference;
    this.setMTGCommandParser();
  }

  /**
   * Basic setup function to enable our parser to call the search function
   */
  private setMTGCommandParser(): void {
    this.HBot.onText(/^\/mtg/i, (msg: any, match: any): void => {
      const commandArray: string[] = msg.text.split(' ');
      if (commandArray.length === 1) {
        // TODO - Possibly integrate with native help commands?
        this.showMissingQuery(msg);
      } else {
        const queryString: string = commandArray.splice(1, commandArray.length).join(' ');
        this.getMTGCards(msg, queryString);
      }
    });
  }

  /**
   * Wrapper function to tell the user that they didn't provide a search query.
   * @param msg - The initial message sent to the bot. It allows us to send a message back.
   */
  private showMissingQuery(msg: any): void {
    this.HBot.sendMessage(msg.chat.id, `Please provide something for me to search for. Try your favorite card name!`);
  }

  /**
   * Function to fetch MTG card data based on user inputs. If too many or no cards are found,
   * it will let the user know or provide steps for refining their search query.
   * @param msg - The initial message sent to the bot. It allows us to send a message back.
   * @param queryString - The custom query that was provided by the user.
   */
  private getMTGCards(msg: any, queryString: string) {
    this.HBot.sendMessage(msg.chat.id, `<b>Fetching MTG card results for "${queryString}"</b>\n`, { parse_mode: 'HTML', disable_web_page_preview: true });
    const cardResults: Card[] = [];
    // TODO: add support for unique:prints or see whether or not it would be better to injest a set param flag.
    // Without the set param, the API fetches most recent printing (including online) which affects pricing/image.
    // If we simply open this up to use unique:prints, the amount of cards is exponentially more (since almost all cards have more than one printing)
    Cards.search(queryString + ' order:released')
      // Called each time the API finds a card
      .on('data', (card: Card) => {
        cardResults.push(card);
      })
      // Called if the API encounters an error.
      .on('error', (error: any) => {
        // The 'error' object has the following keys: ['name', 'statusCode', 'message', 'error', 'options', 'response']
        // Default API error message from Scryfall can be used at error.response.body.details
        if (error.statusCode === 404) {
          // We use a custom message here because the help link in the orignal message refers to dead link
          this.HBot.sendMessage(msg.chat.id, `Sorry, your search query didn't match any cards. Please try refining your query or removing excess words.`);
        } else {
          // This is for any unhandled errors that we're not expecting.
          this.HBot.sendMessage(msg.chat.id, `${error.response.body.details}`);
        }
      })
      // Called once the API says there are no more cards left for us to get.
      .on('end', () => {
        if (cardResults.length === 1) {
          // If there's only one card, we send the info/image directly.
          const card: Card = cardResults[0];
          const priceCaption: string = card.usd ? `USD Price: $${card.usd}` : null;
          this.HBot.sendPhoto(msg.chat.id, `${card.image_uris.normal}`, { caption: priceCaption });
        } else {
          // If there are multiple cards, we provide up to the top 5 results and ask the user to refine.
          let message: string = `Multiple cards found (${cardResults.length}). Did you mean one of the following? If not, try refining or changing your query.\n`;
          const maxResultNumber = 5 > cardResults.length ? cardResults.length : 5;
          for (let i = 0; i < maxResultNumber; i += 1) {
            const card: Card = cardResults[i];
            message += `\t\t\t* ${card.name} <i>(${card.type_line})</i>\n`;
          }
          this.HBot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML', disable_web_page_preview: true });
        }
      });
  }

}
