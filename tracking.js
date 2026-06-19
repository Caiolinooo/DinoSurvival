class TrackingSystem {
    constructor(maxEntries = 10000) {
        this.events = [];
        this.maxEntries = maxEntries;
        this.killCount = 0;
        this.deathCount = 0;
        this.discoveryCount = 0;
    }

    logKill(killerId, killerName, killerDinoId, victimId, victimName, victimDinoId, position) {
        const event = {
            type: 'kill',
            timestamp: Date.now(),
            killerId,
            killerName,
            killerDinoId,
            victimId,
            victimName,
            victimDinoId,
            position: position ? { ...position } : null
        };
        this.addEvent(event);
        this.killCount++;
        return event;
    }

    logDeath(playerId, playerName, dinoId, cause, killerInfo, position) {
        const event = {
            type: 'death',
            timestamp: Date.now(),
            playerId,
            playerName,
            dinoId,
            cause,
            killerInfo: killerInfo || null,
            position: position ? { ...position } : null
        };
        this.addEvent(event);
        this.deathCount++;
        return event;
    }

    logDiscovery(playerId, playerName, discoveryType, details, position) {
        const event = {
            type: 'discovery',
            timestamp: Date.now(),
            playerId,
            playerName,
            discoveryType,
            details: details || null,
            position: position ? { ...position } : null
        };
        this.addEvent(event);
        this.discoveryCount++;
        return event;
    }

    logJoin(playerId, playerName, dinoId) {
        this.addEvent({
            type: 'join',
            timestamp: Date.now(),
            playerId,
            playerName,
            dinoId
        });
    }

    logLeave(playerId, playerName) {
        this.addEvent({
            type: 'leave',
            timestamp: Date.now(),
            playerId,
            playerName
        });
    }

    logChat(playerId, playerName, message, channel) {
        this.addEvent({
            type: 'chat',
            timestamp: Date.now(),
            playerId,
            playerName,
            message,
            channel
        });
    }

    logEgg(playerId, playerName, eggCode, action) {
        this.addEvent({
            type: 'egg',
            timestamp: Date.now(),
            playerId,
            playerName,
            eggCode,
            action
        });
    }

    logTribe(playerId, playerName, tribeName, action) {
        this.addEvent({
            type: 'tribe',
            timestamp: Date.now(),
            playerId,
            playerName,
            tribeName,
            action
        });
    }

    addEvent(event) {
        this.events.push(event);
        if (this.events.length > this.maxEntries) {
            this.events.shift();
        }
    }

    getStats() {
        return {
            totalEvents: this.events.length,
            kills: this.killCount,
            deaths: this.deathCount,
            discoveries: this.discoveryCount
        };
    }

    getRecentEvents(count = 50) {
        return this.events.slice(-count);
    }

    getEventsByType(type, count = 50) {
        return this.events.filter(e => e.type === type).slice(-count);
    }

    getEventsByPlayer(playerId, count = 50) {
        return this.events.filter(e => e.playerId === playerId || e.killerId === playerId || e.victimId === playerId).slice(-count);
    }

    getKillLeaderboard(limit = 10) {
        const killMap = new Map();
        this.events.filter(e => e.type === 'kill').forEach(e => {
            const key = e.killerId;
            if (!killMap.has(key)) {
                killMap.set(key, { playerId: key, playerName: e.killerName, kills: 0, dinoId: e.killerDinoId });
            }
            killMap.get(key).kills++;
        });
        return Array.from(killMap.values()).sort((a, b) => b.kills - a.kills).slice(0, limit);
    }

    getDeathLeaderboard(limit = 10) {
        const deathMap = new Map();
        this.events.filter(e => e.type === 'death').forEach(e => {
            const key = e.playerId;
            if (!deathMap.has(key)) {
                deathMap.set(key, { playerId: key, playerName: e.playerName, deaths: 0 });
            }
            deathMap.get(key).deaths++;
        });
        return Array.from(deathMap.values()).sort((a, b) => b.deaths - a.deaths).slice(0, limit);
    }
}

module.exports = { TrackingSystem };
