# Get Down, Mr. President! — Project Requirements and Specification

Version: 1.0, approved October 22, 2026.
Owner: Jonah Karafotis, sole developer with AI assistance.
Status: PRD and Stage 10 approved. Implementation explicitly authorized October 23, 2026. Milestone 1 is in progress; no hosted feasibility or release validation has passed. See docs/FEASIBILITY_REPORT.md.
Schedule timezone: America/New_York; October 31, 2026 is EDT (UTC−4).

## 1. Executive summary

Deliver a complete, humorous, browser-only 1v1 party game by October 31, 2026, within 60 focused implementation hours and a strict $0 monthly hosting budget. A bodyguard protects an automatically advancing president while a protester throws tomatoes. Fixed-arc attacks, positioning, jumping, and defensive dives create the core contest. Five starting Composure points and a 2–3 minute route are initial tuning values.

The first release is deliberately smaller than the long-term 3v3 vision. Its success depends on enjoyable repeated rounds, understandable interactions, reliable remote multiplayer, and a professional portfolio presentation.

## 2. Problem statement and objectives

Provide friends with an accessible shared activity that creates dramatic saves, humorous failures, and a reason to rematch. Demonstrate delivery of a complete software product, including authoritative networking, usable interfaces, testing, deployment, and documentation.

Priorities: reliable multiplayer; complete gameplay; complete lobby-to-rematch journey; essential recovery; cohesive presentation. Optional content must never consume protected release-testing time.

## 3. Users and use cases

Primary audience: casual friend groups. Secondary audiences: party-game enthusiasts, content creators, Handshake reviewers, and portfolio visitors.

Primary use case: one friend creates a private room, shares its invitation, and plays repeated rounds with another friend on a separate computer. Both experience each role. Players need no accounts, downloads beyond normal web assets, extensions, or prior game-engine knowledge.

## 4. Functional requirements

All rows below are mandatory submission requirements unless explicitly labeled otherwise. Verification groups are defined in section 16. Every requirement starts **Not Tested**. Passing a group requires checking each associated requirement, not merely executing one example.

| ID | Requirement and acceptance criteria | Verification |
|---|---|---|
| FR-001 | Public HTTPS game supports two humans on separate computers over the internet, entirely in-browser. | QA-004, QA-006, QA-008 |
| FR-002 | Landing screen offers Create Game, Join Game, and concise How to Play instructions for both roles. | QA-002, QA-007 |
| FR-003 | Each private room has a securely generated six-character alphanumeric code and shareable URL; copy-link control works. Code allocation checks conflicts with existing rooms. Rooms are unlisted; possession permits entry into an open slot. | QA-002, QA-003 |
| FR-004 | Exactly two connected participants maximum; one bodyguard and one protester. Exclusive role claims resolve consistently; changing role clears readiness. Host starts only when both are connected, assigned, and ready. | QA-002 |
| FR-005 | Lobby shows player slots, connection status, role instructions, and Ready controls. Start and rematches use a synchronized three-second countdown and role objective reminder. | QA-002, QA-007 |
| FR-006 | A/D or Left/Right move and face; Space jumps; J activates the role action. Last facing persists while stationary. Normal jumps allow horizontal control. Movement is responsive and not excessively slippery. | QA-001, QA-004, QA-007 |
| FR-007 | J requires a fresh press; cooldown presses do not queue or disrupt movement. Browser scrolling does not interfere. Focus loss clears held input; returning requires fresh presses. | QA-001, QA-003, QA-007 |
| FR-008 | One handcrafted 2D platform-style route scrolls with the automatically advancing president. Include basic elevated platforms and obstacles; no depth-axis movement. | QA-001, QA-006 |
| FR-009 | Tomato Toss uses fixed launch angle/speed and gravity, follows facing, and works standing, moving, or jumping. Each accepted action has cooldown/recovery. Horizontal momentum inheritance is optional. | QA-001, QA-006 |
| FR-010 | Reject throws if the protester overlaps the president or the projectile would spawn inside him. Reject before cooldown/recovery; show “Move away to throw!” Only tomatoes reduce Composure. | QA-001, QA-007 |
| FR-011 | Bodyguard contact destroys tomatoes with visible block feedback and no significant stun. Dive is a fast horizontal lunge in facing direction, ground or air, with extended interception hitbox, committed direction, brief recovery, and shared cooldown. | QA-001, QA-006, QA-007 |
| FR-012 | Bodyguard and president use gentle separation when their bodies overlap; president cannot be blocked. Protester passes through both characters but collides with terrain. Dives do not damage or knock down characters. | QA-001, QA-006 |
| FR-013 | Resolve projectile contact along its swept path, earliest contact first. Exact bodyguard/president contact tie favors bodyguard. Proximity alone never blocks. Geometry and removal must prevent duplicate hits and tunneling. | QA-001, QA-006 |
| FR-014 | Fixed non-regenerating Composure; each valid tomato hit removes one. Protester wins at zero; bodyguard wins at route end with Composure remaining. Exact final-hit/finish-time tie favors protester. | QA-001 |
| FR-015 | Finalize each round once. No later input, damage, interruption, or delayed event can overwrite its outcome. Interruption processed before finalization produces no winner. | QA-001, QA-003 |
| FR-016 | HUD shows Composure, route progress, J action reminder and cooldown; hits and blocks have distinguishable visual/audio feedback. Confirmed outcomes come only from server events. | QA-004, QA-006, QA-007 |
| FR-017 | Fully trailing off-screen players receive “Catch up!” and approximately one second to recover. Returning resets the warning. Otherwise reposition to safe grounded on-screen locations, cancel active actions, preserve cooldowns, and restore control immediately. Avoid overlap with president/terrain and unfair instant attacks or blocks. Leading boundary prevents moving entirely off-screen. | QA-001, QA-006, QA-007 |
| FR-018 | Results show winner, humorous outcome message, remaining Composure, upcoming roles, Play Again, and Return to Lobby. Both confirm rematch; roles swap and all gameplay state resets before countdown. | QA-002, QA-006 |
| FR-019 | Either player can return both to lobby from results. During gameplay, confirmation is required: “End this round for both players?” Dialog clears local inputs but does not pause. Confirm interrupts without winner, clears readiness/state, preserves room, and notifies opponent. | QA-002, QA-003 |
| FR-020 | Confirmed disconnect interrupts active round and clears readiness; slot becomes immediately available. Remaining player inherits host permissions. Original invitation remains usable while room exists. | QA-002, QA-003 |
| FR-021 | Server-generated unpredictable room-scoped tokens in browser session storage recognize returning players. Validate token before replacing stale connection; invalidate old connection input. Store token hashes where practical. Reassignment revokes old owner's token; expired/invalid tokens cannot evict occupants. | QA-002, QA-003 |
| FR-022 | Clear errors for full, expired, and unknown rooms; missing/invalid token only permits a normal join into an open slot. Concurrent joins cannot claim one slot twice. | QA-002, QA-003 |
| FR-023 | Empty rooms expire after 30 minutes; a valid rejoin cancels expiry. Occupied rooms remain available subject to hosting limits. Preserve minimal metadata across hibernation; never assume stored players are still connected or ready. | QA-002, QA-003 |
| FR-024 | Active match stays in memory; no exact resume after restart/interruption. Latest result survives only for current results view. No accounts, history, progression, rankings, or permanent profiles. | QA-002, QA-003 |
| FR-025 | Stale input around 500 ms clears movement only; authorized dives/projectiles/cooldowns continue. Silent connection failure around 10 seconds interrupts; explicit closure acts immediately. Periodic input/health messages support detection. Recovered traffic cannot replay stale action bursts. | QA-003, QA-004 |
| FR-026 | Serious simulation corruption interrupts active round, logs compact diagnostics, and restores clean lobby if possible. Unrecoverable room offers Retry Connection and Main Menu. No technical stack traces shown to players. | QA-003 |
| FR-027 | Incompatible shared gameplay/protocol identifier rejects participation before inputs. Show “Game updated — refresh to continue” and Refresh Game; preserve room/token where available. Visual-only changes need not change compatibility ID. | QA-003, QA-008 |
| FR-028 | Backend unavailability shows “Multiplayer is temporarily unavailable. Please try again later,” Retry and Main Menu. No invented winner or client-authoritative continuation; preserve static menu where possible. | QA-003, QA-008 |
| FR-029 | Cohesive retro pixel-art presentation, readable movement/action/impact feedback, basic sound effects, and mute. Use licensed existing and limited original assets; keep attribution record. Music and elaborate animation are optional. | QA-007, QA-008 |

## 5. Nonfunctional requirements

| ID | Requirement and acceptance criteria | Verification |
|---|---|---|
| NFR-001 | Strict $0 hosting; no paid upgrades, provider changes, or new paid infrastructure without explicit approval. No unexpected billable configuration. | QA-005, QA-008 |
| NFR-002 | Main menu interactive in ≤5 seconds with empty cache; create and join in ≤2 seconds. 20 trials per metric per primary device, ≥19 passing. Connection ≥25 Mbps; record device/network. Include inactivity and five-room conditions. | QA-004 |
| NFR-003 | Target 60 FPS at 1280×720 internal resolution; ≥95% active focused gameplay frame intervals ≤20 ms. Record visible stalls separately. | QA-004 |
| NFR-004 | Local visible input feedback ≤50 ms at 95th percentile; ≥100 samples per device. | QA-004 |
| NFR-005 | At ≤100 ms client/server RTT, collision-to-confirmed-feedback delay ≤200 ms at 95th percentile; ≥100 event samples per device. Account for clock offset and uncertainty. | QA-004 |
| NFR-006 | At approximately 200 ms RTT, preserve consistent state/outcomes, no duplicate or stale replay, and functional recovery; extra delay/correction is acceptable. | QA-003, QA-004 |
| NFR-007 | Five simultaneous 1v1 rooms for ten minutes: one real two-device match and four simulated rooms with representative traffic. Room state isolated; one injected room failure must not corrupt others. | QA-005 |
| NFR-008 | Estimate ten active room-hours/day from measured resource use, including connection/lobby overhead. Label extrapolation; idle rooms stop simulation/unnecessary snapshots. Workload is a validation target, not a hard room limit. | QA-005 |
| NFR-009 | At least 30 minutes AND ten completed rounds: zero unexpected crashes, freezes, disconnects, duplicate actions, or conflicting outcomes; no observed unbounded resource growth. Controlled disconnect/rejoin tested separately. | QA-006 |
| NFR-010 | Primary release verification: Chrome on newer MacBook Pro/macOS and Windows 11 desktop. Record exact hardware and browser versions. Edge/Safari secondary; Firefox/Linux desirable but not required validation baseline. No dedicated GPU intended; broader hardware performance remains unverified. | QA-004, QA-008 |
| NFR-011 | Two first-time testers understand objective/controls in approximately 60 seconds, independently finish both roles, explain hit/block outcomes, and voluntarily choose another round. Missing testers reduce coverage, never count as pass. | QA-007 |
| NFR-012 | Server validates types, sizes, values, permissions, phase, sequence, round ID, cooldown, and connection ownership. Normal rejections nonpunitive; repeated malformed/excessive traffic closes connection using bounded resetting counters. Protect room creation/join attempts. | QA-003 |
| NFR-013 | HTTPS/WSS only for credentials; never include tokens in shared snapshots, invitations, or logs. Compact diagnostic categories include round/tick/phase/subsystem where useful. | QA-003, QA-008 |
| NFR-014 | One understandable repository separates client/shared/server. Automated type checks and focused tests; documented setup, architecture, deployment, licenses, limitations. | QA-008 |
| NFR-015 | Submitted hosted build equals verified build. No known blockers; high-priority usability defects addressed; minor exceptions documented. Failed criteria only change by successful retest or explicit user-approved revision. | QA-008 |

## 6. Scope and exclusions

Mandatory: all FR/NFR rows above, with adjustable values distinguished from final acceptance thresholds.

Optional submission enhancements: music, richer effects, minor route variations, tomato momentum inheritance, session win tally. Do not add these before essentials pass or use protected testing time.

Post-submission expansion: fixed 3v3 with 1–6 humans and bot filling, selectable loadouts, ten role actions, drop-in/drop-out takeover, ragdolls, additional environments. These are not required architecture scaffolding.

Excluded initially: mobile/touch, controllers, shared-keyboard multiplayer, native installations, adjustable aiming, progression, public matchmaking, accounts, chat, interactive tutorial, pause, advanced lag compensation, rollback, and seamless deployment migration.

## 7. Architecture

Browser Phaser client → secure WebSocket → Worker routing → one authoritative Durable Object per room.

Worker serves static assets and routes create/join requests. Durable Object owns all gameplay decisions and room transitions. Shared TypeScript code has no Phaser dependency. Client predicts local movement/dive and reconciles against acknowledged input; remote objects use basic interpolation. Server-confirmed events alone finalize hits, blocks, projectile destruction, damage, and victories.

Use a bounded fixed-step simulation; snapshot rate is independently tunable. Explicitly compare contact/finish times within a step rather than equating every same-tick event. Do not trust client elapsed-time claims to advance authoritative simulation. Specific rates remain feasibility-test decisions.

## 8. Technology rationale

Phaser and TypeScript support browser-focused 2D presentation and one shared implementation language. Workers plus Durable Objects consolidate hosting and authoritative room state without a continuously provisioned VM. Free-tier and timer behavior must be measured. Active game loops prevent hibernation; idle lobby state must be recoverable.

Godot/headless Godot was superseded. Render is only an explicitly reviewed fallback, not preauthorized. Sites' documented exposed capabilities did not establish the needed room backend; direct Cloudflare hosting is selected provisionally.

Reference documentation inspected during planning:
- https://docs.phaser.io/phaser/getting-started/what-is-phaser
- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/durable-objects/best-practices/websockets/
- https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/
- https://developers.cloudflare.com/durable-objects/platform/pricing/

Pricing and platform behavior must be rechecked during setup; documentation is not a completed feasibility test.

## 9. Component responsibilities

`client/`: rendering, input/focus handling, menus/HUD, loading/error states, prediction, interpolation, audio.
`shared/`: simulation types/functions, constants, collision ordering, message contracts and runtime schemas.
`server/`: Worker entry, room routing, Durable Object, slot credentials, persistence, authority, validation, rate limits.
`tests/`: focused rule and room tests, fault/concurrency harness, measurement helpers.
`docs/`: setup, architecture, verification evidence, defect log, attribution and release checklist.

Directory names are recommendations; dependency separation is approved. Pin compatible dependency versions at setup. Avoid unnecessary frameworks and generic future-extension systems.

## 10. Data models and information flow

Proposed minimal models:
- RoomMetadata: room ID/code, created time, emptySince/expiry, schema version, minimal slot credentials and lobby recovery data.
- PlayerSession: stable slot identity, token hash, current connection identity/generation, role, readiness, host designation, validated health times.
- MatchState: round ID, phase, simulation tick/time, countdown, player states, president, projectiles, latest result.
- PlayerState: position, velocity, facing, grounded/action/recovery state, cooldown deadline, last acknowledged input sequence.
- PresidentState: position, route progress, Composure.
- ProjectileState: unique ID, owner, position/velocity, creation/expiry state; swept contact data computed as needed.
- InputMessage: round ID, sequence, horizontal intent, fresh jump/action edges; timing fields are untrusted.
- Snapshot: round/tick, full renderable match state and processed-input acknowledgments; no credentials.
- ConfirmedEvent: round ID, unique event ID, type, simulation time and minimal effect/result data.

Exact fields are implementation design, not permission to add features. Use bounded input history/event deduplication. Reconcile from the authoritative state, discard acknowledged history, and reapply only still-valid pending inputs. Buffer limits must prevent network stalls creating unlimited backlog.

Room data persists only as needed; no per-frame database writes. Latest result is temporary. Token hash/ownership must survive recovery consistently with slot reassignment. No active-match backups. Schema/protocol changes require explicit handling or safe room invalidation, never blind restoration.

## 11. User workflows

Open → Create/Join/How to Play → private lobby → exclusive role selection → both Ready → host Start → three-second countdown → active round → results → both Play Again → swapped roles and fresh round.

Either player can return both to lobby. Mid-round return requires confirmation and interrupts. Server-confirmed disconnect interrupts; host transfers; slot opens. Valid token replaces only its own stale connection or reclaims an unreassigned slot. New ownership revokes old token. Unknown/expired/full rooms show distinct errors without disturbing existing players.

Focus loss clears input but does not pause. Off-screen recovery remains active. Instructions use short text/icons and role-specific cards; HUD never obscures core action. Audio mute is always reachable through the interface.

## 12. Security and reliability

Invitation possession is sufficient entry permission, not authentication of a real-world identity. Reconnect token is a private capability. Random codes reduce casual guessing but do not guarantee secrecy; bound failed joins and creation.

Enforce all permissions and capacity on server. Replace connection generations atomically so a stale socket closure cannot evict a newer connection. Ordinary invalid gameplay requests are not abuse violations. Repeated malformed/oversized/excessive traffic is bounded and disconnectable.

Simulations isolate room state. Treat non-finite coordinates and serious authority exceptions as interrupted rounds. Preserve finalized results against later events. Deployment/restart can interrupt active games; never advertise seamless resume.

## 13. Performance and operational constraints

See NFR-001–010 for exact targets. Free hosting may become unavailable; no automatic payment or provider migration. Prefer static menu survival and clear retry paths. Outages are recorded failures, not silently excluded successes. Operational targets still apply when service is available.

Resource evaluation includes active duration, message volume, static delivery, persistent operations, and lobby monitoring. Account for room timers and health checks preventing idle hibernation. Benchmark evidence must distinguish measured results from daily projections.

Implementation budget: 60 hours from start of implementation, excluding this interview. All setup, deployment, instrumentation, testing, debugging, documentation and submission count. Dates do not reset consumed hours.

## 14. Edge cases and error handling

Required checks include: simultaneous slot/role claims; stale socket replacement; expired/reassigned tokens; unknown/full/expired rooms; duplicate/wrong-round inputs; held keys on focus loss; silent disconnect; queued stale actions; invalid throw spawn; same-step collision ordering; finish-line exact tie; post-finalization interruptions; invalid positions; server exception; recovery positions blocked by geometry; repeated rematches; incompatible client; unavailable hosting.

Implementation must additionally choose simple consistent rules for opposite movement keys, jumping while airborne, tomato spawn overlapping a guard/terrain, projectile expiry, vertical out-of-bounds, countdown interruption, and conflicting result-screen requests. These are open implementation details requiring explicit specification and focused tests before their milestone passes. No new traversal or gameplay feature is implied.

## 15. Development milestones

| Milestone | Hours | Exit evidence |
|---|---:|---|
| Feasibility | 6 | Hosted two-device room, responsive movement/prediction/smoothing, thrown/intercepted tomato with consistent authority, functioning simulation, preliminary latency/load/resource measurements |
| Core round | 12 | Scrolling route, president, movement, actions, interception, recovery, Composure, victory and clean reset |
| Complete journey | 10 | Invitations, lobby, readiness, onboarding, countdown, results and rematches without developer intervention |
| Reliability | 8 | Session recovery, expiration, validation, compatibility, interruption and focused tests |
| Polish | 6 | Tuned mechanics, readable coherent art/effects, basic audio and mute |
| Release testing/fixes | 12 | Protected performance, concurrency, stability, usability and repair time |
| Documentation/submission | 3 | Repository documentation, exact build verification, URL and submission materials |
| Contingency | 3 | Bounded unexpected blockers; unused hours go to fixes |
| Total | 60 | |

October 22–28: incremental implementation; October 28 feature freeze; October 29–30 validation/fixes; October 31 final checks and submission. Exact Handshake cutoff remains TBD; do not assume 11:59 PM.

Work one milestone at a time, with tests and deployment throughout. Small reviewed commits and deliberate deployments; avoid deployments during playtests. Short-lived branches are recommended for substantial changes. AI assistance must produce understandable code and explain material decisions.

Six-hour hard gate: on any critical feasibility failure, stop adding features; record failing criterion, evidence, time spent, likely cause, repair/alternative effort, schedule effect and recommendation. Obtain explicit user approval for a bounded continuation. No automatic paid service, provider migration, major rewrite, or threshold relaxation. Troubleshooting time counts. A rewrite is not assumed to fit.

## 16. Verification and traceability

The FR/NFR tables are the requirements-to-test matrix. No listed requirement lacks an assigned verification group; requirements with tuning or implementation details cannot pass until those details and checks are finalized. Every requirement currently has status **Not Tested**.

| Group | Execution and evidence |
|---|---|
| QA-001 Simulation | Automated movement/cooldown/spawn/interception tests, first-contact ordering, finish tie, one-time result, stale/duplicate outcomes; include chosen numerical edge rules |
| QA-002 Rooms | Automated room lifecycle/ownership tests plus hosted full user journey, rematches and expiry recovery |
| QA-003 Failures/security | Inject stale/lost connections, replaced sockets, invalid/oversized/excessive traffic, exceptions, version mismatch and backend unavailability; verify clean recovery |
| QA-004 Measurements | 20 trials per load/create/join metric per device, ≥19 pass each; ≥100 samples per input and event-latency metric per device; report p95 and clock uncertainty; frame intervals during active focused gameplay; normal/degraded RTT |
| QA-005 Capacity | Five rooms for ten minutes, four simulated and one real; isolate state/failure; measure resources and label ten-room-hour daily projection |
| QA-006 Stability | Two devices, ≥30 minutes AND ≥10 completed rounds with role swaps; no unexpected failures/unbounded growth. Separately test intentional disconnect/rejoin |
| QA-007 New players | Two first-time testers, no coaching: 60-second onboarding, complete both roles, explain collisions, voluntarily replay. Collect confusion/frustration and responsiveness feedback |
| QA-008 Release | Public URL/build match, primary devices, installation-free access, docs, licenses, usage configuration, known limitations, final checklist |

Record CSV/Markdown evidence: build/commit, timestamp, device/browser, network conditions, sample count, results, uncertainty and limitations. Use simple instrumentation, browser tools and small scripts rather than a benchmarking platform. Server timestamps and client presentation timestamps need clock alignment; uncertain measurements are not automatically passes.

Statuses: Passed, Failed, Not Tested, Waived. A waiver requires explicit user approval and rationale. No claims based solely on assumptions. Injected expected failures are separate; failed recovery is a defect.

Defect log: description, reproduction, expected/actual, device/browser/build, severity, status and retest. Block release for broken joining/rounds/rematches, authority disagreement, ordinary crashes/disconnects, broken recovery/ownership, or repeated required performance failure. Resolve major clarity, control and effortless-win issues. Minor cosmetics and nonbaseline browser issues may be documented/deferred.

## 17. Dependencies, assumptions and risks

| Risk/dependency | Consequence and mitigation |
|---|---|
| Cloudflare setup/account/free-tier capability unverified | Six-hour proof including deployment and measurements; no paid fallback without approval |
| Sixty-hour scope is ambitious | Track actual time; freeze scope; protect 12 test hours; simplify presentation, not essential reliability |
| Predicted dive differs from authoritative collision | Early hands-on test, clear confirmed effects, tune speed/arc/cooldown; no advanced lag compensation assumed |
| Fixed arc and one defender create dominant strategy | Test stationary defense and point-blank attack; tune layout and timings; major redesign needs scope review |
| Runtime restarts/hibernation discard memory | Minimal persisted lobby/session state; interrupted active round; validate connections on recovery |
| Free allowance exhausted/outage | Clear unavailable UI; no bills; document failures and request approval for alternatives |
| Art creation exceeds six-hour polish allocation | Use cohesive licensed assets and simple animation; prioritize readable characters/actions |
| Test suite and 120 loading/join trials consume time | Automate repetitive measurements early; keep instrumentation small; do not silently reduce samples |
| Playtesters not yet confirmed | Owner arranges two; one-person fallback explicitly reduced coverage |
| Submission cutoff/fields unknown | Owner verifies ahead of deadline; prepare baseline package early |

## 18. Open decisions and unresolved questions

External prerequisites: exact Handshake cutoff/required fields; Cloudflare account availability; repository destination; exact test hardware/browser versions; first-time tester availability. No service credentials should be embedded in project files.

Bounded implementation decisions: pinned dependencies, simulation/snapshot/input frequencies, client correction/interpolation limits, input expiry protocol, rate/message-size limits, diagnostics retention, memory/bandwidth headroom, room metadata schema and expired-code handling. Distinguishing expired from unknown codes may require a minimal tombstone with bounded retention; no indefinite personal data is warranted.

Gameplay tuning: movement/jump/dive parameters, tomato arc/cooldown/lifetime, exact collision shapes, safe recovery offsets, route geometry. Starting candidates: 5 Composure, 2–3 minute route, Dive 0.4–0.6 seconds, recovery 0.5–0.8 seconds, cooldown around 4 seconds; off-screen grace around 1 second. These are not additional guaranteed thresholds.

Open edge details are listed in section 14. Stage 10, this specification, and implementation are approved as of October 23, 2026. No feature approval authorizes a hosting purchase.

## 19. Completion criteria and readiness

Minimum submission: public installation-free browser game; reliable 1v1 on separate devices; clear rules; playable attack/defense round; complete join-to-rematch flow; required recovery; cohesive readable presentation and audio/mute; passing essential acceptance tests; documented repository and lawful asset use.

Baseline deliverables: game URL, short description and join/play instructions, GitHub source with setup, architecture and limitations. Screenshots/video only if required or feasible; final form requirements TBD.

Readiness assessment: **Conditionally Ready for the six-hour feasibility milestone with implementation authorization granted October 23, 2026. Specification approved; not yet validated for full production delivery or submission.** Core product decisions are defined, but architecture feasibility remains a gate and external setup dependencies must be resolved. Passing the first milestone permits the approved roadmap, not a claim of release readiness. Only verified tests and owner-approved exceptions establish release status.

## 20. Recommended first implementation steps

After authorization: inspect workspace/repository and available tooling; confirm Cloudflare free deployment access and dependency versions; establish client/shared/server skeleton and type checks; deploy smallest static client/room endpoint; connect two devices; add fixed-step shared movement and authoritative tomato collision; add minimal prediction/smoothing and measurement; record six-hour go/no-go evidence.

Implementation must not begin before the interview is complete and the owner explicitly authorizes it.
