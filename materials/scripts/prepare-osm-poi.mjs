import {readFile, writeFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";

const materialsRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = join(materialsRoot, "test-fixture");
const boundaryPath = join(fixtureRoot, "nanjing-boundary-wgs84.geojson");
const sourceRoot = join(fixtureRoot, "osm-source");
const keys = ["amenity", "shop", "tourism", "leisure", "office", "craft", "healthcare", "public_transport"];
const columns = ["poi_id", "name", "category_l1", "category_l2", "function_type", "address", "district", "longitude", "latitude"];

const functionTypeByCategory = {
    "餐饮": "商业消费",
    "购物": "商业消费",
    "商务住宅": "居住生活",
    "生活服务": "居住生活",
    "住宿服务": "居住生活",
    "科教文化服务": "教育文化",
    "医疗保健服务": "医疗健康",
    "交通设施服务": "交通设施",
    "风景名胜": "休闲游憩",
    "体育休闲服务": "休闲游憩",
    "政府机构及社会团体": "公共管理",
    "公共设施": "公共管理",
    "公司企业": "商务就业",
    "金融保险服务": "商务就业"
};

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

function position(element) {
    if (Number.isFinite(element.lon) && Number.isFinite(element.lat)) return [element.lon, element.lat];
    if (Number.isFinite(element.center?.lon) && Number.isFinite(element.center?.lat)) return [element.center.lon, element.center.lat];
    return null;
}

function amenityCategory(value) {
    if (["restaurant", "fast_food", "food_court"].includes(value)) return ["餐饮", value === "fast_food" ? "快餐厅" : "中餐厅"];
    if (["cafe", "ice_cream"].includes(value)) return ["餐饮", value === "cafe" ? "咖啡厅" : "冷饮店"];
    if (["bar", "pub", "biergarten"].includes(value)) return ["餐饮", "休闲餐饮场所"];
    if (["school", "college", "university", "kindergarten", "music_school", "language_school", "training"].includes(value)) return ["科教文化服务", value === "training" ? "培训机构" : "学校"];
    if (value === "library") return ["科教文化服务", "图书馆"];
    if (["research_institute", "research_station"].includes(value)) return ["科教文化服务", "科研机构"];
    if (value === "driving_school") return ["科教文化服务", "驾校"];
    if (["hospital", "clinic", "doctors", "dentist"].includes(value)) return ["医疗保健服务", value === "hospital" ? "综合医院" : "诊所"];
    if (value === "pharmacy") return ["医疗保健服务", "医药保健销售店"];
    if (value === "veterinary") return ["医疗保健服务", "动物医疗场所"];
    if (["parking", "parking_entrance", "parking_space", "bicycle_parking", "motorcycle_parking"].includes(value)) return ["交通设施服务", "停车场"];
    if (["bus_station", "taxi", "ferry_terminal"].includes(value)) return ["交通设施服务", "公交车站"];
    if (["fuel", "charging_station"].includes(value)) return ["交通设施服务", "公交车站"];
    if (["bank", "atm", "bureau_de_change"].includes(value)) return ["金融保险服务", value === "atm" ? "自动提款机" : "银行"];
    if (["police", "courthouse", "fire_station", "ranger_station"].includes(value)) return ["政府机构及社会团体", "公检法机构"];
    if (["townhall", "public_building", "government", "social_facility", "community_centre"].includes(value)) return ["政府机构及社会团体", "政府机关"];
    if (["post_office", "post_box"].includes(value)) return ["生活服务", "邮局"];
    if (value === "telephone") return ["生活服务", "生活服务场所"];
    if (value === "toilets") return ["公共设施", "公共厕所"];
    if (["cinema", "theatre", "arts_centre", "nightclub", "social_centre", "gambling"].includes(value)) return ["体育休闲服务", value === "cinema" || value === "theatre" ? "影剧院" : "娱乐场所"];
    if (["marketplace", "vending_machine"].includes(value)) return ["购物", "综合市场"];
    return ["政府机构及社会团体", "政府及社会团体相关"];
}

function classify(tags) {
    if (tags.healthcare) {
        const value = tags.healthcare;
        if (value === "pharmacy") return ["医疗保健服务", "医药保健销售店"];
        if (value === "hospital") return ["医疗保健服务", "综合医院"];
        if (["dentist", "doctor", "clinic", "physiotherapist", "psychotherapist"].includes(value)) return ["医疗保健服务", "诊所"];
        return ["医疗保健服务", "医疗保健服务场所"];
    }
    if (tags.amenity) return amenityCategory(tags.amenity);
    if (tags.shop) {
        const value = tags.shop;
        if (value === "supermarket") return ["购物", "超级市场"];
        if (value === "convenience") return ["购物", "便民商店/便利店"];
        if (["mall", "department_store"].includes(value)) return ["购物", "商场"];
        if (["clothes", "shoes", "bag", "leather"].includes(value)) return ["购物", "服装鞋帽皮具店"];
        if (["electronics", "mobile_phone", "computer", "appliance"].includes(value)) return ["购物", "家电电子卖场"];
        if (["furniture", "hardware", "doityourself", "bathroom_furnishing"].includes(value)) return ["购物", "家居建材市场"];
        if (["bakery", "pastry"].includes(value)) return ["餐饮", "糕饼店"];
        return ["购物", "专卖店"];
    }
    if (tags.tourism) {
        const value = tags.tourism;
        if (["hotel", "apartment"].includes(value)) return ["住宿服务", "宾馆酒店"];
        if (["hostel", "guest_house", "motel", "chalet", "camp_site"].includes(value)) return ["住宿服务", "旅馆招待所"];
        if (value === "museum") return ["科教文化服务", "博物馆"];
        if (value === "gallery") return ["科教文化服务", "美术馆"];
        return ["风景名胜", "风景名胜"];
    }
    if (tags.leisure) {
        const value = tags.leisure;
        if (["park", "garden", "nature_reserve"].includes(value)) return ["风景名胜", "公园广场"];
        if (["stadium", "pitch", "sports_centre", "fitness_centre", "swimming_pool", "track", "golf_course"].includes(value)) return ["体育休闲服务", value === "golf_course" ? "高尔夫相关" : "运动场馆"];
        return ["体育休闲服务", "休闲场所"];
    }
    if (tags.public_transport) {
        if (tags.subway === "yes" || tags.station === "subway") return ["交通设施服务", "地铁站"];
        if (tags.railway === "station") return ["交通设施服务", "火车站"];
        return ["交通设施服务", "公交车站"];
    }
    if (tags.office) {
        if (["government", "administrative"].includes(tags.office)) return ["政府机构及社会团体", "政府机关"];
        if (tags.office === "diplomatic") return ["政府机构及社会团体", "外国机构"];
        if (["educational_institution", "research"].includes(tags.office)) return ["科教文化服务", "科研机构"];
        if (tags.office === "insurance") return ["金融保险服务", "保险公司"];
        return ["公司企业", "公司"];
    }
    if (tags.craft) return ["生活服务", "维修站点"];
    return ["公司企业", "公司企业"];
}

function address(tags, district) {
    if (tags["addr:full"]) return tags["addr:full"];
    const parts = [tags["addr:city"], tags["addr:district"], tags["addr:street"], tags["addr:housenumber"]].filter(Boolean);
    if (parts.length) return parts.join("");
    return `南京市${district}（OSM未提供详细地址）`;
}

function csvCell(value) {
    const text = String(value ?? "");
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const boundary = JSON.parse(await readFile(boundaryPath, "utf8"));
const districtFeatures = boundary.features.map(feature => ({name: feature.properties.name, geometry: feature.geometry}));
const rawFiles = await Promise.all(keys.map(async key => JSON.parse(await readFile(join(sourceRoot, `${key}.json`), "utf8"))));
const rawCount = rawFiles.reduce((sum, file) => sum + file.elements.length, 0);
const elements = new Map();
for (const file of rawFiles) {
    for (const element of file.elements) {
        const id = `${element.type}/${element.id}`;
        const previous = elements.get(id);
        elements.set(id, previous ? {...previous, tags: {...previous.tags, ...element.tags}} : element);
    }
}

const features = [];
const excluded = {missingPosition: 0, outsideBoundary: 0};
for (const element of elements.values()) {
    const coordinates = position(element);
    if (!coordinates) {
        excluded.missingPosition += 1;
        continue;
    }
    const district = districtFeatures.find(feature => pointInGeometry(coordinates, feature.geometry))?.name;
    if (!district) {
        excluded.outsideBoundary += 1;
        continue;
    }
    const tags = element.tags ?? {};
    const [categoryL1, categoryL2] = classify(tags);
    const poiId = `osm-${element.type}-${element.id}`;
    const longitude = Number(coordinates[0].toFixed(7));
    const latitude = Number(coordinates[1].toFixed(7));
    const properties = {
        poi_id: poiId,
        name: tags["name:zh"] || tags.name || tags.brand || `${categoryL2}（${element.type}/${element.id}）`,
        category_l1: categoryL1,
        category_l2: categoryL2,
        function_type: functionTypeByCategory[categoryL1],
        address: address(tags, district),
        district,
        longitude,
        latitude
    };
    features.push({type: "Feature", id: poiId, properties, geometry: {type: "Point", coordinates: [longitude, latitude]}});
}
features.sort((a, b) => a.id.localeCompare(b.id, "en"));

const snapshotTimes = rawFiles.map(file => file.osm3s?.timestamp_osm_base).filter(Boolean).sort();
const collection = {
    type: "FeatureCollection",
    metadata: {
        title: "OpenStreetMap POIs within the Nanjing municipal boundary",
        source: "OpenStreetMap contributors",
        license: "ODbL 1.0",
        sourceUrl: "https://www.openstreetmap.org/copyright",
        coordinateReferenceSystem: "EPSG:4326",
        osmSnapshotRange: [snapshotTimes[0], snapshotTimes.at(-1)],
        queriedTagKeys: keys,
        rawElementCount: rawCount,
        uniqueElementCount: elements.size,
        featureCount: features.length,
        exclusions: excluded,
        processing: "Deduplicated by OSM object type/id, represented nodes directly and ways/relations by Overpass center, then point-in-polygon clipped to 11 Nanjing districts."
    },
    features
};

const csv = [columns.join(","), ...features.map(feature => columns.map(column => csvCell(feature.properties[column])).join(","))].join("\r\n") + "\r\n";
await Promise.all([
    writeFile(join(fixtureRoot, "osm-poi.geojson"), `${JSON.stringify(collection)}\n`, "utf8"),
    writeFile(join(fixtureRoot, "osm-poi.csv"), csv, "utf8")
]);

const countBy = field => Object.fromEntries([...features.reduce((counts, feature) => {
    const value = feature.properties[field];
    counts.set(value, (counts.get(value) ?? 0) + 1);
    return counts;
}, new Map()).entries()].sort((a, b) => b[1] - a[1]));

console.log(JSON.stringify({
    status: "prepared",
    rawElementCount: rawCount,
    uniqueElementCount: elements.size,
    featureCount: features.length,
    excluded,
    districtCounts: countBy("district"),
    categoryCounts: countBy("category_l1")
}, null, 2));
