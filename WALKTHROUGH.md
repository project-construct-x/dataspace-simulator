# Simulator Walkthrough

This walkthrough is a click-by-click guide for understanding the full simulator flow.

## 0) Start the simulator

Run:

```bash
docker compose up -d --build
```

Open `http://localhost:4000`.

## 1) Pick two participants

Goal: one node publishes, another node searches and requests.

Example:
- Provider: `NordBeton AG`
- Consumer: `Stahlwerk Weber`

What to do:
1. Use `NordBeton AG` as the provider node (this node will publish).
2. Use `Stahlwerk Weber` as the consumer node (this node will search/request).
3. Click a node to open its panel, then switch to the other node when needed.
4. Confirm both nodes are snapped to the dataspace ring (connected position).

What happens technically:
- Node data and claims are loaded from backend (`/api/nodes`).

## 2) Publish an asset on provider

Goal: create a dataset with metadata and policy.

What to click:
1. Click `NordBeton AG`.
2. In the connector panel, open data storage and click `Publish Asset`.
3. Upload a file (`.json`, `.csv`, or `.txt`).
4. Fill `Title` and optional `Description`.
5. Select policy (for first test, choose `Open`).
6. Optionally add DCAT metadata fields (keyword/theme/spatial/etc.).
7. Click `Publish Asset`.

What happens technically:
- Backend stores asset + payload in SQLite.
- Backend indexes semantic metadata in Fuseki as RDF/DCAT.

## 3) Run normal browse discovery

Goal: understand provider discovery and catalog access.

What to click:
1. Click `Stahlwerk Weber`.
2. Open `Browse Dataspace`.
3. In `Browse` tab, click `Search`.
4. Click `View Catalog` for a provider.

What you see:
- Discovery/control-plane animations.
- Provider catalog assets in the panel.

What happens technically:
- Frontend requests policy-filtered catalog from backend.
- Backend filters visibility using consumer claims.

## 4) Run semantic search

Goal: see catalog-first semantic behavior.

What to click:
1. Stay in `Browse Dataspace`.
2. Switch to `Semantic Search` tab.
3. Enter search text (example: `boat`) and click `Go`.
4. Optional: add field filters (DCAT key + value), then `Go`.

What you see:
- Live status text phases (discovering/collecting/querying/preparing).
- Result cards with title, description, metadata.

What happens technically:
- Backend first computes policy-visible assets.
- Backend passes only visible dataset IDs into SPARQL filter.
- SPARQL ranks/refines only within allowed IDs.

## 5) Request contract from semantic result

Goal: contract + transfer from semantic result card.

What to click:
1. In a semantic result card, click `Request Contract`.

What you see:
- Negotiation animation (control plane).
- Contract phase status.
- Automatic transfer phase.

What happens technically:
- Backend creates negotiation and advances states.
- On agreement, transfer is initiated.
- Asset payload is copied to consumer received storage.

## 6) Verify asset arrived at consumer

What to click:
1. Close popup if needed.
2. In `Stahlwerk Weber` connector, open data storage.
3. Check received asset entry.

What to verify:
- Asset appears as received.
- Source/provider is shown.
- Metadata is visible.

## 7) Test policy-denied scenario

Goal: show governance effect.

What to click:
1. Publish a new asset on provider with restrictive policy (industry/role/DID group).
2. Run semantic search as consumer without matching claims.

Expected outcome:
- Asset not visible in catalog or semantic results, or negotiation denied.

What happens technically:
- Same policy model is applied to catalog visibility and negotiation enforcement.

## 8) Recommended demo script (5 minutes)

1. Publish one open asset on provider.
2. From consumer, run semantic search and show result.
3. Click `Request Contract` and show auto transfer.
4. Show received asset at consumer.
5. Publish second asset with restrictive policy.
6. Show that it is filtered/denied.

## 9) Troubleshooting quick checks

- No semantic results:
  - Ensure asset is published and description/title contains search term.
  - Ensure policy allows consumer visibility.
  - Check active field filters in semantic UI.

- Search works but no result card for expected asset:
  - Confirm provider is not the same active consumer node.
  - Confirm node is connected in ring.

- Transfer does not appear:
  - Check negotiation status in UI.
  - Check backend logs (`docker compose logs -f sim-backend`).

## 10) Where to read more

- Overview: `simulator/README.md`
- Presentation narrative: `simulator/PRESENTATION.md`
- Technical details: `simulator/DOCUMENTATION.md`
