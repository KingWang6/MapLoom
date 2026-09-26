import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

async function readJson(relativePath) {
    return JSON.parse(await readFile(new URL(`../${relativePath}`, import.meta.url), "utf8"));
}

function pointInRing([x, y], ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
}

function pointInGeometry(point, geometry) {
    const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
    return polygons.some(polygon => pointInRing(point, polygon[0]) && polygon.slice(1).every(hole => !pointInRing(point, hole)));
}

const poi = await readJson("test-fixture/osm-poi.geojson");
const boundary = await readJson("test-fixture/nanjing-boundary-wgs84.geojson");
const dbscan = await readJson("test-fixture/expected-results/dbscan.json");
const grid = await readJson("test-fixture/expected-results/poi-grid.json");
const urban = await readJson("test-fixture/expected-results/urban-function.json");
const csv = await readFile(new URL("../test-fixture/osm-poi.csv", import.meta.url), "utf8");

assert.equal(poi.type, "FeatureCollection");
assert.equal(poi.metadata.source, "OpenStreetMap contributors");
assert.equal(poi.metadata.license, "ODbL 1.0");
assert.equal(poi.features.length, poi.metadata.featureCount);
assert(poi.features.length > 10_000);
assert.equal(boundary.type, "FeatureCollection");
assert.equal(boundary.features.length, 11);

const districtFeatures = new Map(boundary.features.map(feature => [feature.properties?.name, feature]));
const requiredFields = ["poi_id", "name", "category_l1", "category_l2", "function_type", "address", "district", "longitude", "latitude"];
const ids = new Set();
for (const [index, feature] of poi.features.entries()) {
    assert.equal(feature.geometry?.type, "Point", `Feature ${index} is not a Point.`);
    for (const field of requiredFields) assert.notEqual(feature.properties?.[field], undefined, `Feature ${index} lacks ${field}.`);
    assert.match(feature.id, /^osm-(node|way|relation)-\d+$/);
    assert.equal(feature.id, feature.properties.poi_id);
    assert.equal(ids.has(feature.id), false, `Duplicate POI id: ${feature.id}`);
    ids.add(feature.id);
    assert.deepEqual(feature.geometry.coordinates, [feature.properties.longitude, feature.properties.latitude]);
    const district = districtFeatures.get(feature.properties.district);
    assert(district, `Unknown district on feature ${feature.id}.`);
    assert(pointInGeometry(feature.geometry.coordinates, district.geometry), `Feature ${feature.id} lies outside ${feature.properties.district}.`);
}

const csvLines = csv.trimEnd().split(/\r?\n/);
assert.equal(csvLines.length, poi.features.length + 1);
assert.equal(csvLines[0], requiredFields.join(","));

for (const result of [dbscan, grid, urban]) assert.equal(result.summary.featureCount, poi.features.length);
assert.equal(dbscan.algorithm, "spherical-kdtree-exact-v1");
assert.equal(dbscan.summary.clusterCount, 171);
assert.equal(dbscan.summary.noiseCount, 3732);
assert.equal(grid.summary.gridSizeMeters, 1000);
assert.equal(grid.summary.gridCount, 1589);
assert.equal(urban.summary.gridSizeMeters, 1000);
assert.equal(urban.summary.minimumSample, 10);

console.log(JSON.stringify({
    status: "passed",
    boundaryDistricts: boundary.features.length,
    fixturePoiCount: poi.features.length,
    source: poi.metadata.source,
    license: poi.metadata.license,
    recordedOutputs: {
        dbscanClusters: dbscan.summary.clusterCount,
        dbscanNoise: dbscan.summary.noiseCount,
        gridCells: grid.summary.gridCount,
        urbanFunctionCells: urban.summary.gridCount
    }
}, null, 2));
