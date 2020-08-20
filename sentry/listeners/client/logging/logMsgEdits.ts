import { Listener } from 'discord-akairo';
import { Message, DMChannel } from 'discord.js';
import logger from '../../../utils/logger';
import { logMsgEdit } from '../../../services/serverlogs';

export default class LogMessageEditListener extends Listener {
  public constructor() {
    super('logMsgEdit', {
      emitter: 'client',
      event: 'messageUpdate',
      category: 'client',
    });
  }

  public async exec(oldMessage: Message, newMessage: Message) {
    if (oldMessage.channel instanceof DMChannel) return;

    logger.debug(
      `Message edited in ${newMessage.guild!.name} (${newMessage.guild!.id})`
    );

    logMsgEdit(oldMessage, newMessage);
  }
}
