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

  action(interaction: Interaction) {
    return {
      condition: interaction.isButton(),
      customId: "user-denied",
    };
  }

  async execute(interaction: ButtonInteraction) {
    const [target, id] = interaction.customId.split(":");
    const user = await this.client.users.fetch(id);

    const reason = new TextInputBuilder()
      .setLabel("Причина")
      .setCustomId("user-denied-reason")
      .setRequired()
      .setStyle(TextInputStyle.Short);

    const raw = new ActionRowBuilder<TextInputBuilder>().addComponents(reason);

    const modal = new ModalBuilder()
      .setTitle("Отклонение заявки")
      .setCustomId(`modal-denied:${user.id}`)
      .addComponents(raw);

    interaction.showModal(modal);
  }
}
