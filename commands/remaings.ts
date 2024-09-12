import { EmbedBuilder, Message } from "discord.js";
import Command from "../src/structures/command";
import { AlisterHelper } from "../src/core";
import { SharedEntity } from "../src/@foxlib/shared-entity";
import { SchedulerModel } from "../src/database/scheduler_schema";
import { formatDuration } from "../src/util/formatDuration";
import { TokenType } from "../src/engine/command-parser/token-type";
import { BooleanEntity, IntEntity } from "../src/engine/command-parser/manager";
import { getMoscowTime } from "../src/util/getMoscowTime";
import { formatDateString } from "../src/util/formatDateString";

export default class UseCommand extends Command {
  constructor(client: AlisterHelper) {
    super(client, {
      name: "remaings",
      description: "Показать весь список напоминаний",
      memberPermissions: [],
      clientPermissions: [],
      arguments: [],
      flags: []
    });
  }

  public async run(message: Message<boolean>) {
    const task = await SharedEntity.findOneOrCreate(SchedulerModel, {
      search: {
        uid: message.author.id
      },
      createPayload: {
        tasks: []
      }
    })

    const tasks = task.payload.tasks.filter(task => task.type == "Reminder")
    if(tasks.length < 1) {
      const embed = new EmbedBuilder()
        .setTitle(`📋 Список напоминаний ${message.author.username}`)
        .setColor('#FF6347')
        .setDescription('На данный момент напоминаний нет. Наслаждайтесь свободным временем! 😊')
        .setTimestamp();

      message.channel.send({ embeds: [ embed ] })
    } else {
      const embed = new EmbedBuilder()
        .setTitle(`📋 Список напоминаний ${message.author.username}`)
        .setColor(0x0077b6)

      const moscowTime = getMoscowTime();

      for(const current of tasks) {
        const diff = new Date(current.task_due).getTime() - moscowTime.getTime()
        embed.addFields({
          name: `Название: ${current.title}`,
          
          value: [
            `🕒 Добавлено: ${formatDateString(current.task_add)}`,
            `⏰ Выполнится: через **${formatDuration(diff, "ms", 3)}**`,
            `📩 Уведомлять в ЛС: **${current.remaining_self ? "Да" : "Нет"}**`,
            current.content.length < 1 ? undefined : `\`\`\`${current.content}\`\`\``
          ].filter(Boolean).join("\n"),
          inline: true
        })
      }

      message.channel.send({ embeds: [ embed ] })
    }
  }
}
