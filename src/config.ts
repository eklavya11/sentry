require('dotenv').config();

export let token: string = process.env.BOT_TOKEN!;
export let defaultPrefix: string = process.env.DEFAULT_PREFIX!;
export let owners: string[] = process.env.OWNERS!.split(',');
export let dbName: string = 'sentry';
export let dbHost: string = process.env.DB_HOST!;
export let dbUsername: string = process.env.DB_USERNAME!;
export let dbPassword: string = process.env.DB_PASSWORD!;
export let discordClientSecret: string = process.env.CLIENT_SECRET!;
// TODO: Might need to change this
export let callbackUrl: string = 'http://0.0.0.0/localhost';
export let sessionSecret: string = process.env.SESSION_SECRET ?? 'secret';
export let domain: string = process.env.DOMAIN ?? '0.0.0.0';
