class TribeManager {
    constructor() {
        this.tribes = new Map();
        this.invites = new Map();
        this.playerTribes = new Map();
    }

    createTribe(name, tag, ownerId, ownerName) {
        if (this.tribes.has(name)) return { success: false, reason: 'Tribo já existe' };
        if (tag.length < 2 || tag.length > 5) return { success: false, reason: 'Tag deve ter 2-5 caracteres' };
        if (name.length < 2 || name.length > 30) return { success: false, reason: 'Nome deve ter 2-30 caracteres' };
        if (this.playerTribes.has(ownerId)) return { success: false, reason: 'Você já está em uma tribo' };
        const tribe = {
            name,
            tag: tag.toUpperCase(),
            description: '',
            ownerId,
            createdAt: Date.now(),
            maxMembers: 30,
            members: new Map()
        };
        tribe.members.set(ownerId, { userId: ownerId, username: ownerName, role: 'leader', joinedAt: Date.now() });
        this.tribes.set(name, tribe);
        this.playerTribes.set(ownerId, name);
        return { success: true, tribe: this.sanitizeTribe(tribe, ownerId) };
    }

    inviteToTribe(tribeName, inviterId, targetUserId, targetUsername) {
        const tribe = this.tribes.get(tribeName);
        if (!tribe) return { success: false, reason: 'Tribo não encontrada' };
        const member = tribe.members.get(inviterId);
        if (!member || (member.role !== 'leader' && member.role !== 'admin')) {
            return { success: false, reason: 'Sem permissão para convidar' };
        }
        if (tribe.members.size >= tribe.maxMembers) return { success: false, reason: 'Tribo está cheia' };
        if (tribe.members.has(targetUserId)) return { success: false, reason: 'Jogador já está na tribo' };
        if (this.playerTribes.has(targetUserId)) return { success: false, reason: 'Jogador já está em outra tribo' };
        const key = `${targetUserId}_${tribeName}`;
        this.invites.set(key, {
            tribeName,
            inviterId,
            targetUserId,
            targetUsername,
            createdAt: Date.now(),
            expiresAt: Date.now() + 60000
        });
        return { success: true, inviteKey: key };
    }

    acceptInvite(userId, tribeName) {
        const key = `${userId}_${tribeName}`;
        const invite = this.invites.get(key);
        if (!invite) return { success: false, reason: 'Convite não encontrado' };
        if (Date.now() > invite.expiresAt) {
            this.invites.delete(key);
            return { success: false, reason: 'Convite expirado' };
        }
        const tribe = this.tribes.get(tribeName);
        if (!tribe) return { success: false, reason: 'Tribo não encontrada' };
        if (tribe.members.size >= tribe.maxMembers) return { success: false, reason: 'Tribo está cheia' };
        tribe.members.set(userId, { userId, username: invite.targetUsername, role: 'member', joinedAt: Date.now() });
        this.playerTribes.set(userId, tribeName);
        this.invites.delete(key);
        return { success: true, tribe: this.sanitizeTribe(tribe, userId) };
    }

    kickFromTribe(tribeName, kickerId, targetUserId) {
        const tribe = this.tribes.get(tribeName);
        if (!tribe) return { success: false, reason: 'Tribo não encontrada' };
        const kicker = tribe.members.get(kickerId);
        if (!kicker || (kicker.role !== 'leader' && kicker.role !== 'admin')) {
            return { success: false, reason: 'Sem permissão' };
        }
        const target = tribe.members.get(targetUserId);
        if (!target) return { success: false, reason: 'Jogador não está na tribo' };
        if (target.role === 'leader') return { success: false, reason: 'Não pode expulsar o líder' };
        if (kicker.role === 'admin' && target.role === 'admin') return { success: false, reason: 'Admin não pode expulsar outro admin' };
        tribe.members.delete(targetUserId);
        this.playerTribes.delete(targetUserId);
        return { success: true };
    }

    leaveTribe(userId) {
        const tribeName = this.playerTribes.get(userId);
        if (!tribeName) return { success: false, reason: 'Você não está em uma tribo' };
        const tribe = this.tribes.get(tribeName);
        if (!tribe) return { success: false, reason: 'Tribo não encontrada' };
        const member = tribe.members.get(userId);
        if (member && member.role === 'leader') {
            const admins = Array.from(tribe.members.values()).filter(m => m.role === 'admin');
            if (admins.length > 0) {
                admins[0].role = 'leader';
            } else {
                const members = Array.from(tribe.members.values()).filter(m => m.role === 'member');
                if (members.length > 0) {
                    members[0].role = 'leader';
                } else {
                    this.disbandTribe(tribeName);
                    return { success: true, disbanded: true };
                }
            }
        }
        tribe.members.delete(userId);
        this.playerTribes.delete(userId);
        return { success: true };
    }

    disbandTribe(tribeName) {
        const tribe = this.tribes.get(tribeName);
        if (!tribe) return { success: false, reason: 'Tribo não encontrada' };
        tribe.members.forEach((member) => {
            this.playerTribes.delete(member.userId);
        });
        this.tribes.delete(tribeName);
        return { success: true };
    }

    getPlayerTribe(userId) {
        const tribeName = this.playerTribes.get(userId);
        if (!tribeName) return null;
        const tribe = this.tribes.get(tribeName);
        if (!tribe) return null;
        return this.sanitizeTribe(tribe, userId);
    }

    getTribeByName(name) {
        const tribe = this.tribes.get(name);
        if (!tribe) return null;
        return this.sanitizeTribe(tribe, null);
    }

    getAllTribes() {
        return Array.from(this.tribes.values()).map(t => this.sanitizeTribe(t, null));
    }

    promoteMember(tribeName, promoterId, targetUserId) {
        const tribe = this.tribes.get(tribeName);
        if (!tribe) return { success: false, reason: 'Tribo não encontrada' };
        const promoter = tribe.members.get(promoterId);
        if (!promoter || promoter.role !== 'leader') return { success: false, reason: 'Só o líder pode promover' };
        const target = tribe.members.get(targetUserId);
        if (!target) return { success: false, reason: 'Jogador não está na tribo' };
        if (target.role === 'leader') return { success: false, reason: 'Líder não pode ser promovido' };
        if (target.role === 'admin') { target.role = 'member'; return { success: true, action: 'rebaixado' }; }
        target.role = 'admin';
        return { success: true, action: 'promovido' };
    }

    sanitizeTribe(tribe, viewerId) {
        return {
            name: tribe.name,
            tag: tribe.tag,
            description: tribe.description,
            ownerId: tribe.ownerId,
            memberCount: tribe.members.size,
            maxMembers: tribe.maxMembers,
            members: Array.from(tribe.members.values()).map(m => ({
                userId: m.userId,
                username: m.username,
                role: m.role,
                joinedAt: m.joinedAt
            })),
            isMember: viewerId ? tribe.members.has(viewerId) : false,
            myRole: viewerId ? (tribe.members.get(viewerId)?.role || null) : null
        };
    }
}

module.exports = { TribeManager };
