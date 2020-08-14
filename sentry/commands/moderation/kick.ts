import { Command } from 'discord-akairo';
import { Message, Permissions, GuildMember } from 'discord.js';
import logger from '../../utils/logger';
import { logKick } from '../../structures/logManager';
import { getDefaultEmbed } from '../../utils/message';
import { checkHigherOrEqualPermissions } from '../../utils/permissions';

export default class KickCommand extends Command {
  public constructor() {
    // TODO: Allow the ability to purge messages after a kick
    super('kick', {
      aliases: ['kick'],
      description: {
        content: 'Kick a user from the server.',
        usage: 'kick <user> [reason]',
        examples: [
          '@temporis#6402',
          'temporis ur bad',
          '111901076520767488',
          '@temporis#6402 --silent',
          '@temporis#6402 --purge=1d',
        ],
      },
      category: 'moderation',
      channel: 'guild',
      clientPermissions: [Permissions.FLAGS.KICK_MEMBERS],
      userPermissions: [Permissions.FLAGS.KICK_MEMBERS],
      args: [
        {
          id: 'member',
          type: 'member',
        },
        {
          id: 'reason',
          type: 'string',
          match: 'rest',
          default: (_: Message) => 'No reason provided.',
        },
        {
          id: 'silent',
          match: 'flag',
          flag: ['--silent', '-s'],
          default: false,
        },
      ],
    });
  }

  public async exec(
    msg: Message,
    {
      member,
      reason,
      silent,
    }: {
      member: GuildMember;
      reason: string;
      silent: boolean;
    }
  ) {
    if (!member) {
      return msg.util?.send('Please specify a user to kick.');
    }

    // Checks so that you can not kick someone higher than you.
    if (await checkHigherOrEqualPermissions(msg, member))
      return msg.util?.send(
        'That member has a higher or equal role to you. You are unable to kick them.'
      );

    try {
      // kick the user and send them a msg
      await member.kick(reason).then(() => {
        if (!silent) {
          member.send(
            `You have been kicked from ${member.guild.name} for the reason: *${reason}*`
          );
        }
      });

      // log kick
      logKick(member, reason, msg.member!);

      logger.debug(
        `Kicked ${member.user.tag} (${member.id}) for reason: ${reason}`
      );
    } catch (err) {
      logger.error('Error kicking user. Error: ', err);
      return msg.util?.send('Error occured when trying to kick user.');
    }

    const embed = getDefaultEmbed('GREEN')
      .setTitle('Kicked')
      .addField('Reason', reason, true)
      .addField('User', member.user, true)
      .addField('Moderator', msg.member!.user, true);

    return msg.util?.send(embed);
  }
}
