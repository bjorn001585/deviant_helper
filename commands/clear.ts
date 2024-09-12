import { Message, TextChannel } from "discord.js";
import Command from "../src/structures/command";
import { AlisterHelper } from "../src/core";
import { Enum, Metadata } from "../src/engine/command-parser/enum";
import BaseEntity, { EntityManager, UserEntity } from "../src/engine/command-parser/manager";
import { TokenType } from "../src/engine/command-parser/token-type";

export default class UseCommand extends Command {
  constructor(client: AlisterHelper) {
    super(client, {
      name: "clear",
      description: "Удалить N количестава сообщения",
      memberPermissions: [
        "Administrator"
      ],
      clientPermissions: [],
      arguments: [
        {
          name: "user",
          type: TokenType.USER,
          required: false,
          default: UserEntity.value(""),
          description: ""
        }
      ],
      flags: [
        {
          name: "c",
          type: [TokenType.INT],
          desription: "",
          required: true,
          allowList: false
        }
      ]
    });
  }

  public async run(
    message: Message<boolean>,
    manager: EntityManager<Enum<string, Metadata>>,
    flags: Record<string, BaseEntity>
  ) {
    if (message.channel instanceof TextChannel) {
      const count = flags.c.value
      const user = manager.getEntityList(TokenType.USER)
      
      if(isNaN(count)) {
        return;
      }

      if(count > 100) {
        const errorMessageOptions: string[] = [
          "Извини, но по техническим причинам я ограничен удалением только 100 сообщений. Пожалуйста, разберись с ненужными сообщениями поодиночке!",
          "К сожалению, моя магия удаления достигла предела на 100 сообщений. Я постараюсь стать ещё мощнее в следующем обновлении!",
          "Увы, мне запретили удаление более 100 сообщений из-за недовольных модераторов. Давай поищем другие способы избавиться от ненужных сообщений!",
          "Извини, но мои способности к удалению сообщений ограничены 100-ю единицами. Предлагаю найти креативное решение для остальных!",
          "Ой, вышел из строя счетчик удаленных сообщений после 100. Буду рад помочь с удалением оставшихся вручную!",
          "Извини, но моя квота на удаление сообщений исчерпана после 100. Давай воспользуемся другими методами очистки чата!",
          "К сожалению, я не могу удалить более 100 сообщений, потому что мои руки начинают уставать. Предлагаю перейти на план тренировок для более выносливых роботов!",
          "Увы, мой удалитель сообщений настроен на максимальное значение 100. Давай рассмотрим альтернативные стратегии для поддержания порядка!",
          "Извини, но мой программный код не приспособлен к удалению более 100 сообщений. Предлагаю разделить задачу на несколько этапов!",
          "Ой, похоже, моя способность удаления сообщений ограничена до 100. Я постараюсь улучшить свои навыки в следующем обновлении!"
        ];

        this.client.utilSendMessage(message, this.client.utilGetRandomValue(errorMessageOptions))
        return;
      }

      const variations: string[] = [
        `Хорошо, я удаляю сообщения, как ты просишь.`,
        `Разумеется, сообщения будут удалены.`,
        `Выполнено, сообщения успешно удалены.`,
        `ОК, я удалю указанное количество сообщений.`,
        `Понял, я удаляю нужные сообщения.`,
        `Без проблем, сообщения будут удалены.`,
        `Ладно, я уберу указанное количество сообщений.`,
        `Хорошо, я приступлю к удалению сообщений.`,
        `Понял, я удаляю нужные тебе сообщения.`,
        `Окей, сообщения будут удалены по твоей просьбе.`,
        `Сделано, я удаляю указанное количество сообщений.`,
        `Будет сделано, я удалю сообщения, как ты пожелал.`,
        `Принято, я удаляю указанное количество сообщений.`,
        `Хорошо, сообщения будут удалены в ближайшее время.`,
        `Окей, я удаляю сообщения согласно твоей просьбе.`,
        `Без проблем, я выполню удаление указанного количества сообщений.`,
        `Разумеется, я удалю сообщения, как ты запросил.`,
        `Хорошо, сообщения будут удалены безо всяких проблем.`,
        `Понял, я удаляю нужные тебе сообщения сразу.`
      ];

      const greatMessage = await this.client.utilSendMessage(message, this.client.utilGetRandomValue(variations))

      const collection = await message.channel.messages.fetch({ limit: count });
      const messages = collection.toJSON()
        .filter(message => message.id != greatMessage.id)
        .filter(message => {
          const deltaTime = Date.now() - message.createdAt.getTime()

          if(deltaTime < 1000 * 60 * 60 * 24 * 14) {
            return message
          }
        }).filter(Boolean)

      if(user.isEmpty()) {
        message.channel.bulkDelete(messages)
        .then(({ size }) => {
          if(count > size) {
            const errorMessageOptions: string[] = [
              `Я удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но к сожалению, ${count - size} из них слишком старые.`,
              `Удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но обнаружил, что ${count - size} из них слишком старые.`,
              `Удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но оказалось, что ${count - size} из них слишком старые для удаления.`,
              `Я успешно удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но ${count - size} из них оказались слишком старыми.`,
              `Удалил выбранные ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но заметил, что ${count - size} из них слишком старые.`,
              `Удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но к сожалению, ${count - size} из них не могут быть удалены из-за их старости.`,
              `Удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но обнаружил, что ${count - size} из них настолько старые, что не могут быть удалены.`,
              `Удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но ${count - size} из них оказались слишком старыми для операции удаления.`,
              `Я успешно осуществил удаление ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но ${count - size} из них не могут быть удалены из-за их старости.`,
              `Удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но заметил, что ${count - size} из них слишком старые для успешного удаления.`,
              `Удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но обнаружил, что ${count - size} из них слишком старые и не могут быть удалены.`,
              `Удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но ${count - size} из них не подлежат удалению из-за своего старения.`,
              `Удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но стало ясно, что ${count - size} из них слишком старые для операции удаления.`,
              `Я успешно удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но увы, ${count - size} из них оказались слишком старыми для удаления.`,
              `Удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но ${count - size} из них не были удалены из-за их длительного существования.`,
              `Удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но обнаружил, что ${count - size} из них настолько старые, что не могут быть удалены.`,
              `Удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но ${count - size} из них оказались слишком старыми для успешного выполнения операции.`,
              `Удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но к сожалению, ${count - size} из них не могут быть удалены из-за своей старости.`,
              `Я успешно осуществил удаление ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но ${count - size} из них не подлежали удалению из-за их старости.`,
              `Удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}, но заметил, что ${count - size} из них слишком старые для успешного удаления.`
            ];

            this.client.utilSendMessage(message, this.client.utilGetRandomValue(errorMessageOptions))
          } else {
            const messagesDeletedGeneral: string[] = [
              `Удалено ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])}.`,
              `${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} успешно удалены.`,
              `${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} были удалены из канала.`,
              `${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} удалены.`,
              `${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} удалены.`,
              `Удалено ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} из этого канала.`,
              `${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} были успешно удалены.`,
              `Удалено ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} в этом канале.`,
              `${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} удалены из канала.`,
              `${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} удалены.`
            ];

            this.client.utilSendMessage(message, this.client.utilGetRandomValue(messagesDeletedGeneral))
          }
        }) 
      } else {
        const u_entity = user.first().as(UserEntity)
        const userMessages = messages.filter(message => message.author.id == u_entity.value)
        message.channel.bulkDelete(userMessages)
        .then(({ size }) => {
          if (count > size) {
            const errorMessageOptions: string[] = [
              `Я удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} от <@${u_entity.value}>, но к сожалению, ${count - size} из них слишком старые.`,
              `Удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} от <@${u_entity.value}>, но обнаружил, что ${count - size} из них слишком старые.`,
              `Удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} от <@${u_entity.value}>, но оказалось, что ${count - size} из них слишком старые для удаления.`,
              `Я успешно удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} от <@${u_entity.value}>, но ${count - size} из них оказались слишком старыми.`,
              `Удалил выбранные ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} от <@${u_entity.value}>, но заметил, что ${count - size} из них слишком старые.`,
              `Удалил ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} от <@${u_entity.value}>, но к сожалению, ${count - size} из них не могут быть удалены из-за их старости.`,
            ];
            
            this.client.utilSendMessage(message, this.client.utilGetRandomValue(errorMessageOptions));
          } else {
            const messagesDeletedUser: string[] = [
              `Удалено ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} от <@${u_entity.value}>.`,
              `${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} от <@${u_entity.value}> были удалены.`,
              `${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} от <@${u_entity.value}> успешно удалены.`,
              `Удалено ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} от пользователя <@${u_entity.value}>.`,
              `${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} от <@${u_entity.value}> удалены.`,
              `${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} от пользователя <@${u_entity.value}>.`,
              `${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} от <@${u_entity.value}> были успешно удалены.`,
              `Удалено ${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} от <@${u_entity.value}> в этом канале.`,
              `${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} от <@${u_entity.value}> удалены из канала.`,
              `${this.client.utilDeclineNumber(size, ["сообщение", "сообщения", "сообщений"])} от <@${u_entity.value}> удалены.`,
            ];
            
            this.client.utilSendMessage(message, this.client.utilGetRandomValue(messagesDeletedUser));
          }
        });
      }
    }
  }
}
