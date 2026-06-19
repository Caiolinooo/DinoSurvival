const DINO_PERSONALITIES = {
    aggressive: { huntRange: 60, fleeChance: 0.1, socialChance: 0.05, aggression: 0.8 },
    shy: { huntRange: 30, fleeChance: 0.7, socialChance: 0.2, aggression: 0.2 },
    curious: { huntRange: 40, fleeChance: 0.3, socialChance: 0.4, aggression: 0.4 },
    lazy: { huntRange: 25, fleeChance: 0.4, socialChance: 0.3, aggression: 0.3 },
    territorial: { huntRange: 50, fleeChance: 0.15, socialChance: 0.1, aggression: 0.9 }
};

const PERSONALITY_WEIGHTS = ['aggressive', 'shy', 'curious', 'lazy', 'territorial'];
const PERSONALITY_WEIGHT_VALUES = [20, 20, 25, 20, 15];
const TOTAL_PERSONALITY_WEIGHT = PERSONALITY_WEIGHT_VALUES.reduce((a, b) => a + b, 0);

class AISystem {
    constructor() {
        this.npcs = new Map();
    }

    createAI(dinoId, dinoData) {
        let r = Math.random() * TOTAL_PERSONALITY_WEIGHT;
        let personality = PERSONALITY_WEIGHTS[0];
        for (let i = 0; i < PERSONALITY_WEIGHTS.length; i++) {
            r -= PERSONALITY_WEIGHT_VALUES[i];
            if (r <= 0) { personality = PERSONALITY_WEIGHTS[i]; break; }
        }
        const traits = DINO_PERSONALITIES[personality];
        const ai = {
            state: 'idle',
            personality,
            traits,
            stateTimer: 0,
            wanderTarget: null,
            wanderTimer: 0,
            patrolPath: [],
            patrolIndex: 0,
            lastStateChange: Date.now(),
            socialTarget: null,
            sleepTimer: 0,
            isSleeping: false
        };
        this.npcs.set(dinoId, ai);
        return ai;
    }

    removeAI(dinoId) {
        this.npcs.delete(dinoId);
    }

    update(dinoId, dino, dinoData, players, foodSpawns, waterSpawns, ecosystemPlants, ecosystemAnimals, mapSize, allDinoData) {
        const ai = this.npcs.get(dinoId);
        if (!ai) return null;
        ai.stateTimer -= 0.05;

        let targetX = dino.position.x;
        let targetZ = dino.position.z;
        let shouldSprint = false;
        let action = null;

        const nearestFood = this.findNearestFood(dino, foodSpawns, ecosystemPlants, 50);
        const nearestWater = this.findNearestWater(dino, waterSpawns, 50);
        const nearestThreat = this.findNearestThreat(dino, dinoData, players, 50 + ai.traits.huntRange, allDinoData);
        const nearestPrey = dinoData.type === 'carnivore' ? this.findNearestPrey(dino, dinoData, players, 50 + ai.traits.huntRange, allDinoData) : null;
        const nearestMate = this.findNearestMate(dino, dinoData, players, 40);

        const mapHalf = mapSize / 2;

        switch (ai.state) {
            case 'idle':
                if (ai.stateTimer <= 0) {
                    ai.state = this.chooseState(dino, dinoData, ai, nearestFood, nearestWater, nearestThreat, nearestPrey);
                    ai.lastStateChange = Date.now();
                }
                break;

            case 'wander':
                if (ai.wanderTimer <= 0 || !ai.wanderTarget) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 10 + Math.random() * 20;
                    ai.wanderTarget = {
                        x: Math.max(-mapHalf, Math.min(mapHalf, dino.position.x + Math.cos(angle) * dist)),
                        z: Math.max(-mapHalf, Math.min(mapHalf, dino.position.z + Math.sin(angle) * dist))
                    };
                    ai.wanderTimer = 3 + Math.random() * 5;
                }
                ai.wanderTimer -= 0.05;
                if (ai.wanderTarget) {
                    targetX = ai.wanderTarget.x;
                    targetZ = ai.wanderTarget.z;
                }
                shouldSprint = Math.random() < 0.01;
                break;

            case 'hunt':
                if (nearestPrey && nearestPrey.player.health > 0) {
                    targetX = nearestPrey.player.position.x;
                    targetZ = nearestPrey.player.position.z;
                    shouldSprint = true;
                    if (Math.random() < 0.005) {
                        const damage = dinoData.attackDamage;
                        nearestPrey.player.health -= damage;
                        action = { type: 'attack', target: nearestPrey };
                        if (nearestPrey.player.health <= 0) {
                            nearestPrey.player.isDead = true;
                        }
                    }
                } else if (nearestFood) {
                    ai.state = 'eat';
                } else {
                    ai.state = 'wander';
                }
                break;

            case 'flee':
                if (nearestThreat) {
                    const dx = dino.position.x - nearestThreat.player.position.x;
                    const dz = dino.position.z - nearestThreat.player.position.z;
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist > 0) {
                        targetX = dino.position.x + (dx / dist) * 30;
                        targetZ = dino.position.z + (dz / dist) * 30;
                        targetX = Math.max(-mapHalf, Math.min(mapHalf, targetX));
                        targetZ = Math.max(-mapHalf, Math.min(mapHalf, targetZ));
                    }
                    shouldSprint = true;
                    ai.fleeTimer = (ai.fleeTimer || 5) - 0.05;
                    if (ai.fleeTimer <= 0) {
                        ai.state = 'wander';
                        ai.fleeTimer = 0;
                    }
                } else {
                    ai.state = 'wander';
                }
                break;

            case 'eat':
                if (nearestFood) {
                    targetX = nearestFood.food.position.x;
                    targetZ = nearestFood.food.position.z;
                    shouldSprint = false;
                    const dist = Math.sqrt(
                        (targetX - dino.position.x) ** 2 +
                        (targetZ - dino.position.z) ** 2
                    );
                    if (dist < 2 && Math.random() < 0.02) {
                        const canEat = dinoData.type === 'carnivore' ? nearestFood.food.type !== 'berry' : true;
                        if (canEat) {
                            nearestFood.food.isEaten = true;
                            dino.hunger = Math.min(dino.hunger + nearestFood.food.amount, dinoData.maxHunger);
                        }
                        ai.state = 'wander';
                    }
                } else {
                    ai.state = 'wander';
                }
                break;

            case 'drink':
                if (nearestWater) {
                    targetX = nearestWater.position.x;
                    targetZ = nearestWater.position.z;
                    shouldSprint = false;
                    const dist = Math.sqrt(
                        (targetX - dino.position.x) ** 2 +
                        (targetZ - dino.position.z) ** 2
                    );
                    if (dist < 3 && Math.random() < 0.02) {
                        dino.thirst = Math.min(dino.thirst + 30, dinoData.maxThirst);
                        ai.state = 'wander';
                    }
                } else {
                    ai.state = 'wander';
                }
                break;

            case 'socialize':
                if (nearestMate) {
                    targetX = nearestMate.player.position.x;
                    targetZ = nearestMate.player.position.z;
                    shouldSprint = false;
                } else {
                    ai.state = 'wander';
                }
                break;

            case 'sleep':
                if (ai.sleepTimer > 0) {
                    ai.sleepTimer -= 0.05;
                    ai.isSleeping = true;
                    dino.isSprinting = false;
                } else {
                    ai.isSleeping = false;
                    ai.state = 'wander';
                }
                return null;
        }

        if (nearestThreat && ai.traits.fleeChance > Math.random() && ai.state !== 'flee') {
            ai.state = 'flee';
            ai.fleeTimer = 3 + Math.random() * 5;
        }

        if (dinoData.type === 'carnivore' && dino.hunger < dinoData.maxHunger * 0.4 && nearestPrey && ai.state !== 'hunt' && ai.state !== 'eat') {
            ai.state = 'hunt';
        }

        if (dino.hunger < dinoData.maxHunger * 0.3 && nearestFood && ai.state !== 'eat') {
            ai.state = 'eat';
        }

        if (dino.thirst < dinoData.maxThirst * 0.4 && nearestWater && ai.state !== 'drink') {
            ai.state = 'drink';
        }

        if (Math.random() < 0.001 && ai.state === 'wander') {
            ai.state = 'sleep';
            ai.sleepTimer = 10 + Math.random() * 20;
        }

        return { targetX, targetZ, shouldSprint, action, ai };
    }

    chooseState(dino, dinoData, ai, nearestFood, nearestWater, nearestThreat, nearestPrey) {
        if (dino.hunger < dinoData.maxHunger * 0.4 && nearestFood) return 'eat';
        if (dino.thirst < dinoData.maxThirst * 0.4 && nearestWater) return 'drink';
        if (nearestThreat && ai.traits.fleeChance > Math.random()) return 'flee';
        if (dinoData.type === 'carnivore' && dino.hunger < dinoData.maxHunger * 0.5 && nearestPrey) return 'hunt';
        if (Math.random() < ai.traits.socialChance && nearestPrey) return 'socialize';
        return 'wander';
    }

    findNearestFood(dino, foodSpawns, ecosystemPlants, range) {
        let nearest = null;
        let minDist = range;
        foodSpawns.forEach((food, id) => {
            if (food.isEaten) return;
            const dist = Math.sqrt((food.position.x - dino.position.x) ** 2 + (food.position.z - dino.position.z) ** 2);
            if (dist < minDist) { minDist = dist; nearest = { food, id }; }
        });
        if (ecosystemPlants) {
            ecosystemPlants.forEach((plant, id) => {
                if (plant.isHarvested || plant.growthStage < 0.5) return;
                const dist = Math.sqrt((plant.position.x - dino.position.x) ** 2 + (plant.position.z - dino.position.z) ** 2);
                if (dist < minDist) { minDist = dist; nearest = { food: { ...plant, type: plant.foodType, isEaten: plant.isHarvested, amount: plant.amount * 0.5 }, id }; }
            });
        }
        return nearest;
    }

    findNearestWater(dino, waterSpawns, range) {
        let nearest = null;
        let minDist = range;
        waterSpawns.forEach((water, id) => {
            const dist = Math.sqrt((water.position.x - dino.position.x) ** 2 + (water.position.z - dino.position.z) ** 2);
            if (dist < minDist) { minDist = dist; nearest = water; }
        });
        return nearest;
    }

    findNearestThreat(dino, dinoData, players, range, allDinoData) {
        let nearest = null;
        let minDist = range;
        players.forEach((player, id) => {
            if (player.isDead) return;
            const playerDinoData = allDinoData ? allDinoData[player.dinosaurId] : null;
            if (playerDinoData && ((dinoData.type === 'herbivore' && playerDinoData.type === 'carnivore') || (dinoData.type === 'carnivore' && player.dinosaurId !== dino.dinosaurId))) {
                const dist = Math.sqrt((player.position.x - dino.position.x) ** 2 + (player.position.z - dino.position.z) ** 2);
                if (dist < minDist) { minDist = dist; nearest = { player, id }; }
            }
        });
        return nearest;
    }

    findNearestPrey(dino, dinoData, players, range, allDinoData) {
        let nearest = null;
        let minDist = range;
        players.forEach((player, id) => {
            if (player.isDead) return;
            const pDino = allDinoData ? allDinoData[player.dinosaurId] : null;
            const isPrey = pDino && pDino.type === 'herbivore';
            if (isPrey) {
                const dist = Math.sqrt((player.position.x - dino.position.x) ** 2 + (player.position.z - dino.position.z) ** 2);
                if (dist < minDist) { minDist = dist; nearest = { player, id }; }
            }
        });
        return nearest;
    }

    findNearestMate(dino, dinoData, players, range) {
        let nearest = null;
        let minDist = range;
        players.forEach((player, id) => {
            if (player.isDead) return;
            if (player.dinosaurId === dino.dinosaurId) {
                const dist = Math.sqrt((player.position.x - dino.position.x) ** 2 + (player.position.z - dino.position.z) ** 2);
                if (dist < minDist) { minDist = dist; nearest = { player, id }; }
            }
        });
        return nearest;
    }
}

module.exports = { AISystem, DINO_PERSONALITIES };
