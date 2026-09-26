import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {fileURLToPath, pathToFileURL} from "node:url";
import {dirname, join} from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const files = {
    poi: join(root, "test-fixture", "osm-poi.geojson"),
    boundary: join(root, "test-fixture", "nanjing-boundary-wgs84.geojson"),
    dbscan: join(root, "test-fixture", "expected-results", "dbscan.json"),
    grid: join(root, "test-fixture", "expected-results", "poi-grid.json"),
    urbanFunction: join(root, "test-fixture", "expected-results", "urban-function.json")
};

async function readJson(path) {
    return JSON.parse(await readFile(path, "utf8"));
}

function sendJson(response, status, value, extraHeaders = {}) {
    response.writeHead(status, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Content-Type": "application/json; charset=utf-8",
        "X-MapLoom-Mock": "true",
        ...extraHeaders
    });
    response.end(JSON.stringify(value));
}

async function readRequestJson(request) {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    if (chunks.length === 0) return {};
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function fixedRequestError(pathname, body) {
    const query = body.query ?? {};
    const onlyFullFixture = Object.keys(query).every(key => key === "district") &&
        (query.district === undefined || query.district === "__all__");
    if (!onlyFullFixture) return "Recorded analytical responses are available only for the complete released Nanjing OSM fixture.";
    if (pathname.endsWith("/dbscan") && (body.epsMeters !== 400 || body.minPoints !== 10)) {
        return "The recorded DBSCAN response requires epsMeters=400 and minPoints=10.";
    }
    if (pathname.endsWith("/poi-grid") && body.gridSizeMeters !== 1000) {
        return "The recorded grid response requires gridSizeMeters=1000.";
    }
    if (pathname.endsWith("/urban-function") &&
        (body.gridSizeMeters !== 1000 || body.minPoi !== 10 || body.mixedThreshold !== 0.7)) {
        return "The recorded urban-function response requires gridSizeMeters=1000, minPoi=10, and mixedThreshold=0.7.";
    }
    return null;
}

async function handler(request, response) {
    try {
        if (request.method === "OPTIONS") {
            response.writeHead(204, {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
            });
            response.end();
            return;
        }

        const url = new URL(request.url ?? "/", "http://127.0.0.1");
        if (request.method === "GET" && url.pathname === "/health") {
            sendJson(response, 200, {
                status: "ok",
                service: "maploom-recorded-response-mock",
                mode: "mock",
                dbscanAlgorithm: "spherical-kdtree-exact-v1"
            });
            return;
        }
        if (request.method === "GET" && url.pathname === "/api/boundary") {
            sendJson(response, 200, await readJson(files.boundary));
            return;
        }
        if (request.method === "GET" && url.pathname === "/api/poi") {
            const collection = await readJson(files.poi);
            const filters = {
                district: url.searchParams.get("district"),
                category_l1: url.searchParams.get("category_l1"),
                category_l2: url.searchParams.get("category_l2")
            };
            const features = collection.features.filter(feature => Object.entries(filters).every(
                ([key, value]) => !value || value === "__all__" || feature.properties?.[key] === value
            ));
            const limit = Math.max(1, Math.min(Number(url.searchParams.get("limit") ?? 20000), 50000));
            const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0));
            const page = features.slice(offset, offset + limit);
            sendJson(response, 200, {
                type: "FeatureCollection",
                features: page,
                metadata: {total: features.length, returned: page.length, limit, offset, fixture: true}
            });
            return;
        }
        if (request.method === "GET" && url.pathname === "/api/poi/metadata") {
            const collection = await readJson(files.poi);
            sendJson(response, 200, {fixture: true, featureCount: collection.features.length});
            return;
        }

        const responseFile = new Map([
            ["/api/analysis/dbscan", files.dbscan],
            ["/api/analysis/poi-grid", files.grid],
            ["/api/analysis/urban-function", files.urbanFunction]
        ]).get(url.pathname);
        if (request.method === "POST" && responseFile) {
            const body = await readRequestJson(request);
            const error = fixedRequestError(url.pathname, body);
            if (error) {
                sendJson(response, 400, {detail: error});
                return;
            }
            sendJson(response, 200, await readJson(responseFile));
            return;
        }

        sendJson(response, 404, {detail: "Mock endpoint not found."});
    } catch (error) {
        sendJson(response, 500, {detail: error instanceof Error ? error.message : String(error)});
    }
}

export function createMockService() {
    return createServer(handler);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const port = Number(process.env.PORT ?? 8000);
    createMockService().listen(port, "127.0.0.1", () => {
        console.log(`Recorded-response mock listening on http://127.0.0.1:${port}`);
        console.log("This mock does not contain or execute the external analytical service.");
    });
}
