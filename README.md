# Dataspace Simulator

Standalone interactive simulator for teaching and demonstrating core dataspace workflows,
including catalog visibility, policy-based access, semantic search, negotiation, and transfer.

## About

This project provides a reproducible local dataspace environment focused on conceptual
correctness and explainability rather than full protocol compliance. It is designed for
research demos, classroom settings, and semantics-focused evaluation.

### What is included

- Visual frontend for discovery, catalog browsing, semantic search, negotiation, and transfer
- Backend orchestration with policy checks and negotiation/transfer state machine
- RDF/DCAT metadata indexing and SPARQL querying via Apache Fuseki
- Persistent local storage using SQLite and Docker volumes

### Out of scope

- Full DSP/EDC interoperability
- Production-grade trust infrastructure and identity federation
- Real network-level data plane implementation

## Documentation

The key documentation is in this `README.md` and covers architecture, setup, and runtime behavior.

## Getting Started

### Prerequisites

To run and work with this project, the following prerequisites are needed:

- Docker Desktop (or Docker Engine) with Docker Compose support

### Installation

To run this project, execute the following steps:

1. Clone this repository

   ```sh
   git clone https://github.com/project-construct-x/<your-repo>.git
   ```

2. Open the project directory

   ```sh
   cd <your-repo>
   ```

3. Start all services

   ```sh
   docker compose up -d --build
   ```

4. Open the applications

   - Simulator UI: `http://localhost:4000`
   - Backend API: `http://localhost:4001`
   - Fuseki UI: `http://localhost:4030`

## Runtime Architecture

| Component | Role | Port |
|---|---|---|
| `sim-frontend` | React-based interactive simulator UI | 4000 |
| `sim-backend` | Node.js API, policy checks, state machine, persistence | 4001 |
| `sim-fuseki` | RDF store and SPARQL endpoint for semantic metadata | 4030 |

Persistence:

- SQLite database in backend container at `/data/simulator.db`
- Fuseki dataset stored in Docker volume `fuseki-data`

## Functional Flow

1. Participants with claims (for example `industry`, `orgRole`) interact as providers/consumers.
2. Providers publish assets with optional policies and optional semantic metadata.
3. Catalog visibility is filtered by policy before semantic ranking is applied.
4. Semantic search runs SPARQL in Fuseki, restricted to policy-visible datasets.
5. Negotiation follows `REQUESTED -> OFFERED -> AGREED` or `TERMINATED`.
6. Transfer is completed through the backend state machine and persisted for visualization.

## Semantic and Policy Model

Assets are mapped to RDF as `dcat:Dataset` resources with common predicates such as
`dct:title`, `dct:description`, `dcat:keyword`, and `dcat:theme`.

Policies are represented as constraint sets and evaluated against consumer claims at:

- Catalog stage (visibility)
- Negotiation stage (contractability)

This separation makes policy filtering and semantic ranking behavior explicit and reproducible.

## Project Structure

```text
backend/
  server.js            API and orchestration
  db.js                SQLite schema and persistence
  semantic.js          RDF mapping, Fuseki I/O, SPARQL search
  policy.js            Policy evaluation
  state-machine.js     Negotiation and transfer lifecycle
frontend/
  src/                 UI components and pages
  package.json
docker-compose.yml
LICENSE
LICENSE_non-code
README.md
```

## License

All code files are distributed under the Apache 2.0 license.
See [LICENSE](./LICENSE) for more information.

All non-code files are distributed under the Creative Commons Attribution 4.0 International license.
See [LICENSE_non-code](./LICENSE_non-code) for more information.
