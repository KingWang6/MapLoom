# Reproduction guide

## 1. Install the released artifact

From the repository root:

```powershell
npm run install:web
```

The frozen Nanjing boundary, raw OSM snapshots, prepared POIs, and representative responses are already versioned under `materials/test-fixture/`. Network access is not required for the standard verification workflow.

## 2. Build and verify

```powershell
npm run verify
```

This command builds the case against the released obfuscated framework packages, tests the recorded-response mock, validates the public reproduction AppSpec, and verifies POI identifiers, fields, district containment, licensing metadata, and recorded response summaries.

These checks verify artifact integrity and framework-level integration. They do not rerun or validate the external analytical algorithms.

## 3. Run the interactive case

Terminal 1:

```powershell
npm run dev:analysis
```

This starts a local mock at `http://127.0.0.1:8000`. It serves 16,488 prepared OSM POIs and replays recorded analytical responses; it contains no DBSCAN, grid, or urban-function implementation.

Terminal 2:

```powershell
npm run dev:case
```

Open <http://127.0.0.1:5176>.

## 4. Inspect the contracts and AppSpec configurations

- `materials/appspec/appspec-v0.1.schema.json`: stable AppSpec core structure;
- `materials/appspec/iufzs-manuscript-appspec.json`: AppSpec configuration corresponding to the manuscript experiments;
- `materials/appspec/iufzs-reproduction-appspec.json`: runnable configuration adapted to the released OSM-based Nanjing fixture;
- `materials/service-contract/openapi.yaml`: external analytical-service boundary;
- `materials/service-contract/overpass/nanjing-poi.overpassql`: OSM selection query;
- `materials/service-contract/requests/`: representative analysis requests;
- `materials/test-fixture/expected-results/`: recorded responses.

The manuscript and reproduction AppSpecs intentionally differ in several data-dependent parameters. The manuscript configuration records the parameters reported in the paper, whereas the public reproduction configuration is tuned for the redistributable OSM fixture. These differences do not alter the AppSpec structure, plugin interfaces, or runtime coordination mechanism under evaluation.

## 5. Optional OSM refresh

The committed snapshot should be used for exact reproduction of the released artifact. To intentionally refresh it from live OSM:

```powershell
npm run download:osm
npm run prepare:osm
```

The downloader caches each queried tag family and uses serial requests. A refreshed OSM snapshot will change the POI count and invalidate the committed expected analytical responses and their assertions; those responses can only be regenerated through a compatible external analytical implementation.

## Expected limitations

- The external analytical-service implementation is intentionally not released.
- Recorded responses allow the integration workflow to run but do not demonstrate analytical correctness or recomputation.
- The OSM replacement dataset differs from the restricted manuscript dataset and must not be used to reproduce the manuscript's numerical analytical results or benchmark timings.
- OSM completeness and tagging density vary spatially; observed density is partly a mapping-coverage effect.
- The artifact verifies one OpenLayers implementation rather than cross-engine portability.
