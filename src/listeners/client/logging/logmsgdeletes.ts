import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';
import { logMsgDelete, Executor } from '../../../structures/logmanager';

export default class LogMessageDeleteListener extends Listener {
    public constructor() {
        super('logMsgDelete', {
            emitter: 'client',
            event: 'messageDelete',
            category: 'client',
        });
    }

    public async exec(msg: Message) {
        logger.debug(`Message deleted in ${msg.guild.name} (${msg.guild.id})`);

        let serversRepo = this.client.db.getRepository(Servers);
        logMsgDelete(serversRepo, msg, Executor.USER);
    }
}
