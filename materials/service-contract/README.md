# External analytical-service contract

The case study treats spatial analysis as an externally supplied capability. The implementation of that service is therefore **not included** in this artifact.

This directory contains only the HTTP contract needed by the released plugin:

- `openapi.yaml`: endpoint and payload specification;
- `requests/`: representative requests for the frozen OSM fixture;
- `overpass/`: the query used to select the eight OSM tag families.

Complete representative responses are recorded under `../test-fixture/expected-results/`. The repository-level mock server replays those responses so that the framework-level invocation and presentation workflow remains executable. It is not an analytical implementation and must not be used to benchmark or validate the external algorithms.
