import {mkdir, readFile, writeFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";

const materialsRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = join(materialsRoot, "test-fixture", "osm-source");
const keys = ["amenity", "shop", "tourism", "leisure", "office", "craft", "healthcare", "public_transport"];
const bbox = "31.2267477,118.3345905,32.6157780,119.2395068";
const tiles = [
    "31.2267477,118.3345905,31.9212629,118.7870487",
    "31.2267477,118.7870487,31.9212629,119.2395068",
    "31.9212629,118.3345905,32.6157780,118.7870487",
    "31.9212629,118.7870487,32.6157780,119.2395068"
];
const endpoints = process.env.OVERPASS_ENDPOINT
    ? [process.env.OVERPASS_ENDPOINT]
    : [
        "https://overpass.private.coffee/api/interpreter",
        "https://overpass-api.de/api/interpreter",
        "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
    ];

function queryFor(key, bounds = bbox) {
    return `[out:json][timeout:600];nwr["${key}"](${bounds});out center tags;`;
}

async function validCache(path) {
    try {
        const value = JSON.parse(await readFile(path, "utf8"));
        return value?.version === 0.6 && Array.isArray(value.elements);
    } catch {
        return false;
    }
}

async function fetchQuery(key, bounds) {
    let lastError;
    for (const endpoint of endpoints) {
        try {
            console.log(`[download] ${key} ${bounds} from ${endpoint}`);
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                    "User-Agent": "MapLoom-research-artifact/0.1 (academic reproducibility)"
                },
                body: new URLSearchParams({data: queryFor(key, bounds)}),
                signal: AbortSignal.timeout(660_000)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
            const value = await response.json();
            if (value?.version !== 0.6 || !Array.isArray(value.elements)) throw new Error("Unexpected Overpass response.");
            return {value, endpoint};
        } catch (error) {
            lastError = error;
            console.warn(`[failed] ${key} at ${endpoint}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    throw lastError;
}

async function download(key) {
    const path = join(outputDirectory, `${key}.json`);
    if (await validCache(path)) {
        const cached = JSON.parse(await readFile(path, "utf8"));
        console.log(`[cached] ${key}: ${cached.elements.length} elements`);
        return cached.elements.length;
    }

    const requests = [];
    if (key === "healthcare" || key === "public_transport") {
        for (const bounds of tiles) requests.push({...await fetchQuery(key, bounds), bounds});
    } else {
        requests.push({...await fetchQuery(key, bbox), bounds: bbox});
    }
    const unique = new Map();
    for (const {value} of requests) {
        for (const element of value.elements) unique.set(`${element.type}/${element.id}`, element);
    }
    const first = requests[0].value;
    const result = {
        version: first.version,
        generator: first.generator,
        osm3s: first.osm3s,
        elements: [...unique.values()],
        maploomDownload: {
            queriedKey: key,
            boundingBox: bbox,
            queryMode: requests.length === 1 ? "single-bbox" : "four-tiles",
            fetchedAt: new Date().toISOString(),
            endpoints: [...new Set(requests.map(request => request.endpoint))],
            queries: requests.map(request => queryFor(key, request.bounds))
        }
    };
    await writeFile(path, `${JSON.stringify(result)}\n`, "utf8");
    console.log(`[saved] ${key}: ${result.elements.length} unique elements`);
    return result.elements.length;
}

await mkdir(outputDirectory, {recursive: true});
const counts = {};
for (const key of keys) counts[key] = await download(key);
console.log(JSON.stringify({status: "downloaded", counts, outputDirectory}, null, 2));
