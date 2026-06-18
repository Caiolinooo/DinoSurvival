# DinoSurvival - Documento de Especificação do Projeto

## 1. IDENTIDADE DO JOGO

| Item | Definição |
|------|-----------|
| **Nome** | DinoSurvival |
| **Gênero** | Survival Simulator multiplayer (The Isle / Path of Titans style) |
| **Plataforma** | Navegador Web (Three.js + Node.js) |
| **Servidor** | Ubuntu, Intel Xeon Gold 6138, 50GB RAM |
| **Idioma** | Português (BR) |

## 2. ARQUITETURA DO SISTEMA

```
CLIENTE (Porta 80 - client.js)          SERVIDOR (Porta 2122 - server.js)
       |                                        |
   public/                                  server/
     index.html        ◄──WS──►            server.js (orquestrador)
     models/*.glb                          database.js (SQLite)
     textures/*                            auth.js (bcrypt + JWT)
     sounds/*                              weather.js (clima)
     css/style.css                         terrain.js (mapa)
     js/                                   ecosystem.js (plantas)
       game.js                             ai-system.js (IA NPC)
       menu.js                             genetics.js (ovos/mutações)
       hud.js                              tribes.js (grupos)
       dino-viewer.js                      tracking.js (rastreio)
       network.js                          dinodefs.js (~60 dinos)
                                           client.js (porta 80)
```

### Stack Tecnológica
| Camada | Tecnologia |
|--------|-----------|
| Servidor | Node.js v18.19.1 |
| HTTP/WS | Express + ws |
| Banco | SQLite (better-sqlite3) |
| Auth | bcryptjs + jsonwebtoken (JWT) |
| Ruído | simplex-noise |
| 3D | Three.js r128 |
| Modelos | .glb (Sketchfab / Poly Pizza) |

## 3. DECISÕES DO PROJETO

### Removido do código original
- ❌ Montaria (`isRiding`, `riddenBy`, `rideTarget`)
- ❌ Inventário client-side
- ❌ Construção/base
- ❌ Texto "THE ISLE EVRIMA"

### Adicionado
- ✅ Sistema de login/registro com senha (bcrypt)
- ✅ Sessões JWT
- ✅ Rastreabilidade de dinossauros (instâncias + log de eventos)
- ✅ 60 dinossauros (27 atuais + 33 novos)
- ✅ Modelos 3D .glb (gratuitos de alta qualidade)
- ✅ Skins pré-definidas com 8 slots de cor
- ✅ 6 tipos de clima server-side (clear, cloudy, rain, storm, fog, snow, heatwave)
- ✅ Mapa 3000x3000 com 8 biomas (floresta, planície, deserto, montanha, pântano, praia, rio, caverna)
- ✅ Terreno procedural com altura variável
- ✅ IA NPC em máquina de estados formal
- ✅ Ecossistema com plantas (8 tipos) e animais pequenos
- ✅ Ovos com código de 8 caracteres (DINO-XXXX)
- ✅ Ninhos para gestação
- ✅ Mutações genéticas (max 16 por dinossauro)
- ✅ Sistema de XP (tempo vivo, kills, exploração)
- ✅ Tribos/grupos
- ✅ Chat global + grupo
- ✅ HUD completo

### Definições de Skins
- 8 slots de cor por dinossauro:
  1. Corpo principal
  2. Barriga
  3. Cabeça
  4. Cauda
  5. Olhos
  6. Garras/dentes
  7. Padrão 1 (listras/manchas)
  8. Detalhes (crista, espinhos, chifres)
- Skins pré-definidas desbloqueáveis por XP

### Mutações Genéticas (max 16 slots)
| Mutação | Custo XP | Efeito |
|---------|----------|--------|
| color_mutation | 500 | Nova cor de skin |
| pattern_mutation | 600 | Novo padrão |
| health_up_I | 800 | +5% HP máximo |
| health_up_II | 1500 | +8% HP máximo |
| speed_up_I | 700 | +5% velocidade |
| speed_up_II | 1300 | +8% velocidade |
| stamina_up_I | 600 | +8% stamina máxima |
| stamina_up_II | 1200 | +12% stamina máxima |
| strength_up_I | 1000 | +8% dano |
| strength_up_II | 1800 | +12% dano |
| defense_up | 900 | +10% defesa |
| hunger_resist | 500 | -15% taxa fome |
| thirst_resist | 500 | -15% taxa sede |
| regen_up | 700 | +25% regen HP |
| size_up | 2000 | +10% tamanho |
| glow | 3000 | Efeito glow (lendário) |

## 4. BANCO DE DADOS (SQLite - schema completo)

```sql
-- Usuários e autenticação
users (id, username, email, password_hash, created_at, last_login, total_play_time, is_banned, ban_reason, is_admin)
sessions (id, user_id, token, ip_address, created_at, expires_at, is_active)

-- Personagens
players (id, user_id, player_name, current_dino_id, is_online, created_at, last_active, total_play_time, total_kills, total_deaths)

-- Instâncias de dinossauros (rastreabilidade)
dinosaur_instances (id, player_id, user_id, dinosaur_id, dino_name, health, max_health, stamina, max_stamina, hunger, max_hunger, thirst, max_thirst, growth_stage, experience, level, kills, deaths, is_alive, death_cause, killed_by, position_x, position_z, time_alive, created_at, died_at, updated_at)

-- Eventos de vida do dinossauro (log completo)
dino_events (id, dino_instance_id, event_type, event_data(json), position_x, position_z, timestamp)

-- Ovos e genética
eggs (id, mother_instance_id, father_instance_id, egg_code(8 chars), position_x, position_z, incubation_progress, genetics(json), is_hatched, hatched_by, created_at, hatched_at)
mutations (id, user_id, dino_instance_id, mutation_id, slot_number(0-15), is_active, unlocked_at)

-- Ninhos
nests (id, owner_instance_id, owner_id, position_x, position_z, egg_count, max_eggs(5), is_active, created_at, abandoned_at)

-- Tribos
tribes (id, name(unique), tag(unique), description, owner_id, created_at, max_members(30), total_members)
tribe_members (id, tribe_id, user_id, role(leader/admin/member), joined_at)

-- Mundo
world_state (id, state_key(unique), state_value(json), updated_at)

-- Plantas (ecossistema)
plants (id, plant_type, biome, position_x, position_z, growth_stage, is_harvested, harvest_count, max_harvests(5), respawn_time, created_at, last_harvested)

-- Animais NPC
animals (id, animal_type, health, max_health, is_alive, is_tamed, tamed_by, position_x, position_y, position_z, biome, behavior_state, created_at)

-- Chat
chat_log (id, player_id, message, channel(global/tribe/local), timestamp)
```

## 5. COMUNICAÇÃO WEBSOCKET

### Cliente → Servidor
| Tipo | Descrição |
|------|-----------|
| join | Entrar no mundo (token, dinosaurId, dinoName, colors, skinId) |
| move | Movimento (rotation, isSprinting, isFlying, isSwimming) |
| attack | Atacar |
| interact | Interagir (eat/drink/build_nest/lay_egg) |
| chat | Mensagem de chat (message, channel) |
| build_nest | Construir ninho (position_x, position_z) |
| hatch_egg | Chocar ovo (egg_code) |
| leave_world | Sair do jogo |

### Servidor → Cliente
| Tipo | Frequência | Descrição |
|------|------------|-----------|
| authenticated | No join | Confirmação de autenticação |
| joined | No join | Dados iniciais do jogador |
| world_state | No join | Estado completo do mundo |
| update | 10x/s | Atualização de estado |
| weather_update | 30s | Atualização do clima |
| chat | Sob demanda | Mensagens de chat |
| dino_event | Eventos | Eventos de dinossauro |
| egg_created | Ao criar ovo | Código do ovo + genética |
| egg_hatched | Ao chocar | Dados do baby |
| death | Ao morrer | Causa e killer |
| player_removed | Disconnect | Jogador saiu |

## 6. FASES DE IMPLEMENTAÇÃO

| Fase | Descrição | Módulos | Estimativa |
|------|-----------|---------|------------|
| 1 | Database + Auth + Login | database.js, auth.js, novo index.html | 2-3 dias |
| 2 | Clima server-side | weather.js | 1 dia |
| 3 | Mapa 3000x3000 + 8 biomas | terrain.js, Three.js | 3-4 dias |
| 4 | +33 dinos + modelos GLTF + skins | dinodefs.js, dino-viewer.js | 5-7 dias |
| 5 | IA + Ecossistema | ai-system.js, ecosystem.js | 4-5 dias |
| 6 | Ovos, ninhos, genética | genetics.js | 3-4 dias |
| 7 | Tribos/Grupos | tribes.js | 2 dias |
| 8 | HUD final + menu personalização | hud.js, menu.js | 3-4 dias |
| 9 | Multiplayer + chat + otimizações | network.js | 2-3 dias |

**Total estimado: 25-33 dias**

## 7. CLIMA (Server-Side)

### Tipos e efeitos
| Tipo | Temp | Efeitos |
|------|------|---------|
| clear | 20-35°C | Normal |
| cloudy | 15-28°C | Visibilidade reduzida |
| rain | 10-22°C | Recupera água, plantas crescem |
| storm | 5-18°C | Dano em área aberta |
| fog | 8-20°C | Visibilidade 20% |
| snow | -5-5°C | Dano por frio, água congela |
| heatwave | 35-50°C | Sede dobra, dano por calor |

## 8. MAPA (3000x3000)

### 8 Biomas
| Bioma | % | Altura (Y) | Temperatura |
|-------|---|------------|-------------|
| Floresta | 25% | 0 a 50 | 18-28°C |
| Planície | 20% | 0 a 10 | 20-32°C |
| Deserto | 15% | 0 a 30 | 30-50°C |
| Montanha | 10% | 50 a 200 | -5-15°C |
| Pântano | 10% | -5 a 5 | 22-35°C |
| Praia | 8% | 0 a 5 | 20-30°C |
| Rio | 7% | -3 a 0 | 18-28°C |
| Caverna | 5% | -50 a 0 | 10-15°C |

Algoritmo: Simplex noise multi-oitavas, grid 256x256.

## 9. DINOSSAUROS (60 total)

### 27 atuais mantidos + 33 novos
Carnívoros adicionados: Giganotosaurus, Carcharodontosaurus, Carnotaurus, Ceratosaurus, Baryonyx, Suchomimus, Megalosaurus, Abelisaurus, Herrerasaurus, Coelophysis, Utahraptor, Microraptor
Herbívoros adicionados: Diplodocus, Brontosaurus, Protoceratops, Styracosaurus, Pachyrhinosaurus, Corythosaurus, Lambeosaurus, Tenontosaurus, Dryosaurus, Gallimimus, Therizinosaurus, Amargasaurus, Kentrosaurus, Euoplocephalus
Voadores: Quetzalcoatlus, Tapejara, Dimorphodon
Aquáticos: Tylosaurus, Ichthyosaurus, Megalodon, Liopleurodon

## 10. CICLO DE VIDA DO JOGADOR

Login → Selecionar dinossauro → Spawnar no mapa OU chocar ovo (se tiver código)
Ganhar XP (tempo vivo, kills, exploração, clima)
Trocar XP por mutações genéticas (max 16 slots)
Reprodução opcional: ninho → ovo (código 8 chars) → compartilhar código → baby dino
Baby herda genética dos pais
Morte: registrada no banco → volta ao menu
