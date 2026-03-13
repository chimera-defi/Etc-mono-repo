# SpecForge Collaboration Server

This is the dedicated collaboration runtime for the SpecForge MVP.

Current state:
- Hocuspocus server scaffold is runnable
- default port is `4321`
- document rooms are created on demand by Hocuspocus
- the web editor connects to rooms keyed by `document_id`

Planned next slice:
- authentication hooks
- awareness/presence wiring
- document persistence hooks
- stronger integration tests with the web app editor client
