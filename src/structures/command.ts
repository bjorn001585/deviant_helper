import { EmbedBuilder, Message, PermissionResolvable } from "discord.js";

import { AlisterHelper } from "../core";
import BaseEntity, {
  CommandEntity,
  EntityManager,
  PrefixEntity,
} from "../engine/command-parser/manager";
import { Enum, Metadata } from "../engine/command-parser/enum";
import { TokenType } from "../engine/command-parser/token-type";
import { smartJoinAdvanced } from "../util/smartJoinAdvanced";

interface BaseArgument {
  name: string;
  description: string;
  type: TokenType<Metadata>;
  rest?: boolean;
}

interface RequiredArgument extends BaseArgument {
  required: true;
  default?: null;
}

interface NotRequiredArgument extends BaseArgument {
  required: false;
  default: BaseEntity;
}

interface BaseFlag {
  type: TokenType<Metadata>[];
  name: string;
  desription: string;
  allowList: boolean;
}

interface RequiredFlag extends BaseFlag {
  required: true;
  default?: null;
}

interface NotRequiredFlag extends BaseFlag {
  required: false;
  default: BaseEntity;
}

interface CommandOption {
  name: string; // Название команды
  description: string;
  examples?: string[];
  memberPermissions: PermissionResolvable[]; // Разрешения участника, необходимые для выполнения команды
  clientPermissions: PermissionResolvable[]; // Разрешения бота, необходимые для выполнения команды
  memberAccess?: string[];
  errorMessages?: string[];
  arguments: (RequiredArgument | NotRequiredArgument)[];
  flags: (RequiredFlag | NotRequiredFlag)[];
}

export default class Command {
  constructor(public client: AlisterHelper, public option: CommandOption) {}

  public memberAccess(message: Message) {
    return !!(
      this.option.memberAccess &&
      !this.option.memberAccess.includes(message.author.id)
    );
  }

  public execute(
    message: Message,
    parser: {
      prefix: PrefixEntity;
      command: CommandEntity;
      manager: EntityManager<Enum<string, Metadata>>;
      flags: Record<string, BaseEntity>;
    }
  ) {
    if (!message.member?.permissions.has(this.option.memberPermissions)) {
      message.channel.send({ content: "У тебя нет прав" });

      return;
    }

    if (this.memberAccess(message)) {
      return;
    }

    const types = {
      [TokenType.STRING.value]: "строка",
      [TokenType.INT.value]: "целое число",
      [TokenType.FLOAT.value]: "число с плавающей точкой",
      [TokenType.BOOLEAN.value]: "логическое значение",
      [TokenType.USER.value]: "@пользователь",
      [TokenType.ROLE.value]: "@роль",
      [TokenType.CHANNEL.value]: "#канал",
      [TokenType.TIME.value]: "время",
      [TokenType.HEX.value]: "шестнадцатеричное число (0xHEX)",
    };

    const args = this.option.arguments;
    const restArgumentLength = args.filter(
      (arg) => arg.rest != undefined
    ).length;
    const firgsRequired = [...args]
      .sort((a, b) => Number(b.required) - Number(a.required))
      .map((arg) => arg.required);

    for (const arg of args) {
      const index = args.indexOf(arg);

      const argType = arg.type;
      let entity = parser.manager.entityes[index];

      if (arg.required != firgsRequired[index]) {
        const embed = new EmbedBuilder()
          .setColor("#FF5555") // Оранжевый цвет embed
          .setTitle("🚨 Ошибка порядка параметров") // Заголовок с эмодзи
          .setDescription(
            "Нарушен порядок параметров: обязательные параметры должны располагаться в начале, за ними следуют необязательные. Пожалуйста, убедитесь, что все обязательные параметры указаны до необязательных и попробуйте снова."
          ) // Описание ошибки
          .setFooter({
            text: "Проверьте порядок параметров и попробуйте снова.",
          }) // Футер с призывом к действию
          .setTimestamp(); // Добавляем временную метку к сообщению
        return message.channel.send({ embeds: [embed] });
      }

      if (
        arg.required == true &&
        entity == undefined &&
        arg.default == undefined
      ) {
        const examples = this.option.examples
          ?.map((exp, index) => `${index + 1}. ${exp}`)
          .join("\n\n")
          .replace(/\{prefix\}/g, parser.prefix.value)
          .replace(/\{command\}/g, parser.command.value);
        const embed = new EmbedBuilder()
          .setColor("#FF5555")
          .setTitle("⚠️ Отсутствует параметр")
          .setDescription(
            `Обязательный параметр "${
              arg.name
            }" не передан.\n\n**Примеры:**\n\`\`\`${
              examples || "Не указано"
            }\`\`\``
          )
          .setFooter({
            text: "Пожалуйста, убедитесь, что все обязательные параметры переданы.",
          })
          .setTimestamp();

        return message.channel.send({ embeds: [embed] });
      } else {
        if (arg.default && entity?.value == undefined) {
          entity = arg.default;
        }
      }

      const entityType = entity.type;

      if (
        (arg.rest != undefined && index < args.length - 1) ||
        restArgumentLength > 1
      ) {
        const embed = new EmbedBuilder()
          .setColor("#FF5555") // Оранжевый цвет embed
          .setTitle("🚨 Ошибка использования rest оператора") // Заголовок с эмодзи
          .setDescription(
            "**Rest** оператор должен быть последним параметром в списке аргументов. **Rest** оператор не может быть в начале или в середине существующих аргументов."
          ) // Описание ошибки
          .setFooter({
            text: "Пожалуйста, проверьте порядок аргументов и попробуйте снова.",
          }) // Футер с призывом к действию
          .setTimestamp();

        return message.channel.send({ embeds: [embed] });
      }

      if (argType != entityType) {
        const examples = this.option.examples
          ?.map((exp, index) => `${index + 1}. ${exp}`)
          .join("\n\n")
          .replace(/\{prefix\}/g, parser.prefix.value)
          .replace(/\{command\}/g, parser.command.value);
        const embed = new EmbedBuilder()
          .setColor("#FF5555")
          .setTitle("🚫 Ошибка типа")
          .setDescription(
            `Параметр "**${arg.name}**" должен иметь тип "**${
              types[argType.value]
            }**", но получено "**${
              types[entityType.value]
            }**".\n\n**Примеры:**\n\`\`\`${examples || "Не указано"}\`\`\``
          )
          .setFooter({ text: "Пожалуйста, проверьте типы параметров." })
          .setFields(
            args.map((arg) => {
              return {
                name: `Параметры аргумента: ${arg.name}`,
                value: `Тип: **${types[arg.type.value]}**\nСписок: **${
                  arg.rest ? "Да" : "Нет"
                }**\nОбязательный: **${arg.required ? "Да" : "Нет"}**\n\`\`\`${
                  arg.description
                }\`\`\``,
                inline: true,
              };
            })
          )
          .setTimestamp();

        return message.channel.send({ embeds: [embed] });
      }

      if (arg.rest == true) {
        const entityes = parser.manager.entityes.slice(index);
        // const has = args.slice(index).every(arg => entityes.every(entity => entity.type == arg.type))
        for (const entity of entityes) {
          if (argType != entity.type) {
            const examples = this.option.examples
              ?.map((exp, index) => `${index + 1}. ${exp}`)
              .join("\n\n")
              .replace(/\{prefix\}/g, parser.prefix.value)
              .replace(/\{command\}/g, parser.command.value);
            const embed = new EmbedBuilder()
              .setColor("#FF5555")
              .setTitle("🚫 Ошибка типа")
              .setDescription(
                `Параметр "**${
                  arg.name
                }**" с включеным модификатором rest (список) должен иметь тип "**${
                  types[argType.value]
                }**", но получено "**${
                  types[entity.type.value]
                }**".\n\n**Примеры:**\n\`\`\`${examples || "Не указано"}\`\`\``
              )
              .setFooter({ text: "Пожалуйста, проверьте типы параметров." })
              .setFields(
                args.map((arg) => {
                  return {
                    name: `Параметры аргумента: ${arg.name}`,
                    value: `Тип: **${types[arg.type.value]}**\nСписок: **${
                      arg.rest ? "Да" : "Нет"
                    }**\nОбязательный: **${
                      arg.required ? "Да" : "Нет"
                    }**\n\`\`\`${arg.description}\`\`\``,
                    inline: true,
                  };
                })
              )
              .setTimestamp();

            return message.channel.send({ embeds: [embed] });
          }
        }
      }
    }

    const flags = this.option.flags;
    for (const flag of flags) {
      if (
        flag.required &&
        parser.flags[flag.name] == undefined &&
        flag.default == undefined
      ) {
        if (!(flag.name in parser.flags)) {
          const embed = new EmbedBuilder()
            .setColor("#FF5555")
            .setTitle("⚠️ Отсутствует флаг")
            .setDescription(`Обязательный флаг "**-${flag.name}**" не передан.`)
            .setFooter({
              text: "Пожалуйста, убедитесь, что все обязательные флаги переданы.",
            })
            .setTimestamp();

          return message.channel.send({ embeds: [embed] });
        }
      } else {
        if (flag.default != undefined && parser.flags[flag.name] == undefined) {
          parser.flags[flag.name] = flag.default;
        }
      }

      if (parser.flags[flag.name].isList()) {
        if (!flag.allowList) {
          const embed = new EmbedBuilder()
            .setTitle("Ошибка конфигурации")
            .setColor("#FF5555")
            .setDescription(
              `Флаг "**-${flag.name}**" не поддерживает список значений.`
            )
            .setFooter({
              text: "Пожалуйста, проверьте конфигурацию и попробуйте снова.",
            })
            .setTimestamp();

          return message.channel.send({ embeds: [embed] });
        }

        const hasType = parser.flags[flag.name].elements.every((element) =>
          flag.type.some((t) => t == element.type)
        );
        if (!hasType) {
          const flagList = flags.map((flag) => {
            return {
              name: `Параметры флага: -${flag.name}`,
              value: [
                `Типы (Список): ${smartJoinAdvanced(
                  flag.type.map((type) => `**${types[type.value]}**`)
                )}`,
                `Обязательный: **${flag.required ? "Да" : "Нет"}**`,
                `Поддержка списка: **${flag.allowList ? "Да" : "Нет"}**`,
                `\`\`\`${
                  flag.desription.length < 1
                    ? "Описание отсутствует"
                    : flag.desription
                }\`\`\``,
              ].join("\n"),
              inline: true,
            };
          });

          const excludeTypes = parser.flags[flag.name].elements.filter(
            (element) => !flag.type.some((type) => element.type == type)
          );

          const embed = new EmbedBuilder()
            .setColor("#FF5555")
            .setTitle("🚫 Ошибка типа")
            .setDescription(
              `Флаг "**-${
                flag.name
              }**" должен иметь следующие разрешенные типы ${smartJoinAdvanced(
                flag.type.map((type) => `"**${types[type.value]}**"`)
              )}, но получен ${smartJoinAdvanced(
                excludeTypes.map((token) => `"**${types[token.type.value]}**"`)
              )}`
            )
            .setFields(flagList);

          return message.channel.send({ embeds: [embed] });
        }
      } else {
        if (flag.allowList && parser.flags[flag.name].isList()) {
          const embed = new EmbedBuilder()
            .setTitle("Ошибка конфигурации")
            .setColor("#FF5555")
            .setDescription(
              `Флаг "**-${flag.name}**" не поддерживает список значений.`
            )
            .setFooter({
              text: "Пожалуйста, проверьте конфигурацию и попробуйте снова.",
            })
            .setTimestamp();

          return message.channel.send({ embeds: [embed] });
        }

        const hasType = flag.type.some(
          (type) => type == parser.flags[flag.name].type
        );
        if (!hasType) {
          const flagList = flags.map((flag) => {
            return {
              name: `Параметры флага: -${flag.name}`,
              value: [
                `Типы: ${smartJoinAdvanced(
                  flag.type.map((type) => `**${types[type.value]}**`)
                )}`,
                `Обязательный: **${flag.required ? "Да" : "Нет"}**`,
                `Поддержка списка: **${flag.allowList ? "Да" : "Нет"}**`,
                `\`\`\`${
                  flag.desription.length < 1
                    ? "Описание отсутствует"
                    : flag.desription
                }\`\`\``,
              ].join("\n"),
              inline: true,
            };
          });

          const embed = new EmbedBuilder()
            .setColor("#FF5555")
            .setTitle("🚫 Ошибка типа")
            .setDescription(
              `Флаг "**-${
                flag.name
              }**" должен иметь следующие разрешенные типы ${smartJoinAdvanced(
                flag.type.map((type) => `"**${types[type.value]}**"`)
              )}, но получен "**${types[parser.flags[flag.name].type.value]}**"`
            )
            .setFields(flagList);

          return message.channel.send({ embeds: [embed] });
        }
      }
    }

    this.run(message, parser.manager, parser.flags);
  }

  run(
    message: Message,
    manager: EntityManager<Enum<string, Metadata>>,
    flags: Record<string, BaseEntity>
  ) {
    throw new Error("Command not implemented");
  }
}
