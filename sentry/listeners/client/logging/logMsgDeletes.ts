import { Listener } from 'discord-akairo';
import { Message, DMChannel } from 'discord.js';
import logger from '../../../utils/logger';
import { logMsgDelete } from '../../../services/serverlogs';

export default class LogMessageDeleteListener extends Listener {
  public constructor() {
    super('logMsgDelete', {
      emitter: 'client',
      event: 'messageDelete',
      category: 'client',
    });
  }

  public async exec(msg: Message) {
    if (msg.channel instanceof DMChannel) return;

    logger.debug(`Message deleted in ${msg.guild!.name} (${msg.guild!.id})`);

    logMsgDelete(msg);
  }
}
