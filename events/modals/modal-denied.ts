import {
  ActionRowBuilder,
  EmbedBuilder,
  Interaction,
  ModalBuilder,
  ModalSubmitInteraction,
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
      condition: interaction.isModalSubmit(),
      customId: "modal-denied",
    };
  }

  async execute(interaction: ModalSubmitInteraction) {
    const [target, id] = interaction.customId.split(":");

    const entity = await SharedEntity.findOneOrCreate(UserModel, { search: { uid: id } })
    
    const user = await this.client.users.fetch(id);

    const reason = interaction.fields.getField("user-denied-reason");
    entity.payload.request.status = "rejected"
    entity.payload.request.description = reason.value;
    entity.save()

    if (interaction.message) {
      const old_embed = new EmbedBuilder(interaction.message.embeds[0].toJSON())
        .setTitle("❎ Отклонено")
        .setColor(0xeb1049)
        .addFields([
          {
            name: "Причина",
            value: `\`\`\`${reason.value}\`\`\``,
          },
        ]);

      interaction.message.edit({
        content: null,
        embeds: [old_embed],
        components: [],
      });
    }

    interaction.reply({
      ephemeral: true,
      content: `Сообщение отправленно ${user}`,
    });

    const embed = new EmbedBuilder()
      .setTitle("Заявка отклонена")
      .setDescription(
        "Извените за неудобства, но администрация решила отменить заявку, но вы можите пройти ее повторно"
      )
      .addFields([
        {
          name: "Причина",
          value: `\`\`\`${reason.value}\`\`\``,
        },
      ])
      .setColor(0xeb1049);

    user.send({ embeds: [embed] }).catch((e) => e);
  }
}
