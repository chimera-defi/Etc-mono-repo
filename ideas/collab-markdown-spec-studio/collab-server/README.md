# SpecForge Collaboration Server

This is the dedicated collaboration runtime for the SpecForge MVP.

Current state:
- Hocuspocus server scaffold is runnable
- default port is `4321`
- document rooms are created on demand by Hocuspocus
- signed room tokens are verified before websocket clients join
- structured JSON room logs make reconnect/auth failures debuggable locally
- the web editor connects to rooms keyed by `document_id`
- room snapshots are persisted locally under `.data/collab-rooms/` so collaboration state survives server restarts

Planned next slice:
- deeper reconnect and stale-room recovery
- stronger integration tests with the web app editor client
