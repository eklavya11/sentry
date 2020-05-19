import { Command } from 'discord-akairo';
import { GuildMember, Message, Permissions } from 'discord.js';
import { utc } from 'moment';
import 'moment-duration-format';
import { getDefaultEmbed } from '../../utils/message';

export default class UserInfoCommand extends Command {
    public constructor() {
        super('user', {
            aliases: ['user', 'userinfo', 'whois', 'member', 'user-info'],
            description: {
                content: 'Get information about a user in a server.',
                usage: 'userinfo <member>',
                examples: ['temporis', '@temporis#6402', '111901076520767488'],
            },
            category: 'info',
            channel: 'guild',
            clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
            args: [
                {
                    id: 'member',
                    match: 'content',
                    type: 'member',
                    default: (msg: Message) => msg.member,
                },
            ],
        });
    }

    public async exec(msg: Message, { member }: { member: GuildMember }) {
        const { user } = member;
        let isBanned = '';

        try {
            await msg.guild.fetchBan(user);
            isBanned = 'Yes';
        } catch (err) {
            isBanned = 'No';
        }

        // TODO: If user requesting is a mod, get infractions

        const embed = getDefaultEmbed()
            .setTitle(user.tag)
            .addField('ID', user.id, false)
            .addField(
                'Created at (UTC)',
                utc(user.createdAt).format('MM/DD/YYYY hh:mm'),
                true
            )
            .addField(
                'Nickname',
                member.nickname == undefined ? 'No nickname' : member.nickname,
                true
            )
            .addField('Is Bot?', user.bot ? 'Yes' : 'No', true)
            .addField('Banned?', isBanned, true)
            .addField('Status', user.presence.status.toUpperCase(), true)
            .addField(
                'Activity',
                user.presence.activities?.[0]?.name ?? 'None',
                true
            )
            // TODO: Order these
            .addField(
                'Roles',
                member.roles.cache.map((role) => role).join(', '),
                false
            )
            .setThumbnail(user.displayAvatarURL());

        msg.util?.send(embed);
    }
}
