import {
  AutoModerationActionExecution,
  AutoModerationActionType,
  AutoModerationRuleTriggerType,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { AlisterHelper } from "../src/core";
import DiscordEvent from "../src/structures/event";
import { SharedEntity } from "../src/@foxlib/shared-entity";
import { UserModel } from "../src/database/user_schema";
import { formatDuration } from "../src/util/formatDuration";

export default class UseEvent extends DiscordEvent<"autoModerationActionExecution"> {
  constructor(client: AlisterHelper) {
    super(client, {
      name: "autoModerationActionExecution",
      once: false,
    });
  }

  async execute(automod: AutoModerationActionExecution) {
    if (automod.user == undefined) return;

    const user = await SharedEntity.findOneOrCreate(UserModel, {
      search: {
        uid: automod.user.id,
      },
    });

    if (automod.channel instanceof TextChannel) {
      const triggers = {
        [AutoModerationRuleTriggerType.Keyword]:
          "Использование заприщеного слово:",
        [AutoModerationRuleTriggerType.MentionSpam]:
          "Многочисленные упоминания:",
        [AutoModerationRuleTriggerType.Spam]: "Подозрения на спам:",
        [AutoModerationRuleTriggerType.KeywordPreset]:
          "Испольpование заприщеного слово:",
      };

      switch (automod.action.type) {
        case AutoModerationActionType.Timeout: {
          user.payload.warns.push({
            timestamp: new Date().toISOString(),
            moderator: this.client.user?.username!,
            reason: `${triggers[automod.ruleTriggerType]} ${
              automod.matchedKeyword
            }`,
            status: "active",
          });

          const embed = new EmbedBuilder()
            .setTitle("Автомод: Мьют")
            .setDescription(
              `Обнаружено нарушение правил сервера, Пользователь ${automod.user} получил немедленный мьют`
            )
            .addFields([
              {
                name: "Полное сообщение",
                value: `\`\`\`${automod.content}\`\`\``
              },
              {
                name: "Причина:",
                value: `${triggers[automod.ruleTriggerType]} **${
                  automod.matchedKeyword
                }**`,
              },
              {
                name: "Время:",
                value: formatDuration(
                  automod.action.metadata.durationSeconds!,
                  "sec"
                ),
              },
            ])
            .setColor("#E57373")
            .setTimestamp(Date.now());
          automod.channel
            .send({ embeds: [embed] })
            .then((message) => setTimeout((_) => message.delete(), 20000));
          break;
        }
        case AutoModerationActionType.BlockMessage: {
          user.payload.warns.push({
            timestamp: new Date().toISOString(),
            moderator: this.client.user?.username!,
            reason: `${triggers[automod.ruleTriggerType]} ${
              automod.matchedKeyword
            }`,
            status: "active",
          });

          const embed = new EmbedBuilder()
            .setTitle("Автомод: Предупреждение")
            .setDescription(
              `Обнаружено нарушение правил сервера, сообщение пользователя ${automod.user} было заблокировано`
            )
            .addFields([
              {
                name: "Полное сообщение",
                value: `\`\`\`${automod.content}\`\`\``
              },
              {
                name: "Причина:",
                value: `${triggers[automod.ruleTriggerType]} **${
                  automod.matchedKeyword
                }**`,
              },
            ])
            .setColor("#E57373")
            .setTimestamp(Date.now());
          automod.channel
            .send({ embeds: [embed] })
            .then((message) => setTimeout((_) => message.delete(), 20000));

          break;
        }
        case AutoModerationActionType.SendAlertMessage: {
          user.payload.warns.push({
            timestamp: new Date().toISOString(),
            moderator: this.client.user?.username!,
            reason: `${triggers[automod.ruleTriggerType]} ${
              automod.matchedKeyword
            }`,
            status: "active",
          });

          break;
        }
      }

      user.save();
    }

    // automod.member?.roles.add("1175868237511143432")

    console.log(automod);
  }
}
