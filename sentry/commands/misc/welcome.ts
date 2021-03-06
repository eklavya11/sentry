import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { TextChannel } from 'discord.js';
import { getDefaultEmbed } from '../../utils/message';
import logger from '../../utils/logger';
import { updateServerById } from '../../services/server';

export default class WelcomeCommand extends Command {
  public constructor() {
    super('welcome', {
      aliases: ['welcome', 'welcomemsg'],
      description: {
        content: 'Send a message to a channel whenever a user joins!',
        usage: 'welcome <channel> <message>',
        examples: [
          '#welcome Hello, {name}. Welcome to {server}!',
          '#welcome Welcome {name} to the server!',
          '#welcome Welcome to {server}',
          '#welcome Welcome! Please read the rules.',
        ],
      },
      category: 'misc',
      channel: 'guild',
      clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      args: [
        {
          id: 'channel',
          type: 'textChannel',
        },
        {
          id: 'message',
          type: 'string',
          match: 'rest',
        },
      ],
    });
  }

  public async exec(
    msg: Message,
    { channel, message }: { channel: TextChannel; message: string }
  ) {
    if (!channel) {
      return msg.util?.send(
        'Please specify a channel to send the welcome message to.'
      );
    }

    if (!message) {
      return msg.util?.send(
        'Please specify a message you want to send when a user joins.'
      );
    }

    // update the channel and message in the server and enable it
    try {
      const updated = await updateServerById(msg.guild!.id, {
        welcomeMessage: message,
        welcomeChannel: channel.id,
        welcomeMessageEnabled: true,
      });

      if (updated) {
        logger.info(
          `Updated welcome message in ${msg.guild?.name} (${msg.guild?.id})`
        );
      } else {
        logger.error(
          `Error when updating welcome message in ${msg.guild?.name} (${msg.guild?.id})`
        );

        return msg.util?.send(`Error updating welcome message.`);
      }
    } catch (err) {
      logger.error(
        `Error when updating welcome message in ${msg.guild?.name} (${msg.guild?.id})`
      );
    }

    return msg.util?.send(
      getDefaultEmbed('GREEN')
        .setTitle('Welcome Message Enabled')
        .addField('Message', message, false)
        .addField('Channel', channel, true)
    );
  }
}
