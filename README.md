# Get Down, Mr. President! 🎮

**A real-time, browser-based multiplayer party game developed for the Handshake "Create a Multiplayer Game" competition.**

## 🏆 About the Competition

This project is being developed as an entry for the **[Handshake](https://joinhandshake.com/) "Create a Multiplayer Game" challenge**, where participants use ChatGPT's Work mode to design, build, and deploy a multiplayer game that friends, family, or classmates can play together from their own devices.

**Competition Details:**
- **Challenge:** Create a Multiplayer Game
- **Platform:** Handshake
- **Submission Deadline:** October 31, 2026
- **Prize Opportunity:** $1,000
- **Development Tool:** ChatGPT Work mode
- **Goal:** Build and deploy a publicly accessible, real-time multiplayer game.

### Competition Requirements

The challenge emphasizes building a functional multiplayer experience with the following capabilities:

- **Real-time multiplayer:** Multiple players can participate simultaneously, with synchronized game states.
- **Cross-device accessibility:** Players can join from their own computers or mobile devices.
- **No installation required:** The game runs directly in a web browser.
- **Room-based multiplayer:** Players can join friends through a room code or invitation link.
- **No account required:** Players should be able to participate without registering or logging in.
- **Accessible gameplay:** New players should understand the rules without requiring an explanation from the developer.
- **Public deployment:** The finished game must be accessible through a publicly shareable URL.

The competition also emphasizes AI-assisted software engineering, including requirements gathering, specification approval, iterative development, testing, and debugging.

## 🕹️ About the Game

**Get Down, Mr. President!** is a browser-based, 1v1 multiplayer party game built around a simple premise: protect the president or create enough chaos to break through the defense.

Players compete in two opposing roles:

- **Bodyguard:** Protect the president by intercepting incoming threats.
- **Protester:** Attempt to get past the bodyguard's defenses using movement and carefully timed throws.

The planned experience focuses on fast-paced interactions, timing, and synchronized multiplayer gameplay.

The game is designed to be accessible from a browser without requiring players to install software or create accounts.

## 🚧 Development Status

**Current Stage: Milestone 1 — Multiplayer Feasibility Prototype**

The project currently contains an initial multiplayer prototype focused on verifying networking, movement synchronization, collision detection, and server-authoritative game rules.

The approved project specification is available in [PROJECT_REQUIREMENTS.md](PROJECT_REQUIREMENTS.md).

The current prototype uses a fixed testing arena rather than the complete planned game environment.

### What Has Been Implemented

- Browser-based multiplayer architecture
- Two-player room creation and joining
- WebSocket communication
- Server-authoritative game simulation
- Basic player movement and jumping
- Initial dive and throw actions
- Projectile interception detection
- Client-side prediction and reconciliation
- Automated simulation and networking tests
- Initial public deployment to Cloudflare Workers

### What Remains

- Complete scrolling game environment
- Moving parade and platforms
- Role selection and ready system
- Finished scoring and results experience
- Improved reconnect and recovery behavior
- Audio and visual polish
- Mobile-friendly gameplay controls
- Additional security and abuse protections
- Real-world, cross-device latency and performance testing

**The prototype is not yet the finished competition submission.**

## 🌐 Live Prototype

**Public URL:**  
https://get-down-mr-president.getdownmrpresident.workers.dev

The initial Cloudflare deployment was created on October 23, 2026.

The deployed multiplayer transport smoke test passes using two scripted WebSocket clients. Actual two-device gameplay and performance verification remain pending.

## 💻 Running Locally

Install Node.js (a modern supported LTS release is recommended).

Then run:

```bash
npm ci
npm run check
npm test
npm run build
npm run dev
```

Open the local address printed by Wrangler, normally:

```text
http://localhost:8787
```

### Testing Multiplayer Locally

1. Create a room in one browser.
2. Open the invitation link in another browser.
3. The first participant becomes the bodyguard.
4. The second participant becomes the protester.
5. Click **Start test** once both players have joined.

### Controls

| Action | Keyboard |
|---|---|
| Move | A / D or Arrow Keys |
| Jump | Space |
| Dive / Throw | J |

The current fixed arena is intentionally designed to isolate movement and interception testing.

After modifying client code, rebuild using:

```bash
npm run build
```

Wrangler watches server source files, but development reloads may interrupt active rooms.

## 🧪 Testing and Verification

With the local server running, execute:

```bash
node tests/room-smoke.mjs http://127.0.0.1:8787
```

The automated smoke test creates two scripted WebSocket clients and verifies:

- Identical projectile interception events across clients
- Correct Composure behavior after a successful block
- Proper game interruption following a player disconnect

These automated tests do not replace human multiplayer testing across separate devices and internet connections.

## 🏗️ Technical Architecture

| Component | Technology / Responsibility |
|---|---|
| Frontend | Phaser and browser-based rendering |
| Game Simulation | TypeScript fixed-step simulation |
| Networking | WebSockets |
| Backend | Cloudflare Workers |
| Multiplayer State | SQLite-backed Durable Objects |
| Testing | Simulation tests and transport smoke tests |
| Hosting | Cloudflare Workers Free |

### Project Structure

```text
client/
  Phaser rendering, keyboard input,
  prediction, reconciliation, smoothing

shared/
  simulation.ts
  Fixed-step game rules and projectile contacts

server/
  index.ts
  Static assets, Worker, and room Durable Objects

tests/
  Automated simulation and transport tests

docs/
  Feasibility evidence, limitations, time tracking
```

### Prototype Networking Configuration

| Parameter | Initial Setting |
|---|---|
| Simulation Frequency | 60 Hz |
| Snapshot Frequency | Nominal 20 Hz |
| Routine Client Input | 15 Hz |
| Ping Interval | 2 seconds |

Immediate transitions and actions are transmitted separately from routine client inputs.

These settings are initial engineering targets, not verified production performance guarantees.

Game outcomes are determined by the server. Phaser physics is not executed server-side.

## ☁️ Deployment

The project targets **Cloudflare Workers Free** to keep hosting costs at $0.

To deploy:

```bash
npx wrangler login
npm run deploy
```

Before deployment, verify the intended Cloudflare account and free plan. Do not enable paid services.

The deployment combines static assets and multiplayer room functionality within the same Worker.

Cloudflare billing configuration and free-tier resource usage must still be verified.

Never commit credentials or secrets to the repository.

## ⚠️ Current Limitations

This repository currently represents a feasibility prototype rather than a finished multiplayer game.

The prototype does not yet contain the full parade environment, platforms, role selection, ready flow, results, reconnect credentials, complete recovery mechanisms, audio, or release-grade abuse protections.

Room expiration is basic, and server restarts discard active tests. Starting the current test does not reset an existing session; players must disconnect and rejoin.

Real keyboard responsiveness, latency behavior, network timers, hibernation, CPU accounting, and free-tier capacity still require further verification.

Prototype graphics use generated rectangles rather than third-party art assets. Phaser and other dependencies retain their respective licenses.

## 🎯 Competition Objective

The goal is to deliver a complete, publicly playable version of **Get Down, Mr. President!** before the Handshake submission deadline of **October 31, 2026**.

The final submission aims to demonstrate:

1. A functional real-time multiplayer game.
2. Reliable state synchronization across independent devices.
3. Accessible browser-based gameplay without downloads or accounts.
4. An intuitive room creation and joining experience.
5. A documented AI-assisted engineering process, from requirements to testing and deployment.

The project is being developed using ChatGPT as an AI-assisted engineering tool, following an approved requirements specification and milestone-based implementation process.

---

**Developed for the Handshake "Create a Multiplayer Game" Challenge — October 2026.**

*Competition entry in development. Final submission and eligibility are subject to Handshake's official challenge rules.*
