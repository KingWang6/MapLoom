# Nanjing open-data fixture

This fixture contains 16,488 OpenStreetMap POIs located within the 11-district Nanjing boundary. It replaces the earlier artificial point distribution and is not derived from the restricted POI dataset used in the manuscript experiments.

## Files

- `nanjing-boundary-wgs84.geojson`: 11 district polygons in EPSG:4326;
- `osm-source/*.json`: eight raw Overpass response snapshots;
- `osm-poi.geojson`: deduplicated, boundary-clipped POIs used by the case;
- `osm-poi.csv`: the same POIs using the database-compatible nine-column schema;
- `expected-results/*.json`: responses recorded from the external analytical implementation;
- `osm-processing.md`: acquisition counts, harmonization rules, and limitations;
- `boundary-source.md`: boundary provenance and coordinate conversion note.

The POI fields are `poi_id`, `name`, `category_l1`, `category_l2`, `function_type`, `address`, `district`, `longitude`, and `latitude`. Ways and relations are represented by the center coordinates returned by Overpass. Records are deduplicated by OSM object type and identifier and then assigned to a district by point-in-polygon testing.

## Recorded analytical parameters

- DBSCAN: `epsMeters = 400`, `minPoints = 10`;
- grid density: `gridSizeMeters = 1000`;
- urban-function identification: `gridSizeMeters = 1000`, `minPoi = 10`, `mixedThreshold = 0.70`.

The DBSCAN distance was selected for this OSM snapshot after checking 300–800 m alternatives. At 400 m the recorded result contains 171 clusters and 3,732 noise points; 800 m merged 11,006 of 16,488 points into one cluster and was therefore not used for this replacement dataset.

## Attribution

POI data © OpenStreetMap contributors, ODbL 1.0. See <https://www.openstreetmap.org/copyright>. The snapshot is intended for reproducible software demonstration and inherits ODbL requirements.
