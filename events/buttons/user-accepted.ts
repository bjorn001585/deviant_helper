import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
  Interaction,
  ModalBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { AlisterHelper } from "../../src/core";
import DiscordEvent from "../../src/structures/event";
import { SharedEntity } from "../../src/@foxlib/shared-entity";
import { UserModel } from "../../src/database/user_schema";

export default class UseEvent extends DiscordEvent<"interactionCreate"> {
  constructor(client: AlisterHelper) {
    super(client, {
      name: "interactionCreate",
      once: false,
    });
  }
// HRXJXBVL5WLY1YPFXVYX9PMX
  action(interaction: Interaction) {
    return {
      condition: interaction.isButton(),
      customId: "user-accepted",
    };
  }

  async execute(interaction: ButtonInteraction) {
    const [ target, id ] = interaction.customId.split(":")
    const user = await this.client.users.fetch(id);
    const entity = await SharedEntity.findOneOrCreate(UserModel, { search: { uid: user.id } })

    const member = await interaction.guild?.members.fetch(id)

    if(member) {
      member.roles.add("1277332882934726770")
      member.roles.remove("1277332798025371648")
    }

    entity.payload.request.status = "approved"
    entity.payload.isVerfied = true
    entity.save()

    const embed = new EmbedBuilder()
      .setTitle("Верификация пройдена!")
      .setDescription("Поздравляем, вы успешно прошли верификацию! Не забудьте прочитать правила и посмотреть канал <#1175870575571390614>")
      .setColor(0xb400ff);

    user.send({ embeds: [embed] }).catch((e) => e);

    const old_embed = new EmbedBuilder(interaction.message.embeds[0].toJSON())
      .setTitle("✅ Принято")
      .setColor(0x0cf559);

    interaction.message.edit({
      content: null,
      embeds: [old_embed],
      components: [],
    });

    const channel = this.client.channels.resolve(
      "1175868237871845401"
    ) as TextChannel | null;

    if (channel) {
      const embed = new EmbedBuilder()
        .setTitle(`👋 Добро пожаловать ${user.username} 👋`)
        .setDescription(
          [
            "Мы рады что ты присоеденился к нам!!",
            "Не забудь прочитать правила <#1175868237871845397>",
            "Вся информация находится тут <#1175870575571390614>",
          ].join("\n")
        )
        .setColor(0xb400ff)
        .setImage(
          "https://cdn.discordapp.com/attachments/1177226027047604315/1193259561549828207/welcome.png?ex=65ac1091&is=65999b91&hm=f5aadad283e190b39ebe99414eda66271896fa296bc766b4b94d304895f41c32&"
        )
        .setThumbnail(user.avatarURL({ size: 2048, extension: "png" }));

      const button = new ButtonBuilder()
        .setLabel("По приветствовать")
        .setCustomId(`say-hello:${user.id}`)
        .setEmoji({ name: "👋" })
        .setStyle(ButtonStyle.Secondary);

      // const raw = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

      channel.send({
        embeds: [embed],
        // components: [raw],
      });
    }
  }
}
