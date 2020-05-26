import { Listener } from 'discord-akairo';
import { GuildChannel, DMChannel } from 'discord.js';
import { Servers } from '../../models/server';
import { Repository } from 'typeorm';
import { getMutedRole } from '../../structures/muteManager';
import logger from '../../utils/logger';

export default class ChannelCreateListener extends Listener {
  public constructor() {
    super('channelCreate', {
      emitter: 'client',
      event: 'channelCreate',
    });
  }

  public async exec(channel: DMChannel | GuildChannel) {
    // ignore dm channels
    logger.debug(`New Channel Created: `, channel);
    if (channel instanceof DMChannel) return;

    const serversRepo: Repository<Servers> = this.client.db.getRepository(
      Servers
    );

    // no muted role, something probably went wrong...
    let mutedRole = await getMutedRole(serversRepo, channel.guild);
    if (!mutedRole) return;

    // override the new channels permissions for the muted role so that muted people can not talk in new channels
    try {
      await channel.updateOverwrite(mutedRole, {
        SEND_MESSAGES: false,
        SPEAK: false,
      });
      logger.info(
        `Updated mute permissions for new channel ${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id})`
      );
    } catch (err) {
      logger.error(
        `Error creating mute permission overwrites for channel ${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id}). Error: `,
        err
      );
    }
  }
}
