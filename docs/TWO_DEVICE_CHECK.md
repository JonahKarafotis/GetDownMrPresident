# Required human feasibility check

Public build: https://get-down-mr-president.getdownmrpresident.workers.dev

1. Open in Chrome on the Mac and Windows computer (separate networks if practical).
2. Create a test room on the Mac and share its invitation with Windows.
3. First participant is bodyguard; second is protester. Start the test once both connect.
4. Click the game area. Use A/D or arrows, Space, and J. Move the guard into/out of the tomato path; try ground and airborne dives. The test arena has no automatic parade yet.
5. Confirm both screens show the same saves, hits and Composure. Report any apparent save that becomes a hit, input delay, jumping failure, or visible snapping.
6. Close one player's tab. Remaining player should see waiting state; rejoin the invitation and start again.

Please record: exact computer/browser, same or separate network, room joining time, observed RTT, whether controls work, and whether defense feels responsive. This qualitative check is not the full release benchmark. Do not share authentication credentials.

Known prototype limits: roles follow join order; no role selection, ready flow, full round/results, or reconnect identity yet. Public build may differ from newer local hardening changes; consult FEASIBILITY_REPORT.md.


## Recorded result

October 23: owner reports PASS on two computers, synchronized gameplay, little or no perceived delay, and properly working dive/block/throw/jump/left-right movement. Exact hardware/browser versions and network setup remain unrecorded. This does not constitute instrumented performance or 30-minute stability acceptance.
