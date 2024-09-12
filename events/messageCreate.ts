import { EmbedBuilder, Message } from "discord.js";
import { AlisterHelper } from "../src/core";
import DiscordEvent from "../src/structures/event";
import { StringSimilarity } from "../src/util/Similarity";
import Lexer from "../src/engine/command-parser/lexer";
import Parser from "../src/engine/command-parser/parser";
import { SharedEntity } from "../src/@foxlib/shared-entity";
import { UserModel } from "../src/database/user_schema";
import { TokenType } from "../src/engine/command-parser/token-type";
import { smartJoinAdvanced } from "../src/util/smartJoinAdvanced";

export default class UseEvent extends DiscordEvent<"messageCreate"> {
  constructor(client: AlisterHelper) {
    super(client, {
      name: "messageCreate",
      once: false
    })
  }

  async execute(message: Message) {
    if(message.author.bot) return;

    const user = await SharedEntity.findOneOrCreate(UserModel, {
      search: {
        uid: message.author.id
      }
    }).catch(error => {
      console.log(error);
    })

    if(!(user && user.payload.isVerfied)) return

    const prefix = "f"
  
    if(!message.content.startsWith(`${prefix}.`)) return;
    const lexer = new Lexer(message.content);
    const parser = new Parser(lexer).parse();

    if(!(parser.prefix && parser.prefix.value == prefix)) return;
    
    if(parser.command) {
      const command = this.client.commands.get(parser.command.value)

      if(command) {
        command.execute(message, { 
          prefix: parser.prefix!,
          command: parser.command!,
          manager: parser.manager,
          flags: parser.flags
        });
      }
    }
  }
}