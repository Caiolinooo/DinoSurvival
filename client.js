const express = require('express');
const path = require('path');
const { initDatabase } = require('./database');
const { register, login } = require('./auth');
const { DINOSAURS } = require('./dinodefs');

const app = express();
const PORT = process.env.PORT || 80;

app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/models', express.static(path.join(__dirname, 'models')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'tmp-anim.html'));
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Preencha todos os campos' });
        }
        const result = await register(username, email, password);
        res.json({ user: { userId: result.userId, username: result.username }, token: result.token });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Preencha todos os campos' });
        }
        const result = await login(username, password);
        res.json({ user: { userId: result.userId, username: result.username }, token: result.token });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/api/dinos', (req, res) => {
    const dinos = Object.values(DINOSAURS).map(d => ({
        id: d.id,
        name: d.name,
        nameBR: d.nameBR,
        tier: d.tier,
        type: d.type,
        color: d.color,
        bodyColor: d.bodyColor,
        maxHealth: d.maxHealth,
        maxStamina: d.maxStamina,
        attackDamage: d.attackDamage,
        speed: d.speed,
        sprintSpeed: d.sprintSpeed,
        realLength: d.realLength,
        isSwimming: d.isSwimming,
        isFlying: d.isFlying
    }));
    res.json({ dinosaurs: dinos });
});

initDatabase().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`DinoSurvival Client running on http://0.0.0.0:${PORT}`);
    });
}).catch(e => {
    console.error('Failed to init database:', e);
    process.exit(1);
});
