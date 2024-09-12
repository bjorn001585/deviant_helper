import { EmbedBuilder, GuildMember, Message, TextChannel } from "discord.js";
import { AlisterHelper } from "../src/core";
import DiscordEvent from "../src/structures/event";
import { SharedEntity } from "../src/@foxlib/shared-entity";
import { UserModel } from "../src/database/user_schema";

export default class UseEvent extends DiscordEvent<"guildMemberAdd"> {
  constructor(client: AlisterHelper) {
    super(client, {
      name: "guildMemberAdd",
      once: false
    })
  }

  async execute(member: GuildMember) {
    try {
      const user = await SharedEntity.findOneOrCreate(UserModel, {
        search: {
          uid: member.id
        },
        createPayload: {
          username: {
            discord: member.user.username
          }
        }
      })

      const channel = this.client.channels.resolve(
        "1175868237871845401"
      ) as TextChannel | null;

      if (channel && user.payload.request.status == "approved") {
        member.roles.remove("1277332798025371648")
        const embed = new EmbedBuilder()
          .setTitle(`👋 C возвращением ${member.user.username} 👋`)
          .setDescription(
            [
              "Мы очень рады что ты сново вернулся к нам!!",
              "Не забудь еще раз прочитать правила <#1175868237871845397>",
              "Вся информация находится тут <#1175870575571390614>",
            ].join("\n")
          )
          .setColor(0xb400ff)
          .setImage(
            "https://cdn.discordapp.com/attachments/1177226027047604315/1193259561549828207/welcome.png?ex=65ac1091&is=65999b91&hm=f5aadad283e190b39ebe99414eda66271896fa296bc766b4b94d304895f41c32&"
          )
          .setThumbnail(member.user.avatarURL({ size: 2048, extension: "png" }));
  
  
        // const raw = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
  
        channel.send({
          embeds: [embed],
          // components: [raw],
        });
      }
    } catch (error) {
      
    }

    // console.log(await json.toJson());
  }
}