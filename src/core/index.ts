import {
  Client,
  GatewayIntentBits,
  Message,
  GuildMember as DiscordUser,
  ClientEvents,
} from "discord.js";
import DiscordCommand from "../structures/command";
import PathLoadEngine from "../engine/PathLoadEngine";
import DiscordEvent from "../structures/event";

import "../database/index"
import TaskScheduler from "../util/task";

interface ClassComponentDefault<Args extends any[], R> {
  default: new (...args: Args) => R;
}

interface TypingOptions {
  typingSpeed?: number;
  delayBetweenWords?: number;
  delayBetweenSentences?: number;
  errorRate?: number;
}

type Optional<T> = T | null
interface RandomEvent<T>{
  value: T
  chance: number
}

type Callback<A extends any[]> = (...args: A) => void

export class AlisterHelper extends Client {
  public commands = new Map<string, DiscordCommand>();

  public tasks = new TaskScheduler()

  constructor() {
    super({
      intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
      ],
      allowedMentions: {
        parse: ["users", "roles"],
        repliedUser: true,
      },
    });
  }

  processCommand() {
    PathLoadEngine.load("commands", (path) => {
      import(path).then(
        ({ default: Command }: ClassComponentDefault<[AlisterHelper], DiscordCommand>) => {
          const command = new Command(this);
          this.commands.set(command.option.name, command);
        },
      );
    });
  }

  processEvent() {
    PathLoadEngine.load("events", (path) => {
      import(path).then(
        ({ default: Event }: ClassComponentDefault<[AlisterHelper], DiscordEvent<keyof ClientEvents>>) => {
          const event = new Event(this);
          if(event.options.once) {
            this.once(event.options.name, event.run.bind(event))
          } else {
            this.on(event.options.name, event.run.bind(event))
          }

          console.log(`Event [${event.options.once ? "once" : "on"}.${event.options.name}]: Loaded`);
        },
      );
    });
  }

  utilTruncateText(args: string[], length: number): string {
    const joinedText = args.join(" ");

    if (joinedText.length > length) {
      return `${joinedText.slice(0, length)}...`;
    }

    return joinedText;
  }

  utilConvertToSnakeCase(input: string): string {
    const result = input.replace(
      /[A-Z]/g,
      (match) => `_${match.toLowerCase()}`,
    );
    return result.startsWith("_") ? result.slice(1) : result;
  }

  utilSmartJson<T>(list: T[]): string {
    switch (list.length) {
      case 1:
        return `${list[0]}`;
      case 2:
        return `${list[0]} и ${list[1]}`;
      default:
        const joinedList = list.slice(0, list.length - 1).join(", ");
        return `${joinedList} и ${list[list.length - 1]}`;
    }
  }

  /** Был отправлен на 5 дней */
  utilConvertMilliseconds(milliseconds: number, type: "outFor"): string
  /** Событие произойдет через 5 дней */
  utilConvertMilliseconds(milliseconds: number, type: "placeIn"): string
  utilConvertMilliseconds(
    milliseconds: number,
  ): string {
    const zero = `0 секунд`;

    if (milliseconds <= 0) return zero;

    const s = 1000;
    const m = s * 60;
    const h = m * 60;
    const d = h * 24;
    const M = d * 30.4375;
    const y = d * 365.25;

    const sX = Math.floor((milliseconds / s) % 60);
    const mX = Math.floor((milliseconds / m) % 60);
    const hX = Math.floor((milliseconds / h) % 24);
    const dX = Math.floor((milliseconds / d) % 30.4375);
    const MX = Math.floor((milliseconds / M) % 12);
    const yX = Math.floor(milliseconds / y);

    const parts: (string | null)[] = [
      sX > 0 ? `${this.utilDeclineNumber(sX, ["секунду", "секунды", "секунд"])}` : null,
      mX > 0 ? `${this.utilDeclineNumber(mX, ["минуту", "минуты", "минут"])}` : null,
      hX > 0 ? `${this.utilDeclineNumber(hX, ["час", "часа", "часов"])}` : null,
      dX > 0 ? `${this.utilDeclineNumber(dX, ["день", "дня", "дней"])}` : null,
      MX > 0 ? `${this.utilDeclineNumber(MX, ["месяц", "месяца", "месяцем"])}` : null,
      yX > 0 ? `${this.utilDeclineNumber(yX, ["год", "года", "лет"])}` : null,
    ]
      .filter((element) => element !== null)
      .reverse()
      .slice(0, 3);

    if (parts.length === 0) {
      return zero;
    }

    return this.utilSmartJson(parts);
  }

  async utilGetUser(
    message: Message,
    identify: { position: number; target: string },
  ): Promise<DiscordUser | null>;
  async utilGetUser(
    message: Message,
    identify: { position: number; target: string },
    author: true,
  ): Promise<DiscordUser>;
  async utilGetUser(
    message: Message,
    identify: { position: number; target: string },
    author: false,
  ): Promise<DiscordUser | null>;
  async utilGetUser(
    message: Message,
    identify: { position: number; target: string },
    author = false,
  ): Promise<DiscordUser | null> {
    const findUser = message.guild!.members.cache.get(identify.target);

    if (findUser) {
      return findUser;
    } else {
      const mentionUser = message.mentions.members?.toJSON()[identify.position];

      if (mentionUser) {
        return mentionUser;
      }
    }

    if (author) {
      const m = await message.guild!.members.fetch(message.author.id);
      if (m) {
        return m;
      }
    }

    return null;
  }

  utilNormalizePrice(price: number, step: number = 100, offset: number = 10) {
    return Math.ceil(price / step) * step - offset;
  }

  utilDeclineNumber(
    number: number,
    wordForms: string[],
    intermediate: string | string[] = " "
  ): string {
    function decline(number: number, wordForms: string[],) {
      const [singularForm, pluralForm, pluralGenitiveForm] = wordForms;

      let form: string;
      if (number % 100 >= 11 && number % 100 <= 20) {
        form = pluralGenitiveForm;
      } else {
        switch (number % 10) {
          case 1:
            form = singularForm;
            break;
          case 2:
          case 3:
          case 4:
            form = pluralForm;
            break;
          default:
            form = pluralGenitiveForm;
            break;
        }
      }

      return form
    }

    if(typeof intermediate == "string") {
      return `${number}${intermediate}${decline(number, wordForms)}`;
    }

    return `${number} ${decline(number, intermediate)} ${decline(number, wordForms)}`;
  }

  utilCalculateTypingTime(text: string, options: TypingOptions): number {
    const {
      typingSpeed = 2000,
      delayBetweenWords = 200,
      delayBetweenSentences = 200,
      errorRate = 0.2
    } = options;
  
    const words = text.split(" ");
    const totalWords = words.length;
    
    const typingTimes = words.map((word, index) => {
      const characters = word.split("");
      const totalCharacters = characters.length;
  
      const wordTypingTime = characters.reduce((totalTime, char, charIndex) => {
        const isLastChar = charIndex === totalCharacters - 1;
        const isError = Math.random() < errorRate;

        const charTypingTime = (char === " ") ? 0 : (1000 * 60) / typingSpeed;
        const delayTime = charIndex * 0.8;
  
        const typingTime = charTypingTime + delayTime;
  
        return totalTime + typingTime + (isError && !isLastChar ? 500 : 0);
      }, 0);
  
      const isLastWord = index === totalWords - 1;
      const wordDelay = (isLastWord ? 0 : delayBetweenWords);
  
      return wordTypingTime + wordDelay;
    });
  
    const totalTypingTime = typingTimes.reduce((total, time) => total + time, 0);
    const totalSentences = totalWords > 1 ? totalWords - 1 : 1;
    const totalDelayBetweenSentences = totalSentences * delayBetweenSentences;
  
    return totalTypingTime + totalDelayBetweenSentences << 0;
  }

  utilRandomWithChance<T>(events: RandomEvent<T>[]): Optional<T> {
    let summ_chance = 
      events
      .map(x => x.chance)
      .reduce((x,y) => x + y, 0)
  
    if (!events || summ_chance <= 0) 
      return null
  
    let winner = Math.floor(Math.random() * summ_chance)
  
    let i = 0
    for (let curr_chance = events[0].chance; 
        curr_chance <= winner; 
        curr_chance += events[i].chance
        ){ i++ }
  
    return events[i].value
  }

  async utilTimeout<A extends any[]>(callback: Callback<A>, time: number, callbackArguments: A) {
    if (!callback || typeof callback !== 'function') throw new Error('Invalid Callback')
    let args = ((callbackArguments && typeof callbackArguments === 'object' && 
      callbackArguments.length > 0) ? callbackArguments : []) as A
    let max = 2147483647
    if (time > max) {
      let t = Math.floor(time / max)
      let r = time % max
      for (let i = 0; i < t; i++) await (() => new Promise<void>(res => setTimeout(() => res(), max)))();
      if (r) {
          return setTimeout(() => callback(...args), r)
      } else {
          return callback(...args)
      }
    } else {
      return setTimeout(() => callback(...args), time)
    }
  }

  utilGetRandomValue(max: number): number;
  utilGetRandomValue(min: number, max: number): number;
  utilGetRandomValue<T>(list: T[]): T;
  utilGetRandomValue(arg1: any, arg2?: any): any {
    if (!Array.isArray(arg1) && arg2 === undefined) {
      // Если передан только один параметр, генерируем число от 0 до arg1
      return Math.floor(Math.random() * arg1);
    }

    if (Array.isArray(arg1)) {
      // Если передан список, возвращаем один случайный элемент из списка
      const randomIndex = Math.floor(Math.random() * arg1.length);
      return arg1[randomIndex];
    }

    // Если переданы два параметра, генерируем число от arg1 до arg2
    const min = Math.min(arg1, arg2);
    const max = Math.max(arg1, arg2);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  utilFindPlaceholderValues(template: string, text: string): string[] {
    const regex = /\{(\d+|\*)\}/g;
    const matches = template.match(regex);
    const values: string[] = [];

    if (matches) {
      for (const match of matches) {
        const tempLate = match.slice(1, -1)

        switch(tempLate) {
          case "*": {
            // const value = text.match(/(?<!\S)[0-9a-z]+(?!\S)/giu);
            const value = text.match(/\b[0-9a-z_\-]+\b/giu);

            if(value) {
              const rest = value.filter(v => !values.some(e => e == v)).join(" ")

              values.push(rest)
            }
          }
          default:
            const index = parseInt(tempLate);
            const value = text.match(/\b[0-9a-z_\-]+\b/giu);

            if (value && value[index] !== undefined) {
              values.push(value[index]);
            }

            break;
        }
      }
    }

    return values;
  }

  async utilSendMessage(message: Message, text: string, reply: boolean = false) {
    // message.channel.sendTyping()

    return new Promise<Message>((resolve, reject) => {
      message.channel.send({ content: text })
        .then(resolve)
        .catch(reject)
    })
  }

  utilFindDifference(str1: string, str2: string): string {
    const maxLength = Math.max(str1.length, str2.length);
    let startIndex = -1;
  
    for (let i = 0; i < maxLength; i++) {
      if (str1[i] !== str2[i]) {
        startIndex = i;
        break;
      }
    }
  
    if (startIndex === -1) {
      return "";
    }
  
    let endIndex = -1;
    for (let i = str1.length - 1, j = str2.length - 1; i >= startIndex && j >= startIndex; i--, j--) {
      if (str1[i] !== str2[j]) {
        endIndex = j;
        break;
      }
    }
  
    if (endIndex === -1) {
      endIndex = Math.max(str1.length, str2.length) - 1;
    }
  
    return str2.substring(startIndex, endIndex + 1);
  }

  connect(token: string): Promise<string> {
    return this.login(token);
  }
}