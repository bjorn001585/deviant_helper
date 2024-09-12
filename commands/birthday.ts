import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message, TextChannel } from "discord.js";
import Command from "../src/structures/command";
import { AlisterHelper } from "../src/core";
import { Result } from "../src/util/Similarity";
import DateTime from "../src/util/dataTime";
import { SharedEntity } from "../src/@foxlib/shared-entity";
import { UserModel } from "../src/database/user_schema";
import { formatDuration } from "../src/util/formatDuration";
import { SchedulerModel } from "../src/database/scheduler_schema";

export default class UseCommand extends Command {
  constructor(client: AlisterHelper) {
    super(client, {
      name: "birthday",
      description: "Узнать свой день рождения или еще кого-то",
      memberPermissions: [],
      clientPermissions: [],
      arguments: [],
      flags: []
    });
  }

  public async run(message: Message<boolean>) {
    const user = await SharedEntity.findOneOrCreate(UserModel, { search: { uid: message.author.id } });
    const task = await SharedEntity.findOneOrCreate(SchedulerModel, {
      search: {
        uid: user.payload.uid
      },
      createPayload: {
        tasks: []
      }
    })

    const date = new Date(user.payload.about.birthday)

    const currentDate = new Date();
    currentDate.setUTCDate(8)
    const currentTime = currentDate.getTime()
    const dateDue = new Date(currentDate.getFullYear(), date.getMonth(), date.getDate(), 8, 0);
    dateDue.setUTCHours(8)
    const dateDueTime = dateDue.getTime()

    if(currentTime > dateDueTime) {
      dateDue.setFullYear(currentDate.getFullYear() + 1)
    }

    const diff = dateDue.getTime() - currentTime;
    const msg = await message.channel.send(`${user.payload.about.name}, твой день рождения через **\`${formatDuration(diff, "ms", 3)}\`**`)

    if(!task.payload.tasks.some(task => task.type == "Birthday")) {
      const button = new ButtonBuilder()
        .setCustomId(`setBirthday:${message.author.id}`)
        .setEmoji("🎂")
        .setLabel("Напомнить о дне рождении")
        .setStyle(ButtonStyle.Secondary)

      const raw = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(button)

      msg.edit({ components: [ raw ] })
    }
  }
}
