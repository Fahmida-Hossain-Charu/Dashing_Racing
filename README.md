# AUREL — Crown Circuit

A complete browser-based 3D arcade racer built with Three.js. Drive a custom gold-and-crystal hypercar inspired by the supplied reference photograph around a 1.52 km Mediterranean coastal circuit.

## Play

- W / Up: accelerate
- S / Down: brake; hold at rest to reverse
- A / D or Left / Right: steer
- Space: drift / handbrake
- R: recover to the circuit (three-second penalty)
- Escape / P: pause
- M: sound on/off
- Enter: start from the garage
- Touch devices: on-screen steering, brake and accelerator

Three laps, seven sequential checkpoints per lap, three AI rivals, position tracking, lap and race timing, local personal records, barrier and car collisions, a minimap, restart and finish results. The exhibition mode uses the same steering and physics as opponents and allows taking over; assisted races never save records.

## Development

Requires Node.js 20 or newer.

```sh
npm ci
npm test
npm run build
npx serve dist
```

The `dist` folder is a standalone static site, suitable for Vercel, Netlify, GitHub Pages, or any static host. No server, account, secrets, external CDN, image service or runtime network requests are required. On Vercel use `npm run build` and output directory `dist`.

## Implementation

- `src/world.js`: procedural car, instanced crystal bodywork, continuous track geometry, scenery, materials and lighting.
- `src/race.js`: fixed-step driving model, path-following AI, sequential checkpoint and lap state machine.
- `src/main.js`: 120 Hz simulation, collisions, input, chase camera, generated engine audio, UI and persistence.
- `src/style.css`: responsive garage, racing HUD and results.
- `scripts/build.mjs`: reproducible static production build with locally bundled Three.js modules.
- `tests/`: race rules, driving and full-circuit simulations.

The original photograph is used as a modeling reference, not embedded in the distributed game. The car is a stylized procedural interpretation, not an exact CAD reconstruction.

## Verification

Automated tests exercise countdown, acceleration/braking/reversing, checkpoint order, reverse-lap rejection, three-lap completion, reset and track continuity. A full simulation using the real circuit and autonomous steering completes all three laps in approximately 146 seconds without barrier contact.

Browser visual inspection and manual playtesting were blocked by the environment's browser preview approval gate. The production build and simulation tests passed; rendered appearance and device-specific behavior require browser verification.

## Dependency attribution

Three.js is distributed under the MIT license. Its license is included in `dist/vendor/LICENSE.three.txt`.
