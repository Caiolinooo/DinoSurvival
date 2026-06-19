const DINOSAURS = {
    // CARNIVORES
    tyrannosaurus: {
        id: 'tyrannosaurus', name: 'Tyrannosaurus Rex', nameBR: 'Tiranossauro Rex',
        tier: 5, type: 'carnivore', maxHealth: 1800, maxStamina: 300, maxHunger: 1000, maxThirst: 1000,
        hungerRate: 0.15, thirstRate: 0.2, staminaRegenRate: 0.3, speed: 18, sprintSpeed: 28,
        attackDamage: 120, attackCooldown: 1.5, size: 1, realLength: 12,
        color: '#2d1b0e', bodyColor: '#3d2b1e', bellyColor: '#5d4b3e', textureColor: '#4d3b2e',
        tailColor: '#2d1b0e', headColor: '#3d2b1e', eyeColor: '#ff4400', teethColor: '#ffffff', clawColor: '#1a0a00',
        texture: 't-rex', isSwimming: false, isFlying: false
    },
    spinosaurus: {
        id: 'spinosaurus', name: 'Spinosaurus', nameBR: 'Espinossauro',
        tier: 5, type: 'carnivore', maxHealth: 1600, maxStamina: 350, maxHunger: 1000, maxThirst: 1000,
        hungerRate: 0.12, thirstRate: 0.15, staminaRegenRate: 0.4, speed: 16, sprintSpeed: 26,
        attackDamage: 100, attackCooldown: 1.8, size: 1, realLength: 15,
        color: '#1a4a2e', bodyColor: '#2a5a3e', bellyColor: '#3a6a4e', textureColor: '#3a5a3e',
        tailColor: '#1a4a2e', headColor: '#2a5a3e', eyeColor: '#ffaa00', teethColor: '#ffffff', clawColor: '#0a3a1e',
        texture: 'spino', isSwimming: true, isFlying: false
    },
    allosaurus: {
        id: 'allosaurus', name: 'Allosaurus', nameBR: 'Alossauro',
        tier: 4, type: 'carnivore', maxHealth: 1200, maxStamina: 250, maxHunger: 800, maxThirst: 800,
        hungerRate: 0.12, thirstRate: 0.18, staminaRegenRate: 0.3, speed: 20, sprintSpeed: 32,
        attackDamage: 85, attackCooldown: 1.2, size: 0.85, realLength: 8.5,
        color: '#3a3a4e', bodyColor: '#4a4a5e', bellyColor: '#5a5a6e', textureColor: '#4a4a5e',
        tailColor: '#3a3a4e', headColor: '#4a4a5e', eyeColor: '#ffcc00', teethColor: '#ffffff', clawColor: '#2a2a3e',
        texture: 'allo', isSwimming: false, isFlying: false
    },
    giganotosaurus: {
        id: 'giganotosaurus', name: 'Giganotosaurus', nameBR: 'Giganotossauro',
        tier: 5, type: 'carnivore', maxHealth: 1900, maxStamina: 280, maxHunger: 1100, maxThirst: 1100,
        hungerRate: 0.14, thirstRate: 0.18, staminaRegenRate: 0.28, speed: 17, sprintSpeed: 27,
        attackDamage: 130, attackCooldown: 1.6, size: 1.1, realLength: 13,
        color: '#2a2a1e', bodyColor: '#3a3a2e', bellyColor: '#4a4a3e', textureColor: '#3a3a2e',
        tailColor: '#2a2a1e', headColor: '#3a3a2e', eyeColor: '#ff6600', teethColor: '#ffffff', clawColor: '#1a1a0e',
        texture: 'giga', isSwimming: false, isFlying: false
    },
    carcharodontosaurus: {
        id: 'carcharodontosaurus', name: 'Carcharodontosaurus', nameBR: 'Carcarodontossauro',
        tier: 5, type: 'carnivore', maxHealth: 1750, maxStamina: 290, maxHunger: 1050, maxThirst: 1050,
        hungerRate: 0.13, thirstRate: 0.17, staminaRegenRate: 0.3, speed: 18, sprintSpeed: 28,
        attackDamage: 115, attackCooldown: 1.4, size: 1.05, realLength: 12,
        color: '#3a2a1e', bodyColor: '#4a3a2e', bellyColor: '#5a4a3e', textureColor: '#4a3a2e',
        tailColor: '#3a2a1e', headColor: '#4a3a2e', eyeColor: '#ffaa00', teethColor: '#ffffff', clawColor: '#2a1a0e',
        texture: 'carch', isSwimming: false, isFlying: false
    },
    deinonychus: {
        id: 'deinonychus', name: 'Deinonychus', nameBR: 'Deinonico',
        tier: 2, type: 'carnivore', maxHealth: 300, maxStamina: 200, maxHunger: 400, maxThirst: 400,
        hungerRate: 0.2, thirstRate: 0.25, staminaRegenRate: 0.5, speed: 25, sprintSpeed: 38,
        attackDamage: 45, attackCooldown: 0.8, size: 0.5, realLength: 3.4,
        color: '#5a3a2e', bodyColor: '#6a4a3e', bellyColor: '#7a5a4e', textureColor: '#6a4a3e',
        tailColor: '#5a3a2e', headColor: '#6a4a3e', eyeColor: '#ff6600', teethColor: '#ffffff', clawColor: '#3a2a1e',
        texture: 'deino', isSwimming: false, isFlying: false
    },
    dilophosaurus: {
        id: 'dilophosaurus', name: 'Dilophosaurus', nameBR: 'Dilofossauro',
        tier: 2, type: 'carnivore', maxHealth: 350, maxStamina: 220, maxHunger: 450, maxThirst: 450,
        hungerRate: 0.18, thirstRate: 0.22, staminaRegenRate: 0.4, speed: 22, sprintSpeed: 35,
        attackDamage: 50, attackCooldown: 1.0, size: 0.55, realLength: 6,
        color: '#4a2a1e', bodyColor: '#5a3a2e', bellyColor: '#6a4a3e', textureColor: '#5a3a2e',
        tailColor: '#4a2a1e', headColor: '#5a3a2e', eyeColor: '#ffcc00', teethColor: '#ffffff', clawColor: '#3a2a1e',
        texture: 'dilo', isSpitting: false, isSwimming: false, isFlying: false
    },
    compsognathus: {
        id: 'compsognathus', name: 'Compsognathus', nameBR: 'Compsognato',
        tier: 1, type: 'carnivore', maxHealth: 150, maxStamina: 150, maxHunger: 300, maxThirst: 300,
        hungerRate: 0.3, thirstRate: 0.3, staminaRegenRate: 0.6, speed: 30, sprintSpeed: 42,
        attackDamage: 25, attackCooldown: 0.6, size: 0.35, realLength: 1,
        color: '#5a5a3e', bodyColor: '#6a6a4e', bellyColor: '#7a7a5e', textureColor: '#6a6a4e',
        tailColor: '#5a5a3e', headColor: '#6a6a4e', eyeColor: '#ff4400', teethColor: '#ffffff', clawColor: '#4a4a2e',
        texture: 'comp', isSwimming: false, isFlying: false
    },
    velociraptor: {
        id: 'velociraptor', name: 'Velociraptor', nameBR: 'Velocirraptor',
        tier: 2, type: 'carnivore', maxHealth: 280, maxStamina: 190, maxHunger: 380, maxThirst: 380,
        hungerRate: 0.22, thirstRate: 0.24, staminaRegenRate: 0.45, speed: 28, sprintSpeed: 40,
        attackDamage: 42, attackCooldown: 0.9, size: 0.48, realLength: 2,
        color: '#4a3a2e', bodyColor: '#5a4a3e', bellyColor: '#6a5a4e', textureColor: '#5a4a3e',
        tailColor: '#4a3a2e', headColor: '#5a4a3e', eyeColor: '#ff6600', teethColor: '#ffffff', clawColor: '#3a2a1e',
        texture: 'raptor', isSwimming: false, isFlying: false
    },
    carnotaurus: {
        id: 'carnotaurus', name: 'Carnotaurus', nameBR: 'Carnotauro',
        tier: 3, type: 'carnivore', maxHealth: 600, maxStamina: 260, maxHunger: 600, maxThirst: 600,
        hungerRate: 0.16, thirstRate: 0.2, staminaRegenRate: 0.35, speed: 24, sprintSpeed: 36,
        attackDamage: 60, attackCooldown: 1.2, size: 0.6, realLength: 8,
        color: '#5a3a2e', bodyColor: '#6a4a3e', bellyColor: '#7a5a4e', textureColor: '#6a4a3e',
        tailColor: '#5a3a2e', headColor: '#6a4a3e', eyeColor: '#ff4400', teethColor: '#ffffff', clawColor: '#4a2a1e',
        texture: 'carno', isSwimming: false, isFlying: false
    },
    ceratosaurus: {
        id: 'ceratosaurus', name: 'Ceratosaurus', nameBR: 'Ceratossauro',
        tier: 3, type: 'carnivore', maxHealth: 550, maxStamina: 240, maxHunger: 550, maxThirst: 550,
        hungerRate: 0.17, thirstRate: 0.21, staminaRegenRate: 0.34, speed: 22, sprintSpeed: 34,
        attackDamage: 58, attackCooldown: 1.1, size: 0.55, realLength: 6,
        color: '#3a4a3e', bodyColor: '#4a5a4e', bellyColor: '#5a6a5e', textureColor: '#4a5a4e',
        tailColor: '#3a4a3e', headColor: '#4a5a4e', eyeColor: '#ff8800', teethColor: '#ffffff', clawColor: '#2a3a2e',
        texture: 'cerato', isSwimming: false, isFlying: false
    },
    baryonyx: {
        id: 'baryonyx', name: 'Baryonyx', nameBR: 'Bariônix',
        tier: 3, type: 'carnivore', maxHealth: 700, maxStamina: 270, maxHunger: 650, maxThirst: 650,
        hungerRate: 0.15, thirstRate: 0.18, staminaRegenRate: 0.33, speed: 20, sprintSpeed: 30,
        attackDamage: 62, attackCooldown: 1.3, size: 0.65, realLength: 9,
        color: '#3a4a2e', bodyColor: '#4a5a3e', bellyColor: '#5a6a4e', textureColor: '#4a5a3e',
        tailColor: '#3a4a2e', headColor: '#4a5a3e', eyeColor: '#ffaa00', teethColor: '#ffffff', clawColor: '#2a3a1e',
        texture: 'bary', isSwimming: true, isFlying: false
    },
    suchomimus: {
        id: 'suchomimus', name: 'Suchomimus', nameBR: 'Suchomimo',
        tier: 4, type: 'carnivore', maxHealth: 1000, maxStamina: 300, maxHunger: 800, maxThirst: 800,
        hungerRate: 0.12, thirstRate: 0.16, staminaRegenRate: 0.32, speed: 18, sprintSpeed: 28,
        attackDamage: 75, attackCooldown: 1.4, size: 0.8, realLength: 11,
        color: '#2a3a3e', bodyColor: '#3a4a4e', bellyColor: '#4a5a5e', textureColor: '#3a4a4e',
        tailColor: '#2a3a3e', headColor: '#3a4a4e', eyeColor: '#ffcc00', teethColor: '#ffffff', clawColor: '#1a2a2e',
        texture: 'sucho', isSwimming: true, isFlying: false
    },
    megalosaurus: {
        id: 'megalosaurus', name: 'Megalosaurus', nameBR: 'Meglossauro',
        tier: 3, type: 'carnivore', maxHealth: 650, maxStamina: 250, maxHunger: 580, maxThirst: 580,
        hungerRate: 0.16, thirstRate: 0.2, staminaRegenRate: 0.33, speed: 21, sprintSpeed: 32,
        attackDamage: 60, attackCooldown: 1.2, size: 0.6, realLength: 9,
        color: '#4a4a3e', bodyColor: '#5a5a4e', bellyColor: '#6a6a5e', textureColor: '#5a5a4e',
        tailColor: '#4a4a3e', headColor: '#5a5a4e', eyeColor: '#ff8800', teethColor: '#ffffff', clawColor: '#3a3a2e',
        texture: 'mega', isSwimming: false, isFlying: false
    },
    abelisaurus: {
        id: 'abelisaurus', name: 'Abelisaurus', nameBR: 'Abelissauro',
        tier: 3, type: 'carnivore', maxHealth: 600, maxStamina: 240, maxHunger: 550, maxThirst: 550,
        hungerRate: 0.17, thirstRate: 0.21, staminaRegenRate: 0.34, speed: 22, sprintSpeed: 33,
        attackDamage: 58, attackCooldown: 1.1, size: 0.6, realLength: 9,
        color: '#3a3a2e', bodyColor: '#4a4a3e', bellyColor: '#5a5a4e', textureColor: '#4a4a3e',
        tailColor: '#3a3a2e', headColor: '#4a4a3e', eyeColor: '#ff6600', teethColor: '#ffffff', clawColor: '#2a2a1e',
        texture: 'abel', isSwimming: false, isFlying: false
    },
    herrerasaurus: {
        id: 'herrerasaurus', name: 'Herrerasaurus', nameBR: 'Hererassauro',
        tier: 2, type: 'carnivore', maxHealth: 320, maxStamina: 190, maxHunger: 380, maxThirst: 380,
        hungerRate: 0.22, thirstRate: 0.26, staminaRegenRate: 0.45, speed: 24, sprintSpeed: 36,
        attackDamage: 40, attackCooldown: 0.9, size: 0.45, realLength: 5,
        color: '#4a3a2e', bodyColor: '#5a4a3e', bellyColor: '#6a5a4e', textureColor: '#5a4a3e',
        tailColor: '#4a3a2e', headColor: '#5a4a3e', eyeColor: '#ff6600', teethColor: '#ffffff', clawColor: '#3a2a1e',
        texture: 'herrera', isSwimming: false, isFlying: false
    },
    coelophysis: {
        id: 'coelophysis', name: 'Coelophysis', nameBR: 'Celófise',
        tier: 1, type: 'carnivore', maxHealth: 180, maxStamina: 160, maxHunger: 320, maxThirst: 320,
        hungerRate: 0.28, thirstRate: 0.28, staminaRegenRate: 0.55, speed: 28, sprintSpeed: 40,
        attackDamage: 28, attackCooldown: 0.7, size: 0.38, realLength: 3,
        color: '#5a5a4e', bodyColor: '#6a6a5e', bellyColor: '#7a7a6e', textureColor: '#6a6a5e',
        tailColor: '#5a5a4e', headColor: '#6a6a5e', eyeColor: '#ff4400', teethColor: '#ffffff', clawColor: '#4a4a3e',
        texture: 'coelo', isSwimming: false, isFlying: false
    },
    utahraptor: {
        id: 'utahraptor', name: 'Utahraptor', nameBR: 'Utarraptor',
        tier: 3, type: 'carnivore', maxHealth: 500, maxStamina: 230, maxHunger: 500, maxThirst: 500,
        hungerRate: 0.19, thirstRate: 0.23, staminaRegenRate: 0.4, speed: 24, sprintSpeed: 37,
        attackDamage: 55, attackCooldown: 1.0, size: 0.55, realLength: 6,
        color: '#4a3a2e', bodyColor: '#5a4a3e', bellyColor: '#6a5a4e', textureColor: '#5a4a3e',
        tailColor: '#4a3a2e', headColor: '#5a4a3e', eyeColor: '#ff8800', teethColor: '#ffffff', clawColor: '#3a2a1e',
        texture: 'utah', isSwimming: false, isFlying: false
    },
    microraptor: {
        id: 'microraptor', name: 'Microraptor', nameBR: 'Microraptor',
        tier: 1, type: 'carnivore', maxHealth: 120, maxStamina: 180, maxHunger: 250, maxThirst: 250,
        hungerRate: 0.3, thirstRate: 0.3, staminaRegenRate: 0.6, speed: 0, flightSpeed: 30,
        attackDamage: 20, attackCooldown: 0.5, size: 0.25, realLength: 0.8,
        color: '#3a3a4e', bodyColor: '#4a4a5e', bellyColor: '#5a5a6e', textureColor: '#4a4a5e',
        tailColor: '#3a3a4e', headColor: '#4a4a5e', eyeColor: '#ff4400', teethColor: '#ffffff', clawColor: '#2a2a3e',
        texture: 'micro', isSwimming: false, isFlying: true
    },

    // HERBIVORES
    apatosaurus: {
        id: 'apatosaurus', name: 'Apatosaurus', nameBR: 'Apatossauro',
        tier: 5, type: 'herbivore', maxHealth: 2000, maxStamina: 400, maxHunger: 1200, maxThirst: 1200,
        hungerRate: 0.08, thirstRate: 0.12, staminaRegenRate: 0.3, speed: 14, sprintSpeed: 22,
        attackDamage: 0, attackCooldown: 0, size: 1.2, realLength: 23,
        color: '#2a3a4e', bodyColor: '#3a4a5e', bellyColor: '#4a5a6e', textureColor: '#3a4a5e',
        tailColor: '#2a3a4e', headColor: '#3a4a5e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#2a3a4e',
        texture: 'apato', isSwimming: true, isFlying: false
    },
    brachiosaurus: {
        id: 'brachiosaurus', name: 'Brachiosaurus', nameBR: 'Brachiosauro',
        tier: 5, type: 'herbivore', maxHealth: 2200, maxStamina: 380, maxHunger: 1100, maxThirst: 1100,
        hungerRate: 0.07, thirstRate: 0.11, staminaRegenRate: 0.25, speed: 12, sprintSpeed: 20,
        attackDamage: 0, attackCooldown: 0, size: 1.3, realLength: 25,
        color: '#3a5a2e', bodyColor: '#4a6a3e', bellyColor: '#5a7a4e', textureColor: '#4a6a3e',
        tailColor: '#3a5a2e', headColor: '#4a6a3e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#3a5a2e',
        texture: 'brachio', isSwimming: true, isFlying: false
    },
    mamenchisaurus: {
        id: 'mamenchisaurus', name: 'Mamenchisaurus', nameBR: 'Mamencissauro',
        tier: 5, type: 'herbivore', maxHealth: 2100, maxStamina: 390, maxHunger: 1150, maxThirst: 1150,
        hungerRate: 0.075, thirstRate: 0.115, staminaRegenRate: 0.28, speed: 13, sprintSpeed: 21,
        attackDamage: 0, attackCooldown: 0, size: 1.25, realLength: 26,
        color: '#4a4a3e', bodyColor: '#5a5a4e', bellyColor: '#6a6a5e', textureColor: '#5a5a4e',
        tailColor: '#4a4a3e', headColor: '#5a5a4e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#4a4a3e',
        texture: 'mamench', isSwimming: true, isFlying: false
    },
    diplodocus: {
        id: 'diplodocus', name: 'Diplodocus', nameBR: 'Diplodoco',
        tier: 5, type: 'herbivore', maxHealth: 2100, maxStamina: 400, maxHunger: 1200, maxThirst: 1200,
        hungerRate: 0.075, thirstRate: 0.115, staminaRegenRate: 0.27, speed: 13, sprintSpeed: 21,
        attackDamage: 0, attackCooldown: 0, size: 1.25, realLength: 25,
        color: '#3a4a3e', bodyColor: '#4a5a4e', bellyColor: '#5a6a5e', textureColor: '#4a5a4e',
        tailColor: '#3a4a3e', headColor: '#4a5a4e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#3a4a3e',
        texture: 'diplo', isSwimming: true, isFlying: false
    },
    brontosaurus: {
        id: 'brontosaurus', name: 'Brontosaurus', nameBR: 'Brontossauro',
        tier: 5, type: 'herbivore', maxHealth: 2050, maxStamina: 395, maxHunger: 1180, maxThirst: 1180,
        hungerRate: 0.078, thirstRate: 0.118, staminaRegenRate: 0.28, speed: 14, sprintSpeed: 22,
        attackDamage: 0, attackCooldown: 0, size: 1.22, realLength: 22,
        color: '#3a4a2e', bodyColor: '#4a5a3e', bellyColor: '#5a6a4e', textureColor: '#4a5a3e',
        tailColor: '#3a4a2e', headColor: '#4a5a3e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#3a4a2e',
        texture: 'bron', isSwimming: true, isFlying: false
    },
    edmontosaurus: {
        id: 'edmontosaurus', name: 'Edmontosaurus', nameBR: 'Edmontossauro',
        tier: 4, type: 'herbivore', maxHealth: 1100, maxStamina: 300, maxHunger: 850, maxThirst: 850,
        hungerRate: 0.1, thirstRate: 0.14, staminaRegenRate: 0.35, speed: 16, sprintSpeed: 24,
        attackDamage: 0, attackCooldown: 0, size: 0.8, realLength: 12,
        color: '#3a4a5e', bodyColor: '#4a5a6e', bellyColor: '#5a6a7e', textureColor: '#4a5a6e',
        tailColor: '#3a4a5e', headColor: '#4a5a6e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#3a4a5e',
        texture: 'edmo', isSwimming: true, isFlying: false
    },
    stegosaurus: {
        id: 'stegosaurus', name: 'Stegosaurus', nameBR: 'Esteossauro',
        tier: 3, type: 'herbivore', maxHealth: 800, maxStamina: 280, maxHunger: 700, maxThirst: 700,
        hungerRate: 0.12, thirstRate: 0.16, staminaRegenRate: 0.32, speed: 14, sprintSpeed: 22,
        attackDamage: 60, attackCooldown: 2.0, size: 0.7, realLength: 9,
        color: '#2a4a2e', bodyColor: '#3a5a3e', bellyColor: '#4a6a4e', textureColor: '#3a5a3e',
        tailColor: '#2a4a2e', headColor: '#3a5a3e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#2a4a2e',
        texture: 'stego', hasPlates: true, tailAttack: true, isSwimming: false, isFlying: false
    },
    triceratops: {
        id: 'triceratops', name: 'Triceratops', nameBR: 'Triceratops',
        tier: 3, type: 'herbivore', maxHealth: 850, maxStamina: 290, maxHunger: 750, maxThirst: 750,
        hungerRate: 0.11, thirstRate: 0.15, staminaRegenRate: 0.33, speed: 15, sprintSpeed: 23,
        attackDamage: 55, attackCooldown: 1.8, size: 0.75, realLength: 9,
        color: '#4a3a2e', bodyColor: '#5a4a3e', bellyColor: '#6a5a4e', textureColor: '#5a4a3e',
        tailColor: '#4a3a2e', headColor: '#5a4a3e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#4a3a2e',
        texture: 'trik', hasHorns: true, headbuttAttack: true, isSwimming: false, isFlying: false
    },
    parasaurolophus: {
        id: 'parasaurolophus', name: 'Parasaurolophus', nameBR: 'Parassaurolofo',
        tier: 3, type: 'herbivore', maxHealth: 600, maxStamina: 250, maxHunger: 550, maxThirst: 550,
        hungerRate: 0.14, thirstRate: 0.18, staminaRegenRate: 0.38, speed: 18, sprintSpeed: 28,
        attackDamage: 0, attackCooldown: 0, size: 0.6, realLength: 10,
        color: '#3a5a4e', bodyColor: '#4a6a5e', bellyColor: '#5a7a6e', textureColor: '#4a6a5e',
        tailColor: '#3a5a4e', headColor: '#4a6a5e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#3a5a4e',
        texture: 'parasaur', hasCrest: true, isSwimming: false, isFlying: false
    },
    iguanodon: {
        id: 'iguanodon', name: 'Iguanodon', nameBR: 'Iguanodonte',
        tier: 2, type: 'herbivore', maxHealth: 450, maxStamina: 220, maxHunger: 500, maxThirst: 500,
        hungerRate: 0.16, thirstRate: 0.2, staminaRegenRate: 0.4, speed: 20, sprintSpeed: 30,
        attackDamage: 35, attackCooldown: 1.5, size: 0.55, realLength: 10,
        color: '#4a6a3e', bodyColor: '#5a7a4e', bellyColor: '#6a8a5e', textureColor: '#5a7a4e',
        tailColor: '#4a6a3e', headColor: '#5a7a4e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#4a6a3e',
        texture: 'iguano', hasThumbSpike: true, isSwimming: false, isFlying: false
    },
    hadrosaurus: {
        id: 'hadrosaurus', name: 'Hadrosaurus', nameBR: 'Hadrossauro',
        tier: 3, type: 'herbivore', maxHealth: 700, maxStamina: 260, maxHunger: 600, maxThirst: 600,
        hungerRate: 0.13, thirstRate: 0.17, staminaRegenRate: 0.36, speed: 17, sprintSpeed: 26,
        attackDamage: 0, attackCooldown: 0, size: 0.65, realLength: 8,
        color: '#5a4a3e', bodyColor: '#6a5a4e', bellyColor: '#7a6a5e', textureColor: '#6a5a4e',
        tailColor: '#5a4a3e', headColor: '#6a5a4e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#5a4a3e',
        texture: 'hadro', isSwimming: false, isFlying: false
    },
    protoceratops: {
        id: 'protoceratops', name: 'Protoceratops', nameBR: 'Protoceratops',
        tier: 1, type: 'herbivore', maxHealth: 200, maxStamina: 160, maxHunger: 300, maxThirst: 300,
        hungerRate: 0.25, thirstRate: 0.28, staminaRegenRate: 0.5, speed: 22, sprintSpeed: 32,
        attackDamage: 15, attackCooldown: 1.0, size: 0.3, realLength: 2,
        color: '#5a5a3e', bodyColor: '#6a6a4e', bellyColor: '#7a7a5e', textureColor: '#6a6a4e',
        tailColor: '#5a5a3e', headColor: '#6a6a4e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#4a4a2e',
        texture: 'proto', hasHorns: true, hasFrill: true, isSwimming: false, isFlying: false
    },
    styracosaurus: {
        id: 'styracosaurus', name: 'Styracosaurus', nameBR: 'Estiracossauro',
        tier: 3, type: 'herbivore', maxHealth: 750, maxStamina: 270, maxHunger: 700, maxThirst: 700,
        hungerRate: 0.12, thirstRate: 0.16, staminaRegenRate: 0.34, speed: 15, sprintSpeed: 23,
        attackDamage: 55, attackCooldown: 1.8, size: 0.65, realLength: 5.5,
        color: '#4a3a2e', bodyColor: '#5a4a3e', bellyColor: '#6a5a4e', textureColor: '#5a4a3e',
        tailColor: '#4a3a2e', headColor: '#5a4a3e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#4a3a2e',
        texture: 'styra', hasHorns: true, hasFrill: true, isSwimming: false, isFlying: false
    },
    pachyrhinosaurus: {
        id: 'pachyrhinosaurus', name: 'Pachyrhinosaurus', nameBR: 'Paquirrinossauro',
        tier: 3, type: 'herbivore', maxHealth: 780, maxStamina: 275, maxHunger: 720, maxThirst: 720,
        hungerRate: 0.12, thirstRate: 0.16, staminaRegenRate: 0.33, speed: 14, sprintSpeed: 22,
        attackDamage: 55, attackCooldown: 1.8, size: 0.65, realLength: 6,
        color: '#4a4a3e', bodyColor: '#5a5a4e', bellyColor: '#6a6a5e', textureColor: '#5a5a4e',
        tailColor: '#4a4a3e', headColor: '#5a5a4e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#4a4a3e',
        texture: 'pachy', hasHorns: true, hasFrill: true, isSwimming: false, isFlying: false
    },
    corythosaurus: {
        id: 'corythosaurus', name: 'Corythosaurus', nameBR: 'Coritossauro',
        tier: 3, type: 'herbivore', maxHealth: 650, maxStamina: 255, maxHunger: 600, maxThirst: 600,
        hungerRate: 0.13, thirstRate: 0.17, staminaRegenRate: 0.37, speed: 17, sprintSpeed: 27,
        attackDamage: 0, attackCooldown: 0, size: 0.6, realLength: 9,
        color: '#3a5a4e', bodyColor: '#4a6a5e', bellyColor: '#5a7a6e', textureColor: '#4a6a5e',
        tailColor: '#3a5a4e', headColor: '#4a6a5e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#3a5a4e',
        texture: 'cory', hasCrest: true, isSwimming: false, isFlying: false
    },
    lambeosaurus: {
        id: 'lambeosaurus', name: 'Lambeosaurus', nameBR: 'Lambessauro',
        tier: 3, type: 'herbivore', maxHealth: 680, maxStamina: 260, maxHunger: 620, maxThirst: 620,
        hungerRate: 0.13, thirstRate: 0.17, staminaRegenRate: 0.36, speed: 16, sprintSpeed: 26,
        attackDamage: 0, attackCooldown: 0, size: 0.6, realLength: 9,
        color: '#4a5a3e', bodyColor: '#5a6a4e', bellyColor: '#6a7a5e', textureColor: '#5a6a4e',
        tailColor: '#4a5a3e', headColor: '#5a6a4e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#4a5a3e',
        texture: 'lambe', hasCrest: true, isSwimming: false, isFlying: false
    },
    tenontosaurus: {
        id: 'tenontosaurus', name: 'Tenontosaurus', nameBR: 'Tenontossauro',
        tier: 2, type: 'herbivore', maxHealth: 400, maxStamina: 210, maxHunger: 450, maxThirst: 450,
        hungerRate: 0.17, thirstRate: 0.21, staminaRegenRate: 0.4, speed: 18, sprintSpeed: 28,
        attackDamage: 0, attackCooldown: 0, size: 0.5, realLength: 7,
        color: '#4a4a3e', bodyColor: '#5a5a4e', bellyColor: '#6a6a5e', textureColor: '#5a5a4e',
        tailColor: '#4a4a3e', headColor: '#5a5a4e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#4a4a3e',
        texture: 'tenon', isSwimming: false, isFlying: false
    },
    dryosaurus: {
        id: 'dryosaurus', name: 'Dryosaurus', nameBR: 'Dryossauro',
        tier: 1, type: 'herbivore', maxHealth: 220, maxStamina: 180, maxHunger: 320, maxThirst: 320,
        hungerRate: 0.22, thirstRate: 0.24, staminaRegenRate: 0.48, speed: 26, sprintSpeed: 38,
        attackDamage: 0, attackCooldown: 0, size: 0.35, realLength: 3,
        color: '#5a5a4e', bodyColor: '#6a6a5e', bellyColor: '#7a7a6e', textureColor: '#6a6a5e',
        tailColor: '#5a5a4e', headColor: '#6a6a5e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#4a4a3e',
        texture: 'dryo', isSwimming: false, isFlying: false
    },
    gallimimus: {
        id: 'gallimimus', name: 'Gallimimus', nameBR: 'Galimimo',
        tier: 2, type: 'herbivore', maxHealth: 350, maxStamina: 200, maxHunger: 400, maxThirst: 400,
        hungerRate: 0.2, thirstRate: 0.22, staminaRegenRate: 0.45, speed: 30, sprintSpeed: 44,
        attackDamage: 0, attackCooldown: 0, size: 0.45, realLength: 6,
        color: '#5a4a3e', bodyColor: '#6a5a4e', bellyColor: '#7a6a5e', textureColor: '#6a5a4e',
        tailColor: '#5a4a3e', headColor: '#6a5a4e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#5a4a3e',
        texture: 'galli', isSwimming: false, isFlying: false
    },
    therizinosaurus: {
        id: 'therizinosaurus', name: 'Therizinosaurus', nameBR: 'Terizinossauro',
        tier: 4, type: 'herbivore', maxHealth: 1200, maxStamina: 320, maxHunger: 900, maxThirst: 900,
        hungerRate: 0.1, thirstRate: 0.14, staminaRegenRate: 0.32, speed: 16, sprintSpeed: 24,
        attackDamage: 80, attackCooldown: 1.5, size: 0.85, realLength: 10,
        color: '#4a3a2e', bodyColor: '#5a4a3e', bellyColor: '#6a5a4e', textureColor: '#5a4a3e',
        tailColor: '#4a3a2e', headColor: '#5a4a3e', eyeColor: '#ff6600', teethColor: '#ffffff', clawColor: '#3a2a1e',
        texture: 'theri', isSwimming: false, isFlying: false
    },
    amargasaurus: {
        id: 'amargasaurus', name: 'Amargasaurus', nameBR: 'Amargassauro',
        tier: 4, type: 'herbivore', maxHealth: 1500, maxStamina: 350, maxHunger: 1000, maxThirst: 1000,
        hungerRate: 0.08, thirstRate: 0.12, staminaRegenRate: 0.28, speed: 13, sprintSpeed: 21,
        attackDamage: 0, attackCooldown: 0, size: 1.0, realLength: 10,
        color: '#3a4a3e', bodyColor: '#4a5a4e', bellyColor: '#5a6a5e', textureColor: '#4a5a4e',
        tailColor: '#3a4a3e', headColor: '#4a5a4e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#3a4a3e',
        texture: 'amarga', hasSpines: true, isSwimming: true, isFlying: false
    },
    kentrosaurus: {
        id: 'kentrosaurus', name: 'Kentrosaurus', nameBR: 'Kentrossauro',
        tier: 3, type: 'herbivore', maxHealth: 700, maxStamina: 260, maxHunger: 650, maxThirst: 650,
        hungerRate: 0.13, thirstRate: 0.17, staminaRegenRate: 0.33, speed: 15, sprintSpeed: 23,
        attackDamage: 55, attackCooldown: 2.0, size: 0.55, realLength: 5,
        color: '#3a4a2e', bodyColor: '#4a5a3e', bellyColor: '#5a6a4e', textureColor: '#4a5a3e',
        tailColor: '#3a4a2e', headColor: '#4a5a3e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#3a4a2e',
        texture: 'kentro', hasPlates: true, tailAttack: true, isSwimming: false, isFlying: false
    },
    euoplocephalus: {
        id: 'euoplocephalus', name: 'Euoplocephalus', nameBR: 'Euoplocéfalo',
        tier: 4, type: 'herbivore', maxHealth: 1300, maxStamina: 310, maxHunger: 850, maxThirst: 850,
        hungerRate: 0.09, thirstRate: 0.13, staminaRegenRate: 0.3, speed: 12, sprintSpeed: 19,
        attackDamage: 75, attackCooldown: 2.5, size: 0.75, realLength: 6,
        color: '#3a3a2e', bodyColor: '#4a4a3e', bellyColor: '#5a5a4e', textureColor: '#4a4a3e',
        tailColor: '#3a3a2e', headColor: '#4a4a3e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#3a3a2e',
        texture: 'euoplo', hasArmor: true, tailClubAttack: true, isSwimming: false, isFlying: false
    },
    ceratops: {
        id: 'ceratops', name: 'Ceratops', nameBR: 'Ceratops',
        tier: 1, type: 'herbivore', maxHealth: 250, maxStamina: 170, maxHunger: 350, maxThirst: 350,
        hungerRate: 0.22, thirstRate: 0.25, staminaRegenRate: 0.45, speed: 20, sprintSpeed: 30,
        attackDamage: 20, attackCooldown: 1.0, size: 0.35, realLength: 2,
        color: '#5a4a3e', bodyColor: '#6a5a4e', bellyColor: '#7a6a5e', textureColor: '#6a5a4e',
        tailColor: '#5a4a3e', headColor: '#6a5a4e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#5a4a3e',
        texture: 'cera', hasHorns: true, hasFrill: true, isSwimming: false, isFlying: false
    },
    oviraptor: {
        id: 'oviraptor', name: 'Oviraptor', nameBR: 'Oviraptor',
        tier: 1, type: 'carnivore', maxHealth: 260, maxStamina: 185, maxHunger: 370, maxThirst: 370,
        hungerRate: 0.24, thirstRate: 0.26, staminaRegenRate: 0.48, speed: 27, sprintSpeed: 39,
        attackDamage: 40, attackCooldown: 0.9, size: 0.45, realLength: 2,
        color: '#5a4a2e', bodyColor: '#6a5a3e', bellyColor: '#7a6a4e', textureColor: '#6a5a3e',
        tailColor: '#5a4a2e', headColor: '#6a5a3e', eyeColor: '#ff6600', teethColor: '#ffffff', clawColor: '#5a4a2e',
        texture: 'ovi', hasCrest: true, isSwimming: false, isFlying: false
    },
    dromaeosaurus: {
        id: 'dromaeosaurus', name: 'Dromaeosaurus', nameBR: 'Dromaeossauro',
        tier: 2, type: 'carnivore', maxHealth: 450, maxStamina: 230, maxHunger: 500, maxThirst: 500,
        hungerRate: 0.2, thirstRate: 0.23, staminaRegenRate: 0.42, speed: 24, sprintSpeed: 36,
        attackDamage: 55, attackCooldown: 1.0, size: 0.55, realLength: 2,
        color: '#4a4a3e', bodyColor: '#5a5a4e', bellyColor: '#6a6a5e', textureColor: '#5a5a4e',
        tailColor: '#4a4a3e', headColor: '#5a5a4e', eyeColor: '#ffcc00', teethColor: '#ffffff', clawColor: '#4a4a3e',
        texture: 'dromo', isSwimming: false, isFlying: false
    },
    omeisaurus: {
        id: 'omeisaurus', name: 'Omeisaurus', nameBR: 'Omeissauro',
        tier: 4, type: 'herbivore', maxHealth: 1600, maxStamina: 360, maxHunger: 1000, maxThirst: 1000,
        hungerRate: 0.08, thirstRate: 0.12, staminaRegenRate: 0.28, speed: 13, sprintSpeed: 21,
        attackDamage: 0, attackCooldown: 0, size: 1.0, realLength: 20,
        color: '#3a4a3e', bodyColor: '#4a5a4e', bellyColor: '#5a6a5e', textureColor: '#4a5a4e',
        tailColor: '#3a4a3e', headColor: '#4a5a4e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#3a4a3e',
        texture: 'omei', isSwimming: true, isFlying: false
    },
    hadrosaur: {
        id: 'hadrosaur', name: 'Hadrosaur', nameBR: 'Hadrossauro',
        tier: 3, type: 'herbivore', maxHealth: 700, maxStamina: 260, maxHunger: 600, maxThirst: 600,
        hungerRate: 0.13, thirstRate: 0.17, staminaRegenRate: 0.36, speed: 17, sprintSpeed: 26,
        attackDamage: 0, attackCooldown: 0, size: 0.65, realLength: 8,
        color: '#5a4a3e', bodyColor: '#6a5a4e', bellyColor: '#7a6a5e', textureColor: '#6a5a4e',
        tailColor: '#5a4a3e', headColor: '#6a5a4e', eyeColor: '#006600', teethColor: '#ffffff', clawColor: '#5a4a3e',
        texture: 'hadro', isSwimming: false, isFlying: false
    },

    // PTEROSAURS
    pteranodon: {
        id: 'pteranodon', name: 'Pteranodon', nameBR: 'Pteranodonte',
        tier: 4, type: 'carnivore', maxHealth: 900, maxStamina: 350, maxHunger: 700, maxThirst: 700,
        hungerRate: 0.15, thirstRate: 0.2, staminaRegenRate: 0.5, speed: 0, flightSpeed: 50,
        attackDamage: 65, attackCooldown: 1.0, size: 0.9, realLength: 1.8,
        color: '#3a2a1e', bodyColor: '#4a3a2e', bellyColor: '#5a4a3e', textureColor: '#4a3a2e',
        tailColor: '#3a2a1e', headColor: '#4a3a2e', eyeColor: '#ffcc00', teethColor: '#ffffff', clawColor: '#3a2a1e',
        wingColor: '#4a3a2e', texture: 'ptera', isSwimming: false, isFlying: true
    },
    rhamphorhynchus: {
        id: 'rhamphorhynchus', name: 'Rhamphorhynchus', nameBR: 'Ramforrincus',
        tier: 2, type: 'carnivore', maxHealth: 250, maxStamina: 180, maxHunger: 350, maxThirst: 350,
        hungerRate: 0.25, thirstRate: 0.28, staminaRegenRate: 0.55, speed: 0, flightSpeed: 35,
        attackDamage: 35, attackCooldown: 0.8, size: 0.4, realLength: 1.3,
        color: '#4a3a2e', bodyColor: '#5a4a3e', bellyColor: '#6a5a4e', textureColor: '#5a4a3e',
        tailColor: '#4a3a2e', headColor: '#5a4a3e', eyeColor: '#ff4400', teethColor: '#ffffff', clawColor: '#4a3a2e',
        wingColor: '#5a4a3e', texture: 'rhampho', isSwimming: false, isFlying: true
    },
    quetzalcoatlus: {
        id: 'quetzalcoatlus', name: 'Quetzalcoatlus', nameBR: 'Quetzalcoatlus',
        tier: 5, type: 'carnivore', maxHealth: 1100, maxStamina: 400, maxHunger: 900, maxThirst: 900,
        hungerRate: 0.12, thirstRate: 0.16, staminaRegenRate: 0.45, speed: 0, flightSpeed: 55,
        attackDamage: 75, attackCooldown: 1.2, size: 1.0, realLength: 5,
        color: '#2a2a1e', bodyColor: '#3a3a2e', bellyColor: '#4a4a3e', textureColor: '#3a3a2e',
        tailColor: '#2a2a1e', headColor: '#3a3a2e', eyeColor: '#ff6600', teethColor: '#ffffff', clawColor: '#1a1a0e',
        wingColor: '#3a3a2e', texture: 'quetz', isSwimming: false, isFlying: true
    },
    tapejara: {
        id: 'tapejara', name: 'Tapejara', nameBR: 'Tapejara',
        tier: 2, type: 'carnivore', maxHealth: 280, maxStamina: 190, maxHunger: 370, maxThirst: 370,
        hungerRate: 0.23, thirstRate: 0.26, staminaRegenRate: 0.5, speed: 0, flightSpeed: 38,
        attackDamage: 38, attackCooldown: 0.8, size: 0.45, realLength: 1.5,
        color: '#3a4a3e', bodyColor: '#4a5a4e', bellyColor: '#5a6a5e', textureColor: '#4a5a4e',
        tailColor: '#3a4a3e', headColor: '#4a5a4e', eyeColor: '#ff8800', teethColor: '#ffffff', clawColor: '#3a4a3e',
        wingColor: '#4a5a4e', texture: 'tape', isSwimming: false, isFlying: true
    },
    dimorphodon: {
        id: 'dimorphodon', name: 'Dimorphodon', nameBR: 'Dimorfodonte',
        tier: 1, type: 'carnivore', maxHealth: 180, maxStamina: 170, maxHunger: 280, maxThirst: 280,
        hungerRate: 0.26, thirstRate: 0.28, staminaRegenRate: 0.55, speed: 0, flightSpeed: 32,
        attackDamage: 25, attackCooldown: 0.7, size: 0.3, realLength: 1,
        color: '#4a3a2e', bodyColor: '#5a4a3e', bellyColor: '#6a5a4e', textureColor: '#5a4a3e',
        tailColor: '#4a3a2e', headColor: '#5a4a3e', eyeColor: '#ff4400', teethColor: '#ffffff', clawColor: '#4a3a2e',
        wingColor: '#5a4a3e', texture: 'dimorph', isSwimming: false, isFlying: true
    },

    // MARINE
    plesiosaurus: {
        id: 'plesiosaurus', name: 'Plesiosaurus', nameBR: 'Plesiosauro',
        tier: 4, type: 'carnivore', maxHealth: 1000, maxStamina: 300, maxHunger: 800, maxThirst: 800,
        hungerRate: 0.14, thirstRate: 0.12, staminaRegenRate: 0.45, speed: 10, sprintSpeed: 18,
        attackDamage: 70, attackCooldown: 1.2, size: 0.8, realLength: 3.5,
        color: '#2a4a5e', bodyColor: '#3a5a6e', bellyColor: '#4a6a7e', textureColor: '#3a5a6e',
        tailColor: '#2a4a5e', headColor: '#3a5a6e', eyeColor: '#ffcc00', teethColor: '#ffffff', clawColor: '#2a4a5e',
        texture: 'plesi', isSwimming: true, isFlying: false
    },
    mosasaurus: {
        id: 'mosasaurus', name: 'Mosasaurus', nameBR: 'Mosassauro',
        tier: 5, type: 'carnivore', maxHealth: 1700, maxStamina: 380, maxHunger: 1100, maxThirst: 1100,
        hungerRate: 0.1, thirstRate: 0.08, staminaRegenRate: 0.4, speed: 12, sprintSpeed: 20,
        attackDamage: 95, attackCooldown: 1.5, size: 1.1, realLength: 15,
        color: '#1a3a4e', bodyColor: '#2a4a5e', bellyColor: '#3a5a6e', textureColor: '#2a4a5e',
        tailColor: '#1a3a4e', headColor: '#2a4a5e', eyeColor: '#ff4400', teethColor: '#ffffff', clawColor: '#1a3a4e',
        texture: 'mosa', isSwimming: true, isFlying: false
    },
    deinocheirus: {
        id: 'deinocheirus', name: 'Deinocheirus', nameBR: 'Deinoqueiro',
        tier: 5, type: 'carnivore', maxHealth: 1500, maxStamina: 350, maxHunger: 1000, maxThirst: 1000,
        hungerRate: 0.1, thirstRate: 0.14, staminaRegenRate: 0.3, speed: 15, sprintSpeed: 24,
        attackDamage: 90, attackCooldown: 1.8, size: 1.1, realLength: 11,
        color: '#4a3a2e', bodyColor: '#5a4a3e', bellyColor: '#6a5a4e', textureColor: '#5a4a3e',
        tailColor: '#4a3a2e', headColor: '#5a4a3e', eyeColor: '#ffaa00', teethColor: '#ffffff', clawColor: '#4a3a2e',
        texture: 'deinoch', hasHump: true, isSwimming: false, isFlying: false
    },
    tylosaurus: {
        id: 'tylosaurus', name: 'Tylosaurus', nameBR: 'Tilossauro',
        tier: 5, type: 'carnivore', maxHealth: 1750, maxStamina: 370, maxHunger: 1050, maxThirst: 1050,
        hungerRate: 0.1, thirstRate: 0.09, staminaRegenRate: 0.38, speed: 13, sprintSpeed: 21,
        attackDamage: 100, attackCooldown: 1.5, size: 1.05, realLength: 12,
        color: '#1a2a3e', bodyColor: '#2a3a4e', bellyColor: '#3a4a5e', textureColor: '#2a3a4e',
        tailColor: '#1a2a3e', headColor: '#2a3a4e', eyeColor: '#ff6600', teethColor: '#ffffff', clawColor: '#1a2a3e',
        texture: 'tylo', isSwimming: true, isFlying: false
    },
    ichthyosaurus: {
        id: 'ichthyosaurus', name: 'Ichthyosaurus', nameBR: 'Ictiossauro',
        tier: 2, type: 'carnivore', maxHealth: 350, maxStamina: 220, maxHunger: 400, maxThirst: 400,
        hungerRate: 0.2, thirstRate: 0.18, staminaRegenRate: 0.5, speed: 18, sprintSpeed: 28,
        attackDamage: 40, attackCooldown: 0.8, size: 0.45, realLength: 3,
        color: '#2a4a5e', bodyColor: '#3a5a6e', bellyColor: '#4a6a7e', textureColor: '#3a5a6e',
        tailColor: '#2a4a5e', headColor: '#3a5a6e', eyeColor: '#ff8800', teethColor: '#ffffff', clawColor: '#2a4a5e',
        texture: 'ichth', isSwimming: true, isFlying: false
    },
    megalodon: {
        id: 'megalodon', name: 'Megalodon', nameBR: 'Megalodonte',
        tier: 5, type: 'carnivore', maxHealth: 2000, maxStamina: 400, maxHunger: 1200, maxThirst: 1200,
        hungerRate: 0.08, thirstRate: 0.07, staminaRegenRate: 0.35, speed: 15, sprintSpeed: 25,
        attackDamage: 110, attackCooldown: 1.6, size: 1.2, realLength: 18,
        color: '#1a1a2e', bodyColor: '#2a2a3e', bellyColor: '#3a3a4e', textureColor: '#2a2a3e',
        tailColor: '#1a1a2e', headColor: '#2a2a3e', eyeColor: '#ff4400', teethColor: '#ffffff', clawColor: '#1a1a2e',
        texture: 'megalodon', isSwimming: true, isFlying: false
    },
    liopleurodon: {
        id: 'liopleurodon', name: 'Liopleurodon', nameBR: 'Liopleurodonte',
        tier: 4, type: 'carnivore', maxHealth: 1300, maxStamina: 320, maxHunger: 900, maxThirst: 900,
        hungerRate: 0.11, thirstRate: 0.1, staminaRegenRate: 0.4, speed: 11, sprintSpeed: 19,
        attackDamage: 80, attackCooldown: 1.3, size: 0.9, realLength: 7,
        color: '#2a3a4e', bodyColor: '#3a4a5e', bellyColor: '#4a5a6e', textureColor: '#3a4a5e',
        tailColor: '#2a3a4e', headColor: '#3a4a5e', eyeColor: '#ffaa00', teethColor: '#ffffff', clawColor: '#2a3a4e',
        texture: 'liopleuro', isSwimming: true, isFlying: false
    }
};

function getDinoById(id) {
    return DINOSAURS[id] || null;
}

function getAllDinos() {
    return Object.values(DINOSAURS);
}

module.exports = { DINOSAURS, getDinoById, getAllDinos };
