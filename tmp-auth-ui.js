const DinoAuth = {
    API_BASE: '',
    token: localStorage.getItem('dino_token'),
    user: JSON.parse(localStorage.getItem('dino_user') || 'null'),
    selectedDino: null, allDinos: [], preview3d: null,

    init() { this.bindEvents(); if (this.token) { this.show('select'); this.loadDinos(); this.restoreLast(); } else { this.show('login'); } },

    show(s) {
        document.querySelectorAll('.auth-screen').forEach(e => e.classList.add('hidden'));
        const el = document.getElementById('screen-' + s);
        if (el) el.classList.remove('hidden');
        if (s === 'select' && !this.preview3d) {
            this.preview3d = new DinoPreview3D('dino-preview-3d');
        }
        if (s !== 'select' && this.preview3d) {
            this.preview3d.clean();
        }
    },

    showScreen(s) { this.show(s); },

    async api(method, data) {
        const h = { 'Content-Type': 'application/json' };
        if (this.token) h['Authorization'] = 'Bearer ' + this.token;
        const r = await fetch(this.API_BASE + method, { method: 'POST', headers: h, body: JSON.stringify(data) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'Erro');
        return j;
    },

    async login() {
        const u = document.getElementById('login-user').value.trim();
        const p = document.getElementById('login-pass').value;
        const err = document.getElementById('login-error');
        if (!u || !p) { err.textContent = 'Preencha todos os campos'; err.classList.remove('hidden'); return; }
        err.classList.add('hidden');
        try {
            const r = await this.api('/api/login', { username: u, password: p });
            this.token = r.token; this.user = r.user;
            localStorage.setItem('dino_token', r.token);
            localStorage.setItem('dino_user', JSON.stringify(r.user));
            this.show('select');
            this.loadDinos();
        } catch (e) { err.textContent = e.message; err.classList.remove('hidden'); }
    },

    async register() {
        const u = document.getElementById('reg-user').value.trim();
        const e = document.getElementById('reg-email').value.trim();
        const p1 = document.getElementById('reg-pass').value;
        const p2 = document.getElementById('reg-confirm').value;
        const err = document.getElementById('reg-error');
        const ok = document.getElementById('reg-ok');
        if (!u || !e || !p1 || !p2) { err.textContent = 'Preencha todos os campos'; err.classList.remove('hidden'); return; }
        if (p1 !== p2) { err.textContent = 'Senhas nao conferem'; err.classList.remove('hidden'); return; }
        err.classList.add('hidden');
        try {
            await this.api('/api/register', { username: u, email: e, password: p1 });
            ok.textContent = 'Conta criada! Faca login.'; ok.classList.remove('hidden');
            setTimeout(() => this.show('login'), 2000);
        } catch (er) { err.textContent = er.message; err.classList.remove('hidden'); }
    },

    logout() {
        this.token = null; this.user = null;
        localStorage.removeItem('dino_token'); localStorage.removeItem('dino_user');
        localStorage.removeItem('dino_last');
        if (this.preview3d) { this.preview3d.dispose(); this.preview3d = null; }
        this.show('login');
    },

    async loadDinos() {
        try {
            const r = await this.api('/api/dinos');
            this.allDinos = r.dinosaurs || [];
            this.render();
        } catch (e) { console.error(e); }
    },

    restoreLast() {
        const last = localStorage.getItem('dino_last');
        if (last) {
            try {
                const { dinoId, dinoName } = JSON.parse(last);
                setTimeout(() => {
                    this.pick(dinoId);
                    const nameInput = document.getElementById('dino-name');
                    if (nameInput && dinoName) nameInput.value = dinoName;
                    this.updateBtn();
                }, 100);
            } catch(e) {}
        }
    },

    dinoEmoji(d) {
        const marine = ['mosasaurus','tylosaurus','ichthyosaurus','megalodon','liopleurodon','plesiosaurus'];
        const flyers = ['pteranodon','rhamphorhynchus','quetzalcoatlus','tapejara','dimorphodon'];
        const sauropods = ['apatosaurus','brachiosaurus','diplodocus','brontosaurus','mamenchisaurus','omeisaurus','amargasaurus'];
        const armored = ['ankylosaurus','euoplocephalus','kentrosaurus','stegosaurus'];
        const ceratops = ['triceratops','protoceratops','styracosaurus','pachyrhinosaurus','ceratops'];
        if (marine.includes(d.id)) return '≡ƒÉè';
        if (flyers.includes(d.id)) return '≡ƒªç';
        if (sauropods.includes(d.id)) return '≡ƒªò';
        if (armored.includes(d.id)) return '≡ƒÉó';
        if (ceratops.includes(d.id)) return '≡ƒªÅ';
        if (d.type === 'carnivore') return d.tier >= 4 ? '≡ƒªû' : '≡ƒªà';
        if (d.tier >= 3) return '≡ƒªò';
        return '≡ƒªÄ';
    },

    statDesc(value, stat) {
        if (stat === 'hp') {
            if (value >= 1800) return 'Monstruoso';
            if (value >= 1000) return 'Enorme';
            if (value >= 500) return 'Robusto';
            if (value >= 300) return 'Mediano';
            return 'Fragil';
        }
        if (stat === 'stam') {
            if (value >= 300) return 'Extrema';
            if (value >= 200) return 'Alta';
            if (value >= 100) return 'Media';
            return 'Baixa';
        }
        if (stat === 'atk') {
            if (value >= 120) return 'Mortal';
            if (value >= 80) return 'Perigoso';
            if (value >= 50) return 'Moderado';
            if (value >= 30) return 'Leve';
            return 'Inofensivo';
        }
        if (stat === 'spd') {
            if (value >= 30) return 'Relampago';
            if (value >= 20) return 'Veloz';
            if (value >= 14) return 'Rapido';
            if (value >= 8) return 'Medio';
            return 'Lento';
        }
        return '-';
    },

    render(phylo) {
        const g = document.getElementById('dino-grid');
        if (!g) return;
        phylo = phylo || 'todos';
        const list = phylo === 'todos' ? this.allDinos : this.allDinos.filter(d => d.type === phylo);
        g.innerHTML = list.map(d =>
            '<div class="dino-card" data-id="' + d.id + '" onclick="DinoAuth.pick(\'' + d.id + '\')">' +
            '<div class="dino-icon" style="background:linear-gradient(135deg,' + (d.color || '#555') + ',' + (d.bodyColor || '#777') + ')">' +
            '<span class="dino-emoji">' + this.dinoEmoji(d) + '</span>' +
            '<span class="dino-tier-badge">T' + d.tier + '</span></div>' +
            '<div class="dino-card-name">' + d.name + '</div>' +
            '<div class="dino-card-type ' + d.type + '">' + (d.type === 'carnivore' ? 'Carnivoro' : 'Herbivoro') + '</div></div>'
        ).join('');
        document.querySelectorAll('.dino-card[data-id="' + this.selectedDino + '"]').forEach(c => c.classList.add('selected'));
    },

    filter(phylo) {
        document.querySelectorAll('.phylo-btn').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector('.phylo-btn[data-phylo="' + phylo + '"]');
        if (btn) btn.classList.add('active');
        this.render(phylo);
    },

    pick(id) {
        try {
            this.selectedDino = id;
            document.querySelectorAll('.dino-card').forEach(c => c.classList.remove('selected'));
            const card = document.querySelector('.dino-card[data-id="' + id + '"]');
            if (card) card.classList.add('selected');
            const d = this.allDinos.find(x => x.id === id);
            if (!d) return;
            if (this.preview3d && this.preview3d.loadDino) this.preview3d.loadDino(d);
            const setText = (elId, text) => { const el = document.getElementById(elId); if (el) el.textContent = text; };
            setText('dino-pname', d.name);
            const typeLabel = d.type === 'carnivore' ? 'Carnivoro' : 'Herbivoro';
            setText('dino-ptier', 'Tier ' + d.tier + ' | ' + typeLabel);
            setText('dino-php', this.statDesc(d.maxHealth, 'hp'));
            setText('dino-pstam', this.statDesc(d.maxStamina, 'stam'));
            setText('dino-patk', this.statDesc(d.attackDamage, 'atk'));
            const spd = d.sprintSpeed || d.flightSpeed || d.speed || 0;
            setText('dino-pspd', this.statDesc(spd, 'spd'));
            setText('dino-pdesc', this.dinoFlavor(d));
            this.updateBtn();
        } catch(e) { console.error('DinoAuth.pick error:', e); }
    },

    dinoFlavor(d) {
        const flavors = {
            carnivore: [
                'Um predador nato. Melhor nao chegar perto.',
                'Seus olhos brilham na escuridao. Cuidado.',
                'O rastro de sangue conta a historia.',
                'Cacador silencioso, morte certeira.',
                'A natureza criou uma maquina de matar.',
                'Nao corra. Nao adianta.'
            ],
            herbivore: [
                'Gigante gentil... ate ser provocado.',
                'Vive em paz, mas morre lutando.',
                'Seu tamanho ja intimida.',
                'Pastador pacifico, defesa implacavel.',
                'A forca da natureza em forma pura.',
                'Nao subestime quem nao ataca primeiro.'
            ]
        };
        const list = flavors[d.type] || flavors.herbivore;
        return list[Math.floor(Math.random() * list.length)];
    },

    updateBtn() {
        const b = document.getElementById('dino-start');
        const n = document.getElementById('dino-name').value.trim();
        b.disabled = !(this.selectedDino && n.length >= 2);
    },

    enter() {
        const n = document.getElementById('dino-name').value.trim();
        if (!this.selectedDino || n.length < 2) return;
        localStorage.setItem('dino_last', JSON.stringify({ dinoId: this.selectedDino, dinoName: n }));
        window.__dinoJoinData = { token: this.token, dinosaurId: this.selectedDino, dinoName: n, colors: {}, skinId: 'classic' };
        this.show('loading');
        if (typeof initGameFromAuth === 'function') setTimeout(initGameFromAuth, 300);
        else if (typeof startGame === 'function') setTimeout(startGame, 300);
    },

    bindEvents() {
        document.getElementById('login-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') this.login(); });
        document.getElementById('reg-confirm')?.addEventListener('keydown', e => { if (e.key === 'Enter') this.register(); });
        document.getElementById('dino-name')?.addEventListener('input', () => this.updateBtn());
    }
};
document.addEventListener('DOMContentLoaded', () => DinoAuth.init());
