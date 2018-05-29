import * as Firebase from 'firebase-admin';
import * as TelegramBot from 'node-telegram-bot-api';

export class Karma {
  private karmaDB: FirebaseFirestore.CollectionReference;
  private HBot: TelegramBot;

  constructor(botReference: TelegramBot, db: FirebaseFirestore.Firestore) {
    this.karmaDB = db.collection('karma');
    this.HBot = botReference;
    this.giveKarma();
  }

  private fetchUser(userId: string, name: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.karmaDB.doc(userId).get()
        .then((user) => {
          if (!user.exists) {
            this.karmaDB.doc(userId).set({
              karma: 0,
              name,
            });
            resolve(0);
          } else {
            resolve(user.data().karma as number);
          }
        })
        .catch((err) => {
          console.log(err);
          reject();
        });
    });
  }

  private setKarma(userId: string, newKarma: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.karmaDB
        .doc(userId)
        .get()
        .then((user) => {
          this.karmaDB.doc(userId).set({
            karma: newKarma,
            name: user.data().name,
          });
          resolve();
        })
        .catch((err) => {
          console.log(err);
          reject();
        });
    });
  }

  private giveKarma(): void {
    this.HBot.onText(/\+\+/, (msg, match) => {
      if (!msg.text.match(/(\-\-|—)/)) {
        this.karmaUp(msg);
      }
    });
    this.HBot.onText(/(\-\-|—)/, (msg, match) => {
      if (!msg.text.match(/\+\+/)) {
        this.karmaDown(msg);
      }
    });
  }

  private karmaUp(msg: TelegramBot.Message): void {
    if (msg.entities) {
      const senderID = msg.from.id;
      const senderUsername = `@${msg.from.username}`;
      const MENTION_TYPE = 'mention';
      const TEXT_MENTION_TYPE = 'text_mention';
      msg.entities.forEach((entity) => {
        if (entity.type === TEXT_MENTION_TYPE) {
          if (entity.user.id === senderID) {
            const fullName = msg.from.last_name ? `${msg.from.first_name} ${msg.from.last_name}` : `${msg.from.first_name}`;
            this.fetchUser(msg.from.id.toString(), fullName)
              .then((karma) => {
                this.setKarma(entity.user.id.toString(), karma - 1)
                  .then(() => {
                    const cheatMsg = `<b>You can't give yourself karma</b>. Level down. ${msg.from.first_name} has lost karma (${karma - 1} total)`;
                    this.HBot.sendMessage(msg.chat.id, cheatMsg, { parse_mode: 'HTML' });
                  })
                  .catch(() => {
                    console.log('err');
                  });
              })
              .catch(() => {
                console.log('err');
              });
          } else {
            const fullName = entity.user.last_name
              ? `${entity.user.first_name} ${entity.user.last_name}`
              : `${entity.user.first_name}`;
            this.fetchUser(entity.user.id.toString(), fullName)
              .then((karma) => {
                this.setKarma(entity.user.id.toString(), karma + 1)
                  .then(() => {
                    const karmaMsg = `<b>Level Up!</b> ${fullName} now has +1 Karma (${karma + 1} Total)`;
                    this.HBot.sendMessage(msg.chat.id, karmaMsg, { parse_mode: 'HTML' });
                  })
                  .catch(() => {
                    console.log('err');
                  });
              })
              .catch(() => {
                console.log('err');
              });
          }
        } else if (entity.type === MENTION_TYPE) {
          const username = msg.text.substr(entity.offset, entity.length);
          if (username === senderUsername) {
            this.fetchUser(username, username)
              .then((karma) => {
                this.setKarma(entity.user.id.toString(), karma - 1)
                  .then(() => {
                    const cheatMsg = `<b>You can't give yourself karma</b>. Level down. ${username} has lost karma (${karma - 1} total)`;
                    this.HBot.sendMessage(msg.chat.id, cheatMsg, { parse_mode: 'HTML' });
                  })
                  .catch(() => {
                    console.log('err');
                  });
              })
              .catch(() => {
                console.log('err');
              });
          } else {
            this.fetchUser(username, username)
              .then((karma) => {
                this.setKarma(username, karma + 1)
                  .then(() => {
                    const karmaMsg = `<b>Level Up!</b> ${username} now has +1 Karma (${karma + 1} Total)`;
                    this.HBot.sendMessage(msg.chat.id, karmaMsg, { parse_mode: 'HTML' });
                  })
                  .catch(() => {
                    console.log('err');
                  });
              })
              .catch(() => {
                console.log('err');
              });
          }
        }
      });
    }
  }

  private karmaDown(msg: TelegramBot.Message): void {
    if (msg.entities) {
      const senderID = msg.from.id;
      const senderUsername = `@${msg.from.username}`;
      const MENTION_TYPE = 'mention';
      const TEXT_MENTION_TYPE = 'text_mention';
      if (msg.entities[0].type === TEXT_MENTION_TYPE) {
        if (msg.entities[0].user.id !== senderID) {
          const fullName = msg.entities[0].user.last_name ? `${msg.entities[0].user.first_name} ${msg.entities[0].user.last_name}` : `${msg.entities[0].user.first_name}`;
          this.fetchUser(msg.entities[0].user.id.toString(), fullName)
            .then((karma) => {
              this.setKarma(msg.entities[0].user.id.toString(), karma - 1)
                .then(() => {
                  const karmaMsg = `<b>Level Down!</b> ${fullName} has lost 1 Karma (${karma - 1} Total)`;
                  this.HBot.sendMessage(msg.chat.id, karmaMsg, { parse_mode: 'HTML' });
                })
                .catch(() => {
                  console.log('err');
                });
            })
            .catch(() => {
              console.log('err');
            });
        }
      } else if (msg.entities[0].type === MENTION_TYPE) {
        const username = msg.text.substr(msg.entities[0].offset, msg.entities[0].length);
        if (username !== senderUsername) {
          this.fetchUser(username, username)
            .then((karma) => {
              this.setKarma(username, karma - 1)
                .then(() => {
                  const karmaMsg = `<b>Level Down!</b> ${username} now has - 1 Karma (${karma - 1} Total)`;
                  this.HBot.sendMessage(msg.chat.id, karmaMsg, { parse_mode: 'HTML' });
                })
                .catch(() => {
                  console.log('err');
                });
            })
            .catch(() => {
              console.log('err');
            });
        }
      }
    }
  }
}
