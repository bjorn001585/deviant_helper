import {
  ActivityType,
  AttachmentBuilder,
  EmbedBuilder,
  TextChannel,
  User,
} from "discord.js";
import { AlisterHelper } from "../src/core";
import DiscordEvent from "../src/structures/event";
import { MinecraftAPI } from "../src/util/mc.api";
import DateTime from "../src/util/dataTime";
import Duration from "../src/util/duration";
import { SharedEntity } from "../src/@foxlib/shared-entity";
import { UserModel } from "../src/database/user_schema";
import { SchedulerModel } from "../src/database/scheduler_schema";
import TaskScheduler, { Task } from "../src/util/task";
import { formatDuration } from "../src/util/formatDuration";
import { BaseType, Infer } from "../src/@foxlib/data-types";
import { LongTimeout } from "../src/util/LongTimeout";
import { getMoscowTime } from "../src/util/getMoscowTime";
import { getDeclension } from "../src/util/getDeclension";
import { DocumentChange } from "@firebase/firestore";

type ITask = Infer<typeof SchedulerModel.model>;

export default class UseEvent extends DiscordEvent<"ready"> {
  constructor(client: AlisterHelper) {
    super(client, {
      name: "ready",
      once: true,
    });
  }

  async execute() {
    console.log("Connect!");

    this.client.user?.setPresence({
      status: "dnd",
      activities: [
        {
          name: "Minecraft",
          state: "foxmine.zlr.su",
          type: ActivityType.Playing,
        },
      ],
    });

    // const api = new MinecraftAPI("foxmine.zlr.su");
    // this.update(api);
    this.updateRoles();

    const taskActive: Record<string, boolean> = {};
    const tasks = await SharedEntity.toList(SchedulerModel);
    for (const task of tasks) {
      task.onUpdate(async (data) => {
        const updates = (
          change: DocumentChange<
            Infer<typeof SchedulerModel.model>,
            Infer<typeof SchedulerModel.model>
          >
        ) => {
          const doc = change.doc.data();
          const db_task = SharedEntity.fromJson(SchedulerModel, doc);

          for (const subtask of doc.tasks) {
            if(!(subtask.id in taskActive)) {
              taskActive[subtask.id] = false
            }

            if(taskActive[subtask.id] == true) {
              continue;
            }

            switch (subtask.type) {
              case "Birthday": {
                if(taskActive[subtask.id] == false) {
                  taskActive[subtask.id] = true;
                }

                const current = getMoscowTime();

                const diff = Date.parse(subtask.task_due) - current.getTime();
                new LongTimeout(async () => {
                  const index = db_task.payload.tasks.indexOf(subtask);
                  const new_task = db_task.payload.tasks[index];
                  const new_due = new Date(new_task.task_due);
                  new_due.setFullYear(current.getFullYear() + 1);
                  new_task.task_due = new_due.toISOString();

                  db_task.save();

                  const congratulations = [
                    `🎉 Ух ты, {name}, тебе уже {age}?! 🎂 Не могу поверить! Ты такой взрослый! Пусть этот возраст принесет тебе кучу радости, успехов и незабываемых моментов! Желаю, чтобы каждый день был наполнен счастьем и улыбками!`,
                    `🎈 Невероятно, {name}, {age}! 🎁 Это просто фантастика! Ты уже такой большой! Желаю тебе кучу счастья, благополучия и исполнения всех мечт! Пусть каждый день будет ярким и запоминающимся!`,
                    `🎊 Вау, {name}, {age}! 🎉 Это просто потрясающе! Ты уже такой взрослый! Пусть этот возраст будет наполнен яркими моментами, новыми открытиями и большими успехами! Желаю тебе море радости и веселья!`,
                    `🎂 Ого, {name}, {age}! 🎈 Это просто невероятно! Ты уже такой взрослый! Пусть этот возраст будет самым лучшим, полным счастья, любви и незабываемых приключений! Желаю тебе всего самого наилучшего!`,
                    `🎁 Ничего себе, {name}, тебе уже {age}! 🎉 Это просто удивительно! Ты уже такой взрослый! Пусть этот возраст принесет тебе много новых возможностей, радости и удачи! Желаю, чтобы каждый день был наполнен счастьем и позитивом!`,
                    `🎉 Вау, {name}, {age}! 🎂 Это просто невероятно! Ты уже такой взрослый! Пусть этот возраст будет полон счастья, любви и незабываемых моментов! Желаю тебе море радости и веселья!`,
                    `🎈 Удивительно, {name}, {age}! 🎊 Это просто потрясающе! Ты уже такой взрослый! Пусть этот возраст будет наполнен радостью, успехами и новыми открытиями! Желаю тебе кучу счастья и благополучия!`,
                    `🎁 Вау, {name}, {age}! 🎉 Это просто невероятно! Ты уже такой взрослый! Пусть этот возраст принесет тебе много счастья, удачи и незабываемых моментов! Желаю, чтобы каждый день был ярким и запоминающимся!`,
                    `🎂 Невероятно, {name}, {age}! 🎈 Это просто удивительно! Ты уже такой взрослый! Пусть этот возраст будет самым ярким и запоминающимся, полным счастья, любви и радости! Желаю тебе всего самого наилучшего!`,
                    `🎉 Ого, {name}, {age}! 🎁 Это просто потрясающе! Ты уже такой взрослый! Пусть этот возраст будет полон радости, веселья и незабываемых моментов! Желаю тебе море счастья и успехов!`,
                    `😂 Ха-ха, {name}, тебе уже {age}! 🎂 Неужели ты еще не устал считать свои года? Пусть этот возраст принесет тебе кучу радости и веселья!`,
                    `🎈 Ого, {name}, {age}! 🎁 Ты уже такой взрослый, что скоро начнешь забывать, сколько тебе лет! Желаю тебе кучу счастья и благополучия!`,
                    `🎊 Вау, {name}, {age}! 🎉 Ты уже такой взрослый, что пора задуматься о пенсии! Пусть этот возраст будет наполнен радостью и успехами!`,
                    `🎂 Невероятно, {name}, {age}! 🎈 Ты уже такой взрослый, что пора писать мемуары! Пусть этот возраст будет самым лучшим и запоминающимся!`,
                    `🎁 Ха-ха, {name}, тебе уже {age}! 🎉 Ты уже такой взрослый, что пора задуматься о покупке трости! Желаю тебе кучу счастья и удачи!`,
                  ];

                  const discordCongratulations = [
                    `🎉 Всем внимание! Сегодня у {name} день рождения! 🎂 Ему исполнилось {age}! Давайте поздравим его и пожелаем кучу радости и успехов!`,
                    `🎈 Внимание, внимание! У {name} сегодня день рождения! 🎁 Ему уже {age}! Давайте поздравим его и пожелаем счастья и благополучия!`,
                    `🎊 Друзья, у нас сегодня праздник! У {name} день рождения! 🎉 Ему исполнилось {age}! Давайте поздравим его и пожелаем ярких моментов и успехов!`,
                    `🎂 Всем привет! Сегодня у {name} день рождения! 🎈 Ему уже {age}! Давайте поздравим его и пожелаем счастья, любви и незабываемых приключений!`,
                    `🎁 Внимание, друзья! У {name} сегодня день рождения! 🎉 Ему исполнилось {age}! Давайте поздравим его и пожелаем новых возможностей и радости!`,
                    `🎉 Друзья, у нас сегодня праздник! У {name} день рождения! 🎂 Ему уже {age}! Давайте поздравим его и пожелаем счастья, любви и незабываемых моментов!`,
                    `🎈 Всем внимание! Сегодня у {name} день рождения! 🎊 Ему исполнилось {age}! Давайте поздравим его и пожелаем радости, успехов и новых открытий!`,
                    `🎁 Внимание, внимание! У {name} сегодня день рождения! 🎉 Ему уже {age}! Давайте поздравим его и пожелаем счастья, удачи и незабываемых моментов!`,
                    `🎂 Друзья, у нас сегодня праздник! У {name} день рождения! 🎈 Ему исполнилось {age}! Давайте поздравим его и пожелаем ярких и запоминающихся моментов!`,
                    `🎉 Всем привет! Сегодня у {name} день рождения! 🎁 Ему уже {age}! Давайте поздравим его и пожелаем радости, веселья и успехов!`,
                  ];

                  const member = this.client.users.resolve(doc.uid);

                  const user = await SharedEntity.findOneOrCreate(UserModel, {
                    search: { uid: doc.uid },
                  });
                  if (member) {
                    const index1 = Math.floor(
                      Math.random() * congratulations.length
                    );
                    const index2 = Math.floor(
                      Math.random() * discordCongratulations.length
                    );

                    const diff =
                      current.getTime() -
                      Date.parse(user.payload.about.birthday);
                    const seconds = 1000;
                    const minutes = seconds * 60;
                    const hours = minutes * 60;
                    const days = hours * 24;
                    const years = days * 365.25;

                    const age = (diff / years) << 0;

                    const content1 = congratulations[index1]
                      .replace(/\{name\}/, user.payload.about.name)
                      .replace(
                        /\{age\}/,
                        `${age} ${getDeclension(age, ["год", "года", "лет"])}`
                      );

                    const content2 = discordCongratulations[index2]
                      .replace(/\{name\}/, member.toString())
                      .replace(
                        /\{age\}/,
                        `${age} ${getDeclension(age, ["год", "года", "лет"])}`
                      );

                    const embed = new EmbedBuilder()
                      .setColor("#FFD700")
                      .setTitle(
                        `🎉 С Днем Рождения, ${user.payload.about.name}! 🎉`
                      )
                      .setDescription(content1)
                      .setFooter({
                        text: "Пусть твой день будет наполнен радостью и счастьем!",
                      })
                      .setThumbnail(
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/557-birthday-cake-1.svg/640px-557-birthday-cake-1.svg.png"
                      );

                    member.send({ embeds: [embed] });

                    const guild = this.client.guilds.resolve(
                      "1175868237464997928"
                    );

                    const embed1 = new EmbedBuilder()
                      .setColor("#FFD700")
                      .setTitle("🎉 День Рождения! 🎉")
                      .setDescription(content2)
                      .addFields({ name: "Поздравления:", value: content1 })
                      .setFooter({
                        text: `С любовью, ваш ${guild!.name}!`,
                        iconURL: guild!.iconURL()!,
                      })
                      .setThumbnail(
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/557-birthday-cake-1.svg/640px-557-birthday-cake-1.svg.png"
                      );

                    const channel = this.client.channels.resolve(
                      "1238803428252319784"
                    );
                    if (channel && channel instanceof TextChannel) {
                      channel.send({ embeds: [embed1] });
                    }
                  }
                }, diff);
                break;
              }

              case "Reminder":
                { 
                  if(taskActive[subtask.id] == false) {
                    taskActive[subtask.id] = true;
                  }

                  const current = getMoscowTime();

                  const diff = Date.parse(subtask.task_due) - current.getTime();

                  new LongTimeout(() => {
                    const index = db_task.payload.tasks.indexOf(subtask);
                    delete db_task.payload.tasks[index];
                    delete taskActive[subtask.id];
                    db_task.payload.tasks = db_task.payload.tasks.filter(Boolean);
                    db_task.save();

                    if (subtask.remaining_self) {
                      const member = this.client.users.resolve(
                        task.payload.uid
                      );

                      if (member == null) {
                        return;
                      }

                      const reminderEmbed = new EmbedBuilder()
                        .setColor("#8a2be2")
                        .setTitle(`📌 Напоминание: ${subtask.title}`)
                        .setDescription("Не забудь о своем важном деле!")
                        .addFields({ name: "Задачи:", value: `\`\`\`${subtask.content}\`\`\`` })
                        .setTimestamp(Date.now());

                      member.send({ embeds: [reminderEmbed] });
                    } else {
                      const channel = this.client.channels.resolve(
                        subtask.cid
                      ) as TextChannel;

                      const reminderEmbed = new EmbedBuilder()
                        .setColor("#8a2be2")
                        .setTitle(`📌 Напоминание: ${subtask.title}`)
                        .setDescription("Не забудь о своем важном деле!")
                        .addFields({ name: "Задачи:", value: `\`\`\`${subtask.content}\`\`\`` })
                        .setTimestamp(Date.now());

                      channel.send({ embeds: [reminderEmbed], content: `<@${task.payload.uid}>` });
                    }
                  }, diff);
                }
                break;
            }
          }
        };

        for (const change of data.docChanges()) {
          switch (change.type) {
            case "modified": {
              updates(change);
              break;
            }
          }
        }
      });

      // task.save();
    }

    // this.client.tasks.on("taskDue", <T extends ITask, P extends ITask['tasks'][number]>(task: Task<T, P>) => {
    //   console.log(task);

    //   switch (task.data.type) {
    //     case "Birthday": {
    //       console.log("Happy Birthday");
    //     }
    //   }
    // });
  }

  async updateRoles() {
    const users = await SharedEntity.toList(UserModel);
    const guild = this.client.guilds.resolve("1175868237464997928");

    // console.log(guild?.roles.cache.map(role => `${role.name} (${role.id})`));

    if (!guild) return;

    for (let [_, member] of guild.members.cache) {
      if (member.user.bot) continue;
      const isUser = users.some((user) => user.payload.uid == member.id);

      if (!isUser) {
        const roles = guild.roles.cache.toJSON();
        console.log(roles.map((role) => `${role.name} (${role.id})`));
        member.roles.remove(roles);
      }
    }

    for (let user of users) {
      try {
        var member = await guild.members.fetch(user.payload.uid);
      } catch (error) {
        console.log(`Unknown Member: ${user.payload.username.discord}`);
        continue;
      }

      const memberRoles = member.roles.cache.map((role) => role.id);
      if (memberRoles.includes("1279880872887058544")) {
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
          member.roles.remove("1279880872887058544");
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
                value: `Тебе еще **${formatDuration(
                  diff,
                  "ms",
                  1
                )}**, и мы обязаны удалить эту роль и ограничить доступ к NSFW-контенту.`,
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
          member.send({ embeds: [nsfwWarningEmbed] });
        }
      }

      if (user.payload.request.status == "approved") {
        member.roles.remove("1277332798025371648");
        member.roles.add("1277332882934726770");
      } else {
        member.roles.add("1277332798025371648");
        member.roles.remove("1277332882934726770");
      }

      const roles = member.roles.cache
        .toJSON()
        .filter((role) => role.name != "@everyone")
        .map((role) => role.id);

      user.save();
    }
  }

  async update(api: MinecraftAPI) {
    const list = await SharedEntity.toList(UserModel);

    const [response, widget] = await Promise.all([
      api.getInfo(),
      api.getWidget(),
    ]);

    const embed = new EmbedBuilder();
    if (!response.online) {
      embed
        .setTitle(`Сервер не в сети`)
        .setDescription(
          `\`\`\`IP: ${response.host}\`\`\`\n**Просим свои извинения**`
        )
        .setColor(0xeb1049)
        .setImage("attachment://widget.png");
    } else {
      embed
        .setTitle(`Статистика сервера: FoxMine`)
        .setDescription(`\`\`\`IP: ${response.host}\`\`\``)
        .setColor(0xb400ff)
        .addFields([
          {
            name: "Статус",
            value: response.online ? "Онлайн" : "Оффлайн",
            inline: true,
          },
          {
            name: "Блокировка EULA",
            value: response.eula_blocked ? "Да" : "Нет",
            inline: true,
          },
          {
            name: "Версия",
            value: response.version.name_clean,
            inline: true,
          },
          {
            name: `Игроки [${response.players.online} / ${response.players.max}]`,
            value: `\`\`\`${
              response.players.list
                .map(
                  (player) =>
                    `${player.name_clean} - ${
                      list.find(
                        (user) =>
                          user.payload.username.minecraft == player.name_clean
                      )?.payload.username.discord ?? "Discord неизвестен"
                    }`
                )
                .join("\n") || "Отсутствуют"
            }\`\`\``,
            inline: true,
          },
          {
            name: "Моды",
            value: `\`\`\`${
              response.mods
                .map((m, index) => `${index + 1}. ${m}`)
                .join("\n") || "Отсутствуют"
            }\`\`\``,
            inline: true,
          },
          {
            name: "Плагины",
            value: `\`\`\`${
              response.plugins
                .map((p, index) => `${index + 1}. ${p}`)
                .join("\n") || "Отсутствуют"
            }\`\`\``,
            inline: true,
          },
        ])
        .setImage("attachment://widget.png");
    }

    const guilds = this.client.guilds.cache.toJSON();
    const guild = guilds[0];

    const channel = (await guild.channels.fetch(
      "1175870575571390614"
    )) as TextChannel;
    const message = await channel.messages.fetch("1190562700502257747");

    message.edit({
      embeds: [embed],
      files: [new AttachmentBuilder(widget, { name: "widget.png" })],
    });

    setTimeout(this.update.bind(this, api), 30 * 1000);
  }
}
