import * as TelegramBot from 'node-telegram-bot-api';
import { Card, Cards } from 'scryfall-sdk';

export class MTGSearch {
  private HBot: TelegramBot;
  private cardResultsByMessageId: any = {};

  constructor(botReference: TelegramBot) {
    this.HBot = botReference;
    this.setMTGCommandParser();
  }

  /**
   * Basic setup function to enable our parser to call the search function
   */
  private setMTGCommandParser(): void {
    // Listener for messages beginning with '/mtg'
    this.HBot.onText(/^\/mtg/i, (msg: TelegramBot.Message, match: any): void => {
      const commandArray: string[] = msg.text.split(' ');
      if (commandArray.length === 1) {
        // TODO - Possibly integrate with native help commands?
        this.showMissingQuery(msg);
      } else {
        const fullQueryString: string = commandArray.splice(1, commandArray.length).join(' ');
        const queryObject: any = this.parseQueryString(fullQueryString);
        if (queryObject.flags && queryObject.flags.random) {
          this.getRandomMTGCard(msg);
        } else {
          this.searchMTGCards(msg, queryObject.queryString, queryObject.flags);
        }
      }
    });

    // Listener for the 'callback_query' event from Telegram.
    this.HBot.on('callback_query', (query: TelegramBot.CallbackQuery) => {
      this.respondToMTGKeyboardCallbackQuery(query);
    });
  }

  /**
   * Wrapper function to tell the user that they didn't provide a search query.
   * @param msg - The initial message sent to the bot. It allows us to send a message back.
   */
  private showMissingQuery(msg: TelegramBot.Message): void {
    this.HBot.sendMessage(msg.chat.id, `Please provide something for me to search for. Try your favorite card name!`);
  }

  /**
   * Function designed to take in the full query from a user and parse out
   * any and all applicable flags to use to trigger other searches or refine
   * the generic card search.
   * @param fullQueryString - Full query string including search params and flags.
   */
  private parseQueryString(fullQueryString: string): any {
    const indexOfFirstFlag: number = fullQueryString.indexOf(' -');
    // TODO: During flag integration- If other flags can be executed without a query before them, find a more robust solution to add them here.
    if (indexOfFirstFlag === -1 && fullQueryString.trim() !== '-r') {
      return {
        queryString: fullQueryString,
      };
    }
    // TODO: Fill out the following flags section with other appropriate flags.
    return {
      flags: {
        random: fullQueryString.indexOf(' -r') >= 0 || fullQueryString.trim() === '-r',
      },
      queryString: fullQueryString.slice(0, indexOfFirstFlag),
    };
  }

  /**
   * Helper function to send the user a random mtg card. This card will be any combination
   * of available API parameters meaning it likely won't be in English.
   * @param msg - The initial message sent to the bot. It allows us to send a message back.
   */
  private getRandomMTGCard(msg: TelegramBot.Message): void {
    Cards.random().then(
      (card: Card) => {
        const priceCaption: string = card.usd ? `USD Price: $${card.usd}` : null;
        this.HBot.sendPhoto(msg.chat.id, `${card.image_uris.normal}`, { caption: priceCaption });
      },
      (error: any) => {
        // This is for any unhandled errors that we're not expecting.
        this.HBot.sendMessage(msg.chat.id, `${error.response.body.details}`);
      },
    );
  }

  /**
   * Function to fetch MTG card data based on user inputs. If too many or no cards are found,
   * it will let the user know or provide steps for refining their search query.
   * @param msg - The initial message sent to the bot. It allows us to send a message back.
   * @param queryString - The custom query that was provided by the user.
   * @param params - Optional parameter that contains flags to refine the card search.
   */
  private searchMTGCards(msg: TelegramBot.Message, queryString: string, params?: any): void {
    this.HBot.sendMessage(msg.chat.id, `<b>Fetching MTG card results for "${queryString}"</b>\n`, { parse_mode: 'HTML', disable_web_page_preview: true });
    const cardResults: Card[] = [];
    // TODO: Work on flushing out the params provided by the parseQueryString function. Start with sets.
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
          this.sendSingleCardResult(msg, cardResults[0]);
        } else {
          const cardMatchFromName: Card = cardResults.find((card) => card.name.toLowerCase() === queryString.toLowerCase());
          if (cardMatchFromName) {
            this.sendSingleCardResult(msg, cardMatchFromName);
          } else {
            // If there are multiple cards, we provide up to the top 5 results and ask the user to refine.
            this.sendMultipleCardResults(msg, cardResults);
          }
        }
      });
  }

  /**
   * Function to search the ScryFall API using an existing cardId. If
   * a card is found, we will send it to the user.
   * @param msg - The initial message sent to the bot. It allows us to send a message back.
   * @param cardId - The Id of the card we want to send to the user.
   */
  private getMtgCardById(msg: TelegramBot.Message, cardId: string): void {
    Cards.byId(cardId).then(
      (result: Card) => {
        this.sendSingleCardResult(msg, result);
      },
      (error) => {
        this.HBot.sendMessage(msg.chat.id, `${error.response.body.details}`);
      },
    );
  }

  /**
   * Function to send user a single MTG card. Data is sent as a
   * picture with the caption of the USD price, if applicable.
   * @param msg - The initial message sent to the bot. It allows us to send a message back.
   * @param card - The Card data fetched from ScryFall.
   */
  private sendSingleCardResult(msg: TelegramBot.Message, card: Card): void {
    const priceCaption: string = card.usd ? `USD Price: $${card.usd}` : null;
    this.HBot.sendPhoto(msg.chat.id, `${card.image_uris.normal}`, { caption: priceCaption });
  }

  /**
   * Function to let the user know their search result found more than one
   * result when using their query. We provide a small amount of functionality
   * to help them refine their query using inline keyboard options.
   * TODO: Consider better/more robust ways for users to interact with the full list of cards.
   * @param msg - The initial message sent to the bot. It allows us to send a message back.
   * @param cards - List of MTG cards that were returned from the user's search query.
   * @param [cardIndex] - Optional param to display cards
   */
  private sendMultipleCardResults(msg: TelegramBot.Message, cards: Card[], cardIndex: number = 0, firstCall: boolean = true): void {
    const message: string = `Multiple cards found (${cards.length}). Did you mean one of the following? If not, try refining or changing your query.\n`;
    const maxResultNumber = 10 > cards.length - cardIndex ? cards.length : cardIndex + 10;
    const keyboardCards: TelegramBot.InlineKeyboardButton[][] = [];

    for (let i = cardIndex; i < maxResultNumber; i += 1) {
      const card: Card = cards[i];
      keyboardCards.push([{ text: card.name + ' - ' + card.type_line, callback_data: 'mtgCard:' + card.id + '|' + msg.message_id }]);
    }

    // Associate the full results list to the message ID to use while interacting with our dialogues.
    this.cardResultsByMessageId[msg.message_id] = cards;
    // Navigation related keyboards
    const navKeyBoards: TelegramBot.InlineKeyboardButton[] = [];

    // If this is not the first part of the list (starting index is 0), display previous button
    if (cardIndex > 0) {
      navKeyBoards.push({ text: 'Previous Results', callback_data: 'mtgCard:prev|' + msg.message_id + '|' + (cardIndex - 10) });
    }
    // If there are more than 10 cards left, show the more button
    if (cardIndex + 10 < cards.length) {
      navKeyBoards.push({ text: 'More Results', callback_data: 'mtgCard:more|' + msg.message_id + '|' + (cardIndex + 10) });
    }
    // Only add the nav keyboards if they're needed
    if (navKeyBoards.length) {
      keyboardCards.push(navKeyBoards);
    }
    // Add a button that allows cancellation of process.
    keyboardCards.push([{ text: 'Cancel', callback_data: 'mtgCard:cancel' + '|' + msg.message_id }]);

    // If this is the first message, send the message. Otherwise update the existing one.
    if (firstCall) {
      this.HBot.sendMessage(msg.chat.id, message, {
        reply_markup: {
          inline_keyboard: keyboardCards,
          one_time_keyboard: true,
          selective: true,
        },
        reply_to_message_id: msg.message_id,
      });
    } else {
      this.HBot.editMessageReplyMarkup(
        {
          inline_keyboard: keyboardCards,
        }, {
          chat_id: msg.chat.id,
          message_id: msg.message_id,
        });
    }
  }

  /**
   * Function to handle callback_query events from inline keyboards. It handles
   * a few select command inputs sent from keyboards created in the process of
   * sending users a search result that has found multiple cards with the user's
   * query. We can handle the direct selection of a card from a list of keyboards
   * as well as showing the next results, previous results, and cancelling the
   * interaction completely.
   * @param query - CallBackQuery object associated with the event.
   */
  private respondToMTGKeyboardCallbackQuery(query: TelegramBot.CallbackQuery): void {
    const mtgDataIndex: number = query.data.indexOf('mtgCard:');
    const msg: TelegramBot.Message = query.message;
    // Make sure this 'callback_query' was from an MTG command
    if (mtgDataIndex >= 0) {
      /*
        This callback data is split in a certain order/amount depending on the first
        string after the mtgCard: prefix. The second string will always be our MessageId,
        but the first will either be a command (more/prev/cancel) or the ID of the selected
        Magic Card. If 'more' or 'prev' is the command, there will also be a third input of the
        desired index of cards to start at in the displayed search results.
      */
      const callbackData: string[] = query.data.slice(mtgDataIndex + 8).split('|');
      if (callbackData[0] === 'more') {
        const messageId: string = callbackData[1];
        const currentIndex: number = parseInt(callbackData[2], 10);

        this.sendMultipleCardResults(msg, this.cardResultsByMessageId[messageId], currentIndex, false);
      } else if (callbackData[0] === 'prev') {
        const messageId: string = callbackData[1];
        const currentIndex: number = parseInt(callbackData[2], 10);

        this.sendMultipleCardResults(msg, this.cardResultsByMessageId[messageId], currentIndex, false);
      } else if (callbackData[0] === 'cancel') {
        const messageId: string = callbackData[1];

        this.HBot.deleteMessage(msg.chat.id, msg.message_id.toString());
        delete this.cardResultsByMessageId[messageId];
      } else {
        this.HBot.deleteMessage(msg.chat.id, msg.message_id.toString());

        const cardId: string = callbackData[0];
        const messageId: string = callbackData[1];
        const cards: Card[] = this.cardResultsByMessageId[messageId];
        const targetCard: Card = cards.find((card: Card) => card.id === cardId);

        // In the unlikely event we can't find the target card in our search results- fetch it by ID from the API.
        if (targetCard) {
          this.sendSingleCardResult(msg, targetCard);
        } else {
          this.getMtgCardById(msg, cardId);
        }

        delete this.cardResultsByMessageId[messageId];
      }
    }
  }

}
