# server

Empty until milestone F4.

F4 adds a minimal local bridge so the web app can attach to real terminals:

- Fastify + `ws` + `node-pty`.
- `GET /term/:session` upgrades to a WebSocket and attaches to `tmux new-session -A -s <session>`.
- Binds to `127.0.0.1` only and requires a token from `.env` on the WebSocket URL.
- Closing the browser tab never kills the tmux session.

Until then the web app talks only to the mock `ApiClient` in `web/src/api/mock/`.

## Node native module note

`node-pty` 1.1.0 ships N-API prebuilds and works on the Node version pinned in `.nvmrc`.
npm 11 blocks lifecycle scripts by default, so installing it will need
`npm install-scripts approve node-pty`. See `docs/decisions.md`.
