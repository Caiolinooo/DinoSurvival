        // Game state
        const GAME = {
            camera: null,
            scene: null,
            renderer: null,
            player: null,
            ws: null,
            selectedDino: null,
            selectedPhylo: 'all',
            playerName: '',
            isPlaying: false,
            isDead: false,
            isRiding: false,
            isEating: false,
            isSprinting: false,
            isSwimming: false,
            isFlying: false,
            isAttacking: false,
            attackCooldown: 0,
            isEatingTimer: 0,
            keys: {},
            mouse: { x: 0, y: 0, isPointerLocked: false },
            cameraAngle: { x: 0, y: 0.5 },
            cameraDistance: 15,
            noise: null,
            terrainData: null,
            mapSize: 1500,
            food: new Map(),
            water: new Map(),
            npcs: new Map(),
            otherPlayers: new Map(),
            dayTime: 0,
            dayLength: 600, // 10 minutes
            weather: 'clear',
            temperature: 25,
            rainDrops: null,
            fog: null,
            sounds: {
                enabled: true,
                attack: null,
                eat: null,
                roar: null,
                footsteps: null,
                ambient: null
            },
            inventory: {
                meat: 0,
                berry: 0,
                fish: 0,
                insect: 0
            },
            kills: 0,
            deaths: 0,
            killsList: []
        };

        // Initialize Three.js
        function initGameFromAuth() {
    const jd = window.__dinoJoinData || {};
    GAME.playerName = jd.dinoName || "Player";
    GAME.selectedDino = jd.dinosaurId || "compsognathus";
    document.getElementById("auth-overlay").classList.add("hidden");
    document.getElementById("menu")?.classList.add("hidden");
    initThreeJS();
    connectWS();
    startGameLoop();
}

function initThreeJS() {
            const canvas = document.getElementById('gameCanvas');
            GAME.scene = new THREE.Scene();
            GAME.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 6000);
            GAME.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
            GAME.renderer.setSize(window.innerWidth, window.innerHeight);
            GAME.renderer.shadowMap.enabled = true;
            GAME.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            GAME.renderer.setClearColor(0x87CEEB);

            // Add orbit controls
            const controls = new THREE.OrbitControls(GAME.camera, canvas);
            controls.enableDamping = true;
            controls.dampingFactor = 0.1;
            controls.maxPolarAngle = Math.PI / 2 - 0.1;
            controls.minDistance = 5;
            controls.maxDistance = 30;
            controls.target.set(0, 0, 0);

            // Add lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
            GAME.scene.add(ambientLight);

            const sunLight = new THREE.DirectionalLight(0xffffff, 1);
            sunLight.position.set(100, 100, 100);
            sunLight.castShadow = true;
            sunLight.shadow.mapSize.width = 2048;
            sunLight.shadow.mapSize.height = 2048;
            sunLight.shadow.camera.near = 0.5;
            sunLight.shadow.camera.far = 500;
            sunLight.shadow.camera.left = -100;
            sunLight.shadow.camera.right = 100;
            sunLight.shadow.camera.top = 100;
            sunLight.shadow.camera.bottom = -100;
            GAME.scene.add(sunLight);

            // Hemisphere light for better lighting
            const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
            GAME.scene.add(hemiLight);
            GAME.noise = new Noise(42);
            const terrainData = createProceduralTerrain(GAME.scene, GAME.mapSize, GAME.noise);
            GAME.terrainData = terrainData;

        function getTerrainHeight(x, z) {
    const td = GAME.terrainData;
    if (!td) return 0;
    const half = td.mapSize;
    const nx = (x / (half * 2)) + 0.5;
    const nz = (z / (half * 2)) + 0.5;
    const gx = Math.min(Math.floor(nx * td.grid), td.grid);
    const gz = Math.min(Math.floor(nz * td.grid), td.grid);
    if (gx < 0 || gx > td.grid || gz < 0 || gz > td.grid) return 0;
    return td.heightMap[gz][gx];
}

        // Create trees
        function createTrees() {
            for (let i = 0; i < 200; i++) {
                const x = (Math.random() - 0.5) * GAME.mapSize;
                const z = (Math.random() - 0.5) * GAME.mapSize;
                const terrainY = getTerrainHeight(x, z);
                if (terrainY < 0.5 || terrainY > 80) continue;
                const height = 8 + Math.random() * 12;

                // Trunk
                const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, height, 8);
                const trunkMaterial = new THREE.MeshStandardMaterial({
                    color: 0x8B4513,
                    roughness: 0.9,
                    metalness: 0.1
                });
                const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
                trunk.position.set(x, terrainY + height / 2, z);
                trunk.castShadow = true;
                trunk.receiveShadow = true;
                GAME.scene.add(trunk);

                // Canopy
                const canopyGeometry = new THREE.SphereGeometry(3 + Math.random() * 3, 8, 8);
                const canopyMaterial = new THREE.MeshStandardMaterial({
                    color: 0x228B22,
                    roughness: 0.8,
                    metalness: 0.1
                });
                const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
                canopy.position.set(x, terrainY + height, z);
                canopy.castShadow = true;
                canopy.receiveShadow = true;
                GAME.scene.add(canopy);
            }
        }

        // Create rocks
        function createRocks() {
            for (let i = 0; i < 100; i++) {
                const x = (Math.random() - 0.5) * GAME.mapSize;
                const z = (Math.random() - 0.5) * GAME.mapSize;
                const terrainY = getTerrainHeight(x, z);
                if (terrainY < 0) continue;
                const size = 1 + Math.random() * 3;

                const rockGeometry = new THREE.DodecahedronGeometry(size, 0);
                const rockMaterial = new THREE.MeshStandardMaterial({
                    color: 0x808080,
                    roughness: 0.95,
                    metalness: 0.1,
                    flatShading: true
                });
                const rock = new THREE.Mesh(rockGeometry, rockMaterial);
                rock.position.set(x, terrainY + size / 2, z);
                rock.rotation.set(Math.random(), Math.random(), Math.random());
                rock.castShadow = true;
                rock.receiveShadow = true;
                GAME.scene.add(rock);
            }
        }

        // Create water
        function createWater() {
            const waterGeometry = new THREE.PlaneGeometry(200, 200);
            const waterMaterial = new THREE.MeshStandardMaterial({
                color: 0x1E90FF,
                transparent: true,
                opacity: 0.7,
                roughness: 0.1,
                metalness: 0.5
            });
            const water = new THREE.Mesh(waterGeometry, waterMaterial);
            water.rotation.x = -Math.PI / 2;
            water.position.set(0, -0.1, 0);
            water.receiveShadow = true;
            GAME.scene.add(water);
        }

        // Create food spawns
        function createFoodSpawns() {
            for (let i = 0; i < 50; i++) {
                const x = (Math.random() - 0.5) * GAME.mapSize;
                const z = (Math.random() - 0.5) * GAME.mapSize;
                const type = Math.random() < 0.4 ? 'berry' : 'meat';

                const geometry = new THREE.SphereGeometry(0.5, 8, 8);
                const material = new THREE.MeshStandardMaterial({
                    color: type === 'berry' ? 0x44ff44 : 0xff4444,
                    roughness: 0.8,
                    metalness: 0.1
                });
                const food = new THREE.Mesh(geometry, material);
                food.position.set(x, 0.5, z);
                food.castShadow = true;
                GAME.scene.add(food);

                GAME.food.set(`food_${i}`, food);
            }
        }

        // Create dinosaur model
        function createDinoModel(type, color) {
            const group = new THREE.Group();

            // Body
            const bodyGeometry = new THREE.BoxGeometry(4, 2, 6);
            const bodyMaterial = new THREE.MeshStandardMaterial({
                color: color || 0x8B4513,
                roughness: 0.8,
                metalness: 0.1
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.castShadow = true;
            group.add(body);

            // Head
            const headGeometry = new THREE.BoxGeometry(2, 1.5, 2);
            const headMaterial = new THREE.MeshStandardMaterial({
                color: color || 0x8B4513,
                roughness: 0.8,
                metalness: 0.1
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.set(0, 1.5, 4);
            head.castShadow = true;
            group.add(head);

            // Eye
            const eyeGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const eyeMaterial = new THREE.MeshStandardMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 0.5
            });
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(0.5, 1.8, 4.5);
            group.add(eye);

            const eye2 = eye.clone();
            eye2.position.set(-0.5, 1.8, 4.5);
            group.add(eye2);

            // Legs
            const legGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
            const legMaterial = new THREE.MeshStandardMaterial({
                color: color || 0x8B4513,
                roughness: 0.8,
                metalness: 0.1
            });

            const legPositions = [
                [1.2, -1, 1.5],
                [-1.2, -1, 1.5],
                [1.2, -1, -1.5],
                [-1.2, -1, -1.5]
            ];

            legPositions.forEach(pos => {
                const leg = new THREE.Mesh(legGeometry, legMaterial);
                leg.position.set(...pos);
                leg.castShadow = true;
                group.add(leg);
            });

            // Tail
            const tailGeometry = new THREE.CylinderGeometry(0.5, 0.2, 8, 8);
            const tailMaterial = new THREE.MeshStandardMaterial({
                color: color || 0x8B4513,
                roughness: 0.8,
                metalness: 0.1
            });
            const tail = new THREE.Mesh(tailGeometry, tailMaterial);
            tail.position.set(0, 0, -6);
            tail.rotation.x = Math.PI / 4;
            tail.castShadow = true;
            group.add(tail);

            // Teeth
            const teethGeometry = new THREE.ConeGeometry(0.1, 0.3, 4);
            const teethMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.5,
                metalness: 0.3
            });

            for (let i = -2; i <= 2; i++) {
                const tooth = new THREE.Mesh(teethGeometry, teethMaterial);
                tooth.position.set(i * 0.3, 1.2, 5);
                group.add(tooth);
            }

            group.scale.setScalar(0.5);
            return group;
        }

        // Connect to WebSocket
        function connectWS() {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const jd = window.__dinoJoinData || {};
    const token = jd.token || localStorage.getItem('dino_token') || '';
    GAME.ws = new WebSocket(`${protocol}//${window.location.hostname}:2122?token=${encodeURIComponent(token)}`);

            GAME.ws.onopen = () => {
                console.log('Connected to server');
                // Send join message
                GAME.ws.send(JSON.stringify({
                    type: 'join',
                    dinosaurId: GAME.selectedDino,
                    name: GAME.playerName
                }));
            };

            GAME.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                handleServerMessage(data);
            };

            GAME.ws.onclose = () => {
                console.log('Disconnected from server');
            };
        }

        // Handle server messages
        function handleServerMessage(data) {
            if (data.type === 'joined') {
                GAME.player = {
                    id: data.playerId,
                    name: GAME.playerName,
                    dinosaurId: data.dinosaur,
                    position: data.position,
                    rotation: data.rotation,
                    health: 100,
                    stamina: 100,
                    hunger: 100,
                    thirst: 100,
                    isSprinting: false,
                    isDead: false,
                    isAttacking: false,
                    isRiding: false,
                    isEating: false,
                    kills: 0
                };
                updateHUD();

                // Create player dinosaur model
                const dinoModel = createDinoModel(data.dinosaur.id, data.dinosaur.color);
                GAME.scene.add(dinoModel);
                GAME.player.dinoModel = dinoModel;
            }

            if (data.type === 'weather_update') {
                GAME.weather = data.weather;
                GAME.temperature = data.temperature;
                GAME.wind = data.wind;
                if (document.getElementById('hud-weather')) {
                    const icons = { clear:'☀️', cloudy:'☁️', rain:'🌧️', storm:'⛈️', fog:'🌫️', snow:'🌨️', heatwave:'🔥' };
                    document.getElementById('hud-weather').textContent =
                        (icons[data.weather] || '☀️') + ' ' +
                        (data.temperature || 25) + '°C';
                }
                return;
            }
            if (data.type === 'world_state') {
                // Update all dinosaurs
                data.dinosaurs.forEach(d => {
                    if (GAME.npcs.has(d.id)) {
                        const existing = GAME.npcs.get(d.id);
                        existing.position.x = d.position.x;
                        existing.position.z = d.position.z;
                        existing.rotation = d.rotation;
                        existing.health = d.health;
                        existing.stamina = d.stamina;
                        existing.hunger = d.hunger;
                        existing.thirst = d.thirst;
                    } else {
                        const dinoModel = createDinoModel(d.dinosaurId, d.color);
                        dinoModel.position.set(d.position.x, d.position.y, d.position.z);
                        dinoModel.rotation.y = d.rotation;
                        GAME.scene.add(dinoModel);
                        GAME.npcs.set(d.id, dinoModel);
                    }
                });

                // Update other players
                data.players.forEach(p => {
                    if (GAME.otherPlayers.has(p.id)) {
                        const existing = GAME.otherPlayers.get(p.id);
                        existing.position.x = p.position.x;
                        existing.position.z = p.position.z;
                        existing.rotation = p.rotation;
                        existing.health = p.health;
                    } else {
                        const dinoModel = createDinoModel(p.dinosaurId, p.color);
                        dinoModel.position.set(p.position.x, p.position.y, p.position.z);
                        dinoModel.rotation.y = p.rotation;
                        GAME.scene.add(dinoModel);
                        GAME.otherPlayers.set(p.id, dinoModel);
                    }
                });

                // Update food
                data.food.forEach(f => {
                    if (GAME.food.has(f.id)) {
                        const existing = GAME.food.get(f.id);
                        existing.position.x = f.position.x;
                        existing.position.z = f.position.z;
                    } else {
                        const foodModel = createFoodModel(f.type);
                        foodModel.position.set(f.position.x, f.position.y, f.position.z);
                        GAME.scene.add(foodModel);
                        GAME.food.set(f.id, foodModel);
                    }
                });

                // Update water
                data.water.forEach(w => {
                    if (!GAME.water.has(w.id)) {
                        const waterModel = createWaterModel(w.id, w.position);
                        GAME.water.set(w.id, waterModel);
                    }
                });

                // Update counts
                document.getElementById('playerCount').textContent = data.players.length;
                document.getElementById('dinoCount').textContent = data.dinosaurs.length;
            }

            if (data.type === 'update') {
                // Update all players
                data.players.forEach(p => {
                    if (p.id === GAME.player.id) {
                        GAME.player.position = p.position;
                        GAME.player.rotation = p.rotation;
                        GAME.player.health = p.health;
                        GAME.player.stamina = p.stamina;
                        GAME.player.hunger = p.hunger;
                        GAME.player.thirst = p.thirst;
                        GAME.player.isSprinting = p.isSprinting;
                        GAME.player.isDead = p.isDead;
                        GAME.player.isAttacking = p.isAttacking;
                        GAME.player.isRiding = p.isRiding;
                        GAME.player.isEating = p.isEating;
                    }
                });

                // Update all dinosaurs
                data.dinosaurs.forEach(d => {
                    if (GAME.npcs.has(d.id)) {
                        const existing = GAME.npcs.get(d.id);
                        existing.position.x = d.position.x;
                        existing.position.z = d.position.z;
                        existing.rotation = d.rotation;
                        existing.health = d.health;
                        existing.stamina = d.stamina;
                        existing.hunger = d.hunger;
                        existing.thirst = d.thirst;
                    }
                });

                // Update food
                data.food.forEach(f => {
                    if (GAME.food.has(f.id)) {
                        const existing = GAME.food.get(f.id);
                        existing.position.x = f.position.x;
                        existing.position.z = f.position.z;
                    }
                });

                // Update water
                data.water.forEach(w => {
                    if (GAME.water.has(w.id)) {
                        const existing = GAME.water.get(w.id);
                        existing.position.x = w.position.x;
                        existing.position.z = w.position.z;
                    }
                });

                updateHUD();
            }
        }

        // Create food model
        function createFoodModel(type) {
            const color = type === 'berry' ? 0x44ff44 : 0xff4444;
            const geometry = new THREE.SphereGeometry(0.5, 8, 8);
            const material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.8,
                metalness: 0.1
            });
            const food = new THREE.Mesh(geometry, material);
            food.castShadow = true;
            return food;
        }

        // Create water model
        function createWaterModel(id, position) {
            const geometry = new THREE.PlaneGeometry(10, 10);
            const material = new THREE.MeshStandardMaterial({
                color: 0x1E90FF,
                transparent: true,
                opacity: 0.7,
                roughness: 0.1,
                metalness: 0.5
            });
            const water = new THREE.Mesh(geometry, material);
            water.rotation.x = -Math.PI / 2;
            water.position.set(position.x, -0.1, position.z);
            return water;
        }

        // Update HUD
        function updateHUD() {
            if (!GAME.player) return;

            const dino = GAME.player.dinosaurId;
            document.getElementById('dinoName').textContent = dino.name || dino.id;
            document.getElementById('healthStat').textContent = Math.round(GAME.player.health);
            document.getElementById('staminaStat').textContent = Math.round(GAME.player.stamina);
            document.getElementById('hungerStat').textContent = Math.round(GAME.player.hunger);
            document.getElementById('thirstStat').textContent = Math.round(GAME.player.thirst);

            document.getElementById('healthFill').style.width = `${(GAME.player.health / dino.maxHealth) * 100}%`;
            document.getElementById('staminaFill').style.width = `${(GAME.player.stamina / dino.maxStamina) * 100}%`;
            document.getElementById('hungerFill').style.width = `${(GAME.player.hunger / dino.maxHunger) * 100}%`;
            document.getElementById('thirstFill').style.width = `${(GAME.player.thirst / dino.maxThirst) * 100}%`;
            document.getElementById('sprintFill').style.width = `${(GAME.player.stamina / dino.maxStamina) * 100}%`;

            // Update inventory
            document.getElementById('meatCount').textContent = GAME.inventory.meat;
            document.getElementById('berryCount').textContent = GAME.inventory.berry;
            document.getElementById('fishCount').textContent = GAME.inventory.fish;
            document.getElementById('insectCount').textContent = GAME.inventory.insect;
        }

        // Start game
        function startGame() { try { initGameFromAuth(); } catch(e) { console.error(e); }
function startGameOld() {
            GAME.playerName = document.getElementById('playerName').value || 'Player';
            GAME.isPlaying = true;
            document.getElementById('menu').classList.add('hidden');
            document.getElementById('loading').classList.add('active');

            // Simulate loading
            let progress = 0;
            const loadInterval = setInterval(() => {
                progress += 5;
                document.getElementById('loadingFill').style.width = `${progress}%`;
                if (progress >= 100) {
                    clearInterval(loadInterval);
                    document.getElementById('loading').classList.remove('active');
                    initThreeJS();
                    connectWS();
                    startGameLoop();
                }
            }, 100);
        }

        // Start game loop
        function startGameLoop() {
            const clock = new THREE.Clock();

            function animate() {
                requestAnimationFrame(animate);

                const delta = clock.getDelta();
                const elapsed = clock.getElapsedTime();

                // Update game logic
                update(delta, elapsed);

                // Update camera
                updateCamera();

                // Update weather effects
                updateWeatherEffects();

                // Update day/night cycle
                updateDayNight();

                // Render
                GAME.renderer.render(GAME.scene, GAME.camera);
            }

            animate();
        }

        // Update game logic
        function update(delta, elapsed) {
            if (!GAME.player) return;

            // Update position based on movement
            if (GAME.keys['KeyW']) {
                GAME.player.position.x += Math.sin(GAME.player.rotation * Math.PI / 180) * 0.1;
                GAME.player.position.z += Math.cos(GAME.player.rotation * Math.PI / 180) * 0.1;
            }
            if (GAME.keys['KeyS']) {
                GAME.player.position.x -= Math.sin(GAME.player.rotation * Math.PI / 180) * 0.1;
                GAME.player.position.z -= Math.cos(GAME.player.rotation * Math.PI / 180) * 0.1;
            }
            if (GAME.keys['KeyA']) {
                GAME.player.position.x += Math.cos(GAME.player.rotation * Math.PI / 180) * 0.1;
                GAME.player.position.z -= Math.sin(GAME.player.rotation * Math.PI / 180) * 0.1;
            }
            if (GAME.keys['KeyD']) {
                GAME.player.position.x -= Math.cos(GAME.player.rotation * Math.PI / 180) * 0.1;
                GAME.player.position.z += Math.sin(GAME.player.rotation * Math.PI / 180) * 0.1;
            }

            // Update stamina while sprinting
            if (GAME.isSprinting) {
                GAME.player.stamina -= 0.5 * delta;
                if (GAME.player.stamina <= 0) {
                    GAME.player.stamina = 0;
                    GAME.isSprinting = false;
                }
            } else {
                GAME.player.stamina = Math.min(GAME.player.stamina + 0.3 * delta, GAME.player.dinosaurId.maxStamina);
            }

            // Update hunger
            GAME.player.hunger -= 0.1 * delta;
            if (GAME.player.hunger <= 0) {
                GAME.player.hunger = 0;
                GAME.player.health -= 0.1 * delta;
            }

            // Update thirst
            GAME.player.thirst -= 0.15 * delta;
            if (GAME.player.thirst <= 0) {
                GAME.player.thirst = 0;
                GAME.player.health -= 0.1 * delta;
            }

            // Health regen
            if (GAME.player.hunger > 50 && GAME.player.thirst > 50) {
                GAME.player.health = Math.min(GAME.player.health + 0.1 * delta, GAME.player.dinosaurId.maxHealth);
            }

            // Attack cooldown
            if (GAME.attackCooldown > 0) {
                GAME.attackCooldown -= delta;
            }

            // Eating timer
            if (GAME.isEating) {
                GAME.isEatingTimer -= delta;
                if (GAME.isEatingTimer <= 0) {
                    GAME.isEating = false;
                }
            }

            // Update dinosaur model position
            if (GAME.player.dinoModel) {
                GAME.player.dinoModel.position.x = GAME.player.position.x;
                GAME.player.dinoModel.position.z = GAME.player.position.z;
                GAME.player.dinoModel.rotation.y = GAME.player.rotation;

                // Animate legs
                const legAnim = Math.sin(elapsed * 10) * 0.3;
                GAME.player.dinoModel.children.forEach((child, i) => {
                    if (i >= 3 && i <= 6) { // Legs
                        child.position.y = -1 + Math.sin(elapsed * 10 + i * 0.5) * 0.2;
                    }
                });
            }

            // Update other dinosaurs
            GAME.npcs.forEach((dino, id) => {
                dino.position.x += Math.sin(elapsed * 0.5 + id.charCodeAt(0)) * 0.01;
                dino.position.z += Math.cos(elapsed * 0.5 + id.charCodeAt(0)) * 0.01;
                dino.rotation.y = elapsed * 0.1 + id.charCodeAt(0);
            });

            // Update food bobbing
            GAME.food.forEach((food, id) => {
                food.position.y = 0.5 + Math.sin(elapsed * 2 + id.charCodeAt(0)) * 0.2;
            });

            // Check death
            if (GAME.player.health <= 0) {
                GAME.isDead = true;
                document.getElementById('deathScreen').classList.add('active');
            }
        }

        // Update camera
        function updateCamera() {
            if (!GAME.player) return;

            // Third person camera
            const targetX = GAME.player.position.x + Math.sin(GAME.player.rotation * Math.PI / 180) * GAME.cameraDistance;
            const targetZ = GAME.player.position.z + Math.cos(GAME.player.rotation * Math.PI / 180) * GAME.cameraDistance;
            const targetY = 5 + GAME.cameraAngle.y * 10;

            GAME.camera.position.x += (targetX - GAME.camera.position.x) * 0.1;
            GAME.camera.position.y += (targetY - GAME.camera.position.y) * 0.1;
            GAME.camera.position.z += (targetZ - GAME.camera.position.z) * 0.1;
            GAME.camera.lookAt(GAME.player.position.x, GAME.player.position.y, GAME.player.position.z);
        }

        // Update weather effects
        function updateWeatherEffects() {
            if (GAME.weather === 'rain') {
                document.getElementById('rainEffect').classList.add('active');
                document.getElementById('fogEffect').classList.add('active');
            } else {
                document.getElementById('rainEffect').classList.remove('active');
                document.getElementById('fogEffect').classList.remove('active');
            }
        }

        // Update day/night cycle
        function updateDayNight() {
            const dayProgress = (GAME.dayTime % GAME.dayLength) / GAME.dayLength;
            const isDay = dayProgress < 0.5;
            const dayIntensity = isDay ? 1 - dayProgress * 2 : (dayProgress - 0.5) * 2;

            // Update lighting
            GAME.scene.children.forEach(child => {
                if (child instanceof THREE.DirectionalLight) {
                    child.intensity = dayIntensity * 1;
                    child.position.y = dayIntensity * 100;
                }
            });

            // Update sky color
            const skyColor = new THREE.Color();
            skyColor.setHSL(0.6, 0.5, dayIntensity * 0.5);
            GAME.renderer.setClearColor(skyColor);

            // Update indicator
            const dayNightEl = document.getElementById('dayNight');
            if (isDay) {
                dayNightEl.innerHTML = '☀️ Dia';
            } else {
                dayNightEl.innerHTML = '🌙 Noite';
            }

            // Update temperature
            const temp = 20 + dayIntensity * 15;
            document.getElementById('temperature').textContent = `${Math.round(temp)}°C`;
        }

        // Handle keyboard events
        document.addEventListener('keydown', (e) => {
            GAME.keys[e.code] = true;

            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                GAME.isSprinting = true;
            }

            if (e.code === 'KeyE') {
                attack();
            }

            if (e.code === 'KeyF') {
                eatOrDrink();
            }

            if (e.code === 'KeyR') {
                rideDino();
            }

            if (e.code === 'Escape') {
                toggleMenu();
            }

            if (e.code === 'KeyM') {
                toggleMinimap();
            }

            if (e.code === 'KeyI') {
                toggleInventory();
            }

            if (e.code === 'Tab') {
                toggleLeaderboard();
            }

            if (e.code === 'Enter') {
                const chatInput = document.getElementById('chatInput');
                if (chatInput === document.activeElement) {
                    sendChat();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            GAME.keys[e.code] = false;

            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                GAME.isSprinting = false;
            }
        });

        // Handle mouse events
        document.addEventListener('mousemove', (e) => {
            if (GAME.mouse.isPointerLocked) {
                GAME.cameraAngle.x -= e.movementX * 0.005;
                GAME.cameraAngle.y = Math.max(0.1, Math.min(1.5, GAME.cameraAngle.y - e.movementY * 0.005));
            }
        });

        // Attack
        function attack() {
            if (!GAME.player || GAME.isDead || GAME.attackCooldown > 0) return;

            GAME.isAttacking = true;
            GAME.attackCooldown = GAME.player.dinosaurId.attackCooldown;

            document.getElementById('attackIndicator').classList.add('active');

            // Find nearest target
            let nearestTarget = null;
            let minDist = 5;

            GAME.npcs.forEach((dino, id) => {
                if (id === GAME.player.id) return;
                if (dino.health <= 0) return;
                const dist = Math.sqrt(
                    Math.pow(dino.position.x - GAME.player.position.x, 2) +
                    Math.pow(dino.position.z - GAME.player.position.z, 2)
                );
                if (dist < minDist) {
                    minDist = dist;
                    nearestTarget = { id, dino };
                }
            });

            if (nearestTarget) {
                nearestTarget.dino.health -= GAME.player.dinosaurId.attackDamage;
                if (nearestTarget.dino.health <= 0) {
                    GAME.player.kills++;
                    // Drop food
                    const meatId = `meat_${Date.now()}`;
                    const food = createFoodModel('meat');
                    food.position.set(nearestTarget.dino.position.x, 0.5, nearestTarget.dino.position.z);
                    GAME.scene.add(food);
                    GAME.food.set(meatId, food);
                    GAME.inventory.meat += 50;
                }
            }

            setTimeout(() => {
                GAME.isAttacking = false;
                document.getElementById('attackIndicator').classList.remove('active');
            }, GAME.player.dinosaurId.attackCooldown * 1000);
        }

        // Eat or drink
        function eatOrDrink() {
            if (!GAME.player) return;

            // Find nearby food
            let nearestFood = null;
            let minDist = 3;

            GAME.food.forEach((food, id) => {
                const dist = Math.sqrt(
                    Math.pow(food.position.x - GAME.player.position.x, 2) +
                    Math.pow(food.position.z - GAME.player.position.z, 2)
                );
                if (dist < minDist) {
                    minDist = dist;
                    nearestFood = { id, food };
                }
            });

            if (nearestFood) {
                GAME.isEating = true;
                GAME.isEatingTimer = 2;
                document.getElementById('eatIndicator').classList.add('active');

                // Eat food
                const food = nearestFood.food;
                if (food.type === 'meat') {
                    GAME.player.hunger = Math.min(GAME.player.hunger + 50, GAME.player.dinosaurId.maxHunger);
                    GAME.player.health = Math.min(GAME.player.health + 20, GAME.player.dinosaurId.maxHealth);
                } else if (food.type === 'berry') {
                    GAME.player.hunger = Math.min(GAME.player.hunger + 30, GAME.player.dinosaurId.maxHunger);
                }

                GAME.food.delete(nearestFood.id);
                GAME.scene.remove(food);

                setTimeout(() => {
                    GAME.isEating = false;
                    document.getElementById('eatIndicator').classList.remove('active');
                }, 2000);
            }

            // Find nearby water
            let nearestWater = null;
            minDist = 5;

            GAME.water.forEach((water, id) => {
                const dist = Math.sqrt(
                    Math.pow(water.position.x - GAME.player.position.x, 2) +
                    Math.pow(water.position.z - GAME.player.position.z, 2)
                );
                if (dist < minDist) {
                    minDist = dist;
                    nearestWater = { id, water };
                }
            });

            if (nearestWater) {
                GAME.player.thirst = Math.min(GAME.player.thirst + 20, GAME.player.dinosaurId.maxThirst);
            }
        }

        // Ride dinosaur
        function rideDino() {
            if (!GAME.player) return;

            // Find nearby dinosaur to ride
            let nearestDino = null;
            let minDist = 5;

            GAME.npcs.forEach((dino, id) => {
                if (id === GAME.player.id) return;
                if (dino.health <= 0) return;
                const dist = Math.sqrt(
                    Math.pow(dino.position.x - GAME.player.position.x, 2) +
                    Math.pow(dino.position.z - GAME.player.position.z, 2)
                );
                if (dist < minDist) {
                    minDist = dist;
                    nearestDino = { id, dino };
                }
            });

            if (nearestDino) {
                GAME.isRiding = true;
                GAME.player.rideTarget = nearestDino.id;
            }
        }

        // Toggle menu
        function toggleMenu() {
            const menu = document.getElementById('menu');
            if (menu.classList.contains('hidden')) {
                menu.classList.remove('hidden');
            } else {
                menu.classList.add('hidden');
            }
        }

        // Toggle minimap
        function toggleMinimap() {
            const minimap = document.getElementById('minimap');
            minimap.style.display = minimap.style.display === 'none' ? 'block' : 'none';
        }

        // Toggle inventory
        function toggleInventory() {
            const inventory = document.getElementById('inventory');
            inventory.style.display = inventory.style.display === 'none' ? 'block' : 'none';
        }

        // Toggle leaderboard
        function toggleLeaderboard() {
            const leaderboard = document.getElementById('leaderboard');
            leaderboard.style.display = leaderboard.style.display === 'none' ? 'block' : 'none';
        }

        // Send chat message
        function sendChat() {
            const chatInput = document.getElementById('chatInput');
            const message = chatInput.value.trim();
            if (!message || !GAME.player) return;

            const chat = document.getElementById('chat');
            const msgEl = document.createElement('div');
            msgEl.className = 'chat-message';
            msgEl.innerHTML = `<strong>${GAME.player.name}:</strong> ${message}`;
            chat.appendChild(msgEl);
            chat.scrollTop = chat.scrollHeight;
            chatInput.value = '';

            // Send to server
            GAME.ws.send(JSON.stringify({
                type: 'chat',
                message: message,
                playerId: GAME.player.id
            }));
        }

        // Respawn
        function respawn() {
            GAME.isDead = false;
            GAME.player.health = GAME.player.dinosaurId.maxHealth;
            GAME.player.stamina = GAME.player.dinosaurId.maxStamina;
            GAME.player.hunger = GAME.player.dinosaurId.maxHunger;
            GAME.player.thirst = GAME.player.dinosaurId.maxThirst;
            document.getElementById('deathScreen').classList.remove('active');
        }

        // Select dinosaur
        function selectDino(dinoId) {
            GAME.selectedDino = dinoId;
            document.querySelectorAll('.dino-card').forEach(card => {
                card.classList.remove('selected');
            });
            document.querySelector(`[data-dino="${dinoId}"]`).classList.add('selected');

            // Enable start button if name is filled
            const nameInput = document.getElementById('playerName').value.trim();
            document.getElementById('startBtn').disabled = !nameInput;
        }

        // Select phylogeny
        function selectPhylo(phylo) {
            GAME.selectedPhylo = phylo;
            document.querySelectorAll('#phyloSelection .dino-card').forEach(card => {
                card.classList.remove('selected');
            });
            document.querySelector(`[data-phylo="${phylo}"]`).classList.add('selected');

            // Filter dinosaurs
            filterDinos();
        }

        // Filter dinosaurs
        function filterDinos() {
            const selection = document.getElementById('dinoSelection');
            selection.innerHTML = '';

            Object.values(DINOSAURS).forEach(dino => {
                if (GAME.selectedPhylo !== 'all' && dino.type !== GAME.selectedPhylo) return;

                const card = document.createElement('div');
                card.className = 'dino-card';
                card.dataset.dino = dino.id;
                card.onclick = () => selectDino(dino.id);

                const icon = document.createElement('div');
                icon.className = 'dino-icon';
                icon.style.background = `linear-gradient(135deg, ${dino.color}, ${dino.bodyColor})`;

                const name = document.createElement('div');
                name.className = 'dino-name';
                name.textContent = dino.name;

                const type = document.createElement('div');
                type.className = 'dino-type';
                type.textContent = dino.type === 'carnivore' ? 'Carnívoro' : 'Herbívoro';

                const tier = document.createElement('div');
                tier.className = 'dino-tier';
                tier.textContent = `Tier ${dino.tier}`;

                card.appendChild(icon);
                card.appendChild(name);
                card.appendChild(type);
                card.appendChild(tier);
                selection.appendChild(card);
            });
        }

        // Initialize
        document.getElementById('playerName').addEventListener('input', () => {
            const name = document.getElementById('playerName').value.trim();
            document.getElementById('startBtn').disabled = !name || !GAME.selectedDino;
        });

        // Populate dinosaurs
        function populateDinos() {
            const selection = document.getElementById('dinoSelection');
            Object.values(DINOSAURS).forEach(dino => {
                const card = document.createElement('div');
                card.className = 'dino-card';
                card.dataset.dino = dino.id;
                card.onclick = () => selectDino(dino.id);

                const icon = document.createElement('div');
                icon.className = 'dino-icon';
                icon.style.background = `linear-gradient(135deg, ${dino.color}, ${dino.bodyColor})`;

                const name = document.createElement('div');
                name.className = 'dino-name';
                name.textContent = dino.name;

                const type = document.createElement('div');
                type.className = 'dino-type';
                type.textContent = dino.type === 'carnivore' ? 'Carnívoro' : 'Herbívoro';

                const tier = document.createElement('div');
                tier.className = 'dino-tier';
                tier.textContent = `Tier ${dino.tier}`;

                card.appendChild(icon);
                card.appendChild(name);
                card.appendChild(type);
                card.appendChild(tier);
                selection.appendChild(card);
            });
        }

        // Initialize the game
        window.addEventListener('load', () => {
            populateDinos();
            filterDinos();
        });

        // Update minimap
        function updateMinimap() {
            const player = document.getElementById('minimapPlayer');
            if (!GAME.player) return;

            const minimap = document.getElementById('minimap');
            const minimapSize = 150;
            const mapScale = minimapSize / GAME.mapSize;

            // Player position
            player.style.left = `${minimapSize / 2 + GAME.player.position.x * mapScale}px`;
            player.style.top = `${minimapSize / 2 - GAME.player.position.z * mapScale}px`;

            // Dinosaur positions
            minimap.querySelectorAll('.minimap-dino').forEach(el => el.remove());
            GAME.npcs.forEach((dino, id) => {
                const dot = document.createElement('div');
                dot.className = 'minimap-dot minimap-dino';
                dot.style.left = `${minimapSize / 2 + dino.position.x * mapScale}px`;
                dot.style.top = `${minimapSize / 2 - dino.position.z * mapScale}px`;
                minimap.appendChild(dot);
            });

            // Food positions
            minimap.querySelectorAll('.minimap-food').forEach(el => el.remove());
            GAME.food.forEach((food, id) => {
                const dot = document.createElement('div');
                dot.className = 'minimap-dot minimap-food';
                dot.style.left = `${minimapSize / 2 + food.position.x * mapScale}px`;
                dot.style.top = `${minimapSize / 2 - food.position.z * mapScale}px`;
                minimap.appendChild(dot);
            });

            // Water positions
            minimap.querySelectorAll('.minimap-water').forEach(el => el.remove());
            GAME.water.forEach((water, id) => {
                const dot = document.createElement('div');
                dot.className = 'minimap-dot minimap-water';
                dot.style.left = `${minimapSize / 2 + water.position.x * mapScale}px`;
                dot.style.top = `${minimapSize / 2 - water.position.z * mapScale}px`;
                minimap.appendChild(dot);
            });
        }

        // Update ecosystem
        function updateEcosystem() {
            if (!GAME.player) return;

            let carnivores = 0;
            let herbivores = 0;
            let omnivores = 0;

            // Count other players
            GAME.otherPlayers.forEach((dino, id) => {
                const dinoData = DINOSAURS[dino.dinosaurId];
                if (dinoData.type === 'carnivore') carnivores++;
                else if (dinoData.type === 'herbivore') herbivores++;
                else omnivores++;
            });

            // Count NPCs
            GAME.npcs.forEach((dino, id) => {
                const dinoData = DINOSAURS[dino.dinosaurId];
                if (dinoData.type === 'carnivore') carnivores++;
                else if (dinoData.type === 'herbivore') herbivores++;
                else omnivores++;
            });

            document.getElementById('carnivoreCount').textContent = carnivores;
            document.getElementById('herbivoreCount').textContent = herbivores;
            document.getElementById('omnivoreCount').textContent = omnivores;
        }

        // Update food count
        function updateFoodCount() {
            let meat = 0, berry = 0, fish = 0;

            GAME.food.forEach((food, id) => {
                if (food.type === 'meat') meat++;
                else if (food.type === 'berry') berry++;
                else if (food.type === 'fish') fish++;
            });

            document.getElementById('foodCountValue').textContent = meat;
            document.getElementById('berryCountValue').textContent = berry;
            document.getElementById('fishCountValue').textContent = fish;
        }

        // Update sounds
        function updateSounds() {
            if (!GAME.sounds.enabled) {
                // Disable all sounds
                return;
            }

            // Footsteps
            if (GAME.keys['KeyW'] || GAME.keys['KeyA'] || GAME.keys['KeyS'] || GAME.keys['KeyD']) {
                if (!GAME.sounds.footsteps) {
                    // Create footsteps sound
                    GAME.sounds.footsteps = new Audio();
                    GAME.sounds.footsteps.volume = 0.3;
                }
            }
        }

        // Toggle sound
        function toggleSound() {
            GAME.sounds.enabled = !GAME.sounds.enabled;
            document.getElementById('soundToggle').textContent = GAME.sounds.enabled ? '🔊' : '🔇';
        }

        // Start game loop for updates
        setInterval(() => {
            if (GAME.isPlaying) {
                updateMinimap();
                updateEcosystem();
                updateFoodCount();
                updateSounds();
            }
        }, 1000);

        // Toggle settings
        function toggleSettings() {
            const settings = document.getElementById('settings');
            settings.classList.toggle('active');
        }

        // Close settings when clicking outside
        document.addEventListener('click', (e) => {
            const settings = document.getElementById('settings');
            const settingsBtn = document.getElementById('settingsBtn');
            if (!settings.contains(e.target) && e.target !== settingsBtn) {
                settings.classList.remove('active');
            }
        });

        // Handle sound toggle
        document.getElementById('soundToggle').addEventListener('click', toggleSound);

        // Handle settings toggle
        document.getElementById('settingsBtn')?.addEventListener('click', toggleSettings);

        // Handle sensitivity change
        document.getElementById('sensitivity')?.addEventListener('change', (e) => {
            const sensitivity = e.target.value / 5;
            // Apply sensitivity to camera
        });

        // Handle volume change
        document.getElementById('volume')?.addEventListener('change', (e) => {
            GAME.sounds.volume = e.target.value / 100;
        });

        // Handle distance change
        document.getElementById('distance')?.addEventListener('change', (e) => {
            GAME.cameraDistance = e.target.value / 5;
        });

        // Pointer lock for camera control
        document.addEventListener('click', (e) => {
            if (GAME.isPlaying && !GAME.mouse.isPointerLocked) {
                GAME.renderer.domElement.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            GAME.mouse.isPointerLocked = document.pointerLockElement === GAME.renderer.domElement;
        });

        // Handle wheel for camera distance
        document.addEventListener('wheel', (e) => {
            if (GAME.isPlaying) {
                GAME.cameraDistance += e.deltaY * 0.01;
                GAME.cameraDistance = Math.max(5, Math.min(30, GAME.cameraDistance));
            }
        });

        // Handle context menu
        document.addEventListener('contextmenu', (e) => e.preventDefault());

        // Handle mouse click for attack
        document.addEventListener('click', (e) => {
            if (GAME.isPlaying && e.target !== document.getElementById('menu')) {
                attack();
            }
        });

        // Handle mouse movement for camera
        document.addEventListener('mousemove', (e) => {
            if (GAME.isPlaying && GAME.mouse.isPointerLocked) {
                // Rotate camera based on mouse movement
                GAME.cameraAngle.x -= e.movementX * 0.005;
                GAME.cameraAngle.y = Math.max(0.1, Math.min(1.5, GAME.cameraAngle.y - e.movementY * 0.005));
            }
        });

        // Handle pointer lock events
        document.addEventListener('pointerlockchange', () => {
            GAME.mouse.isPointerLocked = document.pointerLockElement === GAME.renderer.domElement;
        });

        // Handle pointer lock error
        document.addEventListener('pointerlockerror', (e) => {
            console.error('Pointer lock failed:', e);
        });

        // Handle window focus
        window.addEventListener('focus', () => {
            if (GAME.isPlaying) {
                GAME.renderer.domElement.requestPointerLock();
            }
        });

        // Handle visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause game when tab is hidden
                GAME.isPlaying = false;
            } else {
                // Resume game when tab is visible
                GAME.isPlaying = true;
            }
        });

        // Handle audio context
        function initAudio() {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create attack sound
            GAME.sounds.attack = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0.3;
            GAME.sounds.attack.connect(gainNode);
            gainNode.connect(audioContext.destination);
            GAME.sounds.attack.start();
        }

        // Initialize audio on user interaction
        document.addEventListener('click', () => {
            initAudio();
        });

        // Handle resize
        window.addEventListener('resize', () => {
            if (GAME.camera) {
                GAME.camera.aspect = window.innerWidth / window.innerHeight;
                GAME.camera.updateProjectionMatrix();
                GAME.renderer.setSize(window.innerWidth, window.innerHeight);
            }
        });

        // Handle game over
        function handleGameOver(cause) {
            GAME.isDead = true;
            document.getElementById('deathScreen').classList.add('active');
            document.getElementById('deathCause').textContent = cause;
        }

        // Handle player death
        function handlePlayerDeath(cause) {
            handleGameOver(cause);
        }

        // Handle NPC death
        function handleNPCDeath(id) {
            GAME.npcs.delete(id);
        }

        // Handle food eaten
        function handleFoodEaten(id) {
            GAME.food.delete(id);
        }

        // Handle player join
        function handlePlayerJoin(playerId) {
            const newPlayer = createNewPlayer();
            GAME.otherPlayers.set(playerId, newPlayer);
        }

        // Handle player leave
        function handlePlayerLeave(playerId) {
            GAME.otherPlayers.delete(playerId);
        }

        // Handle player death
        function handlePlayerDeath(playerId) {
            const player = GAME.otherPlayers.get(playerId);
            if (player) {
                player.isDead = true;
            }
        }

        // Handle chat message
        function handleChatMessage(playerId, message) {
            const player = GAME.otherPlayers.get(playerId);
            if (player) {
                const chat = document.getElementById('chat');
                const msgEl = document.createElement('div');
                msgEl.className = 'chat-message';
                msgEl.innerHTML = `<strong>${player.name}:</strong> ${message}`;
                chat.appendChild(msgEl);
                chat.scrollTop = chat.scrollHeight;
            }
        }

        // Handle world state update
        function handleWorldStateUpdate(data) {
            // Update all players
            data.players.forEach(p => {
                if (GAME.otherPlayers.has(p.id)) {
                    const existing = GAME.otherPlayers.get(p.id);
                    existing.position.x = p.position.x;
                    existing.position.z = p.position.z;
                    existing.rotation = p.rotation;
                    existing.health = p.health;
                }
            });

            // Update all dinosaurs
            data.dinosaurs.forEach(d => {
                if (GAME.npcs.has(d.id)) {
                    const existing = GAME.npcs.get(d.id);
                    existing.position.x = d.position.x;
                    existing.position.z = d.position.z;
                    existing.rotation = d.rotation;
                    existing.health = d.health;
                }
            });

            // Update food
            data.food.forEach(f => {
                if (GAME.food.has(f.id)) {
                    const existing = GAME.food.get(f.id);
                    existing.position.x = f.position.x;
                    existing.position.z = f.position.z;
                }
            });

            // Update water
            data.water.forEach(w => {
                if (GAME.water.has(w.id)) {
                    const existing = GAME.water.get(w.id);
                    existing.position.x = w.position.x;
                    existing.position.z = w.position.z;
                }
            });

            // Update counts
            document.getElementById('playerCount').textContent = data.players.length;
            document.getElementById('dinoCount').textContent = data.dinosaurs.length;
        }

        // Handle update message
        function handleUpdateMessage(data) {
            // Update all players
            data.players.forEach(p => {
                if (GAME.otherPlayers.has(p.id)) {
                    const existing = GAME.otherPlayers.get(p.id);
                    existing.position.x = p.position.x;
                    existing.position.z = p.position.z;
                    existing.rotation = p.rotation;
                    existing.health = p.health;
                }
            });

            // Update all dinosaurs
            data.dinosaurs.forEach(d => {
                if (GAME.npcs.has(d.id)) {
                    const existing = GAME.npcs.get(d.id);
                    existing.position.x = d.position.x;
                    existing.position.z = d.position.z;
                    existing.rotation = d.rotation;
                    existing.health = d.health;
                }
            });

            // Update food
            data.food.forEach(f => {
                if (GAME.food.has(f.id)) {
                    const existing = GAME.food.get(f.id);
                    existing.position.x = f.position.x;
                    existing.position.z = f.position.z;
                }
            });

            // Update water
            data.water.forEach(w => {
                if (GAME.water.has(w.id)) {
                    const existing = GAME.water.get(w.id);
                    existing.position.x = w.position.x;
                    existing.position.z = w.position.z;
                }
            });

            updateHUD();
        }

        // Handle player removed
        function handlePlayerRemoved(playerId) {
            GAME.otherPlayers.delete(playerId);
        }

        // Handle weather change
        function handleWeatherChange(weather) {
            GAME.weather = weather;
            const weatherEl = document.getElementById('weather');

            switch (weather) {
                case 'clear':
                    weatherEl.innerHTML = '☀️ Claro';
                    break;
                case 'rain':
                    weatherEl.innerHTML = '🌧️ Chuva';
                    break;
                case 'storm':
                    weatherEl.innerHTML = '⛈️ Tempestade';
                    break;
                case 'fog':
                    weatherEl.innerHTML = '🌫️ Neblina';
                    break;
                case 'snow':
                    weatherEl.innerHTML = '❄️ Neve';
                    break;
            }
        }

        // Handle temperature change
        function handleTemperatureChange(temp) {
            GAME.temperature = temp;
            document.getElementById('temperature').textContent = `${Math.round(temp)}°C`;
        }

        // Handle day/night change
        function handleDayNightChange(isDay) {
            const dayNightEl = document.getElementById('dayNight');
            if (isDay) {
                dayNightEl.innerHTML = '☀️ Dia';
            } else {
                dayNightEl.innerHTML = '🌙 Noite';
            }
        }

        // Handle food spawn
        function handleFoodSpawn(foodId, type, position) {
            const food = createFoodModel(type);
            food.position.set(position.x, position.y, position.z);
            GAME.scene.add(food);
            GAME.food.set(foodId, food);
        }

        // Handle water spawn
        function handleWaterSpawn(waterId, position) {
            const water = createWaterModel(waterId, position);
            GAME.water.set(waterId, water);
        }

        // Handle NPC spawn
        function handleNPCSpawn(npcId, dinosaurId, position) {
            const dinoModel = createDinoModel(dinosaurId, DINOSAURS[dinosaurId].color);
            dinoModel.position.set(position.x, position.y, position.z);
            GAME.scene.add(dinoModel);
            GAME.npcs.set(npcId, dinoModel);
        }

        // Handle NPC death
        function handleNPCDeath(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                GAME.scene.remove(npc);
                GAME.npcs.delete(npcId);
            }
        }

        // Handle NPC movement
        function handleNPCMovement(npcId, position, rotation) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.position.x = position.x;
                npc.position.z = position.z;
                npc.rotation.y = rotation;
            }
        }

        // Handle NPC attack
        function handleNPCAttack(npcId, targetId, damage) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isAttacking = true;
                setTimeout(() => {
                    npc.isAttacking = false;
                }, 1000);
            }
        }

        // Handle NPC eating
        function handleNPCEating(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isEating = true;
                setTimeout(() => {
                    npc.isEating = false;
                }, 2000);
            }
        }

        // Handle NPC drinking
        function handleNPCDrinking(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isDrinking = true;
                setTimeout(() => {
                    npc.isDrinking = false;
                }, 2000);
            }
        }

        // Handle NPC fleeing
        function handleNPCFleeing(npcId, targetPosition) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isFleeing = true;
                npc.fleeTarget = targetPosition;
                setTimeout(() => {
                    npc.isFleeing = false;
                }, 5000);
            }
        }

        // Handle NPC hunting
        function handleNPCHunting(npcId, targetId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isHunting = true;
                npc.huntTarget = targetId;
            }
        }

        // Handle NPC idle
        function handleNPCIdle(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isIdle = true;
                npc.idleTimer = 3 + Math.random() * 3;
            }
        }

        // Handle NPC wandering
        function handleNPCWandering(npcId, position) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isWandering = true;
                npc.wanderTarget = position;
                npc.wanderTimer = 3 + Math.random() * 3;
            }
        }

        // Handle NPC attacking another NPC
        function handleNPCAttackNPC(npcId, targetId, damage) {
            const npc = GAME.npcs.get(npcId);
            const target = GAME.npcs.get(targetId);
            if (npc && target) {
                npc.isAttacking = true;
                target.health -= damage;
                if (target.health <= 0) {
                    handleNPCDeath(targetId);
                }
                setTimeout(() => {
                    npc.isAttacking = false;
                }, 1000);
            }
        }

        // Handle NPC being eaten
        function handleNPCBeingEaten(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isBeingEaten = true;
                setTimeout(() => {
                    npc.isBeingEaten = false;
                }, 2000);
            }
        }

        // Handle NPC being attacked
        function handleNPCBeingAttacked(npcId, attackerId, damage) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.health -= damage;
                if (npc.health <= 0) {
                    handleNPCDeath(npcId);
                }
            }
        }

        // Handle NPC being ridden
        function handleNPCBeingRidden(npcId, riderId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isRidden = true;
                npc.riddenBy = riderId;
            }
        }

        // Handle NPC stopping being ridden
        function handleNPCStoppingBeingRidden(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isRidden = false;
                npc.riddenBy = null;
            }
        }

        // Handle NPC spawning
        function handleNPCSpawning(npcId, dinosaurId, position) {
            handleNPCSpawn(npcId, dinosaurId, position);
        }

        // Handle NPC despawning
        function handleNPCDespawning(npcId) {
            handleNPCDeath(npcId);
        }

        // Handle NPC health change
        function handleNPCHealthChange(npcId, health) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.health = health;
            }
        }

        // Handle NPC stamina change
        function handleNPCStaminaChange(npcId, stamina) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.stamina = stamina;
            }
        }

        // Handle NPC hunger change
        function handleNPCHungerChange(npcId, hunger) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.hunger = hunger;
            }
        }

        // Handle NPC thirst change
        function handleNPCThirstChange(npcId, thirst) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.thirst = thirst;
            }
        }

        // Handle NPC sprinting
        function handleNPCKicking(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isKicking = true;
                setTimeout(() => {
                    npc.isKicking = false;
                }, 500);
            }
        }

        // Handle NPC roaring
        function handleNPCRoaring(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isRoaring = true;
                setTimeout(() => {
                    npc.isRoaring = false;
                }, 2000);
            }
        }

        // Handle NPC hissing
        function handleNPCHisssing(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isHissing = true;
                setTimeout(() => {
                    npc.isHissing = false;
                }, 1000);
            }
        }

        // Handle NPC chirping
        function handleNPCChirping(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isChirping = true;
                setTimeout(() => {
                    npc.isChirping = false;
                }, 1000);
            }
        }

        // Handle NPC growling
        function handleNPCGrowling(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isGrowling = true;
                setTimeout(() => {
                    npc.isGrowling = false;
                }, 1500);
            }
        }

        // Handle NPC snarling
        function handleNPCSnarling(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isSnarling = true;
                setTimeout(() => {
                    npc.isSnarling = false;
                }, 1000);
            }
        }

        // Handle NPC whimpering
        function handleNPCWhimpering(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isWhimpering = true;
                setTimeout(() => {
                    npc.isWhimpering = false;
                }, 2000);
            }
        }

        // Handle NPC panting
        function handleNPCPanting(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isPanting = true;
                npc.pantingTimer = 5 + Math.random() * 5;
            }
        }

        // Handle NPC yawning
        function handleNPCYawning(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isYawning = true;
                npc.yawningTimer = 3 + Math.random() * 3;
            }
        }

        // Handle NPC snorting
        function handleNPCSnorting(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isSnorting = true;
                npc.snortingTimer = 2 + Math.random() * 2;
            }
        }

        // Handle NPC bellowing
        function handleNPCBellowing(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isBellowing = true;
                npc.bellowingTimer = 5 + Math.random() * 5;
            }
        }

        // Handle NPC clicking
        function handleNPCClicking(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isClicking = true;
                npc.clickingTimer = 2 + Math.random() * 2;
            }
        }

        // Handle NPC croaking
        function handleNPCCroaking(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isCroaking = true;
                npc.croakingTimer = 3 + Math.random() * 3;
            }
        }

        // Handle NPC croaking
        function handleNPCCroaking(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isCroaking = true;
                npc.croakingTimer = 3 + Math.random() * 3;
            }
        }

        // Handle NPC croaking
        function handleNPCCroaking(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isCroaking = true;
                npc.croakingTimer = 3 + Math.random() * 3;
            }
        }

        // Handle NPC croaking
        function handleNPCCroaking(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isCroaking = true;
                npc.croakingTimer = 3 + Math.random() * 3;
            }
        }

        // Handle NPC croaking
        function handleNPCCroaking(npcId) {
            const npc = GAME.npcs.get(npcId);
            if (npc) {
                npc.isCroaking = true;
                npc.croakingTimer = 3 + Math.random() * 3;
            }
        }
