# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-06-19
### Added
- **Visual FX System (Gore & Realism):** Dynamic blood particle system with gravity, floor collision detection, and pooling mechanics built entirely in code (no external image assets needed).
- **Skin Tearing (DecalGeometry):** Dinosaurs now show permanent flesh wound decals where they were attacked based on their health pool.
- **Dynamic 3D Models Loader:** Automatically loads `.glb` files for all 60 species dynamically from the `models/` directory using `[id_do_dino].glb` mapping.
- **Degradable Food Ecosystem:** Server-synchronized logic for carcass and plant degradation. Carcasses transition into exposed rib cages based on the amount of meat eaten by players or NPCs.
- **Food Sync Network Logic:** Overhauled `tmp-server.js` and `tmp-anim.html` to sync `amount` values over WebSocket so multiple players visually see the same carcass size shrink in real-time.
- **Ecosystem Module (`ecosystem.js`):** 8 plant types (berry_bush, fern, cycad, palm, flower, mushroom, cactus, seaweed) + 8 animal types (fish, rabbit, bird, insect, lizard, frog, snake, turtle) with biome-aware spawning, growth stages, harvest/kill mechanics, and respawn timers.
- **AI System Module (`ai-system.js`):** Formal state machine (idle, wander, hunt, flee, eat, drink, socialize, sleep) with 5 personality traits (aggressive, shy, curious, lazy, territorial). NPCs autonomously find food/water/threats/prey with range based on personality.
- **Genetics Module (`genetics.js`):** Egg code generation (DINO-XXXX format), incubation system, 16 mutation types with XP costs, mutation purchase/application to stats, XP/leveling system (`level = sqrt(xp/100) + 1`).
- **Tribes Module (`tribes.js`):** Full tribe management: create, invite, accept, kick, leave, disband, promote/demote with role hierarchy (leader > admin > member), max 30 members.
- **Tracking Module (`tracking.js`):** Event logging for kills, deaths, discoveries, joins, leaves, chat, eggs, tribes with leaderboards and player-specific querying. 10000 entry buffer.
- **Server Integration:** All 5 new modules imported, instantiated, and active in game loop. Ecosystem ticks in game loop, AI system replaces inline NPC logic, 12+ WS message handlers added for genetics/tribes/tracking/chat operations.
- **WS Message Handlers:** `create_egg`, `hatch_egg`, `add_xp`, `get_mutations`, `purchase_mutation`, `tribe_create`, `tribe_invite`, `tribe_accept`, `tribe_leave`, `tribe_kick`, `get_tribe_info`, `get_stats`, `chat`.

### Changed
- Refactored `eatOrDrink()` and `attack()` on the client side (`tmp-anim.html`) to connect with the new `VisualFXSystem`.
- Updated `FoodItem` creation in `tmp-server.js` to emit `amount` on `world_state` broadcast.
- Replaced inline NPC AI logic in `tmp-server.js` with `aiSystem.update()` calls with proper `allDinoData` reference.
- Added tracking integration to player attacks, kills, deaths, join, and leave events.
- Updated `README.md`: corrected `better-sqlite3` to `sql.js`, added all new modules to file structure section.

### Fixed
- Fixed bug where offline-style local food meshes wouldn't properly sync their size and degradation stages with the authoritative server.
- Fixed `ai-system.js` `findNearestThreat`/`findNearestPrey` - removed broken `players.DINOSAURS` reference, now receives `allDinoData` parameter correctly.
- Fixed `tribe_invite` handler - simplified target player notification (removed buggy `players.forEach` loop).
- Fixed `tribe_accept` handler - replaced non-existent `data.targetUsername` with `userData.username`.
- Fixed `tribe_leave` handler - captures tribe name before deletion for tracking.
- Fixed `tribe_kick` handler - added notification to the kicked player via WebSocket.
- Fixed ecosystem spawning retry logic - added retry loops for biome-mismatched plant/animal spawns.
