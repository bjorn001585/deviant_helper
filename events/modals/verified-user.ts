import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
  Interaction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { AlisterHelper } from "../../src/core";
import DiscordEvent from "../../src/structures/event";
import { SharedEntity } from "../../src/@foxlib/shared-entity";
import { UserModel } from "../../src/database/user_schema";
import { parseDate } from "../../src/util/parseDate";
import { SchedulerModel } from "../../src/database/scheduler_schema";
import { formatDuration } from "../../src/util/formatDuration";
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
      condition: interaction.isModalSubmit(),
      customId: "modal-verify",
    };
  }

  async execute(interaction: ModalSubmitInteraction) {
    const author = interaction.user

    const personName = interaction.fields.getField("person-name");
    const personAge = interaction.fields.getField("person-age");
    const serverName = interaction.fields.getField("server-name");
    const purpose = interaction.fields.getField("purpose");
    const aboutSelf = interaction.fields.getField("about-self");

    const date = parseDate(personAge.value)

    if (date == null) {
      const dates = `17 ноября 2001`

      interaction.reply({
        ephemeral: true,
        content:
          `Формат даты не разпознан, попробыйте выбоатоь один из предложенных:\n\`\`\`${dates}\`\`\``,
      });

      return;
    }

    try {
      const user = await SharedEntity.findOneOrCreate(UserModel, { search: { uid: author.id } })
      
      date.setDate(date.getDate() + 1)
      date.setUTCHours(8)

      user.payload.username.minecraft = serverName.value;
      user.payload.about = {
        yourself: aboutSelf.value,
        birthday: date.toISOString(),
        purpose: purpose.value,
        name: personName.value
      }
      user.payload.request.status = "pending"
      await user.save().then(async user => {
        const task = await SharedEntity.findOneOrCreate(SchedulerModel, {
          search: {
            uid: user.payload.uid
          },
          createPayload: {
            tasks: []
          }
        })

        const currentDate = new Date();
        currentDate.setUTCDate(8)
        const currentTime = currentDate.getTime()
        const dateDue = new Date(currentDate.getFullYear(), date.getMonth(), date.getDate(), 8, 0);
        dateDue.setUTCHours(8)
        const dateDueTime = dateDue.getTime()

        if(currentTime > dateDueTime) {
          dateDue.setFullYear(currentDate.getFullYear() + 1)
        }

        if(!task.payload.tasks.some(task => task.type == "Birthday")) {
          const b = task.payload.tasks.find(task => task.type == "Birthday")
          // const item = this.client.tasks.addTask(task.payload, b || {} as any)
 
          task.payload.tasks.push({
            id: generateUUIDv4(),
            title: `День роджения ${user.payload.username.discord}`,
            description: "Отмечаем день рождения",
            status: "InProgress",
            task_add: currentDate.toISOString(),
            task_due: dateDue.toISOString(),
            type: "Birthday",
            cid: "",
            remaining_self: false,
            content: ""
          })
        }

        task.save()
      })
    } catch (error) {
      console.error(error);
      interaction.reply({ content: `Мы рассматриваем вашу анкету!`, ephemeral: true })
      return;
    }

    interaction.reply({
      content: "Спасибо! Администрация рассмотрит вашу анкету!",
      ephemeral: true,
    });

    const acceptedButton = new ButtonBuilder()
      .setCustomId(`user-accepted:${author.id}`)
      .setLabel("Принять")
      .setEmoji({ name: "✅" })
      .setStyle(ButtonStyle.Secondary);

    const deniedButton = new ButtonBuilder()
      .setCustomId(`user-denied:${author.id}`)
      .setLabel("Отклонить")
      .setEmoji({ name: "❎" })
      .setStyle(ButtonStyle.Secondary);

    const raw = new ActionRowBuilder<ButtonBuilder>().addComponents(
      acceptedButton,
      deniedButton
    );

    const user = await SharedEntity.findOneOrCreate(UserModel, { search: { uid: author.id } })
    const birthday = Date.parse(user.payload.about.birthday)
    const diff = Date.now() - birthday

    const embed = new EmbedBuilder()
      .setTitle("Заявка на вступление")
      .setDescription(
        [
          `Пользователь: ${author}\n`,
          `> Имя: **${personName.value}**`,
          `> День рождения: **${personAge.value}** (${formatDuration(diff, "ms", 1)})`,
          `> Никнейм: **${serverName.value || "Не указанно"}**`,
          `> Цель: **${purpose.value}**`,
        ].join("\n")
      )
      .addFields([
        {
          name: "О себе",
          value: `\`\`\`${aboutSelf.value}\`\`\``,
        },
      ])
      .setColor(0xb400ff);

    const channel = (await interaction.guild?.channels.fetch(
      "1177325488012787813"
    )) as TextChannel;
    channel.send({
      content: "<@&1177325368257040454> нужно рассмотреть новую заявку!",
      embeds: [embed],
      components: [raw],
    });
  }
}
