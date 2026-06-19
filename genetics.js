const MUTATIONS = {
    color_mutation: { name: 'Color Mutation', cost: 500, effect: { type: 'cosmetic', description: 'Nova cor de skin' } },
    pattern_mutation: { name: 'Pattern Mutation', cost: 600, effect: { type: 'cosmetic', description: 'Novo padrão' } },
    health_up_I: { name: 'Health Up I', cost: 800, effect: { type: 'stat', stat: 'maxHealth', multiplier: 1.05, description: '+5% HP máximo' } },
    health_up_II: { name: 'Health Up II', cost: 1500, effect: { type: 'stat', stat: 'maxHealth', multiplier: 1.08, description: '+8% HP máximo' } },
    speed_up_I: { name: 'Speed Up I', cost: 700, effect: { type: 'stat', stat: 'speed', multiplier: 1.05, description: '+5% velocidade' } },
    speed_up_II: { name: 'Speed Up II', cost: 1300, effect: { type: 'stat', stat: 'speed', multiplier: 1.08, description: '+8% velocidade' } },
    stamina_up_I: { name: 'Stamina Up I', cost: 600, effect: { type: 'stat', stat: 'maxStamina', multiplier: 1.08, description: '+8% stamina máxima' } },
    stamina_up_II: { name: 'Stamina Up II', cost: 1200, effect: { type: 'stat', stat: 'maxStamina', multiplier: 1.12, description: '+12% stamina máxima' } },
    strength_up_I: { name: 'Strength Up I', cost: 1000, effect: { type: 'stat', stat: 'attackDamage', multiplier: 1.08, description: '+8% dano' } },
    strength_up_II: { name: 'Strength Up II', cost: 1800, effect: { type: 'stat', stat: 'attackDamage', multiplier: 1.12, description: '+12% dano' } },
    defense_up: { name: 'Defense Up', cost: 900, effect: { type: 'stat', stat: 'defense', multiplier: 1.10, description: '+10% defesa' } },
    hunger_resist: { name: 'Hunger Resist', cost: 500, effect: { type: 'stat', stat: 'hungerRate', multiplier: 0.85, description: '-15% taxa fome' } },
    thirst_resist: { name: 'Thirst Resist', cost: 500, effect: { type: 'stat', stat: 'thirstRate', multiplier: 0.85, description: '-15% taxa sede' } },
    regen_up: { name: 'Regen Up', cost: 700, effect: { type: 'stat', stat: 'regenRate', multiplier: 1.25, description: '+25% regen HP' } },
    size_up: { name: 'Size Up', cost: 2000, effect: { type: 'stat', stat: 'size', multiplier: 1.10, description: '+10% tamanho' } },
    glow: { name: 'Glow', cost: 3000, effect: { type: 'cosmetic', description: 'Efeito glow (lendário)' } }
};

const MAX_MUTATIONS_PER_DINO = 16;

class GeneticsSystem {
    constructor() {
        this.activeEggs = new Map();
        this.dinoMutations = new Map();
        this.dinoXP = new Map();
    }

    generateEggCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = 'DINO-';
        for (let i = 0; i < 4; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    createEgg(motherId, fatherId, motherGenetics, fatherGenetics, position) {
        const eggCode = this.generateEggCode();
        const genetics = this.combineGenetics(motherGenetics || [], fatherGenetics || []);
        const egg = {
            code: eggCode,
            motherId,
            fatherId,
            genetics,
            position: { ...position },
            incubationProgress: 0,
            isHatched: false,
            hatchedBy: null,
            createdAt: Date.now()
        };
        this.activeEggs.set(eggCode, egg);
        return egg;
    }

    combineGenetics(motherGenes, fatherGenes) {
        const combined = [];
        const allGenes = [...motherGenes, ...fatherGenes];
        const shuffled = allGenes.sort(() => Math.random() - 0.5);
        const maxSlots = MAX_MUTATIONS_PER_DINO;
        for (let i = 0; i < Math.min(shuffled.length, maxSlots); i++) {
            if (Math.random() < 0.7) {
                combined.push({ ...shuffled[i], slotNumber: i });
            }
        }
        if (combined.length === 0 && Math.random() < 0.1) {
            const mutationIds = Object.keys(MUTATIONS);
            const randMutation = mutationIds[Math.floor(Math.random() * mutationIds.length)];
            combined.push({ mutationId: randMutation, slotNumber: 0 });
        }
        return combined;
    }

    incubateEgg(eggCode, progress) {
        const egg = this.activeEggs.get(eggCode);
        if (!egg || egg.isHatched) return null;
        egg.incubationProgress = Math.min(1, egg.incubationProgress + progress);
        if (egg.incubationProgress >= 1) {
            egg.isHatched = true;
            return egg;
        }
        return null;
    }

    hatchEgg(eggCode, userId) {
        const egg = this.activeEggs.get(eggCode);
        if (!egg || !egg.isHatched) return null;
        egg.hatchedBy = userId;
        return egg;
    }

    addMutation(dinoId, mutationId) {
        if (!MUTATIONS[mutationId]) return false;
        const mutations = this.dinoMutations.get(dinoId) || [];
        if (mutations.length >= MAX_MUTATIONS_PER_DINO) return false;
        const slotNumber = mutations.length;
        mutations.push({ mutationId, slotNumber, isActive: true, unlockedAt: Date.now() });
        this.dinoMutations.set(dinoId, mutations);
        return true;
    }

    getMutations(dinoId) {
        return this.dinoMutations.get(dinoId) || [];
    }

    applyMutations(dinoId, baseStats) {
        const mutations = this.dinoMutations.get(dinoId) || [];
        const stats = { ...baseStats };
        mutations.forEach(m => {
            const def = MUTATIONS[m.mutationId];
            if (!def || !m.isActive) return;
            const effect = def.effect;
            if (effect.type === 'stat' && effect.stat && effect.multiplier) {
                if (stats[effect.stat] !== undefined) {
                    stats[effect.stat] *= effect.multiplier;
                }
            }
        });
        return stats;
    }

    addXP(dinoId, amount) {
        const xp = this.dinoXP.get(dinoId) || 0;
        const newXP = xp + amount;
        this.dinoXP.set(dinoId, newXP);
        const level = this.calculateLevel(newXP);
        return { xp: newXP, level, gained: amount };
    }

    getXP(dinoId) {
        return this.dinoXP.get(dinoId) || 0;
    }

    calculateLevel(xp) {
        return Math.floor(Math.sqrt(xp / 100)) + 1;
    }

    calculateLevelXP(level) {
        return (level - 1) ** 2 * 100;
    }

    getMutationsForPurchase(dinoId) {
        const xp = this.dinoXP.get(dinoId) || 0;
        const currentMutations = this.dinoMutations.get(dinoId) || [];
        return Object.entries(MUTATIONS)
            .filter(([id]) => !currentMutations.find(m => m.mutationId === id))
            .map(([id, def]) => ({
                id,
                name: def.name,
                cost: def.cost,
                description: def.effect.description,
                canAfford: xp >= def.cost
            }));
    }

    purchaseMutation(dinoId, mutationId) {
        const xp = this.dinoXP.get(dinoId) || 0;
        const def = MUTATIONS[mutationId];
        if (!def) return { success: false, reason: 'Mutação inválida' };
        if (xp < def.cost) return { success: false, reason: 'XP insuficiente' };
        const mutations = this.dinoMutations.get(dinoId) || [];
        if (mutations.length >= MAX_MUTATIONS_PER_DINO) return { success: false, reason: 'Limite de mutações atingido' };
        if (mutations.find(m => m.mutationId === mutationId)) return { success: false, reason: 'Mutação já adquirida' };
        this.dinoXP.set(dinoId, xp - def.cost);
        this.addMutation(dinoId, mutationId);
        return { success: true, xpRemaining: xp - def.cost };
    }
}

module.exports = { GeneticsSystem, MUTATIONS, MAX_MUTATIONS_PER_DINO };
