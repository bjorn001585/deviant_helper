import { GuildMember, Message } from "discord.js";
import { AlisterHelper } from "../src/core";
import DiscordEvent from "../src/structures/event";
import { SharedEntity } from "../src/@foxlib/shared-entity";
import { UserModel } from "../src/database/user_schema";

export default class UseEvent extends DiscordEvent<"guildMemberRemove"> {
  constructor(client: AlisterHelper) {
    super(client, {
      name: "guildMemberRemove",
      once: false
    })
  }

  async execute(member: GuildMember) {

  }
}