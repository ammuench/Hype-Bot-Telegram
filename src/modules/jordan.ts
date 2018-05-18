import * as Firebase from 'firebase-admin';
import * as TelegramBot from 'node-telegram-bot-api';

export class TheDarkWebProfessor {
    private HBot: TelegramBot;
    private quoteSource = {
        conclusion: [
            'and we can\'t even have a conversation about it.',
            'so just ask the Kulaks how that worked out.',
            'and no one is talking about it!',
            'as you can bloody well imagine!',
            'just like Nietzsche prophesized.',
            'so you shoudl sign up for the Self Authoring Suite.',
            'and you can be damn sure about that!',
        ],
        evilWeapon: [
            'murderous equity doctrine',
            'dangerous egalitarian utopia',
            'hatred of Objective Truth',
            'compelled speech',
            'group identity',
            'Maoist pronouns',
            'propaganda from <i>Frozen</i>',
            'radical collectivism',
            'lens of power for everything',
            'disdain for Being',
            'ideological bill C-16',
            'low serotonin levels and poor posture',
            'totalitarian ideology which I\'ve been studying for decades',
        ],
        favThing: [
            '<i>the</i> dominance hierarchy',
            '<i>the</i> metaphorical substrate',
            'Western values',
            'the classical humanities',
            '<i>the</i> individual',
            'the Hero\'s Journey',
            'the fabric of Being',
            'Solzhenitsyn\'s genius',
            'Carl Jung\'s Legacy',
            'IQ testing\'s ability to determine achievement',
            'the divine Logos',
            'the inescapiable tragedy and suffering of life',
            'the humble quest of the lobster',
        ],
        spicyVerb: [
            'are totally corrupting',
            'have zero respect for',
            'want to annihilate',
            'assault the archetype of',
            'don\'t bloody believe in',
            'will quickly infect',
            'unleash the Chaos Dragon of',
            'dismiss and transgress',
            'must be stopped from attacking',
            'will make Gulags out of',
            'feminize and weaken',
        ],
        villans: [
            'Postmodern Neomarxists',
            'Feminists (who secretly crave domination)',
            'Leftist academics',
            'Dangerous ideologue',
            'Derrida and Foucault',
            'Indoctrinated students',
            'Social justice types',
            'Radical trans activists',
            'Politically Correct HR departments',
            '<i>Actual</i> Communists',
            'The <i>Left</i>',
            'Millenials with a victimhood mentality',
        ],
    };

    constructor(botReference: TelegramBot) {
        this.HBot = botReference;
        this.giveJBPQuote();
    }

    private giveJBPQuote() {
        this.HBot.onText(/^\/jbp/gi, (msg, match) => {
            this.HBot.sendMessage(msg.chat.id, this.genJBPQuote(), { parse_mode: 'HTML' });
        });
    }

    private genJBPQuote() {
        const { villans, spicyVerb, favThing, evilWeapon, conclusion } = this.quoteSource;
        const giveRand = (maxLen: number) => {
            return Math.floor(Math.random() * Math.floor(maxLen));
        };

        const finalString = `${villans[giveRand(villans.length)]} ${spicyVerb[giveRand(spicyVerb.length)]} ${favThing[giveRand(favThing.length)]} because of their ${evilWeapon[giveRand(evilWeapon.length)]} ${conclusion[giveRand(conclusion.length)]}`;
        return finalString;
    }
}
