import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Interaction,
} from "discord.js";
import { AlisterHelper } from "../../src/core";
import DiscordEvent from "../../src/structures/event";
import { SharedEntity } from "../../src/@foxlib/shared-entity";
import { SchedulerModel } from "../../src/database/scheduler_schema";
import { UserModel } from "../../src/database/user_schema";
import { getMoscowTime } from "../../src/util/getMoscowTime";
import { generateUUIDv4 } from "../../src/util/generateComplexUUID";

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
      customId: "setBirthday",
    };
  }

  async execute(interaction: ButtonInteraction) {
    const [target, id] = interaction.customId.split(":");
    if (interaction.user.id != id) return;
    const user = await SharedEntity.findOneOrCreate(UserModel, {
      search: { uid: id },
    });
    const scheduler = await SharedEntity.findOneOrCreate(SchedulerModel, {
      search: { uid: id },
      createPayload: {
        tasks: [],
      },
    });

    const date = new Date(user.payload.about.birthday);
    const currentDate = getMoscowTime();
    const currentTime = currentDate.getTime();
    const dateDue = new Date(
      currentDate.getFullYear(),
      date.getMonth(),
      date.getDate(),
      8,
      0
    );
    const dateDueTime = dateDue.getTime();

    if (currentTime > dateDueTime) {
      dateDue.setFullYear(currentDate.getFullYear() + 1);
    }

    scheduler.payload.tasks.push({
      id: generateUUIDv4(),
      title: `День роджения ${user.payload.username.discord}`,
      description: "Отмечаем день рождения",
      status: "InProgress",
      task_add: currentDate.toISOString(),
      task_due: dateDue.toISOString(),
      type: "Birthday",
      cid: "",
      remaining_self: false,
      content: "",
    });

    scheduler.save().then((_) => {
      const button = new ButtonBuilder()
        .setCustomId(`setBirthday:${id}`)
        .setEmoji("✅")
        .setLabel("Готово!")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      const raw = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

      interaction.reply({
        ephemeral: true,
        content: "Готово!"
      })
      interaction.message.edit({ components: [raw] });
    });
  }
}
