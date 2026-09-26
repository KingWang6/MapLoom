# Implementation and evidence scope

This document distinguishes what the released prototype implements, what the manuscript evaluates, and what remains outside the current evidence.

The release contains obfuscated executable framework packages, public type declarations, manifests, and schemas. Framework implementation source is intentionally not distributed; “implemented” below describes capabilities present in those executable packages.

## Implemented in the released prototype

- AppSpec parsing through the TypeScript object model and the released JSON representation;
- a machine-readable AppSpec v0.1 core JSON Schema;
- plugin manifests, capability registration, and runtime lookup;
- event dispatch and sequential Action execution within a Binding;
- `$event` and `$state` value resolution;
- shared-State reads, writes, and UI subscriptions;
- one concrete OpenLayers map adapter;
- reusable WebGIS widgets, interactions, and Actions;
- spatial-analysis plugin Actions that invoke HTTP analytical services;
- an OpenAPI description of the external service boundary and a recorded-response mock for the released OSM fixture;
- dynamic result Sources and Layers, execution status, error feedback, and result summaries.

## Implemented but not generally validated

- the plugin contract is exercised by the plugins in this repository, but compatibility among independently developed implementations has not been studied;
- the map-adapter abstraction has one released concrete implementation and therefore does not establish cross-engine portability;
- the capability-composition mechanism is demonstrated by the included case rather than by a broad application corpus;
- asynchronous service calls are supported, but general cancellation, stale-response rejection, and high-concurrency scheduling are not implemented;
- the recorded-response mock demonstrates integration only and does not implement or validate the external analytical algorithms.

## Evaluated in the manuscript

- end-to-end execution of the Nanjing POI application;
- POI loading and runtime-mediated feature selection at three displayed POI counts;
- grid-density, DBSCAN, and urban-function analytical workflows;
- browser-observed service-call time, end-to-end latency, coordination/result-update time, memory consumption, and execution completion under the reported workloads.

The OSM replacement fixture and recorded responses released here verify the executable framework-level workflow but do not reproduce the manuscript's measurements because neither the external service implementation nor the restricted experimental dataset is redistributed.

## Future work and outside current evidence

- automatic composition and fail-fast enforcement of third-party plugin schemas;
- cross-plugin event-payload compatibility checking;
- dependency resolution and version negotiation;
- independently developed plugin ecosystems;
- general cancellation, stale-result rejection, high-concurrency execution, and distributed task scheduling;
- portability across alternative map engines and analytical backends;
- reproduction or independent validation of the external analytical algorithms;
- empirical reductions in development effort and transfer across materially different applications.
