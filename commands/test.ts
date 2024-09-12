import { Message } from "discord.js";
import Command from "../src/structures/command";
import { AlisterHelper } from "../src/core";
import BaseEntity, { EntityManager, IntEntity, StringEntity } from "../src/engine/command-parser/manager";
import { TokenType } from "../src/engine/command-parser/token-type";
import { Enum, Metadata } from "../src/engine/command-parser/enum";
import { generateUUIDv4 } from "../src/util/generateComplexUUID";

export default class UseCommand extends Command {
  constructor(client: AlisterHelper) {
    super(client, {
      name: "test",
      description: "test",
      memberPermissions: [],
      clientPermissions: [],
      arguments: [ ],
      flags: [
        {
          name: "b",
          type: [TokenType.INT],
          required: true,
          desription: "Длина битов",
          allowList: false,
        }
      ]
    });
  }

  public async run(message: Message<boolean>, manager: EntityManager<Enum<string, Metadata>>, flags: Record<string, BaseEntity>) {
  }
}
