import { Message, GuildMember, Role, Permissions } from 'discord.js';
import { GuildInfo } from 'passport-discord';
import { AkairoClient } from 'discord-akairo';

interface PermissionsIndex {
  [key: string]: string;
}

export const PERMISSIONS: PermissionsIndex = {
  ADMINISTRATOR: 'Administrator',
  VIEW_AUDIT_LOG: 'View Audit Log',
  MANAGE_GUILD: 'Manage Server',
  MANAGE_ROLES: 'Manage Roles',
  MANAGE_CHANNELS: 'Manage Channels',
  KICK_MEMBERS: 'Kick Members',
  BAN_MEMBERS: 'Ban Members',
  CREATE_INSTANT_INVITE: 'Create Invite',
  CHANGE_NICKNAME: 'Change Nickname',
  MANAGE_NICKNAMES: 'Manage Nicknames',
  MANAGE_EMOJIS: 'Manage Emojis',
  MANAGE_WEBHOOKS: 'Manage Webhooks',
  VIEW_CHANNEL: 'Read Text Channels & See Voice Channels',
  SEND_MESSAGES: 'Send Messages',
  SEND_TTS_MESSAGES: 'Send TTS Messages',
  MANAGE_MESSAGES: 'Manage Messages',
  EMBED_LINKS: 'Embed Links',
  ATTACH_FILES: 'Attach Files',
  READ_MESSAGE_HISTORY: 'Read Message History',
  MENTION_EVERYONE: 'Mention Everyone',
  USE_EXTERNAL_EMOJIS: 'Use External Emojis',
  ADD_REACTIONS: 'Add Reactions',
  CONNECT: 'Connect',
  SPEAK: 'Speak',
  STREAM: 'Video',
  MUTE_MEMBERS: 'Mute Members',
  DEAFEN_MEMBERS: 'Deafen Members',
  MOVE_MEMBERS: 'Move Members',
  USE_VAD: 'Use Voice Activity',
};

// a check to make sure that the user does not have higher or equal permissions to yourself
// returns true if higher or equal permissions
export async function checkHigherOrEqualPermissions(
  modMsg: Message,
  other: GuildMember
): Promise<boolean> {
  if (
    other.roles.highest.position >= modMsg.member!.roles.highest.position &&
    modMsg.author.id !== modMsg.guild!.ownerID
  ) {
    return true;
  }

  return false;
}

export async function checkHigherRole(
  msg: Message,
  role: Role
): Promise<boolean> {
  if (
    msg.member!.roles.highest.position <= role.position &&
    msg.author.id !== msg.guild!.ownerID
  ) {
    return true;
  }

  return false;
}

// return true if user has manage guild / admin and the bot is in the guild we are trying to return
export function hasManageServerAndBotInGuild(
  client: AkairoClient,
  guildInfo: GuildInfo,
  userId: string
): boolean {
  // get the guild from the bot, meaning you should not be able to manage that server
  const guild = client.guilds.cache.get(guildInfo.id);
  if (!guild) return false;

  // get the guild member
  let member = guild.members.cache.get(userId);
  // if they are not in that guild, something is wrong so return false
  if (!member) return false;

  // make sure that we have either manage guild or admin permissions
  if (
    member.permissions.has(Permissions.FLAGS.MANAGE_GUILD) ||
    member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
  )
    return true;

  // otherwise, they do not have the correct permissions so just return false
  return false;
}
