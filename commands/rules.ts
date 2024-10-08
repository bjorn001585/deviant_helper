import { EmbedBuilder, Message, TextChannel } from "discord.js";
import Command from "../src/structures/command";
import { AlisterHelper } from "../src/core";

export default class UseCommand extends Command {
  constructor(client: AlisterHelper) {
    super(client, {
      name: "rules",
      description: "Правила сервера",
      memberPermissions: ["Administrator"],
      clientPermissions: [],
      arguments: [],
      flags: []
    });
  }

  public async run(message: Message<boolean>) {
    message.delete();

    const embeds = [
      new EmbedBuilder({
        title: "1. Уважение к участникам",
        description:
          "Каждый участник сервера заслуживает уважения. Недопустимо использование оскорбительных слов, высказываний, которые могут унизить или задеть чувства других. Угрозы, дискриминация по любым признакам (включая пол, возраст, национальность, сексуальную ориентацию и т.д.), а также любые формы буллинга и травли строго запрещены. Необходимо вести себя вежливо и с уважением к личному пространству и мнениям других участников.",
        fields: [
          {
            name: "Наказания:",
            value:
              "```1. Предупреждение.\n2. Блокировка к основным каналам сервера на 24 часа.\n3. Временный мьют на 24 часа.\n4. Перманентный бан.```",
          },
          {
            name: "Возможные причины наказания:",
            value:
              "```1. Оскорбление другого участника.\n2. Угроза в адрес другого участника.\n3. Дискриминация по любому признаку.\n4. Буллинг или травля.\n5. Грубое или неуважительное поведение.```",
          },
        ],
        color: 0x0077b6,
      }),
      new EmbedBuilder({
        title: "2. Запрет на NSFW контент",
        description:
          "Любой контент, который может быть классифицирован как неприемлемый для публичного просмотра или работы (NSFW), запрещен к публикации на сервере, за исключением соответствующего канала. Это включает в себя, но не ограничивается, изображениями, видео, текстами и ссылками сексуального характера, жестокостью, графическим насилием и другими взрослыми темами. Также запрещено использование NSFW аватаров и никнеймов.",
        fields: [
          {
            name: "Наказания:",
            value:
              "```1. Предупреждение и удаление контента.\n2. Блокировка к основным каналам сервера на 48 часов.\n3. Временный мьют на 7 дней.\n4. Перманентный бан.```",
          },
          {
            name: "Возможные причины наказания:",
            value:
              "```1. Публикация NSFW изображений.\n2. Публикация NSFW видео.\n3. Размещение ссылок на NSFW материалы.\n4. Обсуждение NSFW тем в общих каналах.\n5. Использование NSFW аватаров или никнеймов.```",
          },
        ],
        color: 0x0077b6,
      }),
      new EmbedBuilder({
        title: "3. Запрет на спам",
        description:
          "Спам, флуд и чрезмерное использование заглавных букв (капса) считаются нарушением правил сервера. Под спамом понимается многократное отправление одинаковых или бессмысленных сообщений, а также рекламных материалов без предварительного согласия администрации. Такие действия мешают нормальному общению и засоряют чат. Спам и флуд разрешены только в канале <#1280388814657032233>, но это не значит, что там разрешена какая-либо реклама.",
        fields: [
          {
            name: "Наказания:",
            value:
              "```1. Предупреждение.\n2. Блокировка к основным каналам сервера на 24 часа.\n3. Временный мьют на 48 часов.\n4. Временный мьют на 7 дней.```",
          },
          {
            name: "Возможные причины наказания:",
            value:
              "```1. Отправка повторяющихся сообщений.\n2. Флуд в чатах.\n3. Чрезмерное использование капса.\n4. Размещение рекламных материалов без разрешения.\n5. Засорение чата ненужными сообщениями.```",
          },
        ],
        color: 0x0077b6,
      }),
      new EmbedBuilder({
        title: "4. Запрет на политические и религиозные обсуждения",
        description:
          "Для поддержания дружелюбной атмосферы и избежания конфликтов на сервере запрещены любые обсуждения политических и религиозных тем. Такие дискуссии часто приводят к спорам и разногласиям, которые могут нарушить мирное общение участников.",
        fields: [
          {
            name: "Наказания:",
            value:
              "```1. Предупреждение.\n2. Блокировка к основным каналам сервера на 24 часа.\n3. Временный мьют на 48 часов.\n4. Перманентный бан.```",
          },
          {
            name: "Возможные причины наказания:",
            value:
              "```1. Обсуждение политических вопросов.\n2. Обсуждение религиозных тем.\n3. Провокация на политические или религиозные дебаты.\n4. Размещение политических или религиозных мемов.\n5. Создание конфликтов на политической или религиозной почве.```",
          },
        ],
        color: 0x0077b6,
      }),
      new EmbedBuilder({
        title: "5. Запрет на рекламу",
        description:
          "Запрещается любая реклама без предварительного одобрения администрации сервера. Это включает в себя рекламу других серверов Discord, веб-сайтов, товаров, услуг или мероприятий. Рекламные сообщения будут удаляться, а нарушители могут быть наказаны.",
        fields: [
          {
            name: "Наказания:",
            value:
              "```1. Предупреждение и удаление рекламы.\n2. Блокировка к основным каналам сервера на 48 часов.\n3. Временный мьют на 7 дней.\n4. Перманентный бан.```",
          },
          {
            name: "Возможные причины наказания:",
            value:
              "```1. Реклама других серверов.\n2. Реклама продуктов или услуг без разрешения.\n3. Размещение рекламных ссылок.\n4. Спам рекламными сообщениями.\n5. Попытка привлечь участников на другие платформы.```",
          },
        ],
        color: 0x0077b6,
      }),
      new EmbedBuilder({
        title: "6. Использование правильных каналов",
        description:
          "На сервере есть различные каналы, каждый из которых предназначен для определенной темы или вида деятельности. Участники должны следить за тем, чтобы их сообщения соответствовали тематике канала. Например, использование команд бота только в канале <#1279879363206189149>, а не в общем чате.",
        fields: [
          {
            name: "Наказания:",
            value:
              "```1. Предупреждение.\n2. Блокировка к основным каналам сервера на 12 часов.\n3. Временный мьют на 24 часа.\n4. Временный мьют на 3 дня.```",
          },
          {
            name: "Возможные причины наказания:",
            value:
              "```1. Обсуждение игр в общем чате.\n2. Публикация мемов в канале для обсуждений.\n3. Размещение вопросов в канале для объявлений.\n4. Игнорирование структуры каналов.\n5. Постоянное использование неправильных каналов для сообщений.```",
          },
        ],
        color: 0x0077b6,
      }),
      new EmbedBuilder({
        title: "7. Запрет на дублирование аккаунтов",
        description:
          "Каждому участнику разрешается иметь только один аккаунт на сервере. Создание дополнительных аккаунтов для обхода наказаний, влияния на голосования или любых других целей считается нарушением и приведет к бану всех связанных аккаунтов.",
        fields: [
          {
            name: "Наказания:",
            value:
              "```1. Перманентный бан всех связанных аккаунтов.```",
          },
          {
            name: "Возможные причины наказания:",
            value:
              "```1. Создание второго аккаунта для обхода наказания.\n2. Создание аккаунтов для троллинга.\n3. Попытка скрыть свою личность через дублирующие аккаунты.```",
          },
        ],
        color: 0x0077b6,
      }),
      new EmbedBuilder({
        title: "8. Запрет на распространение личной информации",
        description:
          "Распространение личной информации без согласия человека запрещено. Это включает в себя любые персональные данные, такие как адреса, номера телефонов, фотографии и другие данные, которые могут быть использованы для идентификации или нанесения вреда.",
        fields: [
          {
            name: "Наказания:",
            value: "```1. Перманентный бан.```",
          },
          {
            name: "Возможные причины наказания:",
            value:
              "```1. Публикация личных данных другого участника.\n2. Размещение фотографий без согласия.\n3. Распространение контактной информации.\n4. Обсуждение личной жизни других участников без их разрешения.\n5. Нарушение конфиденциальности участников.```",
          },
        ],
        color: 0x0077b6,
      }),
      new EmbedBuilder({
        title: "9. Соблюдение указаний администрации",
        description:
          "Участники должны следовать всем указаниям и правилам, установленным администрацией сервера. Несоблюдение этого правила может привести к наказанию, включая предупреждения и баны.",
        fields: [
          {
            name: "Наказания:",
            value:
              "```1. Предупреждение.\n2. Блокировка к основным каналам сервера на 24 часа.\n3. Временный мьют на 48 часов.\n4. Временный мьют на 7 дней.```",
          },
          {
            name: "Возможные причины наказания:",
            value:
              "```1. Игнорирование указаний модераторов.\n2. Оспаривание решений администрации без уважительной причины.\n3. Нарушение правил, установленных администрацией.\n4. Неподчинение указаниям администрации.\n5. Создание конфликтов с администрацией.```",
          },
        ],
        color: 0x0077b6,
      }),
      new EmbedBuilder({
        title: "10. Запрет на токсичное поведение",
        description:
          "Токсичное поведение, включая провокации, троллинг, оскорбления и создание конфликтных ситуаций, строго запрещено. Такое поведение нарушает мирное общение и создает негативную атмосферу на сервере.",
        fields: [
          {
            name: "Наказания:",
            value:
              "```1. Предупреждение.\n2. Блокировка к основным каналам сервера на 48 часов.\n3. Временный мьют на 7 дней.\n4. Перманентный бан.```",
          },
          {
            name: "Возможные причины наказания:",
            value:
              "```1. Провокация других участников.\n2. Троллинг и создание конфликтных ситуаций.\n3. Оскорбление и унижение других участников.\n4. Создание негативной атмосферы.\n5. Постоянное негативное поведение.```",
          },
        ],
        color: 0x0077b6,
      }),
      new EmbedBuilder({
        title: "11. Уважение к фурри сообществу",
        description:
          "Участники должны проявлять уважение к фурри сообществу и его культуре. Любые насмешки, унижения или негативные комментарии в адрес фурри и их культуры не допускаются.",
        fields: [
          {
            name: "Почему не стоит плохо относиться к фурри:",
            value: [
              "> 1. **Создание позитивной атмосферы:** Дружелюбное отношение помогает избежать враждебности и напряженности на сервере, что способствует приятному общению.",
              "> 2. **Поддержка участников:** Насмешки и унижения могут негативно сказаться на самочувствии участников, поэтому важно поддерживать друг друга.",
              "> 3. **Избежание конфликтов:** Негативные комментарии могут привести к спорам и разногласиям, что мешает мирному взаимодействию.",
              "> 4. **Толерантность:** Уважение к фурри помогает поддерживать принципы толерантности и разнообразия, что делает сообщество более дружелюбным.",
            ].join("\n"),
          },
          {
            name: "Почему важно уважать фурри:",
            value: [
              "> 1. **Фурри сервер:** Это фурри сервер, и уважение к фурри сообществу является основополагающим принципом его существования.",
              "> 2. **Дружелюбная атмосфера:** Уважение к фурри помогает создать позитивную и поддерживающую среду, где участники могут свободно выражать свои интересы.",
              "> 3. **Разнообразие:** Уважение к различным интересам и увлечениям способствует взаимопониманию и толерантности.",
              "> 4. **Безопасное пространство:** Запрещение насмешек и унижений помогает создать безопасное пространство для всех участников.",
              "> 5. **Пример для других:** Проявление уважения к фурри служит примером для других участников, показывая ценность толерантности и уважения.",
            ].join("\n"),
          },
          {
            name: "Наказания:",
            value:
              "```1. Предупреждение.\n2. Блокировка к основным каналам сервера на 48 часоы.\n3. Временный мьют на 7 дней.\n4. Перманентный бан.```",
          },
          {
            name: "Возможные причины наказания:",
            value:
              "```1. Насмешки в адрес фурри.\n2. Унижение участников фурри сообщества.\n3. Негативные комментарии о фурри культуре.\n4. Провокация конфликтов на тему фурри.\n5. Неуважение к интересам и увлечениям других участников.```",
          },
        ],
        color: 0x0077b6,
      }),
      new EmbedBuilder({
        title: "12. Соблюдение правил Discord",
        description:
          "Все участники должны соблюдать официальные правила и условия использования Discord. Нарушение этих правил может привести к наказаниям как со стороны администрации сервера, так и со стороны Discord. Это включает в себя запрет на использование ботов или скриптов для автоматизации действий, распространение вредоносного ПО, фишинговых ссылок, нарушение авторских прав и размещение контента, запрещенного правилами Discord.",
        fields: [
          {
            name: "Наказания:",
            value:
              "```1. Предупреждение.\n2. Блокировка к основным каналам сервера на 24 часа.\n3. Временный мьют на 48 часов.\n4. Перманентный бан.```",
          },
          {
            name: "Возможные причины наказания:",
            value:
              "```1. Нарушение условий использования Discord.\n2. Использование ботов или скриптов для автоматизации действий.\n3. Распространение вредоносного ПО или фишинговых ссылок.\n4. Нарушение авторских прав.\n5. Размещение контента, запрещенного правилами Discord.```",
          },
        ],
        color: 0x0077b6,
      }),
      new EmbedBuilder({
        title: "13. Запрет на токсичное поведение в голосовых каналах",
        description:
          "В голосовых каналах запрещено токсичное поведение, включая крики, оскорбления, троллинг и создание конфликтных ситуаций. Участники должны вести себя вежливо и уважительно, избегать громких звуков, нецензурной лексики и провокаций. Важно поддерживать дружелюбную атмосферу и уважать других участников.",
        fields: [
          {
            name: "Наказания:",
            value:
              "```1. Предупреждение.\n2. Блокировка к основным каналам сервера на 12 часов.\n3. Временный мьют на 48 часов.\n4. Временный мьют на 7 дней.```",
          },
          {
            name: "Возможные причины наказания:",
            value:
              "```1. Крики и шум в голосовых каналах.\n2. Оскорбления и унижения других участников.\n3. Провокации и троллинг.\n4. Создание конфликтных ситуаций.\n5. Нарушение правил голосового общения.```",
          },
        ],
        color: 0x0077b6,
      }),
      new EmbedBuilder({
        title: "14. Запрет на использование нецензурной лексики",
        description:
          "Использование нецензурной лексики в текстовых и голосовых каналах запрещено. Участники должны выражаться культурно и уважительно, избегать грубых и оскорбительных слов. Это правило помогает поддерживать приятную и дружелюбную атмосферу на сервере. Нецензурная лексика разрешена в пределах разумного, но не должна использоваться для оскорблений или унижений.",
        fields: [
          {
            name: "Наказания:",
            value:
              "```1. Предупреждение.\n2. Блокировка к основным каналам сервера на 24 часа.\n3. Временный мьют на 48 часов.\n4. Временный мьют на 7 дней.```",
          },
          {
            name: "Возможные причины наказания:",
            value:
              "```1. Использование нецензурных слов и выражений.\n2. Оскорбления с использованием нецензурной лексики.\n3. Публикация нецензурных мемов и изображений.\n4. Нарушение культурных норм общения.\n5. Постоянное использование нецензурной лексики.```",
          },
        ],
        color: 0x0077b6,
      }),
    ];

    for (const embed of embeds) {
      message.channel.send({ embeds: [embed] });
    }
  }
}
