import ms from 'ms';
import { Command } from 'discord-akairo';
import { stripIndents } from 'common-tags';
import { Message, Permissions, TextChannel } from 'discord.js';
import { AutoPurges } from '../../../models/autoPurge';
import {
  getSingleAutoPurge,
  startAutoPurge,
} from '../../../services/autopurge';
import { getServerById } from '../../../services/server';

export default class AutoPurgeStartCommand extends Command {
  public constructor() {
    super('autopurge-start', {
      category: 'moderation',
      clientPermissions: [
        Permissions.FLAGS.MANAGE_MESSAGES,
        Permissions.FLAGS.MANAGE_CHANNELS,
      ],
      userPermissions: [
        Permissions.FLAGS.MANAGE_MESSAGES,
        Permissions.FLAGS.MANAGE_CHANNELS,
      ],
      args: [
        {
          id: 'channel',
          type: 'textChannel',
        },
        {
          id: 'interval',
          type: (_: Message, str: string) => {
            if (str) {
              return Number(ms(str));
            }
            return 0;
          },
        },
      ],
    });
  }

  // TODO: Refactor into other file
  // TODO: Error handling :)
  public async exec(
    msg: Message,
    { channel, interval }: { channel: TextChannel; interval: number }
  ) {
    // no channel specified
    if (!channel) {
      return msg.util?.send('Please specify a channel to autopurge.');
    }

    // no interval specified
    if (!interval) {
      return msg.util?.send(
        stripIndents`Please specify an interval to purge the channel at.
                Min Duration: \`5 minutes\`
                Max Duration: \`14 days\``
      );
    }

    // less than 5 minutes greater or more than 2 weeks
    if (interval < 300000 || interval > 1.21e9) {
      return msg.util?.send(
        stripIndents`Specify an interval within the provided range.
                Min Duration: \`5 minutes\`
                Max Duration: \`14 days\``
      );
    }

    const existingPurge = await getSingleAutoPurge(msg.guild!.id, channel.id);

    // purge already exists on the channel
    if (existingPurge) {
      return msg.util?.send(
        'There is already an existing purge on this channel. Please remove it before adding a new one.'
      );
    }

    const server = await getServerById(msg.guild!.id);

    if (!server)
      return msg.util?.send('Failed to start autopurge. Please try again.');

    // add the auto-purge into the db
    const inserted = await startAutoPurge({
      server,
      channel: channel.id,
      timeUntilNextPurge: interval + Date.now(),
      purgeInterval: interval,
    });

    if (!inserted)
      return msg.util?.send(`Failed to start autopurge. Please try again.`);

    return msg.util?.send(
      `Auto purge started with an interval of \`${ms(interval)}\``
    );
  }
}
