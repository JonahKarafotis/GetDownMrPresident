# Get Down, Mr. President!

A browser-only 1v1 party game, currently at **Milestone 1: local feasibility prototype**. The approved specification is [PROJECT_REQUIREMENTS.md](PROJECT_REQUIREMENTS.md).

## Run locally

Install Node.js (a supported modern LTS release is recommended), then:

```sh
npm ci
npm run check
npm test
npm run build
npm run dev
```

Open the address printed by Wrangler, normally http://localhost:8787. Create a room in one browser and open its invitation in another. First participant is the bodyguard; second is the protester. Click Start test after both join. A/D or arrows move, Space jumps, J dives/throws. This fixed arena deliberately isolates movement and interception; it is not the finished scrolling game.

Rebuild with `npm run build` after client changes. Wrangler watches server source. Development reloads can interrupt rooms.

## Verify

With the local server running:

```sh
node tests/room-smoke.mjs http://127.0.0.1:8787
```

The smoke test creates two scripted WebSocket clients, verifies identical block events, unchanged Composure, and interruption after disconnect. It does **not** substitute for two-computer internet testing or human responsiveness measurements.

## Architecture

- `client/`: Phaser graphics, keyboard input, fixed-step local prediction, reconciliation and basic visual smoothing.
- `shared/simulation.ts`: dependency-free fixed-step rules and swept projectile contacts. Server owns outcomes.
- `server/index.ts`: static-asset Worker and one SQLite-backed Durable Object per room.
- `tests/`: simulation tests and transport smoke test.
- `docs/`: evidence, limitations, and time accounting.

Prototype settings: 60 Hz simulation, nominal 20 Hz snapshots, 60 Hz client inputs, 2-second ping. These are starting values, not accepted production performance guarantees. No Phaser physics runs on the server.

## Deploy after account setup

Use a Cloudflare account on Workers Free. Do not enable paid services. Authenticate via `npx wrangler login`, confirm the intended account/plan, then `npm run deploy`. This deploys static assets and one room class in the same Worker. There is no paid resource declaration in the project, but account billing configuration must still be checked before deployment.

Cloudflare deployment created October 23, 2026: https://get-down-mr-president.getdownmrpresident.workers.dev . Hosted verification is in progress; see the feasibility report. Never put credentials in source files or send them in chat.

## Current limitations

This is a test arena, not a release: no moving parade, platforms, role-selection/ready flow, results, reconnect credentials, full recovery, audio, or release-grade abuse controls. Room expiry is basic; restarting the server discards the active test. Start only begins an inactive test; disconnect/rejoin to reset. Prediction needs real keyboard and latency evaluation. Network timers, hibernation, CPU accounting and free-tier capacity are not hosted-verified.

Generated rectangle graphics use no third-party art assets. Phaser and other dependencies retain their own licenses. No external fonts or asset services are required.
