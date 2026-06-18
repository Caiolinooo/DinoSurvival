class Noise {
    constructor(seed = 42) {
        this.seed = seed;
        this.perm = new Uint8Array(512);
        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) p[i] = i;
        let n, q;
        let s = seed;
        for (let i = 255; i > 0; i--) {
            s = (s * 16807 + 0) % 2147483647;
            n = (s % (i + 1) + i + 1) % (i + 1);
            q = p[i]; p[i] = p[n]; p[n] = q;
        }
        for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
    }

    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(t, a, b) { return a + t * (b - a); }
    grad(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise2D(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        const u = this.fade(xf);
        const v = this.fade(yf);
        const aa = this.perm[this.perm[X] + Y];
        const ab = this.perm[this.perm[X] + Y + 1];
        const ba = this.perm[this.perm[X + 1] + Y];
        const bb = this.perm[this.perm[X + 1] + Y + 1];
        return this.lerp(v,
            this.lerp(u, this.grad(this.perm[aa], xf, yf), this.grad(this.perm[ba], xf - 1, yf)),
            this.lerp(u, this.grad(this.perm[ab], xf, yf - 1), this.grad(this.perm[bb], xf - 1, yf - 1))
        );
    }

    fbm(x, y, octaves = 6, lacunarity = 2.0, gain = 0.5) {
        let value = 0, amplitude = 1, frequency = 1, maxVal = 0;
        for (let i = 0; i < octaves; i++) {
            value += amplitude * this.noise2D(x * frequency, y * frequency);
            maxVal += amplitude;
            amplitude *= gain;
            frequency *= lacunarity;
        }
        return value / maxVal;
    }
}

const BIOMES = {
    floresta: { id: 'floresta', color: [0.15, 0.55, 0.12], heightRange: [0, 50], temp: [18, 28], threshold: [0.3, 1.0], steepness: 0.5 },
    planicie: { id: 'planicie', color: [0.6, 0.75, 0.25], heightRange: [0, 10], temp: [20, 32], threshold: [-0.2, 0.3], steepness: 0.1 },
    deserto: { id: 'deserto', color: [0.76, 0.7, 0.5], heightRange: [0, 30], temp: [30, 50], threshold: [-0.5, -0.2], steepness: 0.2 },
    montanha: { id: 'montanha', color: [0.5, 0.45, 0.4], heightRange: [50, 200], temp: [-5, 15], threshold: [0.2, 1.0], steepness: 0.9 },
    pantano: { id: 'pantano', color: [0.2, 0.35, 0.15], heightRange: [-5, 5], temp: [22, 35], threshold: [-0.3, 0.0], steepness: 0.05 },
    praia: { id: 'praia', color: [0.85, 0.8, 0.6], heightRange: [0, 5], temp: [20, 30], threshold: [-0.8, -0.4], steepness: 0.05 },
    rio: { id: 'rio', color: [0.2, 0.4, 0.8], heightRange: [-3, 0], temp: [18, 28], threshold: [-0.6, -0.2], steepness: 0.02 },
    caverna: { id: 'caverna', color: [0.15, 0.12, 0.1], heightRange: [-50, 0], temp: [10, 15], threshold: [-1.0, -0.5], steepness: 0.3 }
};

function getBiome(height, steepness, noiseVal) {
    for (const b of Object.values(BIOMES)) {
        if (noiseVal >= b.threshold[0] && noiseVal < b.threshold[1]) {
            if (height >= b.heightRange[0] && height <= b.heightRange[1]) {
                if (steepness >= b.steepness - 0.2) {
                    return b;
                }
            }
        }
    }
    return BIOMES.floresta;
}

function lerpColor(a, b, t) {
    return [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t
    ];
}

function generateTerrainTexture(noise, mapSize, heightMap, biomeMap, grid) {
    const texSize = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = texSize;
    canvas.height = texSize;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(texSize, texSize);
    const data = imageData.data;

    for (let ty = 0; ty < texSize; ty++) {
        for (let tx = 0; tx < texSize; tx++) {
            const gx = Math.floor((tx / texSize) * grid);
            const gz = Math.floor((ty / texSize) * grid);
            if (gx >= grid || gz >= grid) continue;
            const h = heightMap[gz][gx];
            const bn = biomeMap[gz][gx];
            const hNorm = Math.max(0, Math.min(1, (h + 3) / 203));
            const biome = getBiome(h, 0, bn);
            let r = biome.color[0];
            let g = biome.color[1];
            let b = biome.color[2];
            const darken = 0.7 + hNorm * 0.3;
            const detail = noise.noise2D(tx * 0.05, ty * 0.05) * 0.08;
            r = Math.max(0, Math.min(1, (r + detail) * darken));
            g = Math.max(0, Math.min(1, (g + detail) * darken));
            b = Math.max(0, Math.min(1, (b + detail) * darken));
            if (h < 0) {
                const sandBlend = Math.min(1, (-h) / 3);
                r = r + (0.85 - r) * sandBlend * 0.5;
                g = g + (0.8 - g) * sandBlend * 0.5;
                b = b + (0.6 - b) * sandBlend * 0.5;
            }
            const idx = (ty * texSize + tx) * 4;
            data[idx] = Math.floor(r * 255);
            data[idx + 1] = Math.floor(g * 255);
            data[idx + 2] = Math.floor(b * 255);
            data[idx + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
}

function createProceduralTerrain(scene, mapSize, noise) {
    const grid = 256;
    const terrainWidth = mapSize * 2;
    const terrainDepth = mapSize * 2;

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const uvs = [];
    const indices = [];
    const heightMap = [];
    const biomeMap = [];

    for (let iz = 0; iz <= grid; iz++) {
        const row = [];
        const bRow = [];
        for (let ix = 0; ix <= grid; ix++) {
            const worldX = (ix / grid) * 2 * mapSize - mapSize;
            const worldZ = (iz / grid) * 2 * mapSize - mapSize;
            const elevNoise = noise.fbm(worldX * 0.002, worldZ * 0.002, 6, 2.0, 0.5);
            const detailNoise = noise.fbm(worldX * 0.008, worldZ * 0.008, 3, 2.5, 0.4);
            const biomeNoise = noise.fbm(worldX * 0.0008, worldZ * 0.0008, 3, 3.0, 0.4);
            const ridge = 1 - Math.abs(noise.fbm(worldX * 0.004, worldZ * 0.004, 4, 2.2, 0.5));

            let height;
            if (biomeNoise < -0.3) {
                height = (elevNoise * 0.5 + 0.5) * 8 + detailNoise * 2;
                height = Math.max(-1, height);
            } else if (biomeNoise < 0.0) {
                height = (elevNoise * 0.5 + 0.5) * 20 + detailNoise * 3;
            } else if (biomeNoise < 0.3) {
                height = (elevNoise * 0.5 + 0.5) * 50 + detailNoise * 5;
            } else {
                height = (elevNoise * 0.5 + 0.5) * 120 + detailNoise * 8 + ridge * 50;
            }
            height = Math.max(-3, Math.min(200, height));
            row.push(height);
            bRow.push(biomeNoise);
        }
        heightMap.push(row);
        biomeMap.push(bRow);
    }

    for (let iz = 0; iz <= grid; iz++) {
        for (let ix = 0; ix <= grid; ix++) {
            const wx = (ix / grid) * terrainWidth - mapSize;
            const wz = (iz / grid) * terrainDepth - mapSize;
            vertices.push(wx, heightMap[iz][ix], wz);
            uvs.push(ix / grid, iz / grid);
        }
    }

    for (let iz = 0; iz < grid; iz++) {
        for (let ix = 0; ix < grid; ix++) {
            const a = iz * (grid + 1) + ix;
            const b = iz * (grid + 1) + ix + 1;
            const c = (iz + 1) * (grid + 1) + ix;
            const d = (iz + 1) * (grid + 1) + ix + 1;
            indices.push(a, b, c);
            indices.push(b, d, c);
        }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const texture = generateTerrainTexture(noise, mapSize, heightMap, biomeMap, grid);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.85,
        metalness: 0.0,
        side: THREE.DoubleSide
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);

    // Create a separate normal map from height for extra detail
    return { heightMap, biomeMap, grid, mapSize };
}

function createDetailedTree(x, y, z, height, noise) {
    const group = new THREE.Group();
    const seed = Math.abs(Math.sin(x * 12.989 + z * 78.233 + y * 45.164) * 43758.5453) % 1;
    const trunkHeight = height * (0.5 + seed * 0.2);
    const trunkRadius = 0.3 + seed * 0.3;
    const woodColor = 0x8B5A2B;
    const leafColor = new THREE.Color().setHSL(0.28 + seed * 0.08, 0.6, 0.3 + seed * 0.15);

    const trunkMat = new THREE.MeshStandardMaterial({ color: woodColor, roughness: 0.9, metalness: 0.0 });
    const trunkGeo = new THREE.CylinderGeometry(trunkRadius * 0.4, trunkRadius, trunkHeight, 6);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    group.add(trunk);

    const branchCount = 3 + Math.floor(seed * 4);
    for (let i = 0; i < branchCount; i++) {
        const angle = (i / branchCount) * Math.PI * 2 + seed * 0.5;
        const branchHeight = trunkHeight * (0.4 + (i / branchCount) * 0.4);
        const branchLen = 1 + seed * 1.5 + (i / branchCount) * 0.5;
        const branchRadius = trunkRadius * (0.3 - (i / branchCount) * 0.1);
        const branchGeo = new THREE.CylinderGeometry(0.05, branchRadius, branchLen, 4);
        const branch = new THREE.Mesh(branchGeo, trunkMat);
        branch.position.y = branchHeight;
        branch.rotation.z = Math.PI / 4 + seed * 0.3;
        branch.rotation.y = angle;
        branch.castShadow = true;
        group.add(branch);

        const leafSize = 1.5 + seed * 1 + (i / branchCount) * 0.5;
        const leafMat = new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.8, metalness: 0.0 });
        const leafGeo = new THREE.DodecahedronGeometry(leafSize, 0);
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(
            Math.sin(branch.rotation.y) * Math.cos(branch.rotation.z) * branchLen * 0.7,
            branchHeight + Math.sin(branch.rotation.z) * branchLen * 0.7,
            Math.cos(branch.rotation.y) * Math.cos(branch.rotation.z) * branchLen * 0.7
        );
        leaf.scale.y = 0.6;
        leaf.castShadow = true;
        group.add(leaf);

        const leaf2 = leaf.clone();
        leaf2.position.set(
            Math.sin(branch.rotation.y + 0.5) * branchLen * 0.4,
            branchHeight + 0.3,
            Math.cos(branch.rotation.y + 0.5) * branchLen * 0.4
        );
        leaf2.scale.setScalar(0.7);
        group.add(leaf2);
    }

    const topLeafMat = new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.8, metalness: 0.0 });
    const topLeafGeo = new THREE.DodecahedronGeometry(1.5 + seed, 1);
    const topLeaf = new THREE.Mesh(topLeafGeo, topLeafMat);
    topLeaf.position.y = trunkHeight + 0.5;
    topLeaf.scale.y = 0.5;
    topLeaf.castShadow = true;
    group.add(topLeaf);

    group.position.set(x, y, z);
    return group;
}

function createDetailedRock(x, y, z, size) {
    const seed = Math.abs(Math.sin(x * 13.37 + z * 7.77) * 43758.5453) % 1;
    const geo = new THREE.IcosahedronGeometry(size, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i);
        const len = Math.sqrt(px * px + py * py + pz * pz);
        const noise = (Math.sin(px * 3.7 + py * 5.1 + pz * 2.3) * 0.5 + 0.5) * 0.3 + 0.85;
        pos.setXYZ(i, px * noise, py * noise, pz * noise);
    }
    geo.computeVertexNormals();
    const colorVal = 0.4 + seed * 0.3;
    const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorVal, colorVal * 0.95, colorVal * 0.9),
        roughness: 0.95, metalness: 0.05, flatShading: true
    });
    const rock = new THREE.Mesh(geo, mat);
    rock.position.set(x, y, z);
    rock.rotation.set(seed * 6, seed * 3, seed * 2);
    rock.scale.y = 0.6 + seed * 0.3;
    rock.castShadow = true;
    rock.receiveShadow = true;
    return rock;
}

function createBush(x, y, z, size) {
    const group = new THREE.Group();
    const seed = Math.abs(Math.sin(x * 9.99 + z * 11.11) * 43758.5453) % 1;
    const color = new THREE.Color().setHSL(0.25 + seed * 0.1, 0.5, 0.25 + seed * 0.15);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.0 });
    const branchCount = 4 + Math.floor(seed * 5);
    for (let i = 0; i < branchCount; i++) {
        const angle = (i / branchCount) * Math.PI * 2 + seed;
        const radius = size * (0.3 + seed * 0.3);
        const bh = size * (0.3 + seed * 0.3);
        const leafGeo = new THREE.DodecahedronGeometry(size * (0.3 + (i % 3) * 0.1), 0);
        const leaf = new THREE.Mesh(leafGeo, mat);
        leaf.position.set(Math.cos(angle) * radius, bh * 0.5 + Math.sin(i * 2) * bh * 0.3, Math.sin(angle) * radius);
        leaf.scale.y = 0.5;
        leaf.castShadow = true;
        group.add(leaf);
    }
    const centerGeo = new THREE.DodecahedronGeometry(size * 0.4, 0);
    const center = new THREE.Mesh(centerGeo, mat);
    center.position.y = size * 0.1;
    center.scale.y = 0.4;
    center.castShadow = true;
    group.add(center);
    group.position.set(x, y, z);
    return group;
}

function createGrassPatch(x, y, z, noise) {
    const group = new THREE.Group();
    const seed = Math.abs(Math.sin(x * 5.55 + z * 3.33) * 43758.5453) % 1;
    const count = 5 + Math.floor(seed * 10);
    const color = new THREE.Color().setHSL(0.25 + seed * 0.08, 0.6, 0.3 + seed * 0.1);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.0, side: THREE.DoubleSide });
    for (let i = 0; i < count; i++) {
        const w = 0.02 + seed * 0.03;
        const h = 0.15 + seed * 0.25 + (i / count) * 0.1;
        const geo = new THREE.PlaneGeometry(w, h);
        const blade = new THREE.Mesh(geo, mat);
        const angle = (i / count) * Math.PI * 2 + seed * 2;
        const dist = 0.05 + seed * 0.08;
        blade.position.set(Math.cos(angle) * dist, h / 2, Math.sin(angle) * dist);
        blade.rotation.set(
            (Math.random() - 0.5) * 0.3,
            angle,
            (Math.random() - 0.5) * 0.3 - 0.1
        );
        group.add(blade);
    }
    group.position.set(x, y, z);
    return group;
}

function createFlower(x, y, z) {
    const seed = Math.abs(Math.sin(x * 7.77 + z * 3.33) * 43758.5453) % 1;
    const group = new THREE.Group();
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x2d5a1e, roughness: 0.9 });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.02, 0.15 + seed * 0.1, 3), stemMat);
    stem.position.y = (0.15 + seed * 0.1) / 2;
    group.add(stem);
    const petalColor = new THREE.Color().setHSL(seed * 0.8, 0.7, 0.5 + seed * 0.2);
    const petalMat = new THREE.MeshStandardMaterial({ color: petalColor, roughness: 0.6, side: THREE.DoubleSide });
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const petal = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.06), petalMat);
        petal.position.set(Math.cos(angle) * 0.04, 0.15 + seed * 0.1, Math.sin(angle) * 0.04);
        petal.rotation.set(0.5, angle, 0.3);
        group.add(petal);
    }
    group.position.set(x, y, z);
    return group;
}

function createTerrainDecorations(scene, mapSize, noise, heightMap, grid) {
    const treePositions = [];
    for (let i = 0; i < 150; i++) {
        const x = (Math.random() - 0.5) * mapSize * 2;
        const z = (Math.random() - 0.5) * mapSize * 2;
        const gx = Math.floor(((x + mapSize) / (mapSize * 2)) * grid);
        const gz = Math.floor(((z + mapSize) / (mapSize * 2)) * grid);
        if (gx < 0 || gx >= grid || gz < 0 || gz >= grid) continue;
        const y = heightMap[gz][gx];
        if (y < 0.5 || y > 80) continue;
        const height = 8 + Math.random() * 12;
        const tree = createDetailedTree(x, y, z, height, noise);
        scene.add(tree);
        treePositions.push({ x, z });
    }

    for (let i = 0; i < 80; i++) {
        const x = (Math.random() - 0.5) * mapSize * 2;
        const z = (Math.random() - 0.5) * mapSize * 2;
        const gx = Math.floor(((x + mapSize) / (mapSize * 2)) * grid);
        const gz = Math.floor(((z + mapSize) / (mapSize * 2)) * grid);
        if (gx < 0 || gx >= grid || gz < 0 || gz >= grid) continue;
        const y = heightMap[gz][gx];
        if (y < 0) continue;
        const size = 1 + Math.random() * 2.5;
        const rock = createDetailedRock(x, y, z, size);
        scene.add(rock);
    }

    for (let i = 0; i < 60; i++) {
        const x = (Math.random() - 0.5) * mapSize * 2;
        const z = (Math.random() - 0.5) * mapSize * 2;
        const gx = Math.floor(((x + mapSize) / (mapSize * 2)) * grid);
        const gz = Math.floor(((z + mapSize) / (mapSize * 2)) * grid);
        if (gx < 0 || gx >= grid || gz < 0 || gz >= grid) continue;
        const y = heightMap[gz][gx];
        if (y < 0 || y > 30) continue;
        const size = 0.8 + Math.random() * 1.5;
        const bush = createBush(x, y, z, size);
        scene.add(bush);
    }

    for (let i = 0; i < 200; i++) {
        const x = (Math.random() - 0.5) * mapSize * 2;
        const z = (Math.random() - 0.5) * mapSize * 2;
        const gx = Math.floor(((x + mapSize) / (mapSize * 2)) * grid);
        const gz = Math.floor(((z + mapSize) / (mapSize * 2)) * grid);
        if (gx < 0 || gx >= grid || gz < 0 || gz >= grid) continue;
        const y = heightMap[gz][gx];
        if (y < 0 || y > 20) continue;
        const grass = createGrassPatch(x, y, z, noise);
        scene.add(grass);
    }

    for (let i = 0; i < 40; i++) {
        const x = (Math.random() - 0.5) * mapSize * 2;
        const z = (Math.random() - 0.5) * mapSize * 2;
        const gx = Math.floor(((x + mapSize) / (mapSize * 2)) * grid);
        const gz = Math.floor(((z + mapSize) / (mapSize * 2)) * grid);
        if (gx < 0 || gx >= grid || gz < 0 || gz >= grid) continue;
        const y = heightMap[gz][gx];
        if (y < 0 || y > 15) continue;
        const flower = createFlower(x, y, z);
        scene.add(flower);
    }
}

function createWaterPlane(scene, mapSize) {
    const geo = new THREE.PlaneGeometry(mapSize * 2, mapSize * 2);
    const waterCanvas = document.createElement('canvas');
    waterCanvas.width = 256;
    waterCanvas.height = 256;
    const ctx = waterCanvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#1a5276');
    gradient.addColorStop(0.3, '#2e86c1');
    gradient.addColorStop(0.6, '#3498db');
    gradient.addColorStop(1, '#1a6ea0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.05})`;
        ctx.beginPath();
        ctx.arc(Math.random() * 256, Math.random() * 256, 5 + Math.random() * 15, 0, Math.PI * 2);
        ctx.fill();
    }
    const waterTex = new THREE.CanvasTexture(waterCanvas);
    waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping;
    waterTex.repeat.set(20, 20);
    const mat = new THREE.MeshStandardMaterial({
        map: waterTex,
        color: 0x2e86c1,
        transparent: true,
        opacity: 0.65,
        roughness: 0.2,
        metalness: 0.6
    });
    const water = new THREE.Mesh(geo, mat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.15, 0);
    water.receiveShadow = true;
    scene.add(water);
    return water;
}
