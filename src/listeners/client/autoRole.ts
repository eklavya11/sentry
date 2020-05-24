import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import { Servers } from '../../models/server';
import logger from '../../utils/logger';

export default class AutoRoleListener extends Listener {
    public constructor() {
        super('autoroleListener', {
            emitter: 'client',
            event: 'guildMemberAdd',
            category: 'client',
        });
    }

    public async exec(member: GuildMember) {
        const serversRepo = this.client.db.getRepository(Servers);
        let server = await serversRepo.findOne({
            where: { server: member.guild.id },
        });

        if (server.autoroleEnabled) {
            if (server.autoroleRole) {
                // Assign the role
                await member.roles.add(server.autoroleRole, 'Autorole');
                logger.debug(
                    `Auto assigning role ${server.autoroleRole} in ${member.guild.name} (${member.guild.id})`
                );
            } else {
                logger.debug(
                    'Not auto-assigning role because role is not set.'
                );
            }
        } else {
            logger.debug(
                'Not auto-assigning role because autorole is not enabled.'
            );
        }
    }
}
