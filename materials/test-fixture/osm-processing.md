# OSM POI acquisition and harmonization

## Selection

The frozen source responses query the following tag keys inside the Nanjing bounding box: `amenity`, `shop`, `tourism`, `leisure`, `office`, `craft`, `healthcare`, and `public_transport`. The exact Overpass QL is versioned under `materials/service-contract/overpass/`. Queries were executed serially and cached by tag family.

The eight responses contain 20,062 elements before cross-family deduplication. Deduplication by `(osm_type, osm_id)` leaves 19,646 objects. Point-in-polygon clipping against the 11 district geometries excludes 3,158 objects whose centers fall outside Nanjing, leaving 16,488 released POIs. No count-based sampling is applied.

## Geometry handling

- OSM nodes use their native longitude and latitude.
- OSM ways and relations use the `center` returned by Overpass `out center tags`.
- All output coordinates are stored as EPSG:4326 longitude and latitude.
- District assignment uses point-in-polygon testing against the WGS84 district boundary.

This representation is appropriate for point-based case workflows but does not preserve the original polygons or relation geometries.

## Attribute harmonization

Every output record uses the same nine non-null fields as the prototype POI table:

| Field | Derivation |
| --- | --- |
| `poi_id` | `osm-{type}-{id}`, preserving the source OSM identity |
| `name` | Chinese name, general name, or brand; otherwise a labeled OSM identifier |
| `category_l1` | mapped from the selected OSM tag families to the case's 14-category vocabulary |
| `category_l2` | mapped to an existing secondary category used by IUFZs-App |
| `function_type` | deterministic mapping from primary category to one of eight urban functions |
| `address` | `addr:full`, composed address tags, or an explicit missing-detail placeholder |
| `district` | containing Nanjing district polygon |
| `longitude` | point or center longitude |
| `latitude` | point or center latitude |

Classification precedence is `healthcare`, `amenity`, `shop`, `tourism`, `leisure`, `public_transport`, `office`, then `craft`. The complete value-level mapping is executable in `materials/scripts/prepare-osm-poi.mjs`.

## Reproducibility and limitations

Raw responses retain the Overpass generator, database timestamp, query, endpoint, and retrieval time. The stored sources span OSM database timestamps from 2026-05-06 to 2026-09-26 because public mirrors were used to recover from timeouts; this range is recorded in `osm-poi.geojson` metadata.

OSM coverage is contributed rather than statistically sampled. Counts therefore reflect both urban activity and mapping practices. Public-transport objects are especially detailed and should not be interpreted as an unbiased census of all functions. The fixture supports transparent software reproduction, not substitution for the manuscript's restricted empirical dataset.
