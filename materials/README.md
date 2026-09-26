# Reproducibility materials

This directory collects non-framework, non-application artifacts used to inspect and reproduce the paper's framework-level workflow.

## Materials referenced in the manuscript

| Material | Repository location |
| --- | --- |
| AppSpec v0.1 JSON Schema | `materials/appspec/appspec-v0.1.schema.json` |
| AppSpec configuration corresponding to the manuscript experiments | `materials/appspec/iufzs-manuscript-appspec.json` |
| Public OSM-based reproduction AppSpec | `materials/appspec/iufzs-reproduction-appspec.json` |
| Plugin contract and manifest locations | `materials/docs/plugin-contract.md` |
| External analytical-service contract | `materials/service-contract/openapi.yaml` |
| Reproduction guide | `materials/docs/reproduction.md` |

The manuscript AppSpec records the configuration reported for the experiments in the paper. The reproduction AppSpec is adapted to the independently redistributable OSM-based Nanjing fixture. Data-dependent parameter differences between the two configurations reflect differences in the underlying datasets and do not change the AppSpec structure, plugin interfaces, or runtime coordination mechanism exercised by the artifact.

## Directory contents

| Directory | Contents |
| --- | --- |
| `appspec/` | AppSpec JSON Schema, manuscript configuration, and public reproduction configuration |
| `service-contract/` | OpenAPI contract and representative requests for the external analytical service |
| `test-fixture/` | Nanjing boundary, OSM source snapshots, prepared POIs, and recorded responses |
| `docs/` | Environment, implementation scope, plugin contract, and reproduction guide |
| `scripts/` | Recorded-response mock and automated integrity checks |

The external analytical-service implementation and restricted manuscript dataset are not included. The released OSM replacement data are subject to ODbL 1.0.
