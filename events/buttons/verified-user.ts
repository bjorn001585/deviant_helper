import {
  ActionRowBuilder,
  ButtonInteraction,
  GuildMemberRoleManager,
  Interaction,
  ModalBuilder,
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

  action(interaction: Interaction) {
    return {
      condition: interaction.isButton(),
      customId: "verify-user",
    };
  }

  async execute(interaction: ButtonInteraction) {
    if(interaction.member?.roles instanceof GuildMemberRoleManager) {
      interaction.member?.roles.remove("1175868237511143432")
    }
    // 1175868237511143432
    const users = await SharedEntity.toList(UserModel)
    if(users.some(user => user.payload.uid == interaction.user.id && user.payload.request.status == "pending")) {
      interaction.reply({
        content: "Вы не можете отправить новую заявку, пока не рассмотрят текущую.",
        ephemeral: true
      })

      return;
    } else if(users.some(user => user.payload.uid == interaction.user.id && user.payload.isVerfied)) {
      interaction.reply({
        content: "Вы уже являетесь участником сервера!",
        ephemeral: true
      })

      return;
    }

    const personName = new TextInputBuilder()
      .setCustomId("person-name")
      .setLabel("Укажите ваше имя (Можно псевдоним)")
      .setPlaceholder("Так мы будем знать как в вам обращатся")
      .setMinLength(3)
      .setMaxLength(10)
      .setRequired()
      .setStyle(TextInputStyle.Short);

    const serverName = new TextInputBuilder()
      .setCustomId("server-name")
      .setLabel("Укажите ваш никнейм в Minecraft")
      .setPlaceholder("Так будут выдоватся (префиксы и т.д.) на сервере")
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(20)
      .setStyle(TextInputStyle.Short);

    const personAge = new TextInputBuilder()
      .setCustomId("person-age")
      .setLabel("Укажите вашу дату рождения")
      .setPlaceholder("Пример: 17 ноября 2001")
      .setRequired()
      .setStyle(TextInputStyle.Short);

    const purpose = new TextInputBuilder()
      .setCustomId("purpose")
      .setLabel("Что вы хотите делать на сервере")
      .setPlaceholder("Строить, Знакомится и развивать сервер!")
      .setRequired()
      .setMinLength(5)
      .setMaxLength(50)
      .setStyle(TextInputStyle.Short);

    const aboutSelf = new TextInputBuilder()
      .setCustomId("about-self")
      .setLabel("И расскажите немного о себе")
      .setRequired()
      .setMinLength(5)
      .setMaxLength(100)
      .setStyle(TextInputStyle.Paragraph);

    const rawPersonName =
      new ActionRowBuilder<TextInputBuilder>().addComponents(personName);
    const rawServerName =
      new ActionRowBuilder<TextInputBuilder>().addComponents(serverName);
    const rawPersonAge = new ActionRowBuilder<TextInputBuilder>().addComponents(
      personAge
    );
    const rawPurpose = new ActionRowBuilder<TextInputBuilder>().addComponents(
      purpose
    );
    const rawAboutSelf = new ActionRowBuilder<TextInputBuilder>().addComponents(
      aboutSelf
    );

    const modal = new ModalBuilder()
      .addComponents(rawPersonName)
      .addComponents(rawServerName)
      .addComponents(rawPersonAge)
      .addComponents(rawPurpose)
      .addComponents(rawAboutSelf)
      .setTitle("Верификация")
      .setCustomId("modal-verify");

    interaction.showModal(modal);
  }
}
