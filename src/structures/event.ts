import { BaseInteraction, ClientEvents, CommandInteraction, Interaction, MessageComponentInteraction } from "discord.js"
import { AlisterHelper } from "../core"

interface IOption<K extends keyof ClientEvents> {
  name: K;
  once: boolean;
}

interface IActionConditionalResult {
  condition: boolean;
  customId: string;
}

export default abstract class DiscordEvent<K extends keyof ClientEvents> {
  constructor(public client: AlisterHelper, public options: IOption<K>) {}

  action(interaction: Interaction): IActionConditionalResult {
    throw new Error("Conditional Interaction Error")
  }

  abstract execute(...args: ClientEvents[K]): void

  run(...args: ClientEvents[K]) {
    const isInteraction = args.some((arg: ClientEvents[K]) => arg instanceof BaseInteraction)

    if(isInteraction) {
      try {
        const payload = this.action(args[0] as Interaction)
  
        if(payload.condition && (args[0] as MessageComponentInteraction).customId.startsWith(payload.customId)) {
          return this.execute(...args)
        }
      } catch(e) {
        if(args[0] instanceof MessageComponentInteraction) {
          args[0].reply({ content: `Данное взаимодействие пока не используется`, ephemeral: true })
        }
      }

      return;
    }

    return this.execute(...args)
  }
}