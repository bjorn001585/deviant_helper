import { AuditLogEvent, EmbedBuilder, Guild, GuildMember, Message } from "discord.js";
import { AlisterHelper } from "../src/core";
import DiscordEvent from "../src/structures/event";
import { StringSimilarity } from "../src/util/Similarity";
import { startAfter } from "@firebase/firestore";
import { SharedEntity } from "../src/@foxlib/shared-entity";
import { UserModel } from "../src/database/user_schema";
import { formatDuration } from "../src/util/formatDuration";

export default class UseEvent extends DiscordEvent<"guildMemberUpdate"> {
  constructor(client: AlisterHelper) {
    super(client, {
      name: "guildMemberUpdate",
      once: false,
    });
  }

  private checkRoles(before: GuildMember, after: GuildMember) {
    const beforeCount: { [key: string]: number } = {};
    const afterCount: { [key: string]: number } = {};

    const beforeRoles = before.roles.cache.filter(role => role.name != "@everyone").map(role => role.id)
    const afterRoles = after.roles.cache.filter(role => role.name != "@everyone").map(role => role.id)

    // Подсчитываем количество каждого элемента в списке before
    beforeRoles.forEach((item) => {
      const key = JSON.stringify(item);
      beforeCount[key] = (beforeCount[key] || 0) + 1;
    });

    // Подсчитываем количество каждого элемента в списке after
    afterRoles.forEach((item) => {
      const key = JSON.stringify(item);
      afterCount[key] = (afterCount[key] || 0) + 1;
    });

    const removed: string[] = [];
    const added: string[] = [];

    // Находим удалённые элементы
    Object.keys(beforeCount).forEach((key) => {
      if (!afterCount[key]) {
        for (let i = 0; i < beforeCount[key]; i++) {
          removed.push(JSON.parse(key));
        }
      } else if (beforeCount[key] > afterCount[key]) {
        for (let i = 0; i < beforeCount[key] - afterCount[key]; i++) {
          removed.push(JSON.parse(key));
        }
      }
    });

    // Находим добавленные элементы
    Object.keys(afterCount).forEach((key) => {
      if (!beforeCount[key]) {
        for (let i = 0; i < afterCount[key]; i++) {
          added.push(JSON.parse(key));
        }
      } else if (afterCount[key] > beforeCount[key]) {
        for (let i = 0; i < afterCount[key] - beforeCount[key]; i++) {
          added.push(JSON.parse(key));
        }
      }
    });

    return { added, removed }
  }

  async execute(before: GuildMember, after: GuildMember) {
    if(before.user.bot) return;

    const user = await SharedEntity.findOneOrCreate(UserModel, { 
      search: {
        uid: before.user.id
      },
      createPayload: {
        username: {
          discord: before.user.username
        }
      }
    })

    const roles = this.checkRoles(before, after);    

    if(roles.added.includes("1279880872887058544")) {
      const birthday = new Date(user.payload.about.birthday).getTime();
      const currentDate = new Date().getTime();

      const diff = currentDate - birthday;

      const seconds = 1000;
      const minutes = seconds * 60;
      const hours = minutes * 60;
      const days = hours * 24;
      const years = days * 365.25;

      const age = (diff / years) << 0;

      if (age < 18) {
        before.roles.remove("1279880872887058544");
        const nsfwWarningEmbed = new EmbedBuilder()
          .setColor("#E57373") // Приятный оттенок красного
          .setTitle("Внимание: Доступ к NSFW-контенту")
          .setDescription(
            `${user.payload.about.name}, мы заметили, что ты получил роль, предоставляющую доступ к NSFW-контенту на нашем сервере.`
          )
          .addFields(
            {
              name: "Правила сервера",
              value:
                "Согласно правилам сервера и политике Discord, доступ к NSFW-контенту разрешён только пользователям, которым исполнилось 18 лет.",
            },
            {
              name: "Ограничение доступа",
              value:
                `Тебе еще **${formatDuration(diff, "ms", 1)}**, и мы обязаны удалить эту роль и ограничить доступ к NSFW-контенту.`,
            },
            {
              name: "Причина",
              value:
                "Мы делаем это для защиты всех участников и поддержания безопасности нашего сообщества.",
            },
            {
              name: "Просьба",
              value:
                "Пожалуйста, уважай эти ограничения и подожди до достижения соответствующего возраста.",
            },
            {
              name: "Контакты",
              value:
                "Если у тебя есть вопросы или тебе нужна дополнительная информация, пожалуйста, обратись к администрации сервера.",
            }
          )
          .setFooter({
            text: "Спасибо за понимание и соблюдение правил нашего сервера.",
          });
        before.send({ embeds: [nsfwWarningEmbed] });
      }
    }

    if(user.payload.request.status == "approved") {
      before.roles.remove("1277332798025371648")
      before.roles.add("1277332882934726770")
    } else {
      before.roles.add("1277332798025371648")
      before.roles.remove("1277332882934726770")
    }

    await user.save()
  }
}
