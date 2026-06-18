const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const { initDatabase, getDb } = require('./database');
const { verifyToken } = require('./auth');
const { WeatherSystem } = require('./weather');
const { getDinoById } = require('./dinodefs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const players = new Map();
const dinosaurs = new Map();
const mapSize = 1000;
const foodSpawns = new Map();
const waterSpawns = new Map();
const weatherSystem = new WeatherSystem();

// Population quotas per species (tier-based + type-based)
// Target: ~600 players, ~65% herbivores, ~35% carnivores
const POP_CAPS = {
    carnivore: { 1: 20, 2: 10, 3: 5, 4: 3, 5: 2 },
    herbivore: { 1: 50, 2: 25, 3: 15, 4: 10, 5: 7 }
};
function getSpeciesCap(dinoId) {
    const d = DINOSAURS[dinoId] || getDinoById(dinoId);
    if (!d) return Infinity;
    const type = d.type || 'herbivore';
    const caps = POP_CAPS[type] || POP_CAPS.herbivore;
    return caps[d.tier] || Infinity;
}
function getCurrentCount(dinoId) {
    let count = 0;
    players.forEach(p => { if (p.dinosaurId === dinoId && !p.isDead) count++; });
    dinosaurs.forEach(d => { if (d.dinosaurId === dinoId) count++; });
    return count;
}

// Dinosaur definitions
const DINOSAURS = {
    // CARNIVORES
    tyrannosaurus: {
        id: 'tyrannosaurus',
        name: 'Tyrannosaurus Rex',
        nameBR: 'Tiranossauro Rex',
        tier: 5,
        type: 'carnivore',
        maxHealth: 1800,
        maxStamina: 300,
        maxHunger: 1000,
        maxThirst: 1000,
        hungerRate: 0.15,
        thirstRate: 0.2,
        staminaRegenRate: 0.3,
        speed: 18,
        sprintSpeed: 28,
        attackDamage: 120,
        attackCooldown: 1.5,
        size: 1,
        realLength: 12,
        color: '#2d1b0e',
        bodyColor: '#3d2b1e',
        bellyColor: '#5d4b3e',
        textureColor: '#4d3b2e',
        tailColor: '#2d1b0e',
        headColor: '#3d2b1e',
        eyeColor: '#ff4400',
        teethColor: '#ffffff',
        clawColor: '#1a0a00',
        texture: 't-rex',
        isSwimming: false,
        isFlying: false
    },
    spinosaurus: {
        id: 'spinosaurus',
        name: 'Spinosaurus',
        nameBR: 'Espinossauro',
        tier: 5,
        type: 'carnivore',
        maxHealth: 1600,
        maxStamina: 350,
        maxHunger: 1000,
        maxThirst: 1000,
        hungerRate: 0.12,
        thirstRate: 0.15,
        staminaRegenRate: 0.4,
        speed: 16,
        sprintSpeed: 26,
        attackDamage: 100,
        attackCooldown: 1.8,
        size: 1,
        realLength: 15,
        color: '#1a4a2e',
        bodyColor: '#2a5a3e',
        bellyColor: '#3a6a4e',
        textureColor: '#3a5a3e',
        tailColor: '#1a4a2e',
        headColor: '#2a5a3e',
        eyeColor: '#ffaa00',
        teethColor: '#ffffff',
        clawColor: '#0a3a1e',
        texture: 'spino',
        isSwimming: true,
        isFlying: false
    },
    allosaurus: {
        id: 'allosaurus',
        name: 'Allosaurus',
        nameBR: 'Alossauro',
        tier: 4,
        type: 'carnivore',
        maxHealth: 1200,
        maxStamina: 250,
        maxHunger: 800,
        maxThirst: 800,
        hungerRate: 0.12,
        thirstRate: 0.18,
        staminaRegenRate: 0.3,
        speed: 20,
        sprintSpeed: 32,
        attackDamage: 85,
        attackCooldown: 1.2,
        size: 0.85,
        realLength: 8.5,
        color: '#3a3a4e',
        bodyColor: '#4a4a5e',
        bellyColor: '#5a5a6e',
        textureColor: '#4a4a5e',
        tailColor: '#3a3a4e',
        headColor: '#4a4a5e',
        eyeColor: '#ffcc00',
        teethColor: '#ffffff',
        clawColor: '#2a2a3e',
        texture: 'allo',
        isSwimming: false,
        isFlying: false
    },
    deinonychus: {
        id: 'deinonychus',
        name: 'Deinonychus',
        nameBR: 'Deinonico',
        tier: 2,
        type: 'carnivore',
        maxHealth: 300,
        maxStamina: 200,
        maxHunger: 400,
        maxThirst: 400,
        hungerRate: 0.2,
        thirstRate: 0.25,
        staminaRegenRate: 0.5,
        speed: 25,
        sprintSpeed: 38,
        attackDamage: 45,
        attackCooldown: 0.8,
        size: 0.5,
        realLength: 3.4,
        color: '#5a3a2e',
        bodyColor: '#6a4a3e',
        bellyColor: '#7a5a4e',
        textureColor: '#6a4a3e',
        tailColor: '#5a3a2e',
        headColor: '#6a4a3e',
        eyeColor: '#ff6600',
        teethColor: '#ffffff',
        clawColor: '#3a2a1e',
        texture: 'deino',
        isSwimming: false,
        isFlying: false
    },
    dilophosaurus: {
        id: 'dilophosaurus',
        name: 'Dilophosaurus',
        nameBR: 'Dilofossauro',
        tier: 2,
        type: 'carnivore',
        maxHealth: 350,
        maxStamina: 220,
        maxHunger: 450,
        maxThirst: 450,
        hungerRate: 0.18,
        thirstRate: 0.22,
        staminaRegenRate: 0.4,
        speed: 22,
        sprintSpeed: 35,
        attackDamage: 50,
        attackCooldown: 1.0,
        size: 0.55,
        realLength: 6,
        color: '#4a2a1e',
        bodyColor: '#5a3a2e',
        bellyColor: '#6a4a3e',
        textureColor: '#5a3a2e',
        tailColor: '#4a2a1e',
        headColor: '#5a3a2e',
        eyeColor: '#ffcc00',
        teethColor: '#ffffff',
        clawColor: '#3a2a1e',
        texture: 'dilo',
        isSpitting: false,
        isSwimming: false,
        isFlying: false
    },
    compsognathus: {
        id: 'compsognathus',
        name: 'Compsognathus',
        nameBR: 'Compsognato',
        tier: 1,
        type: 'carnivore',
        maxHealth: 150,
        maxStamina: 150,
        maxHunger: 300,
        maxThirst: 300,
        hungerRate: 0.3,
        thirstRate: 0.3,
        staminaRegenRate: 0.6,
        speed: 30,
        sprintSpeed: 42,
        attackDamage: 25,
        attackCooldown: 0.6,
        size: 0.35,
        realLength: 1,
        color: '#5a5a3e',
        bodyColor: '#6a6a4e',
        bellyColor: '#7a7a5e',
        textureColor: '#6a6a4e',
        tailColor: '#5a5a3e',
        headColor: '#6a6a4e',
        eyeColor: '#ff4400',
        teethColor: '#ffffff',
        clawColor: '#4a4a2e',
        texture: 'comp',
        isSwimming: false,
        isFlying: false
    },
    velociraptor: {
        id: 'velociraptor',
        name: 'Velociraptor',
        nameBR: 'Velocirraptor',
        tier: 2,
        type: 'carnivore',
        maxHealth: 280,
        maxStamina: 190,
        maxHunger: 380,
        maxThirst: 380,
        hungerRate: 0.22,
        thirstRate: 0.24,
        staminaRegenRate: 0.45,
        speed: 28,
        sprintSpeed: 40,
        attackDamage: 42,
        attackCooldown: 0.9,
        size: 0.48,
        realLength: 2,
        color: '#4a3a2e',
        bodyColor: '#5a4a3e',
        bellyColor: '#6a5a4e',
        textureColor: '#5a4a3e',
        tailColor: '#4a3a2e',
        headColor: '#5a4a3e',
        eyeColor: '#ff6600',
        teethColor: '#ffffff',
        clawColor: '#3a2a1e',
        texture: 'raptor',
        isSwimming: false,
        isFlying: false
    },

    // HERBIVORES
    apatosaurus: {
        id: 'apatosaurus',
        name: 'Apatosaurus',
        nameBR: 'Apatossauro',
        tier: 5,
        type: 'herbivore',
        maxHealth: 2000,
        maxStamina: 400,
        maxHunger: 1200,
        maxThirst: 1200,
        hungerRate: 0.08,
        thirstRate: 0.12,
        staminaRegenRate: 0.3,
        speed: 14,
        sprintSpeed: 22,
        attackDamage: 0,
        attackCooldown: 0,
        size: 1.2,
        realLength: 23,
        color: '#2a3a4e',
        bodyColor: '#3a4a5e',
        bellyColor: '#4a5a6e',
        textureColor: '#3a4a5e',
        tailColor: '#2a3a4e',
        headColor: '#3a4a5e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#2a3a4e',
        texture: 'apato',
        isSwimming: true,
        isFlying: false
    },
    brachiosaurus: {
        id: 'brachiosaurus',
        name: 'Brachiosaurus',
        nameBR: 'Brachiosauro',
        tier: 5,
        type: 'herbivore',
        maxHealth: 2200,
        maxStamina: 380,
        maxHunger: 1100,
        maxThirst: 1100,
        hungerRate: 0.07,
        thirstRate: 0.11,
        staminaRegenRate: 0.25,
        speed: 12,
        sprintSpeed: 20,
        attackDamage: 0,
        attackCooldown: 0,
        size: 1.3,
        realLength: 25,
        color: '#3a5a2e',
        bodyColor: '#4a6a3e',
        bellyColor: '#5a7a4e',
        textureColor: '#4a6a3e',
        tailColor: '#3a5a2e',
        headColor: '#4a6a3e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#3a5a2e',
        texture: 'brachio',
        isSwimming: true,
        isFlying: false
    },
    mamenchisaurus: {
        id: 'mamenchisaurus',
        name: 'Mamenchisaurus',
        nameBR: 'Mamencissauro',
        tier: 5,
        type: 'herbivore',
        maxHealth: 2100,
        maxStamina: 390,
        maxHunger: 1150,
        maxThirst: 1150,
        hungerRate: 0.075,
        thirstRate: 0.115,
        staminaRegenRate: 0.28,
        speed: 13,
        sprintSpeed: 21,
        attackDamage: 0,
        attackCooldown: 0,
        size: 1.25,
        realLength: 26,
        color: '#4a4a3e',
        bodyColor: '#5a5a4e',
        bellyColor: '#6a6a5e',
        textureColor: '#5a5a4e',
        tailColor: '#4a4a3e',
        headColor: '#5a5a4e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#4a4a3e',
        texture: 'mamench',
        isSwimming: true,
        isFlying: false
    },
    edmontosaurus: {
        id: 'edmontosaurus',
        name: 'Edmontosaurus',
        nameBR: 'Edmontossauro',
        tier: 4,
        type: 'herbivore',
        maxHealth: 1100,
        maxStamina: 300,
        maxHunger: 850,
        maxThirst: 850,
        hungerRate: 0.1,
        thirstRate: 0.14,
        staminaRegenRate: 0.35,
        speed: 16,
        sprintSpeed: 24,
        attackDamage: 0,
        attackCooldown: 0,
        size: 0.8,
        realLength: 12,
        color: '#3a4a5e',
        bodyColor: '#4a5a6e',
        bellyColor: '#5a6a7e',
        textureColor: '#4a5a6e',
        tailColor: '#3a4a5e',
        headColor: '#4a5a6e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#3a4a5e',
        texture: 'edmo',
        isSwimming: true,
        isFlying: false
    },
    stegosaurus: {
        id: 'stegosaurus',
        name: 'Stegosaurus',
        nameBR: 'Esteossauro',
        tier: 3,
        type: 'herbivore',
        maxHealth: 800,
        maxStamina: 280,
        maxHunger: 700,
        maxThirst: 700,
        hungerRate: 0.12,
        thirstRate: 0.16,
        staminaRegenRate: 0.32,
        speed: 14,
        sprintSpeed: 22,
        attackDamage: 60,
        attackCooldown: 2.0,
        size: 0.7,
        realLength: 9,
        color: '#2a4a2e',
        bodyColor: '#3a5a3e',
        bellyColor: '#4a6a4e',
        textureColor: '#3a5a3e',
        tailColor: '#2a4a2e',
        headColor: '#3a5a3e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#2a4a2e',
        texture: 'stego',
        hasPlates: true,
        tailAttack: true,
        isSwimming: false,
        isFlying: false
    },
    triceratops: {
        id: 'triceratops',
        name: 'Triceratops',
        nameBR: 'Triceratops',
        tier: 3,
        type: 'herbivore',
        maxHealth: 850,
        maxStamina: 290,
        maxHunger: 750,
        maxThirst: 750,
        hungerRate: 0.11,
        thirstRate: 0.15,
        staminaRegenRate: 0.33,
        speed: 15,
        sprintSpeed: 23,
        attackDamage: 55,
        attackCooldown: 1.8,
        size: 0.75,
        realLength: 9,
        color: '#4a3a2e',
        bodyColor: '#5a4a3e',
        bellyColor: '#6a5a4e',
        textureColor: '#5a4a3e',
        tailColor: '#4a3a2e',
        headColor: '#5a4a3e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#4a3a2e',
        texture: 'trik',
        hasHorns: true,
        headbuttAttack: true,
        isSwimming: false,
        isFlying: false
    },
    parasaurolophus: {
        id: 'parasaurolophus',
        name: 'Parasaurolophus',
        nameBR: 'Parassaurolofo',
        tier: 3,
        type: 'herbivore',
        maxHealth: 600,
        maxStamina: 250,
        maxHunger: 550,
        maxThirst: 550,
        hungerRate: 0.14,
        thirstRate: 0.18,
        staminaRegenRate: 0.38,
        speed: 18,
        sprintSpeed: 28,
        attackDamage: 0,
        attackCooldown: 0,
        size: 0.6,
        realLength: 10,
        color: '#3a5a4e',
        bodyColor: '#4a6a5e',
        bellyColor: '#5a7a6e',
        textureColor: '#4a6a5e',
        tailColor: '#3a5a4e',
        headColor: '#4a6a5e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#3a5a4e',
        texture: 'parasaur',
        hasCrest: true,
        isSwimming: false,
        isFlying: false
    },
    iguanodon: {
        id: 'iguanodon',
        name: 'Iguanodon',
        nameBR: 'Iguanodonte',
        tier: 2,
        type: 'herbivore',
        maxHealth: 450,
        maxStamina: 220,
        maxHunger: 500,
        maxThirst: 500,
        hungerRate: 0.16,
        thirstRate: 0.2,
        staminaRegenRate: 0.4,
        speed: 20,
        sprintSpeed: 30,
        attackDamage: 35,
        attackCooldown: 1.5,
        size: 0.55,
        realLength: 10,
        color: '#4a6a3e',
        bodyColor: '#5a7a4e',
        bellyColor: '#6a8a5e',
        textureColor: '#5a7a4e',
        tailColor: '#4a6a3e',
        headColor: '#5a7a4e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#4a6a3e',
        texture: 'iguano',
        hasThumbSpike: true,
        isSwimming: false,
        isFlying: false
    },
    hadrosaurus: {
        id: 'hadrosaurus',
        name: 'Hadrosaurus',
        nameBR: 'Hadrossauro',
        tier: 3,
        type: 'herbivore',
        maxHealth: 700,
        maxStamina: 260,
        maxHunger: 600,
        maxThirst: 600,
        hungerRate: 0.13,
        thirstRate: 0.17,
        staminaRegenRate: 0.36,
        speed: 17,
        sprintSpeed: 26,
        attackDamage: 0,
        attackCooldown: 0,
        size: 0.65,
        realLength: 8,
        color: '#5a4a3e',
        bodyColor: '#6a5a4e',
        bellyColor: '#7a6a5e',
        textureColor: '#6a5a4e',
        tailColor: '#5a4a3e',
        headColor: '#6a5a4e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#5a4a3e',
        texture: 'hadro',
        isSwimming: false,
        isFlying: false
    },

    // PTEROSAURS
    pteranodon: {
        id: 'pteranodon',
        name: 'Pteranodon',
        nameBR: 'Pteranodonte',
        tier: 4,
        type: 'carnivore',
        maxHealth: 900,
        maxStamina: 350,
        maxHunger: 700,
        maxThirst: 700,
        hungerRate: 0.15,
        thirstRate: 0.2,
        staminaRegenRate: 0.5,
        speed: 0,
        flightSpeed: 50,
        attackDamage: 65,
        attackCooldown: 1.0,
        size: 0.9,
        realLength: 1.8,
        color: '#3a2a1e',
        bodyColor: '#4a3a2e',
        bellyColor: '#5a4a3e',
        textureColor: '#4a3a2e',
        tailColor: '#3a2a1e',
        headColor: '#4a3a2e',
        eyeColor: '#ffcc00',
        teethColor: '#ffffff',
        clawColor: '#3a2a1e',
        wingColor: '#4a3a2e',
        texture: 'ptera',
        isSwimming: false,
        isFlying: true
    },
    rhamphorhynchus: {
        id: 'rhamphorhynchus',
        name: 'Rhamphorhynchus',
        nameBR: 'Ramforrincus',
        tier: 2,
        type: 'carnivore',
        maxHealth: 250,
        maxStamina: 180,
        maxHunger: 350,
        maxThirst: 350,
        hungerRate: 0.25,
        thirstRate: 0.28,
        staminaRegenRate: 0.55,
        speed: 0,
        flightSpeed: 35,
        attackDamage: 35,
        attackCooldown: 0.8,
        size: 0.4,
        realLength: 1.3,
        color: '#4a3a2e',
        bodyColor: '#5a4a3e',
        bellyColor: '#6a5a4e',
        textureColor: '#5a4a3e',
        tailColor: '#4a3a2e',
        headColor: '#5a4a3e',
        eyeColor: '#ff4400',
        teethColor: '#ffffff',
        clawColor: '#4a3a2e',
        wingColor: '#5a4a3e',
        texture: 'rhampho',
        isSwimming: false,
        isFlying: true
    },

    // ADDITIONAL DINOSAURS
    ankylosaurus: {
        id: 'ankylosaurus',
        name: 'Ankylosaurus',
        nameBR: 'Anquilossauro',
        tier: 4,
        type: 'herbivore',
        maxHealth: 1400,
        maxStamina: 320,
        maxHunger: 900,
        maxThirst: 900,
        hungerRate: 0.09,
        thirstRate: 0.13,
        staminaRegenRate: 0.3,
        speed: 11,
        sprintSpeed: 18,
        attackDamage: 80,
        attackCooldown: 2.5,
        size: 0.8,
        realLength: 8,
        color: '#3a3a2e',
        bodyColor: '#4a4a3e',
        bellyColor: '#5a5a4e',
        textureColor: '#4a4a3e',
        tailColor: '#3a3a2e',
        headColor: '#4a4a3e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#3a3a2e',
        texture: 'ankylo',
        hasArmor: true,
        tailClubAttack: true,
        isSwimming: false,
        isFlying: false
    },
    parasaurolophus: {
        id: 'parasaurolophus',
        name: 'Parasaurolophus',
        nameBR: 'Parassaurolofo',
        tier: 3,
        type: 'herbivore',
        maxHealth: 600,
        maxStamina: 250,
        maxHunger: 550,
        maxThirst: 550,
        hungerRate: 0.14,
        thirstRate: 0.18,
        staminaRegenRate: 0.38,
        speed: 18,
        sprintSpeed: 28,
        attackDamage: 0,
        attackCooldown: 0,
        size: 0.6,
        realLength: 10,
        color: '#3a5a4e',
        bodyColor: '#4a6a5e',
        bellyColor: '#5a7a6e',
        textureColor: '#4a6a5e',
        tailColor: '#3a5a4e',
        headColor: '#4a6a5e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#3a5a4e',
        texture: 'parasaur',
        hasCrest: true,
        isSwimming: false,
        isFlying: false
    },
    plesiosaurus: {
        id: 'plesiosaurus',
        name: 'Plesiosaurus',
        nameBR: 'Plesiosauro',
        tier: 4,
        type: 'carnivore',
        maxHealth: 1000,
        maxStamina: 300,
        maxHunger: 800,
        maxThirst: 800,
        hungerRate: 0.14,
        thirstRate: 0.12,
        staminaRegenRate: 0.45,
        speed: 10,
        sprintSpeed: 18,
        attackDamage: 70,
        attackCooldown: 1.2,
        size: 0.8,
        realLength: 3.5,
        color: '#2a4a5e',
        bodyColor: '#3a5a6e',
        bellyColor: '#4a6a7e',
        textureColor: '#3a5a6e',
        tailColor: '#2a4a5e',
        headColor: '#3a5a6e',
        eyeColor: '#ffcc00',
        teethColor: '#ffffff',
        clawColor: '#2a4a5e',
        texture: 'plesi',
        isSwimming: true,
        isFlying: false
    },
    mosasaurus: {
        id: 'mosasaurus',
        name: 'Mosasaurus',
        nameBR: 'Mosassauro',
        tier: 5,
        type: 'carnivore',
        maxHealth: 1700,
        maxStamina: 380,
        maxHunger: 1100,
        maxThirst: 1100,
        hungerRate: 0.1,
        thirstRate: 0.08,
        staminaRegenRate: 0.4,
        speed: 12,
        sprintSpeed: 20,
        attackDamage: 95,
        attackCooldown: 1.5,
        size: 1.1,
        realLength: 15,
        color: '#1a3a4e',
        bodyColor: '#2a4a5e',
        bellyColor: '#3a5a6e',
        textureColor: '#2a4a5e',
        tailColor: '#1a3a4e',
        headColor: '#2a4a5e',
        eyeColor: '#ff4400',
        teethColor: '#ffffff',
        clawColor: '#1a3a4e',
        texture: 'mosa',
        isSwimming: true,
        isFlying: false
    },
    deinocheirus: {
        id: 'deinocheirus',
        name: 'Deinocheirus',
        nameBR: 'Deinoqueiro',
        tier: 5,
        type: 'carnivore',
        maxHealth: 1500,
        maxStamina: 350,
        maxHunger: 1000,
        maxThirst: 1000,
        hungerRate: 0.1,
        thirstRate: 0.14,
        staminaRegenRate: 0.3,
        speed: 15,
        sprintSpeed: 24,
        attackDamage: 90,
        attackCooldown: 1.8,
        size: 1.1,
        realLength: 11,
        color: '#4a3a2e',
        bodyColor: '#5a4a3e',
        bellyColor: '#6a5a4e',
        textureColor: '#5a4a3e',
        tailColor: '#4a3a2e',
        headColor: '#5a4a3e',
        eyeColor: '#ffaa00',
        teethColor: '#ffffff',
        clawColor: '#4a3a2e',
        texture: 'deinoch',
        hasHump: true,
        isSwimming: false,
        isFlying: false
    },
    omeisaurus: {
        id: 'omeisaurus',
        name: 'Omeisaurus',
        nameBR: 'Omeissauro',
        tier: 4,
        type: 'herbivore',
        maxHealth: 1600,
        maxStamina: 360,
        maxHunger: 1000,
        maxThirst: 1000,
        hungerRate: 0.08,
        thirstRate: 0.12,
        staminaRegenRate: 0.28,
        speed: 13,
        sprintSpeed: 21,
        attackDamage: 0,
        attackCooldown: 0,
        size: 1.0,
        realLength: 20,
        color: '#3a4a3e',
        bodyColor: '#4a5a4e',
        bellyColor: '#5a6a5e',
        textureColor: '#4a5a4e',
        tailColor: '#3a4a3e',
        headColor: '#4a5a4e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#3a4a3e',
        texture: 'omei',
        isSwimming: true,
        isFlying: false
    },
    hadrosaur: {
        id: 'hadrosaur',
        name: 'Hadrosaur',
        nameBR: 'Hadrossauro',
        tier: 3,
        type: 'herbivore',
        maxHealth: 700,
        maxStamina: 260,
        maxHunger: 600,
        maxThirst: 600,
        hungerRate: 0.13,
        thirstRate: 0.17,
        staminaRegenRate: 0.36,
        speed: 17,
        sprintSpeed: 26,
        attackDamage: 0,
        attackCooldown: 0,
        size: 0.65,
        realLength: 8,
        color: '#5a4a3e',
        bodyColor: '#6a5a4e',
        bellyColor: '#7a6a5e',
        textureColor: '#6a5a4e',
        tailColor: '#5a4a3e',
        headColor: '#6a5a4e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#5a4a3e',
        texture: 'hadro',
        isSwimming: false,
        isFlying: false
    },
    ceratops: {
        id: 'ceratops',
        name: 'Ceratops',
        nameBR: 'Ceratops',
        tier: 4,
        type: 'herbivore',
        maxHealth: 1100,
        maxStamina: 310,
        maxHunger: 850,
        maxThirst: 850,
        hungerRate: 0.1,
        thirstRate: 0.14,
        staminaRegenRate: 0.32,
        speed: 14,
        sprintSpeed: 22,
        attackDamage: 70,
        attackCooldown: 2.0,
        size: 0.85,
        realLength: 2,
        color: '#4a3a2e',
        bodyColor: '#5a4a3e',
        bellyColor: '#6a5a4e',
        textureColor: '#5a4a3e',
        tailColor: '#4a3a2e',
        headColor: '#5a4a3e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#4a3a2e',
        texture: 'cera',
        hasHorns: true,
        hasFrill: true,
        isSwimming: false,
        isFlying: false
    },
    oviraptor: {
        id: 'oviraptor',
        name: 'Oviraptor',
        nameBR: 'Oviraptor',
        tier: 2,
        type: 'carnivore',
        maxHealth: 260,
        maxStamina: 185,
        maxHunger: 370,
        maxThirst: 370,
        hungerRate: 0.24,
        thirstRate: 0.26,
        staminaRegenRate: 0.48,
        speed: 27,
        sprintSpeed: 39,
        attackDamage: 40,
        attackCooldown: 0.9,
        size: 0.45,
        realLength: 2,
        color: '#5a4a2e',
        bodyColor: '#6a5a3e',
        bellyColor: '#7a6a4e',
        textureColor: '#6a5a3e',
        tailColor: '#5a4a2e',
        headColor: '#6a5a3e',
        eyeColor: '#ff6600',
        teethColor: '#ffffff',
        clawColor: '#5a4a2e',
        texture: 'ovi',
        hasCrest: true,
        isSwimming: false,
        isFlying: false
    },
    dromaeosaurus: {
        id: 'dromaeosaurus',
        name: 'Dromaeosaurus',
        nameBR: 'Dromaeossauro',
        tier: 3,
        type: 'carnivore',
        maxHealth: 450,
        maxStamina: 230,
        maxHunger: 500,
        maxThirst: 500,
        hungerRate: 0.2,
        thirstRate: 0.23,
        staminaRegenRate: 0.42,
        speed: 24,
        sprintSpeed: 36,
        attackDamage: 55,
        attackCooldown: 1.0,
        size: 0.55,
        realLength: 2,
        color: '#4a4a3e',
        bodyColor: '#5a5a4e',
        bellyColor: '#6a6a5e',
        textureColor: '#5a5a4e',
        tailColor: '#4a4a3e',
        headColor: '#5a5a4e',
        eyeColor: '#ffcc00',
        teethColor: '#ffffff',
        clawColor: '#4a4a3e',
        texture: 'dromo',
        isSwimming: false,
        isFlying: false
    },
    giganotosaurus: {
        id: 'giganotosaurus',
        name: 'Giganotosaurus',
        nameBR: 'Giganotossauro',
        tier: 5,
        type: 'carnivore',
        maxHealth: 1700,
        maxStamina: 320,
        maxHunger: 1000,
        maxThirst: 1000,
        hungerRate: 0.14,
        thirstRate: 0.18,
        staminaRegenRate: 0.3,
        speed: 18,
        sprintSpeed: 28,
        attackDamage: 110,
        attackCooldown: 1.6,
        size: 1.1,
        realLength: 13,
        color: '#2d1b0e',
        bodyColor: '#3d2b1e',
        bellyColor: '#5d4b3e',
        textureColor: '#4d3b2e',
        tailColor: '#2d1b0e',
        headColor: '#3d2b1e',
        eyeColor: '#ff4400',
        teethColor: '#ffffff',
        clawColor: '#1a0a00',
        texture: 'giga',
        isSwimming: false,
        isFlying: false
    },
    carcharodontosaurus: {
        id: 'carcharodontosaurus',
        name: 'Carcharodontosaurus',
        nameBR: 'Carcarodontossauro',
        tier: 5,
        type: 'carnivore',
        maxHealth: 1650,
        maxStamina: 310,
        maxHunger: 1000,
        maxThirst: 1000,
        hungerRate: 0.14,
        thirstRate: 0.18,
        staminaRegenRate: 0.35,
        speed: 19,
        sprintSpeed: 29,
        attackDamage: 105,
        attackCooldown: 1.5,
        size: 1.1,
        realLength: 12,
        color: '#3a3a2e',
        bodyColor: '#4a4a3e',
        bellyColor: '#5a5a4e',
        textureColor: '#4a4a3e',
        tailColor: '#3a3a2e',
        headColor: '#4a4a3e',
        eyeColor: '#ff4400',
        teethColor: '#ffffff',
        clawColor: '#2a2a1e',
        texture: 'carchar',
        isSwimming: false,
        isFlying: false
    },
    carnotaurus: {
        id: 'carnotaurus',
        name: 'Carnotaurus',
        nameBR: 'Carnotauro',
        tier: 3,
        type: 'carnivore',
        maxHealth: 500,
        maxStamina: 260,
        maxHunger: 550,
        maxThirst: 550,
        hungerRate: 0.18,
        thirstRate: 0.22,
        staminaRegenRate: 0.45,
        speed: 26,
        sprintSpeed: 38,
        attackDamage: 60,
        attackCooldown: 1.0,
        size: 0.65,
        realLength: 8,
        color: '#3a2a1e',
        bodyColor: '#4a3a2e',
        bellyColor: '#5a4a3e',
        textureColor: '#4a3a2e',
        tailColor: '#3a2a1e',
        headColor: '#4a3a2e',
        eyeColor: '#ff6600',
        teethColor: '#ffffff',
        clawColor: '#2a1a0e',
        texture: 'carno',
        hasHorns: true,
        isSwimming: false,
        isFlying: false
    },
    ceratosaurus: {
        id: 'ceratosaurus',
        name: 'Ceratosaurus',
        nameBR: 'Ceratossauro',
        tier: 3,
        type: 'carnivore',
        maxHealth: 520,
        maxStamina: 240,
        maxHunger: 520,
        maxThirst: 520,
        hungerRate: 0.18,
        thirstRate: 0.21,
        staminaRegenRate: 0.4,
        speed: 22,
        sprintSpeed: 34,
        attackDamage: 58,
        attackCooldown: 1.1,
        size: 0.6,
        realLength: 6,
        color: '#4a3a2e',
        bodyColor: '#5a4a3e',
        bellyColor: '#6a5a4e',
        textureColor: '#5a4a3e',
        tailColor: '#4a3a2e',
        headColor: '#5a4a3e',
        eyeColor: '#ffcc00',
        teethColor: '#ffffff',
        clawColor: '#3a2a1e',
        texture: 'cerato',
        hasHorns: true,
        isSwimming: false,
        isFlying: false
    },
    baryonyx: {
        id: 'baryonyx',
        name: 'Baryonyx',
        nameBR: 'Bariônix',
        tier: 3,
        type: 'carnivore',
        maxHealth: 550,
        maxStamina: 250,
        maxHunger: 600,
        maxThirst: 600,
        hungerRate: 0.16,
        thirstRate: 0.14,
        staminaRegenRate: 0.4,
        speed: 20,
        sprintSpeed: 30,
        attackDamage: 60,
        attackCooldown: 1.2,
        size: 0.65,
        realLength: 9,
        color: '#2a3a2e',
        bodyColor: '#3a4a3e',
        bellyColor: '#4a5a4e',
        textureColor: '#3a4a3e',
        tailColor: '#2a3a2e',
        headColor: '#3a4a3e',
        eyeColor: '#ffaa00',
        teethColor: '#ffffff',
        clawColor: '#2a3a2e',
        texture: 'baryo',
        isSwimming: true,
        isFlying: false
    },
    suchomimus: {
        id: 'suchomimus',
        name: 'Suchomimus',
        nameBR: 'Suchomimo',
        tier: 4,
        type: 'carnivore',
        maxHealth: 900,
        maxStamina: 280,
        maxHunger: 750,
        maxThirst: 750,
        hungerRate: 0.13,
        thirstRate: 0.12,
        staminaRegenRate: 0.35,
        speed: 18,
        sprintSpeed: 28,
        attackDamage: 75,
        attackCooldown: 1.3,
        size: 0.85,
        realLength: 11,
        color: '#3a4a2e',
        bodyColor: '#4a5a3e',
        bellyColor: '#5a6a4e',
        textureColor: '#4a5a3e',
        tailColor: '#3a4a2e',
        headColor: '#4a5a3e',
        eyeColor: '#ffaa00',
        teethColor: '#ffffff',
        clawColor: '#2a3a1e',
        texture: 'sucho',
        isSwimming: true,
        isFlying: false
    },
    megalosaurus: {
        id: 'megalosaurus',
        name: 'Megalosaurus',
        nameBR: 'Meglossauro',
        tier: 3,
        type: 'carnivore',
        maxHealth: 500,
        maxStamina: 230,
        maxHunger: 500,
        maxThirst: 500,
        hungerRate: 0.19,
        thirstRate: 0.22,
        staminaRegenRate: 0.38,
        speed: 21,
        sprintSpeed: 32,
        attackDamage: 55,
        attackCooldown: 1.2,
        size: 0.65,
        realLength: 9,
        color: '#3a3a2e',
        bodyColor: '#4a4a3e',
        bellyColor: '#5a5a4e',
        textureColor: '#4a4a3e',
        tailColor: '#3a3a2e',
        headColor: '#4a4a3e',
        eyeColor: '#ffcc00',
        teethColor: '#ffffff',
        clawColor: '#2a2a1e',
        texture: 'mega',
        isSwimming: false,
        isFlying: false
    },
    abelisaurus: {
        id: 'abelisaurus',
        name: 'Abelisaurus',
        nameBR: 'Abelissauro',
        tier: 3,
        type: 'carnivore',
        maxHealth: 480,
        maxStamina: 240,
        maxHunger: 500,
        maxThirst: 500,
        hungerRate: 0.19,
        thirstRate: 0.22,
        staminaRegenRate: 0.4,
        speed: 22,
        sprintSpeed: 34,
        attackDamage: 55,
        attackCooldown: 1.1,
        size: 0.65,
        realLength: 9,
        color: '#4a3a2e',
        bodyColor: '#5a4a3e',
        bellyColor: '#6a5a4e',
        textureColor: '#5a4a3e',
        tailColor: '#4a3a2e',
        headColor: '#5a4a3e',
        eyeColor: '#ff6600',
        teethColor: '#ffffff',
        clawColor: '#3a2a1e',
        texture: 'abeli',
        isSwimming: false,
        isFlying: false
    },
    herrerasaurus: {
        id: 'herrerasaurus',
        name: 'Herrerasaurus',
        nameBR: 'Hererassauro',
        tier: 2,
        type: 'carnivore',
        maxHealth: 320,
        maxStamina: 200,
        maxHunger: 400,
        maxThirst: 400,
        hungerRate: 0.22,
        thirstRate: 0.26,
        staminaRegenRate: 0.45,
        speed: 24,
        sprintSpeed: 36,
        attackDamage: 45,
        attackCooldown: 0.9,
        size: 0.5,
        realLength: 5,
        color: '#4a4a3e',
        bodyColor: '#5a5a4e',
        bellyColor: '#6a6a5e',
        textureColor: '#5a5a4e',
        tailColor: '#4a4a3e',
        headColor: '#5a5a4e',
        eyeColor: '#ff6600',
        teethColor: '#ffffff',
        clawColor: '#3a3a2e',
        texture: 'herrera',
        isSwimming: false,
        isFlying: false
    },
    coelophysis: {
        id: 'coelophysis',
        name: 'Coelophysis',
        nameBR: 'Celófise',
        tier: 1,
        type: 'carnivore',
        maxHealth: 160,
        maxStamina: 160,
        maxHunger: 300,
        maxThirst: 300,
        hungerRate: 0.28,
        thirstRate: 0.3,
        staminaRegenRate: 0.55,
        speed: 28,
        sprintSpeed: 40,
        attackDamage: 28,
        attackCooldown: 0.6,
        size: 0.35,
        realLength: 3,
        color: '#5a4a3e',
        bodyColor: '#6a5a4e',
        bellyColor: '#7a6a5e',
        textureColor: '#6a5a4e',
        tailColor: '#5a4a3e',
        headColor: '#6a5a4e',
        eyeColor: '#ff4400',
        teethColor: '#ffffff',
        clawColor: '#4a3a2e',
        texture: 'coelo',
        isSwimming: false,
        isFlying: false
    },
    utahraptor: {
        id: 'utahraptor',
        name: 'Utahraptor',
        nameBR: 'Utarraptor',
        tier: 3,
        type: 'carnivore',
        maxHealth: 500,
        maxStamina: 240,
        maxHunger: 520,
        maxThirst: 520,
        hungerRate: 0.19,
        thirstRate: 0.22,
        staminaRegenRate: 0.4,
        speed: 25,
        sprintSpeed: 37,
        attackDamage: 60,
        attackCooldown: 1.0,
        size: 0.6,
        realLength: 6,
        color: '#4a3a2e',
        bodyColor: '#5a4a3e',
        bellyColor: '#6a5a4e',
        textureColor: '#5a4a3e',
        tailColor: '#4a3a2e',
        headColor: '#5a4a3e',
        eyeColor: '#ffcc00',
        teethColor: '#ffffff',
        clawColor: '#3a2a1e',
        texture: 'utah',
        isSwimming: false,
        isFlying: false
    },
    microraptor: {
        id: 'microraptor',
        name: 'Microraptor',
        nameBR: 'Microraptor',
        tier: 1,
        type: 'carnivore',
        maxHealth: 120,
        maxStamina: 140,
        maxHunger: 250,
        maxThirst: 250,
        hungerRate: 0.3,
        thirstRate: 0.3,
        staminaRegenRate: 0.6,
        speed: 0,
        flightSpeed: 30,
        attackDamage: 20,
        attackCooldown: 0.5,
        size: 0.25,
        realLength: 0.8,
        color: '#2a2a3e',
        bodyColor: '#3a3a4e',
        bellyColor: '#4a4a5e',
        textureColor: '#3a3a4e',
        tailColor: '#2a2a3e',
        headColor: '#3a3a4e',
        eyeColor: '#ff6600',
        teethColor: '#ffffff',
        clawColor: '#2a2a3e',
        wingColor: '#3a3a4e',
        texture: 'micro',
        isSwimming: false,
        isFlying: true
    },
    diplodocus: {
        id: 'diplodocus',
        name: 'Diplodocus',
        nameBR: 'Diplodoco',
        tier: 5,
        type: 'herbivore',
        maxHealth: 2100,
        maxStamina: 400,
        maxHunger: 1200,
        maxThirst: 1200,
        hungerRate: 0.07,
        thirstRate: 0.11,
        staminaRegenRate: 0.28,
        speed: 14,
        sprintSpeed: 22,
        attackDamage: 0,
        attackCooldown: 0,
        size: 1.3,
        realLength: 25,
        color: '#3a4a3e',
        bodyColor: '#4a5a4e',
        bellyColor: '#5a6a5e',
        textureColor: '#4a5a4e',
        tailColor: '#3a4a3e',
        headColor: '#4a5a4e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#3a4a3e',
        texture: 'diplo',
        isSwimming: true,
        isFlying: false
    },
    brontosaurus: {
        id: 'brontosaurus',
        name: 'Brontosaurus',
        nameBR: 'Brontossauro',
        tier: 5,
        type: 'herbivore',
        maxHealth: 2200,
        maxStamina: 420,
        maxHunger: 1250,
        maxThirst: 1250,
        hungerRate: 0.065,
        thirstRate: 0.1,
        staminaRegenRate: 0.25,
        speed: 13,
        sprintSpeed: 21,
        attackDamage: 0,
        attackCooldown: 0,
        size: 1.25,
        realLength: 22,
        color: '#4a5a3e',
        bodyColor: '#5a6a4e',
        bellyColor: '#6a7a5e',
        textureColor: '#5a6a4e',
        tailColor: '#4a5a3e',
        headColor: '#5a6a4e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#4a5a3e',
        texture: 'bronto',
        isSwimming: true,
        isFlying: false
    },
    protoceratops: {
        id: 'protoceratops',
        name: 'Protoceratops',
        nameBR: 'Protoceratops',
        tier: 1,
        type: 'herbivore',
        maxHealth: 200,
        maxStamina: 160,
        maxHunger: 350,
        maxThirst: 350,
        hungerRate: 0.25,
        thirstRate: 0.28,
        staminaRegenRate: 0.45,
        speed: 18,
        sprintSpeed: 28,
        attackDamage: 20,
        attackCooldown: 1.2,
        size: 0.3,
        realLength: 2,
        color: '#5a4a3e',
        bodyColor: '#6a5a4e',
        bellyColor: '#7a6a5e',
        textureColor: '#6a5a4e',
        tailColor: '#5a4a3e',
        headColor: '#6a5a4e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#5a4a3e',
        texture: 'proto',
        hasHorns: true,
        hasFrill: true,
        isSwimming: false,
        isFlying: false
    },
    styracosaurus: {
        id: 'styracosaurus',
        name: 'Styracosaurus',
        nameBR: 'Estiracossauro',
        tier: 3,
        type: 'herbivore',
        maxHealth: 700,
        maxStamina: 280,
        maxHunger: 650,
        maxThirst: 650,
        hungerRate: 0.13,
        thirstRate: 0.17,
        staminaRegenRate: 0.34,
        speed: 16,
        sprintSpeed: 24,
        attackDamage: 50,
        attackCooldown: 1.6,
        size: 0.6,
        realLength: 5.5,
        color: '#4a3a2e',
        bodyColor: '#5a4a3e',
        bellyColor: '#6a5a4e',
        textureColor: '#5a4a3e',
        tailColor: '#4a3a2e',
        headColor: '#5a4a3e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#4a3a2e',
        texture: 'styra',
        hasHorns: true,
        hasFrill: true,
        isSwimming: false,
        isFlying: false
    },
    pachyrhinosaurus: {
        id: 'pachyrhinosaurus',
        name: 'Pachyrhinosaurus',
        nameBR: 'Paquirrinossauro',
        tier: 3,
        type: 'herbivore',
        maxHealth: 750,
        maxStamina: 290,
        maxHunger: 700,
        maxThirst: 700,
        hungerRate: 0.12,
        thirstRate: 0.16,
        staminaRegenRate: 0.33,
        speed: 15,
        sprintSpeed: 23,
        attackDamage: 55,
        attackCooldown: 1.8,
        size: 0.65,
        realLength: 6,
        color: '#3a4a2e',
        bodyColor: '#4a5a3e',
        bellyColor: '#5a6a4e',
        textureColor: '#4a5a3e',
        tailColor: '#3a4a2e',
        headColor: '#4a5a3e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#3a4a2e',
        texture: 'pachy',
        hasHorns: true,
        hasFrill: true,
        isSwimming: false,
        isFlying: false
    },
    corythosaurus: {
        id: 'corythosaurus',
        name: 'Corythosaurus',
        nameBR: 'Coritossauro',
        tier: 3,
        type: 'herbivore',
        maxHealth: 650,
        maxStamina: 260,
        maxHunger: 580,
        maxThirst: 580,
        hungerRate: 0.13,
        thirstRate: 0.17,
        staminaRegenRate: 0.36,
        speed: 17,
        sprintSpeed: 26,
        attackDamage: 0,
        attackCooldown: 0,
        size: 0.65,
        realLength: 9,
        color: '#4a5a3e',
        bodyColor: '#5a6a4e',
        bellyColor: '#6a7a5e',
        textureColor: '#5a6a4e',
        tailColor: '#4a5a3e',
        headColor: '#5a6a4e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#4a5a3e',
        texture: 'corytho',
        hasCrest: true,
        isSwimming: false,
        isFlying: false
    },
    lambeosaurus: {
        id: 'lambeosaurus',
        name: 'Lambeosaurus',
        nameBR: 'Lambeossauro',
        tier: 3,
        type: 'herbivore',
        maxHealth: 650,
        maxStamina: 260,
        maxHunger: 580,
        maxThirst: 580,
        hungerRate: 0.13,
        thirstRate: 0.17,
        staminaRegenRate: 0.36,
        speed: 17,
        sprintSpeed: 26,
        attackDamage: 0,
        attackCooldown: 0,
        size: 0.65,
        realLength: 9,
        color: '#3a5a4e',
        bodyColor: '#4a6a5e',
        bellyColor: '#5a7a6e',
        textureColor: '#4a6a5e',
        tailColor: '#3a5a4e',
        headColor: '#4a6a5e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#3a5a4e',
        texture: 'lambeo',
        hasCrest: true,
        isSwimming: false,
        isFlying: false
    },
    tenontosaurus: {
        id: 'tenontosaurus',
        name: 'Tenontosaurus',
        nameBR: 'Tenontossauro',
        tier: 2,
        type: 'herbivore',
        maxHealth: 400,
        maxStamina: 210,
        maxHunger: 480,
        maxThirst: 480,
        hungerRate: 0.17,
        thirstRate: 0.21,
        staminaRegenRate: 0.4,
        speed: 19,
        sprintSpeed: 29,
        attackDamage: 30,
        attackCooldown: 1.5,
        size: 0.5,
        realLength: 7,
        color: '#4a5a2e',
        bodyColor: '#5a6a3e',
        bellyColor: '#6a7a4e',
        textureColor: '#5a6a3e',
        tailColor: '#4a5a2e',
        headColor: '#5a6a3e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#4a5a2e',
        texture: 'tenonto',
        isSwimming: false,
        isFlying: false
    },
    dryosaurus: {
        id: 'dryosaurus',
        name: 'Dryosaurus',
        nameBR: 'Dryossauro',
        tier: 1,
        type: 'herbivore',
        maxHealth: 180,
        maxStamina: 170,
        maxHunger: 320,
        maxThirst: 320,
        hungerRate: 0.26,
        thirstRate: 0.28,
        staminaRegenRate: 0.5,
        speed: 26,
        sprintSpeed: 38,
        attackDamage: 0,
        attackCooldown: 0,
        size: 0.3,
        realLength: 3,
        color: '#5a5a3e',
        bodyColor: '#6a6a4e',
        bellyColor: '#7a7a5e',
        textureColor: '#6a6a4e',
        tailColor: '#5a5a3e',
        headColor: '#6a6a4e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#5a5a3e',
        texture: 'dryo',
        isSwimming: false,
        isFlying: false
    },
    gallimimus: {
        id: 'gallimimus',
        name: 'Gallimimus',
        nameBR: 'Galimimo',
        tier: 2,
        type: 'herbivore',
        maxHealth: 350,
        maxStamina: 220,
        maxHunger: 450,
        maxThirst: 450,
        hungerRate: 0.18,
        thirstRate: 0.22,
        staminaRegenRate: 0.5,
        speed: 30,
        sprintSpeed: 44,
        attackDamage: 0,
        attackCooldown: 0,
        size: 0.4,
        realLength: 6,
        color: '#5a4a2e',
        bodyColor: '#6a5a3e',
        bellyColor: '#7a6a4e',
        textureColor: '#6a5a3e',
        tailColor: '#5a4a2e',
        headColor: '#6a5a3e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#5a4a2e',
        texture: 'galli',
        isSwimming: false,
        isFlying: false
    },
    therizinosaurus: {
        id: 'therizinosaurus',
        name: 'Therizinosaurus',
        nameBR: 'Terizinosauro',
        tier: 4,
        type: 'herbivore',
        maxHealth: 1000,
        maxStamina: 320,
        maxHunger: 850,
        maxThirst: 850,
        hungerRate: 0.1,
        thirstRate: 0.14,
        staminaRegenRate: 0.3,
        speed: 16,
        sprintSpeed: 24,
        attackDamage: 80,
        attackCooldown: 2.0,
        size: 0.9,
        realLength: 10,
        color: '#4a3a2e',
        bodyColor: '#5a4a3e',
        bellyColor: '#6a5a4e',
        textureColor: '#5a4a3e',
        tailColor: '#4a3a2e',
        headColor: '#5a4a3e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#3a2a1e',
        texture: 'theri',
        hasClaws: true,
        isSwimming: false,
        isFlying: false
    },
    amargasaurus: {
        id: 'amargasaurus',
        name: 'Amargasaurus',
        nameBR: 'Amargassauro',
        tier: 4,
        type: 'herbivore',
        maxHealth: 1400,
        maxStamina: 350,
        maxHunger: 950,
        maxThirst: 950,
        hungerRate: 0.08,
        thirstRate: 0.12,
        staminaRegenRate: 0.3,
        speed: 14,
        sprintSpeed: 22,
        attackDamage: 0,
        attackCooldown: 0,
        size: 1.0,
        realLength: 10,
        color: '#3a5a3e',
        bodyColor: '#4a6a4e',
        bellyColor: '#5a7a5e',
        textureColor: '#4a6a4e',
        tailColor: '#3a5a3e',
        headColor: '#4a6a4e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#3a5a3e',
        texture: 'amarga',
        hasSpines: true,
        isSwimming: true,
        isFlying: false
    },
    kentrosaurus: {
        id: 'kentrosaurus',
        name: 'Kentrosaurus',
        nameBR: 'Kentrossauro',
        tier: 3,
        type: 'herbivore',
        maxHealth: 650,
        maxStamina: 270,
        maxHunger: 650,
        maxThirst: 650,
        hungerRate: 0.13,
        thirstRate: 0.17,
        staminaRegenRate: 0.34,
        speed: 15,
        sprintSpeed: 23,
        attackDamage: 55,
        attackCooldown: 1.8,
        size: 0.6,
        realLength: 5,
        color: '#3a4a2e',
        bodyColor: '#4a5a3e',
        bellyColor: '#5a6a4e',
        textureColor: '#4a5a3e',
        tailColor: '#3a4a2e',
        headColor: '#4a5a3e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#3a4a2e',
        texture: 'kentro',
        hasPlates: true,
        tailAttack: true,
        isSwimming: false,
        isFlying: false
    },
    euoplocephalus: {
        id: 'euoplocephalus',
        name: 'Euoplocephalus',
        nameBR: 'Euoplocéfalo',
        tier: 4,
        type: 'herbivore',
        maxHealth: 1300,
        maxStamina: 310,
        maxHunger: 850,
        maxThirst: 850,
        hungerRate: 0.09,
        thirstRate: 0.13,
        staminaRegenRate: 0.3,
        speed: 12,
        sprintSpeed: 19,
        attackDamage: 75,
        attackCooldown: 2.2,
        size: 0.8,
        realLength: 6,
        color: '#3a3a2e',
        bodyColor: '#4a4a3e',
        bellyColor: '#5a5a4e',
        textureColor: '#4a4a3e',
        tailColor: '#3a3a2e',
        headColor: '#4a4a3e',
        eyeColor: '#006600',
        teethColor: '#ffffff',
        clawColor: '#3a3a2e',
        texture: 'euoplo',
        hasArmor: true,
        tailClubAttack: true,
        isSwimming: false,
        isFlying: false
    },
    quetzalcoatlus: {
        id: 'quetzalcoatlus',
        name: 'Quetzalcoatlus',
        nameBR: 'Quetzalcóatlus',
        tier: 5,
        type: 'carnivore',
        maxHealth: 1200,
        maxStamina: 400,
        maxHunger: 900,
        maxThirst: 900,
        hungerRate: 0.12,
        thirstRate: 0.16,
        staminaRegenRate: 0.5,
        speed: 0,
        flightSpeed: 55,
        attackDamage: 80,
        attackCooldown: 1.2,
        size: 0.9,
        realLength: 5,
        color: '#2a1a0e',
        bodyColor: '#3a2a1e',
        bellyColor: '#4a3a2e',
        textureColor: '#3a2a1e',
        tailColor: '#2a1a0e',
        headColor: '#3a2a1e',
        eyeColor: '#ffcc00',
        teethColor: '#ffffff',
        clawColor: '#2a1a0e',
        wingColor: '#3a2a1e',
        texture: 'quetz',
        isSwimming: false,
        isFlying: true
    },
    tapejara: {
        id: 'tapejara',
        name: 'Tapejara',
        nameBR: 'Tapejara',
        tier: 2,
        type: 'carnivore',
        maxHealth: 280,
        maxStamina: 200,
        maxHunger: 380,
        maxThirst: 380,
        hungerRate: 0.24,
        thirstRate: 0.26,
        staminaRegenRate: 0.55,
        speed: 0,
        flightSpeed: 38,
        attackDamage: 38,
        attackCooldown: 0.8,
        size: 0.35,
        realLength: 1.5,
        color: '#3a3a2e',
        bodyColor: '#4a4a3e',
        bellyColor: '#5a5a4e',
        textureColor: '#4a4a3e',
        tailColor: '#3a3a2e',
        headColor: '#4a4a3e',
        eyeColor: '#ff6600',
        teethColor: '#ffffff',
        clawColor: '#3a3a2e',
        wingColor: '#4a4a3e',
        texture: 'tape',
        isSwimming: false,
        isFlying: true
    },
    dimorphodon: {
        id: 'dimorphodon',
        name: 'Dimorphodon',
        nameBR: 'Dimorfodonte',
        tier: 1,
        type: 'carnivore',
        maxHealth: 150,
        maxStamina: 150,
        maxHunger: 280,
        maxThirst: 280,
        hungerRate: 0.3,
        thirstRate: 0.3,
        staminaRegenRate: 0.6,
        speed: 0,
        flightSpeed: 32,
        attackDamage: 22,
        attackCooldown: 0.6,
        size: 0.3,
        realLength: 1,
        color: '#4a3a2e',
        bodyColor: '#5a4a3e',
        bellyColor: '#6a5a4e',
        textureColor: '#5a4a3e',
        tailColor: '#4a3a2e',
        headColor: '#5a4a3e',
        eyeColor: '#ff4400',
        teethColor: '#ffffff',
        clawColor: '#4a3a2e',
        wingColor: '#5a4a3e',
        texture: 'dimorph',
        isSwimming: false,
        isFlying: true
    },
    tylosaurus: {
        id: 'tylosaurus',
        name: 'Tylosaurus',
        nameBR: 'Tilossauro',
        tier: 5,
        type: 'carnivore',
        maxHealth: 1600,
        maxStamina: 360,
        maxHunger: 1100,
        maxThirst: 1100,
        hungerRate: 0.1,
        thirstRate: 0.08,
        staminaRegenRate: 0.4,
        speed: 14,
        sprintSpeed: 22,
        attackDamage: 90,
        attackCooldown: 1.5,
        size: 1.0,
        realLength: 12,
        color: '#1a2a3e',
        bodyColor: '#2a3a4e',
        bellyColor: '#3a4a5e',
        textureColor: '#2a3a4e',
        tailColor: '#1a2a3e',
        headColor: '#2a3a4e',
        eyeColor: '#ff4400',
        teethColor: '#ffffff',
        clawColor: '#1a2a3e',
        texture: 'tylo',
        isSwimming: true,
        isFlying: false
    },
    ichthyosaurus: {
        id: 'ichthyosaurus',
        name: 'Ichthyosaurus',
        nameBR: 'Ictiossauro',
        tier: 2,
        type: 'carnivore',
        maxHealth: 300,
        maxStamina: 200,
        maxHunger: 400,
        maxThirst: 400,
        hungerRate: 0.2,
        thirstRate: 0.18,
        staminaRegenRate: 0.5,
        speed: 22,
        sprintSpeed: 32,
        attackDamage: 40,
        attackCooldown: 0.8,
        size: 0.4,
        realLength: 3,
        color: '#3a4a5e',
        bodyColor: '#4a5a6e',
        bellyColor: '#5a6a7e',
        textureColor: '#4a5a6e',
        tailColor: '#3a4a5e',
        headColor: '#4a5a6e',
        eyeColor: '#ff6600',
        teethColor: '#ffffff',
        clawColor: '#3a4a5e',
        texture: 'ichthy',
        isSwimming: true,
        isFlying: false
    },
    megalodon: {
        id: 'megalodon',
        name: 'Megalodon',
        nameBR: 'Megalodonte',
        tier: 5,
        type: 'carnivore',
        maxHealth: 2000,
        maxStamina: 400,
        maxHunger: 1200,
        maxThirst: 1200,
        hungerRate: 0.09,
        thirstRate: 0.07,
        staminaRegenRate: 0.35,
        speed: 16,
        sprintSpeed: 26,
        attackDamage: 130,
        attackCooldown: 1.8,
        size: 1.2,
        realLength: 18,
        color: '#1a2a3e',
        bodyColor: '#2a3a4e',
        bellyColor: '#3a4a5e',
        textureColor: '#2a3a4e',
        tailColor: '#1a2a3e',
        headColor: '#2a3a4e',
        eyeColor: '#ff4400',
        teethColor: '#ffffff',
        clawColor: '#1a2a3e',
        texture: 'megalodon',
        isSwimming: true,
        isFlying: false
    },
    liopleurodon: {
        id: 'liopleurodon',
        name: 'Liopleurodon',
        nameBR: 'Liopleurodonte',
        tier: 4,
        type: 'carnivore',
        maxHealth: 1100,
        maxStamina: 320,
        maxHunger: 850,
        maxThirst: 850,
        hungerRate: 0.12,
        thirstRate: 0.1,
        staminaRegenRate: 0.4,
        speed: 12,
        sprintSpeed: 20,
        attackDamage: 75,
        attackCooldown: 1.3,
        size: 0.9,
        realLength: 7,
        color: '#2a3a4e',
        bodyColor: '#3a4a5e',
        bellyColor: '#4a5a6e',
        textureColor: '#3a4a5e',
        tailColor: '#2a3a4e',
        headColor: '#3a4a5e',
        eyeColor: '#ffaa00',
        teethColor: '#ffffff',
        clawColor: '#2a3a4e',
        texture: 'liopleuro',
        isSwimming: true,
        isFlying: false
    }
};

// Player class
// Initialize database
initDatabase();

class Player {
    constructor(id, name, dinosaurId) {
        this.id = id;
        this.name = name;
        this.dinosaurId = dinosaurId;
        this.position = { x: Math.random() * mapSize - mapSize/2, y: 0, z: Math.random() * mapSize - mapSize/2 };
        this.rotation = 0;
        this.health = DINOSAURS[dinosaurId].maxHealth;
        this.stamina = DINOSAURS[dinosaurId].maxStamina;
        this.hunger = DINOSAURS[dinosaurId].maxHunger;
        this.thirst = DINOSAURS[dinosaurId].maxThirst;
        this.isSprinting = false;
        this.isSwimming = false;
        this.isFlying = false;
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.isDead = false;
        this.isRiding = false;
        this.riddenBy = null;
        this.rideTarget = null;
        this.speed = 0;
        this.sprintMultiplier = 1.5;
        this.swimMultiplier = 0.4;
        this.flightMultiplier = 1.0;
        this.carrying = null;
        this.carryingAmount = 0;
        this.maxCarry = 5;
        this.isEating = false;
        this.eatingTimer = 0;
        this.isHiding = false;
        this.isRunningAway = false;
        this.terrainHeight = 0;
    }
}

// Food item class
class FoodItem {
    constructor(id, type, position) {
        this.id = id;
        this.type = type; // 'meat', 'berry', 'fish', 'insect'
        this.position = position;
        this.amount = type === 'meat' ? 50 : 30;
        this.isEaten = false;
        this.spawnTime = Date.now();
        this.despawnTime = 600000; // 10 minutes
    }
}

// Water source class
class WaterSource {
    constructor(id, position) {
        this.id = id;
        this.position = position;
        this.radius = 10;
    }
}

// Generate food
function generateFood() {
    for (let i = 0; i < 200; i++) {
        const type = Math.random() < 0.6 ? 'berry' : (Math.random() < 0.5 ? 'insect' : 'meat');
        const foodId = `food_${i}`;
        const x = Math.random() * mapSize - mapSize/2;
        const z = Math.random() * mapSize - mapSize/2;
        const food = new FoodItem(foodId, type, { x, y: 0, z });
        foodSpawns.set(foodId, food);
    }
    for (let i = 0; i < 50; i++) {
        const waterId = `water_${i}`;
        const x = Math.random() * mapSize - mapSize/2;
        const z = Math.random() * mapSize - mapSize/2;
        const water = new WaterSource(waterId, { x, y: 0, z });
        waterSpawns.set(waterId, water);
    }
}

// Generate dinosaurs
function generateDinosaurs() {
    const tiers = [1, 2, 3, 4, 5];
    const tierWeights = [40, 30, 20, 8, 2];
    const totalWeight = tierWeights.reduce((a, b) => a + b);

    for (let i = 0; i < 100; i++) {
        let r = Math.random() * totalWeight;
        let tier = tiers[0];
        for (let j = 0; j < tierWeights.length; j++) {
            r -= tierWeights[j];
            if (r <= 0) { tier = tiers[j]; break; }
        }

        const tierDinos = Object.values(DINOSAURS).filter(d => d.tier === tier);
        const dinosaurId = tierDinos[Math.floor(Math.random() * tierDinos.length)].id;

        const dinosaur = new Player(`npc_${i}`, `Dino_${i}`, dinosaurId);
        dinosaur.position = {
            x: Math.random() * mapSize - mapSize/2,
            y: 0,
            z: Math.random() * mapSize - mapSize/2
        };
        dinosaur.health = dinosaur.maxHealth * (0.7 + Math.random() * 0.3);
        dinosaur.stamina = dinosaur.maxStamina * (0.7 + Math.random() * 0.3);
        dinosaur.hunger = dinosaur.maxHunger * (0.3 + Math.random() * 0.7);
        dinosaur.thirst = dinosaur.maxThirst * (0.3 + Math.random() * 0.7);
        dinosaur.isDead = false;
        dinosaur.ai = {
            target: null,
            state: 'idle', // 'idle', 'wander', 'hunt', 'flee', 'eat', 'drink'
            wanderTimer: 0,
            huntTimer: 0,
            fleeTimer: 0,
            eatTimer: 0,
            drinkTimer: 0,
            path: [],
            pathIndex: 0,
            nearestPrey: null,
            nearestThreat: null,
            nearestFood: null,
            nearestWater: null
        };
        dinosaurs.set(`npc_${i}`, dinosaur);
    }
}

// Initialize game
generateFood();
generateDinosaurs();

// WebSocket handling
wss.on('connection', (ws, req) => {
    console.log('Client connected');

    const wsUrl = new URL(req.url || 'ws://localhost', 'http://localhost');
    const token = wsUrl.searchParams.get('token');
    const userData = token ? verifyToken(token) : null;

    if (!userData) {
        ws.send(JSON.stringify({ type: 'error', message: 'Token de autenticacao invalido ou expirado' }));
        ws.close();
        return;
    }

    console.log('Authenticated user:', userData.username);
    ws.userData = userData;
    const playerId = `player_${userData.userId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'join') {
                const dinosaurId = data.dinosaurId || 'compsognathus';
                const name = data.name || 'Player';

                // Check population quota
                const cap = getSpeciesCap(dinosaurId);
                const current = getCurrentCount(dinosaurId);
                if (current >= cap) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: `Limite de ${DINOSAURS[dinosaurId]?.name || dinosaurId} atingido (${cap}/${cap}). Tente outra especie.`
                    }));
                    return;
                }

                const player = new Player(playerId, name, dinosaurId);
                players.set(playerId, player);

                ws.send(JSON.stringify({
                    type: 'joined',
                    playerId: playerId,
                    position: player.position,
                    rotation: player.rotation,
                    dinosaur: DINOSAURS[dinosaurId],
                    dinosaurs: DINOSAURS
                }));

                // Send all existing players and dinosaurs
                ws.send(JSON.stringify({
                    type: 'world_state',
                    players: Array.from(players.values()).map(p => ({
                        id: p.id,
                        name: p.name,
                        dinosaurId: p.dinosaurId,
                        position: p.position,
                        rotation: p.rotation,
                        health: p.health,
                        stamina: p.stamina,
                        hunger: p.hunger,
                        thirst: p.thirst,
                        isSprinting: p.isSprinting,
                        isDead: p.isDead,
                        isAttacking: p.isAttacking,
                        isRiding: p.isRiding
                    })),
                    dinosaurs: Array.from(dinosaurs.values()).map(d => ({
                        id: d.id,
                        name: d.name,
                        dinosaurId: d.dinosaurId,
                        position: d.position,
                        rotation: d.rotation,
                        health: d.health,
                        stamina: d.stamina,
                        hunger: d.hunger,
                        thirst: d.thirst,
                        isSprinting: d.isSprinting,
                        isDead: d.isDead,
                        isAttacking: d.isAttacking,
                        isRiding: d.isRiding
                    })),
                    food: Array.from(foodSpawns.values()).filter(f => !f.isEaten).map(f => ({
                        id: f.id,
                        type: f.type,
                        position: f.position
                    })),
                    water: Array.from(waterSpawns.values()).map(w => ({
                        id: w.id,
                        position: w.position
                    }))
                }));
            }

            if (data.type === 'move') {
                const player = players.get(playerId);
                if (!player || player.isDead) return;

                player.rotation = data.rotation;
                player.isSprinting = data.isSprinting;

                const dino = DINOSAURS[player.dinosaurId];
                const speed = data.isSprinting ? dino.sprintSpeed : dino.speed;
                const movementSpeed = (data.isFlying ? dino.flightSpeed : speed) * 0.01;

                player.position.x += Math.sin(data.rotation * Math.PI / 180) * movementSpeed;
                player.position.z += Math.cos(data.rotation * Math.PI / 180) * movementSpeed;

                // Map boundaries
                const halfMap = mapSize / 2;
                if (data.isFlying) {
                    player.position.x = Math.max(-halfMap, Math.min(halfMap, player.position.x));
                    player.position.z = Math.max(-halfMap, Math.min(halfMap, player.position.z));
                }
            }

            if (data.type === 'attack') {
                const player = players.get(playerId);
                if (!player || player.isDead || player.isAttacking || player.attackCooldown > 0) return;

                player.isAttacking = true;
                player.attackCooldown = DINOSAURS[player.dinosaurId].attackCooldown;

                // Find target
                let target = null;
                let minDist = 5; // Attack range

                players.forEach((p, pid) => {
                    if (pid === playerId) return;
                    if (p.isDead) return;
                    const dist = Math.sqrt(
                        Math.pow(p.position.x - player.position.x, 2) +
                        Math.pow(p.position.z - player.position.z, 2)
                    );
                    if (dist < minDist && p.dinosaurId !== player.dinosaurId) {
                        minDist = dist;
                        target = { id: pid, player: p };
                    }
                });

                if (target) {
                    // Deal damage
                    const damage = DINOSAURS[player.dinosaurId].attackDamage;
                    target.player.health -= damage;
                    if (target.player.health <= 0) {
                        target.player.isDead = true;
                        // Drop food
                        const meatId = `meat_${Date.now()}`;
                        const food = new FoodItem(meatId, 'meat', {
                            x: target.player.position.x,
                            y: 0,
                            z: target.player.position.z
                        });
                        food.amount = 100;
                        foodSpawns.set(meatId, food);
                    }
                }

                setTimeout(() => {
                    player.isAttacking = false;
                }, DINOSAURS[player.dinosaurId].attackCooldown * 1000);
            }

            if (data.type === 'interact') {
                const player = players.get(playerId);
                if (!player || player.isDead) return;

                if (data.action === 'eat') {
                    // Find nearby food
                    let nearestFood = null;
                    let minDist = 3;

                    foodSpawns.forEach((food, foodId) => {
                        if (food.isEaten) return;
                        const dist = Math.sqrt(
                            Math.pow(food.position.x - player.position.x, 2) +
                            Math.pow(food.position.z - player.position.z, 2)
                        );
                        if (dist < minDist) {
                            minDist = dist;
                            nearestFood = { id: foodId, food: food };
                        }
                    });

                    if (nearestFood) {
                        const food = nearestFood.food;
                        const dino = DINOSAURS[player.dinosaurId];

                        // Check if carnivore can eat herbivore food
                        if (dino.type === 'carnivore' && food.type === 'berry') {
                            return; // Carnivores can't eat berries
                        }

                        player.isEating = true;
                        player.eatingTimer = 2; // 2 seconds to eat

                        setTimeout(() => {
                            player.isEating = false;
                            player.eatingTimer = 0;
                            food.isEaten = true;

                            if (food.type === 'meat') {
                                player.hunger = Math.min(player.hunger + food.amount, dino.maxHunger);
                                player.health = Math.min(player.health + 20, dino.maxHealth);
                            } else if (food.type === 'berry') {
                                player.hunger = Math.min(player.hunger + food.amount, dino.maxHunger);
                            } else if (food.type === 'fish') {
                                player.hunger = Math.min(player.hunger + food.amount, dino.maxHunger);
                                player.thirst = Math.min(player.thirst + food.amount, dino.maxThirst);
                            } else if (food.type === 'insect') {
                                player.hunger = Math.min(player.hunger + food.amount * 2, dino.maxHunger);
                            }
                        }, 2000);
                    }
                }

                if (data.action === 'drink') {
                    // Find nearby water
                    let nearestWater = null;
                    let minDist = 5;

                    waterSpawns.forEach((water, waterId) => {
                        const dist = Math.sqrt(
                            Math.pow(water.position.x - player.position.x, 2) +
                            Math.pow(water.position.z - player.position.z, 2)
                        );
                        if (dist < minDist) {
                            minDist = dist;
                            nearestWater = water;
                        }
                    });

                    if (nearestWater) {
                        const dino = DINOSAURS[player.dinosaurId];
                        player.thirst = Math.min(player.thirst + 20, dino.maxThirst);
                    }
                }

                if (data.action === 'ride') {
                    // Find dinosaur to ride
                    let nearestDino = null;
                    let minDist = 5;

                    dinosaurs.forEach((dino, dinoId) => {
                        if (dinoId === playerId) return;
                        if (dino.isDead) return;
                        const dist = Math.sqrt(
                            Math.pow(dino.position.x - player.position.x, 2) +
                            Math.pow(dino.position.z - player.position.z, 2)
                        );
                        if (dist < minDist && dino.tier < 3) {
                            minDist = dist;
                            nearestDino = { id: dinoId, dino: dino };
                        }
                    });

                    if (nearestDino) {
                        player.isRiding = true;
                        player.riddenBy = playerId;
                        player.rideTarget = nearestDino.id;
                    }
                }
            }
        } catch (e) {
            console.error('Error handling message:', e);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        players.delete(playerId);
        dinosaurs.delete(playerId);

        // Broadcast removal
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === 1) {
                client.send(JSON.stringify({
                    type: 'player_removed',
                    playerId: playerId
                }));
            }
        });
    });
});

// Weather broadcast every 30 seconds
setInterval(() => {
    weatherSystem.update();
    const weatherData = weatherSystem.getWeatherData();
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(weatherData));
        }
    });
}, 30000);

// Game loop - update everything
setInterval(() => {
    const now = Date.now();

    // Update all players
    players.forEach((player, playerId) => {
        if (player.isDead) return;

        const dino = DINOSAURS[player.dinosaurId];

        // Hunger
        player.hunger -= dino.hungerRate;
        if (player.hunger <= 0) {
            player.hunger = 0;
            player.health -= 0.5; // Take damage from starvation
        }

        // Thirst
        player.thirst -= dino.thirstRate;
        if (player.thirst <= 0) {
            player.thirst = 0;
            player.health -= 0.5; // Take damage from dehydration
        }

        // Health regen
        if (player.hunger > dino.maxHunger * 0.5 && player.thirst > dino.maxThirst * 0.5) {
            player.health = Math.min(player.health + 0.1, dino.maxHealth);
        }

        // Stamina regen
        if (!player.isSprinting) {
            player.stamina = Math.min(player.stamina + dino.staminaRegenRate, dino.maxStamina);
        }

        // Stamina drain while sprinting
        if (player.isSprinting) {
            player.stamina -= 0.5;
            if (player.stamina <= 0) {
                player.stamina = 0;
                player.isSprinting = false;
            }
        }

        // Attack cooldown
        if (player.attackCooldown > 0) {
            player.attackCooldown -= 0.05;
        }

        // Eating timer
        if (player.isEating) {
            player.eatingTimer -= 0.05;
            if (player.eatingTimer <= 0) {
                player.isEating = false;
            }
        }
    });

    // Update NPCs
    dinosaurs.forEach((dino, dinoId) => {
        if (dinoId.startsWith('npc_') && !dino.isDead) {
            const dinoData = DINOSAURS[dino.dinosaurId];

            // Hunger
            dino.hunger -= dinoData.hungerRate;
            if (dino.hunger <= 0) {
                dino.hunger = 0;
                dino.health -= 0.5;
            }

            // Thirst
            dino.thirst -= dinoData.thirstRate;
            if (dino.thirst <= 0) {
                dino.thirst = 0;
                dino.health -= 0.5;
            }

            // Stamina regen
            if (!dino.isSprinting) {
                dino.stamina = Math.min(dino.stamina + dinoData.staminaRegenRate, dinoData.maxStamina);
            }

            // AI
            const ai = dino.ai;

            // Find nearest food/water/target/threat
            if (!ai.nearestFood || Math.random() < 0.01) {
                let minDist = 50;
                foodSpawns.forEach((food, foodId) => {
                    if (food.isEaten) return;
                    const dist = Math.sqrt(
                        Math.pow(food.position.x - dino.position.x, 2) +
                        Math.pow(food.position.z - dino.position.z, 2)
                    );
                    if (dist < minDist) {
                        minDist = dist;
                        ai.nearestFood = { id: foodId, food: food };
                    }
                });
            }

            if (!ai.nearestWater || Math.random() < 0.01) {
                let minDist = 50;
                waterSpawns.forEach((water, waterId) => {
                    const dist = Math.sqrt(
                        Math.pow(water.position.x - dino.position.x, 2) +
                        Math.pow(water.position.z - dino.position.z, 2)
                    );
                    if (dist < minDist) {
                        minDist = dist;
                        ai.nearestWater = water;
                    }
                });
            }

            if (!ai.nearestPrey || Math.random() < 0.01) {
                let minDist = 50;
                players.forEach((player, pid) => {
                    if (pid === dinoId) return;
                    if (player.isDead) return;
                    if (dinoData.type === 'herbivore' && player.dinosaurId === dino.dinosaurId) return;
                    const dist = Math.sqrt(
                        Math.pow(player.position.x - dino.position.x, 2) +
                        Math.pow(player.position.z - dino.position.z, 2)
                    );
                    if (dist < minDist) {
                        minDist = dist;
                        ai.nearestPrey = { id: pid, player: player };
                    }
                });
            }

            if (!ai.nearestThreat || Math.random() < 0.01) {
                let minDist = 50;
                players.forEach((player, pid) => {
                    if (pid === dinoId) return;
                    if (player.isDead) return;
                    if (dinoData.type === 'carnivore' && player.dinosaurId === dino.dinosaurId) return;
                    const dist = Math.sqrt(
                        Math.pow(player.position.x - dino.position.x, 2) +
                        Math.pow(player.position.z - dino.position.z, 2)
                    );
                    if (dist < minDist) {
                        minDist = dist;
                        ai.nearestThreat = { id: pid, player: player };
                    }
                });
            }

            // AI State machine
            let targetX = dino.position.x;
            let targetZ = dino.position.z;
            let shouldSprint = false;

            if (dinoData.type === 'carnivore' && ai.nearestPrey && ai.nearestPrey.player.health > 0) {
                // Hunt prey
                targetX = ai.nearestPrey.player.position.x;
                targetZ = ai.nearestPrey.player.position.z;
                shouldSprint = true;

                if (Math.random() < 0.005 && !dino.isAttacking) {
                    // Attack
                    dino.isAttacking = true;
                    const damage = dinoData.attackDamage;
                    ai.nearestPrey.player.health -= damage;
                    if (ai.nearestPrey.player.health <= 0) {
                        ai.nearestPrey.player.isDead = true;
                        // Drop food
                        const meatId = `meat_${Date.now()}`;
                        const food = new FoodItem(meatId, 'meat', {
                            x: ai.nearestPrey.player.position.x,
                            y: 0,
                            z: ai.nearestPrey.player.position.z
                        });
                        food.amount = 100;
                        foodSpawns.set(meatId, food);
                        ai.nearestPrey = null;
                    }
                    setTimeout(() => { dino.isAttacking = false; }, dinoData.attackCooldown * 1000);
                }
            } else if (dinoData.type === 'herbivore' && ai.nearestThreat) {
                // Flee from threat
                const dx = dino.position.x - ai.nearestThreat.player.position.x;
                const dz = dino.position.z - ai.nearestThreat.player.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist > 0) {
                    targetX = dino.position.x + (dx / dist) * 10;
                    targetZ = dino.position.z + (dz / dist) * 10;
                }
                shouldSprint = true;
            } else if (dino.hunger < dinoData.maxHunger * 0.5 && ai.nearestFood) {
                // Hunt food
                targetX = ai.nearestFood.food.position.x;
                targetZ = ai.nearestFood.food.position.z;
                shouldSprint = true;

                // Eat food
                if (Math.random() < 0.01) {
                    dino.isEating = true;
                    setTimeout(() => {
                        dino.isEating = false;
                        ai.nearestFood.food.isEaten = true;
                        dino.hunger = Math.min(dino.hunger + ai.nearestFood.food.amount, dinoData.maxHunger);
                        ai.nearestFood = null;
                    }, 2000);
                }
            } else if (dino.thirst < dinoData.maxThirst * 0.5 && ai.nearestWater) {
                // Go to water
                targetX = ai.nearestWater.position.x;
                targetZ = ai.nearestWater.position.z;
                shouldSprint = true;
            } else {
                // Wander
                if (ai.wanderTimer <= 0) {
                    const wanderAngle = Math.random() * Math.PI * 2;
                    const wanderDist = 5 + Math.random() * 10;
                    targetX = dino.position.x + Math.cos(wanderAngle) * wanderDist;
                    targetZ = dino.position.z + Math.sin(wanderAngle) * wanderDist;
                    ai.wanderTimer = 3 + Math.random() * 3;
                }
                ai.wanderTimer -= 0.05;
            }

            // Move towards target
            const dx = targetX - dino.position.x;
            const dz = targetZ - dino.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist > 0.5) {
                const speed = shouldSprint ? dinoData.sprintSpeed * 0.005 : dinoData.speed * 0.005;
                dino.position.x += (dx / dist) * speed;
                dino.position.z += (dz / dist) * speed;

                // Update rotation to face target
                dino.rotation = Math.atan2(dx, dz) * 180 / Math.PI;
            }

            // Map boundaries
            const halfMap = mapSize / 2;
            dino.position.x = Math.max(-halfMap, Math.min(halfMap, dino.position.x));
            dino.position.z = Math.max(-halfMap, Math.min(halfMap, dino.position.z));

            // Clean up null references
            if (ai.nearestFood && ai.nearestFood.food.isEaten) ai.nearestFood = null;
            if (ai.nearestThreat && ai.nearestThreat.player.isDead) ai.nearestThreat = null;
            if (ai.nearestPrey && ai.nearestPrey.player.isDead) ai.nearestPrey = null;
        }
    });

    // Broadcast updates
    const updateData = {
        type: 'update',
        players: Array.from(players.values()).map(p => ({
            id: p.id,
            name: p.name,
            dinosaurId: p.dinosaurId,
            position: p.position,
            rotation: p.rotation,
            health: p.health,
            stamina: p.stamina,
            hunger: p.hunger,
            thirst: p.thirst,
            isSprinting: p.isSprinting,
            isDead: p.isDead,
            isAttacking: p.isAttacking,
            isRiding: p.isRiding,
            isEating: p.isEating
        })),
        dinosaurs: Array.from(dinosaurs.values()).filter(d => d.id.startsWith('npc_') && !d.isDead).map(d => ({
            id: d.id,
            name: d.name,
            dinosaurId: d.dinosaurId,
            position: d.position,
            rotation: d.rotation,
            health: d.health,
            stamina: d.stamina,
            hunger: d.hunger,
            thirst: d.thirst,
            isSprinting: d.isSprinting,
            isDead: d.isDead,
            isAttacking: d.isAttacking,
            isRiding: d.isRiding,
            isEating: d.isEating
        })),
        food: Array.from(foodSpawns.values()).filter(f => !f.isEaten).map(f => ({
            id: f.id,
            type: f.type,
            position: f.position
        })),
        water: Array.from(waterSpawns.values()).map(w => ({
            id: w.id,
            position: w.position
        }))
    };

    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(updateData));
        }
    });
}, 100); // 10 FPS for game logic

// Start server
server.listen(2122, () => {
    console.log('DinoSurvival 3D Server running on http://localhost:2122');
});
