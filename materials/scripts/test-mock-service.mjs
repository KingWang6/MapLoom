import assert from "node:assert/strict";
import {once} from "node:events";
import {createMockService} from "./mock-analysis-service.mjs";

const server = createMockService();
server.listen(0, "127.0.0.1");
await once(server, "listening");

try {
    const address = server.address();
    assert(address && typeof address === "object");
    const base = `http://127.0.0.1:${address.port}`;

    const health = await fetch(`${base}/health`).then(response => response.json());
    assert.equal(health.mode, "mock");

    const boundary = await fetch(`${base}/api/boundary`).then(response => response.json());
    assert.equal(boundary.features.length, 11);

    const poi = await fetch(`${base}/api/poi?district=__all__&limit=20000`).then(response => response.json());
    assert.equal(poi.type, "FeatureCollection");
    assert.equal(poi.features.length, 16_488);
    assert.equal(poi.metadata.total, 16_488);

    const requests = [
        ["dbscan", {query: {district: "__all__"}, epsMeters: 400, minPoints: 10}, "clusterCount", 171],
        ["poi-grid", {query: {district: "__all__"}, gridSizeMeters: 1000}, "gridCount", 1589],
        ["urban-function", {query: {district: "__all__"}, gridSizeMeters: 1000, minPoi: 10, mixedThreshold: 0.7}, "gridCount", 1589]
    ];
    for (const [endpoint, body, countField, expectedCount] of requests) {
        const response = await fetch(`${base}/api/analysis/${endpoint}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        });
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("x-maploom-mock"), "true");
        const result = await response.json();
        assert.equal(result.summary.featureCount, 16_488);
        assert.equal(result.summary[countField], expectedCount);
    }

    const unsupported = await fetch(`${base}/api/analysis/dbscan`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({query: {district: "__all__"}, epsMeters: 800, minPoints: 10})
    });
    assert.equal(unsupported.status, 400);
    console.log("Mock contract tests passed.");
} finally {
    server.close();
    await once(server, "close");
}
