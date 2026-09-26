# Environment information

## Reproduction environment

The artifact is intended to run with:

- Windows, Linux, or macOS;
- Node.js 22.12 or later;
- npm 10 or later;
- a current Chromium-based browser.

Exact JavaScript dependencies are recorded in the committed package lock files. Python is listed below only because it was part of the manuscript benchmark environment; it is not required to run the released artifact.

## Manuscript benchmark environment

The quantitative evaluation reported in the manuscript used:

- 64-bit Windows 11;
- Intel Core i7-14650HX, 16 cores and 24 logical processors;
- 48 GB RAM;
- OpenLayers 10.9.0;
- CPython 3.12.13;
- headless Chrome 153.0.0.0;
- a 1280 × 720 browser viewport;
- frontend and backend services on the same workstation through loopback networking;
- three warm-up runs followed by ten measured runs per condition.

Those measurements require the restricted full case-study dataset and are reported for transparency; they are not expected outputs of the OSM replacement fixture.

## Coordinate assumptions

The released Nanjing boundary, OSM fixture, and recorded responses use WGS84 longitude–latitude coordinates. The external-service contract expresses DBSCAN thresholds and grid sizes in metres. The recorded DBSCAN implementation uses spherical distance, while the grid workflow converts angular offsets to local metre scales. That analytical implementation is not part of this release. OpenLayers transforms GeoJSON from EPSG:4326 to EPSG:3857 for display.
