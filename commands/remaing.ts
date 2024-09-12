import { EmbedBuilder, Message, TextChannel } from "discord.js";
import Command from "../src/structures/command";
import { AlisterHelper } from "../src/core";
import { Result } from "../src/util/Similarity";
import DateTime from "../src/util/dataTime";
import { SharedEntity } from "../src/@foxlib/shared-entity";
import { UserModel } from "../src/database/user_schema";
import { formatDuration } from "../src/util/formatDuration";
import { getMoscowTime } from "../src/util/getMoscowTime";
import { Enum, Metadata } from "../src/engine/command-parser/enum";
import BaseEntity, {
  BooleanEntity,
  EntityManager,
  IntEntity,
  StringEntity,
} from "../src/engine/command-parser/manager";
import { Token, TokenType } from "../src/engine/command-parser/token-type";
import { SchedulerModel } from "../src/database/scheduler_schema";
import { generateUUIDv4 } from "../src/util/generateComplexUUID";

export default class UseCommand extends Command {
  constructor(client: AlisterHelper) {
    super(client, {
      name: "remaining",
      description: "Создать напоминание",
      examples: [
        "{prefix}.{command} 1d -t 'title' -d 'description' - Напомню там, в каком канале было создано напоминание",
        "{prefix}.{command} 1d 5h -t 'title' -d 'description' - Напомню там, в каком канале было создано напоминание",
        "{prefix}.{command} 1мес 5d 30h -t 'title' -d 'description', 'description2' - Напомню там, в каком канале было создано напоминание",
        "{prefix}.{command} 1mo -dm -t 'title' -d 'description' - Напомню в личном сообщении",
      ],
      memberPermissions: [],
      clientPermissions: [],
      arguments: [
        {
          name: "timestamp",
          type: TokenType.TIME,
          description: "Время установки напоминания",
          required: true
        }
      ],
      flags: [
        {
          name: "dm",
          type: [TokenType.BOOLEAN],
          required: false,
          default: BooleanEntity.value("false"),
          desription: "Указывает, следует ли отправлять уведомления в личные сообщения.",
          allowList: false
        },
        {
          name: "t",
          type: [TokenType.STRING],
          required: true,
          desription: "Устанавливает заголовок напоминания",
          allowList: false
        },
        {
          name: "d",
          type: [TokenType.STRING],
          required: true,
          desription: "Определяет детальное описание напоминания",
          allowList: true
        }
      ]
    });
  }

  public async run(
    message: Message<boolean>,
    manager: EntityManager<Enum<string, Metadata>>,
    flags: Record<string, BaseEntity>
  ) {
    const user = await SharedEntity.findOneOrCreate(UserModel, {
      search: { uid: message.author.id },
    });

    const remaining = await SharedEntity.findOneOrCreate(SchedulerModel, {
      search: { uid: message.author.id },
      createPayload: {
        tasks: []
      }
    });

    const time = manager.getEntityList(TokenType.TIME).first().as(IntEntity);
    const title = flags.t.as(StringEntity);

    let content = "Не указано";

    if(flags.d.isList()) {
      content = flags.d.elements.map((element, index) => `${index + 1}. ${element.as(StringEntity).value}`).join("\n")
    }

    if(flags.d.isString()) {
      content = flags.d.value;
    }

    const moscowTime = getMoscowTime();

    remaining.payload.tasks.push({
      id: generateUUIDv4(),
      title: title.value,
      description: `Напоминание от ${user.payload.about.name}`,
      task_add: moscowTime.toISOString(),
      task_due: new Date(moscowTime.getTime() + time.value).toISOString(),
      status: "InProgress",
      type: "Reminder",
      content: content,
      cid: message.channel.id,
      remaining_self: flags.dm?.value || false,
    });

    remaining.save().then((_) => {
      const reminderCreatedEmbed5 = new EmbedBuilder()
        .setColor("#ff69b4") // Цвет рамки embed
        .setTitle(`✅ Напоминание "${title.value}" создано`)
        .setDescription("Ваше напоминание успешно создано!")
        .setAuthor({
          name: user.payload.about.name,
          iconURL: message.author.avatarURL()!,
        })
        .addFields(
          {
            name: "Напоминание выполнится:",
            value: `Через **${formatDuration(time.value)}**`,
            inline: true,
          },
          { name: "Задачи:", value: `\`\`\`${content}\`\`\`` },
          { 
            name: "Куда придет напоминание:",
            value: `${!(flags.dm?.value || false) ? `В канал <#${message.channel.id}>` : `В личные сообщения`}`
          }
        )
        .setTimestamp(Date.now()); // Время создания embed

      message.channel.send({ embeds: [reminderCreatedEmbed5] });
    });
  }
}