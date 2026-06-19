# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-06-19
### Added
- **Visual FX System (Gore & Realism):** Dynamic blood particle system with gravity, floor collision detection, and pooling mechanics built entirely in code (no external image assets needed).
- **Skin Tearing (DecalGeometry):** Dinosaurs now show permanent flesh wound decals where they were attacked based on their health pool.
- **Dynamic 3D Models Loader:** Automatically loads `.glb` files for all 60 species dynamically from the `models/` directory using `[id_do_dino].glb` mapping.
- **Degradable Food Ecosystem:** Server-synchronized logic for carcass and plant degradation. Carcasses transition into exposed rib cages based on the amount of meat eaten by players or NPCs.
- **Food Sync Network Logic:** Overhauled `tmp-server.js` and `tmp-anim.html` to sync `amount` values over WebSocket so multiple players visually see the same carcass size shrink in real-time.

### Changed
- Refactored `eatOrDrink()` and `attack()` on the client side (`tmp-anim.html`) to connect with the new `VisualFXSystem`.
- Updated `FoodItem` creation in `tmp-server.js` to emit `amount` on `world_state` broadcast.

### Fixed
- Fixed bug where offline-style local food meshes wouldn't properly sync their size and degradation stages with the authoritative server.
