import logger from '../../utils/logger';
import ms from 'ms';
import { Command } from 'discord-akairo';
import { Message, Permissions, GuildMember } from 'discord.js';
import { logBan } from '../../services/serverlogs';
import { getDefaultEmbed } from '../../utils/message';
import { checkHigherOrEqualPermissions } from '../../utils/permissions';
import { createTempBan } from '../../services/tempbans';
import { getServerById } from '../../services/server';

export default class TempBanCommand extends Command {
  public constructor() {
    super('tempban', {
      aliases: ['tempban'],
      description: {
        content:
          'Temporarily ban a user from the server. (also known as a softban)',
        usage: 'tempban <user> <duration> [reason] [--silent]',
        examples: [
          '@temporis#6402 1d',
          'temporis 10d spamming',
          '111901076520767488 30d bad words',
          'temporis 5d memer --silent --days=7',
          '@temporis#6402 racism --days=30d',
        ],
      },
      category: 'moderation',
      channel: 'guild',
      clientPermissions: [Permissions.FLAGS.BAN_MEMBERS],
      userPermissions: [Permissions.FLAGS.BAN_MEMBERS],
      args: [
        {
          id: 'member',
          type: 'member',
        },
        {
          id: 'duration',
          type: (_: Message, str: string) => {
            if (str) {
              return Number(ms(str));
            }
            return 0;
          },
        },
        {
          id: 'reason',
          type: 'string',
          match: 'rest',
          default: (_: Message) => 'No reason provided.',
        },
        {
          id: 'days',
          type: 'integer',
          match: 'option',
          flag: ['--days=', '-d='],
          default: 0,
        },
        {
          id: 'silent',
          match: 'flag',
          flag: ['--silent', '-s'],
        },
      ],
    });
  }

  public async exec(
    msg: Message,
    {
      member,
      duration,
      reason,
      days,
      silent,
    }: {
      member: GuildMember;
      duration: number;
      reason: string;
      days: number;
      silent: boolean;
    }
  ) {
    if (!member) {
      return msg.util?.send(
        'Please specify a user to temporarily ban / user not found.'
      );
    }

    if (!duration) {
      return msg.util?.send(
        'Please specify a duration to ban the user for. Max: `30d`'
      );
    }

    if (duration > 2.592e9) {
      return msg.util?.send('Please specify a duration less than 30 days.');
    }

    // Checks so that you can not temp ban someone higher or equal to you.
    if (await checkHigherOrEqualPermissions(msg, member))
      return msg.util?.send(
        'That member has a higher or equal role to you. You are unable to ban them.'
      );

    let msDuration = ms(duration);

    // check to make sure they are not already banned
    try {
      const ban = await member.guild.fetchBan(member);

      if (ban) {
        return msg.util?.send('That user is already banned.');
      }
    } catch (e) {
      logger.info('User was not already banned... continuing..');
    }

    try {
      if (!silent) {
        await member.send(
          `You have been temporarily banned from ${member.guild.name} for \`${msDuration}\` for the reason: *${reason}*`
        );
      }

      // ban the user and send them a msg
      await member.ban({ reason: reason, days: days });

      const server = await getServerById(msg.guild!.id);

      if (!server)
        return msg.util?.send('Error occured when trying to ban the user.');

      // so that we can unban people later :)
      const inserted = await createTempBan({
        server,
        user: member.id,
        end: Date.now() + duration,
        reason: reason,
        moderator: msg.member!.id,
      });

      // log ban
      logBan(member.user, reason, msg.member!, msDuration);

      if (!inserted)
        msg.util?.send(
          'Failed to save temp ban. User will not be unbanned automatically.'
        );

      logger.debug(
        `Temp banned ${member.user.tag} (${member.id}) for ${msDuration} for reason: ${reason}`
      );
    } catch (err) {
      logger.error('Error temp banning user. Error: ', err);
      return msg.util?.send('Error occured when trying to ban the user.');
    }

    const embed = getDefaultEmbed('GREEN')
      .setTitle('Banned')
      .addField('Reason', reason)
      .addField('User', member.user, true)
      .addField('Duration', msDuration, true)
      .addField('Moderator', msg.member!.user, true);

    return msg.util?.send(embed);
  }
}
