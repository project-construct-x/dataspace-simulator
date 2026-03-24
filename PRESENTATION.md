# Dataspace Simulator Presentation Guide

This document is a complete presentation and narrative guide for the simulator.
It is written for paper discussions, thesis supervision, demo sessions, and conference talks.

## 1. One-sentence elevator pitch

The Dataspace Simulator is an interactive, reproducible research environment that demonstrates
how policy-constrained catalog discovery and semantic search over DCAT metadata can work
together in a realistic dataspace workflow.

## 2. Problem statement

Many dataspace discussions remain abstract. In practice, stakeholders need to understand:
- how participants become visible to each other,
- how credentials and policies constrain access,
- how semantic discovery can improve findability without bypassing governance.

Real connector stacks are important, but they are also heavy for rapid experimentation and
communication. The simulator addresses this by providing a controlled and explainable setup.

## 3. Core message of the artifact

The simulator demonstrates three principles:

1. Governance first:
   semantic search must not reveal assets outside policy-visible catalog scope.

2. Semantics second:
   SPARQL is used as a refinement layer over already visible assets.

3. Explainability always:
   each step is represented visually, so the process is understandable to technical and
   non-technical audiences.

## 4. What users can do interactively

Users can:
- create and position participants,
- assign roles and credential-like claims,
- publish assets with policies and DCAT metadata,
- run normal discovery and semantic discovery,
- initiate contract negotiation and transfer,
- observe resulting state changes in the UI.

This turns dataspace behavior into a guided, interactive experience.

## 5. Full workflow narrative

Use this section as your default live demo script.

### Step A: Participant setup

- Show at least two participants with provider/consumer roles.
- Explain claims such as `industry` and `orgRole`.
- Clarify that these claims are used in policy checks.

### Step B: Publish an asset

- Publish from a provider with title, description, and optional policy constraints.
- Add DCAT metadata (keywords, theme, spatial, temporal, etc.).
- Upload payload (`JSON`, `CSV`, or `TXT`).

Explain what happens internally:
- record persisted in SQLite,
- RDF/DCAT indexed in Fuseki,
- ready for policy-aware discovery and SPARQL search.

### Step C: Discover and collect catalogs

- Use another participant as consumer.
- Start discovery and observe provider fan-out behavior.
- Explain that catalog visibility is policy-filtered before semantic ranking.

### Step D: Semantic search

- Search by text and/or DCAT field filters.
- Explain status phases shown in UI:
  - participant discovery,
  - catalog collection,
  - SPARQL execution,
  - result preparation.

### Step E: Negotiate and transfer

- Trigger request from a semantic result.
- Show negotiation state transitions.
- Show automatic transfer and resulting consumer-side asset receipt.

Highlight: in this simulator, transfer semantics are represented functionally and persisted,
while low-level network protocol details are abstracted.

## 6. Architecture deep dive

## 6.1 Frontend (`sim-frontend`)

Responsibilities:
- interactive graph/canvas and participant UI,
- publish/discovery/search panels,
- visual animation of discovery, control-plane, and transfer phases,
- user-facing explanation of process state.

## 6.2 Backend (`sim-backend`)

Responsibilities:
- node, asset, policy CRUD,
- policy evaluation,
- negotiation and transfer state machine,
- catalog-first semantic orchestration,
- persistence in SQLite,
- semantic integration with Fuseki.

## 6.3 Semantic store (`sim-fuseki`)

Responsibilities:
- RDF storage,
- named graph isolation by publisher/session context,
- SPARQL query execution.

## 7. Semantics section (paper focus)

This is the most important section for a semantics-oriented paper.

### 7.1 Why catalog-first semantics

A pure semantic endpoint can accidentally leak metadata about non-visible assets.
The simulator avoids this by enforcing:

catalog visibility -> semantic refinement

Only assets already visible in policy-filtered catalog are eligible for SPARQL ranking.

### 7.2 RDF and DCAT usage

Published assets are mapped to `dcat:Dataset` with DCT/DCAT predicates.
Examples of supported metadata dimensions:
- keyword, theme,
- spatial, temporal,
- language, format,
- license, creator,
- conformsTo, contactPoint, landingPage, periodicity.

### 7.3 Named graph strategy

Data is stored in named graphs to model isolation and provenance boundaries.
This supports stronger argumentation for multi-party data semantics and cleaner lifecycle
operations (upsert/delete/search scoping).

### 7.4 Query model

SPARQL queries combine:
- visible dataset IDs from catalog filtering,
- optional free-text matching,
- optional field-level DCAT filters.

The result is semantically rich but governance-preserving search.

## 8. Governance and policy model

Policies are claim-based constraints evaluated against participant metadata.
This enables demonstration of how credentials influence:
- discoverability,
- contract eligibility,
- and therefore downstream transfer outcomes.

This is key for explaining that semantics and governance are complementary,
not competing mechanisms.

## 9. Data transfer semantics in this simulator

Transfer includes payload propagation of the uploaded asset content.
Supported input types in the simulator publish flow:
- `JSON`
- `CSV`
- `TXT`

The simulator persists and propagates this content through negotiation/transfer lifecycle,
while still abstracting away low-level connector transport details.

## 10. Suggested slide deck structure

Use this 10-slide structure for a compact talk:

1. Motivation: why dataspace semantics need interactive explanation
2. Research question and objectives
3. System overview (frontend, backend, Fuseki)
4. Participant and policy model
5. Publish and metadata mapping (DCAT/RDF)
6. Catalog-first semantic search principle
7. Live workflow (discover -> search -> negotiate -> transfer)
8. Observations and lessons learned
9. Limitations and validity boundaries
10. Next steps toward connector-native deployment

## 11. Claims you can safely make in a paper

- The artifact demonstrates policy-constrained semantic discovery in an executable system.
- The workflow is reproducible locally with deterministic setup.
- The simulator makes semantic/governance interactions observable and inspectable.

## 12. Claims you should avoid or qualify

- Full protocol compliance with production connector ecosystems.
- Production performance or scalability conclusions.
- Security guarantees beyond simulation boundaries.

## 13. Evaluation ideas

Potential evaluation dimensions for the paper:
- Usability/explainability: can users correctly describe the workflow after interaction?
- Governance correctness: do policies consistently constrain semantic outcomes?
- Semantic utility: does field-based filtering reduce time to relevant asset discovery?

## 14. Limitations and future work

Current limitations:
- single local runtime for multiple simulated participants,
- simplified transfer implementation,
- no federated trust stack.

Future work:
- connector-native execution path,
- richer ontology alignment and ranking,
- query explanation and provenance traces,
- benchmark scenarios with larger metadata corpora.

## 15. Demo checklist

Before presenting:
- `docker compose up -d --build`
- verify UI at `http://localhost:3000`
- verify Fuseki at `http://localhost:3030`
- create at least 2 participants with different claims
- publish at least 2 assets with different DCAT fields and policies
- test one allowed and one denied negotiation case

## 16. Closing statement

The simulator is intentionally scoped: it does not replace production connectors,
but it provides a strong experimental and communicative bridge between dataspace theory,
semantic metadata practice, and policy-aware discovery behavior.
