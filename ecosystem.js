const PLANT_TYPES = {
    berry_bush: { name: 'Berry Bush', foodType: 'berry', amount: 30, growTime: 120, maxHarvests: 5, biomes: ['forest', 'plain'] },
    fern: { name: 'Fern', foodType: 'berry', amount: 15, growTime: 90, maxHarvests: 3, biomes: ['forest', 'swamp'] },
    cycad: { name: 'Cycad', foodType: 'berry', amount: 25, growTime: 180, maxHarvests: 4, biomes: ['forest', 'plain', 'mountain'] },
    palm: { name: 'Palm Tree', foodType: 'berry', amount: 40, growTime: 300, maxHarvests: 6, biomes: ['beach', 'plain', 'desert'] },
    flower: { name: 'Wildflower', foodType: 'berry', amount: 10, growTime: 60, maxHarvests: 2, biomes: ['plain', 'forest', 'mountain'] },
    mushroom: { name: 'Mushroom', foodType: 'berry', amount: 20, growTime: 150, maxHarvests: 3, biomes: ['forest', 'swamp', 'cave'] },
    cactus: { name: 'Cactus', foodType: 'berry', amount: 35, growTime: 240, maxHarvests: 4, biomes: ['desert'] },
    seaweed: { name: 'Seaweed', foodType: 'berry', amount: 18, growTime: 100, maxHarvests: 5, biomes: ['beach', 'river'] }
};

const ANIMAL_TYPES = {
    fish: { name: 'Fish', foodType: 'fish', amount: 25, maxHealth: 30, biomes: ['river', 'beach'] },
    rabbit: { name: 'Rabbit', foodType: 'meat', amount: 35, maxHealth: 40, biomes: ['plain', 'forest'] },
    bird: { name: 'Bird', foodType: 'meat', amount: 20, maxHealth: 25, biomes: ['forest', 'plain', 'mountain', 'beach'] },
    insect: { name: 'Insect', foodType: 'insect', amount: 10, maxHealth: 10, biomes: ['forest', 'swamp', 'plain'] },
    lizard: { name: 'Lizard', foodType: 'meat', amount: 15, maxHealth: 20, biomes: ['desert', 'mountain', 'forest'] },
    frog: { name: 'Frog', foodType: 'insect', amount: 12, maxHealth: 15, biomes: ['swamp', 'river'] },
    snake: { name: 'Snake', foodType: 'meat', amount: 30, maxHealth: 35, biomes: ['desert', 'forest', 'swamp'] },
    turtle: { name: 'Turtle', foodType: 'meat', amount: 40, maxHealth: 60, biomes: ['beach', 'river', 'swamp'] }
};

const ANIMAL_SPAWN_WEIGHTS = {
    fish: 20, rabbit: 20, bird: 25, insect: 35, lizard: 15, frog: 12, snake: 10, turtle: 8
};
const totalWeight = Object.values(ANIMAL_SPAWN_WEIGHTS).reduce((a, b) => a + b, 0);

class Ecosystem {
    constructor(mapSize) {
        this.mapSize = mapSize || 1000;
        this.plants = new Map();
        this.animals = new Map();
        this.targetPlantCount = 300;
        this.targetAnimalCount = 80;
        this.lastPlantSpawn = 0;
        this.lastAnimalSpawn = 0;
        this.plantSpawnInterval = 30;
        this.animalSpawnInterval = 60;
        this.biomes = ['forest', 'plain', 'desert', 'mountain', 'swamp', 'beach', 'river', 'cave'];
    }

    getBiome(x, z) {
        const half = this.mapSize / 2;
        const nx = (x + half) / this.mapSize;
        const nz = (z + half) / this.mapSize;
        const angle = Math.atan2(nz - 0.5, nx - 0.5);
        const dist = Math.sqrt((nx - 0.5) ** 2 + (nz - 0.5) ** 2);
        if (dist < 0.15) return 'plain';
        if (dist > 0.45) return 'mountain';
        if (angle > -0.5 && angle < 0.8) return 'forest';
        if (angle > 0.8 && angle < 1.5) return 'desert';
        if (angle > 1.5 && angle < 2.2) return 'swamp';
        if (angle > -1.5 && angle < -0.5) return 'river';
        if (angle > -2.2 && angle < -1.5) return 'beach';
        return 'cave';
    }

    spawnPlant() {
        const plantTypes = Object.keys(PLANT_TYPES);
        const type = plantTypes[Math.floor(Math.random() * plantTypes.length)];
        const def = PLANT_TYPES[type];
        const x = (Math.random() - 0.5) * this.mapSize;
        const z = (Math.random() - 0.5) * this.mapSize;
        const biome = this.getBiome(x, z);
        if (!def.biomes.includes(biome)) return null;
        const id = `plant_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const plant = {
            id, type, biome,
            position: { x, y: 0, z },
            growthStage: Math.random(),
            isHarvested: false,
            harvestCount: 0,
            maxHarvests: def.maxHarvests,
            respawnTime: def.growTime,
            amount: def.amount,
            foodType: def.foodType,
            lastHarvested: null,
            createdAt: Date.now()
        };
        this.plants.set(id, plant);
        return plant;
    }

    spawnAnimal() {
        const types = Object.keys(ANIMAL_TYPES);
        let r = Math.random() * totalWeight;
        let chosenType = types[0];
        for (const t of types) {
            r -= ANIMAL_SPAWN_WEIGHTS[t];
            if (r <= 0) { chosenType = t; break; }
        }
        const def = ANIMAL_TYPES[chosenType];
        const x = (Math.random() - 0.5) * this.mapSize;
        const z = (Math.random() - 0.5) * this.mapSize;
        const biome = this.getBiome(x, z);
        if (!def.biomes.includes(biome)) return null;
        const id = `animal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const animal = {
            id, type: chosenType, biome,
            position: { x, y: 0, z },
            health: def.maxHealth,
            maxHealth: def.maxHealth,
            isAlive: true,
            isTamed: false,
            tamedBy: null,
            behaviorState: 'idle',
            createdAt: Date.now(),
            foodType: def.foodType,
            amount: def.amount,
            wanderTarget: null,
            wanderTimer: 0
        };
        this.animals.set(id, animal);
        return animal;
    }

    update() {
        this.updatePlants();
        this.updateAnimals();
    }

    updatePlants() {
        const now = Date.now();
        if (this.plants.size < this.targetPlantCount && now - this.lastPlantSpawn > this.plantSpawnInterval * 1000) {
            this.lastPlantSpawn = now;
            const toSpawn = this.targetPlantCount - this.plants.size;
            let attempts = 0;
            let spawned = 0;
            while (spawned < Math.min(toSpawn, 10) && attempts < 50) {
                if (this.spawnPlant()) spawned++;
                attempts++;
            }
        }
        this.plants.forEach((plant, id) => {
            if (plant.isHarvested) {
                const elapsed = (now - plant.lastHarvested) / 1000;
                if (elapsed >= plant.respawnTime) {
                    plant.isHarvested = false;
                    plant.harvestCount = 0;
                    plant.growthStage = 0;
                }
                return;
            }
            if (plant.growthStage < 1) {
                plant.growthStage += 0.001;
            }
        });
    }

    updateAnimals() {
        const now = Date.now();
        if (this.animals.size < this.targetAnimalCount && now - this.lastAnimalSpawn > this.animalSpawnInterval * 1000) {
            this.lastAnimalSpawn = now;
            const toSpawn = this.targetAnimalCount - this.animals.size;
            let attempts = 0;
            let spawned = 0;
            while (spawned < Math.min(toSpawn, 5) && attempts < 30) {
                if (this.spawnAnimal()) spawned++;
                attempts++;
            }
        }
        this.animals.forEach((animal, id) => {
            if (!animal.isAlive) return;
            if (animal.wanderTimer <= 0) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 2 + Math.random() * 5;
                animal.wanderTarget = {
                    x: animal.position.x + Math.cos(angle) * dist,
                    z: animal.position.z + Math.sin(angle) * dist
                };
                animal.wanderTimer = 2 + Math.random() * 4;
            }
            animal.wanderTimer -= 0.05;
            if (animal.wanderTarget) {
                const dx = animal.wanderTarget.x - animal.position.x;
                const dz = animal.wanderTarget.z - animal.position.z;
                const d = Math.sqrt(dx * dx + dz * dz);
                if (d > 0.5) {
                    const speed = 0.005;
                    animal.position.x += (dx / d) * speed;
                    animal.position.z += (dz / d) * speed;
                } else {
                    animal.wanderTarget = null;
                }
            }
            const half = this.mapSize / 2;
            animal.position.x = Math.max(-half, Math.min(half, animal.position.x));
            animal.position.z = Math.max(-half, Math.min(half, animal.position.z));
        });
    }

    harvestPlant(plantId) {
        const plant = this.plants.get(plantId);
        if (!plant || plant.isHarvested || plant.growthStage < 1) return null;
        plant.harvestCount++;
        if (plant.harvestCount >= plant.maxHarvests) {
            plant.isHarvested = true;
            plant.lastHarvested = Date.now();
        }
        return { foodType: plant.foodType, amount: plant.amount };
    }

    killAnimal(animalId) {
        const animal = this.animals.get(animalId);
        if (!animal || !animal.isAlive) return null;
        animal.isAlive = false;
        return { foodType: animal.foodType, amount: animal.amount, position: animal.position };
    }

    getState() {
        return {
            plants: Array.from(this.plants.values()).filter(p => !p.isHarvested && p.growthStage >= 0.5).map(p => ({
                id: p.id, type: p.type, position: p.position, growthStage: p.growthStage
            })),
            animals: Array.from(this.animals.values()).filter(a => a.isAlive).map(a => ({
                id: a.id, type: a.type, position: a.position, behaviorState: a.behaviorState
            }))
        };
    }
}

module.exports = { Ecosystem, PLANT_TYPES, ANIMAL_TYPES };
