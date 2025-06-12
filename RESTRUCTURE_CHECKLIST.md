# Project Restructure Checklist

- [x] 1. Create `src/` directory at repo root
- [x] 2. Move runtime code into `src/`
  - [x] 2a. Move `app/` → `src/app/`
  - [x] 2b. Move `components/` → `src/components/`
  - [x] 2c. Move `hooks/` → `src/hooks/`
  - [x] 2d. Move `lib/` → `src/lib/`
  - [x] 2e. Move `types/` → `src/types/`
- [x] 3. Hoist game engine
  - [x] Move `src/app/game/` → `src/game-engine/`
- [x] 4. Remove unused `core/` directory
- [x] 5. Merge markdown docs: `documentation/*` → `docs/`, delete `documentation/`
- [x] 6. Update `tsconfig.json` path aliases
- [ ] 7. Run `npm run build` and `npm test` to validate
- [ ] 8. Commit changes on branch `chore/restructure-into-src` 