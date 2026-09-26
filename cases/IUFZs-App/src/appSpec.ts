import type {AppSpec, StyleSpec} from "@maploom/core";
import {
    districtLabels,
    districts,
    fieldLabels,
    poiCategories,
    poiCategoryLabels,
    poiSubcategoriesByCategory,
    poiSubcategoryLabels,
    valueLabels
} from "./options";

export const analysisBaseUrl = import.meta.env.VITE_ANALYSIS_BASE_URL ?? "http://127.0.0.1:8000";

const allOption = {label: "All", value: "__all__"};
const districtOptions = [allOption, ...districts.map(value => ({label: districtLabels[value] ?? value, value}))];
const categoryOptions = [allOption, ...poiCategories.map(value => ({label: poiCategoryLabels[value] ?? value, value}))];
const subcategoryOptionGroups = Object.fromEntries(
    Object.entries(poiSubcategoriesByCategory).map(([category, values]) => [
        category,
        values.map(value => ({label: poiSubcategoryLabels[value] ?? value, value}))
    ])
);
const poiPopupFields = [
    {field: "name", label: "Name"},
    {field: "category_l1", label: "Primary Category"},
    {field: "category_l2", label: "Secondary Category"},
    {field: "district", label: "District"},
    {field: "address", label: "Address"}
];

const poiStyle: StyleSpec = {
    type: "category",
    field: "function_type",
    rules: {
        "商业消费": {color: "#ef4444", strokeColor: "#7f1d1d", radius: 2},
        "居住生活": {color: "#f59e0b", strokeColor: "#78350f", radius: 2},
        "教育文化": {color: "#8b5cf6", strokeColor: "#4c1d95", radius: 2},
        "医疗健康": {color: "#ec4899", strokeColor: "#831843", radius: 3},
        "交通设施": {color: "#3b82f6", strokeColor: "#1e3a8a", radius: 3},
        "休闲游憩": {color: "#22c55e", strokeColor: "#14532d", radius: 2},
        "公共管理": {color: "#06b6d4", strokeColor: "#164e63", radius: 2},
        "商务就业": {color: "#6366f1", strokeColor: "#312e81", radius: 2}
    },
    default: {color: "#64748b", strokeColor: "#334155", radius: 2}
};

export const appSpec: AppSpec = {
    version: "0.1",
    state: {
        selection: {feature: null},
        data: {poi: {query: {district: "__all__"}, status: "idle"}},
        analysis: {
            dbscan: {status: "idle"},
            poiGrid: {status: "idle"},
            urbanFunction: {status: "idle"}
        }
    },
    map: {container: "map", center: [118.78, 32.04], zoom: 9},
    sources: [
        {id: "districtSource", type: "geojson", url: `${analysisBaseUrl}/api/boundary`},
        {
            id: "poiSource",
            type: "geojson",
            url: `${analysisBaseUrl}/api/poi`,
            query: {district: "__all__", limit: 20000, sample: "proportional"}
        }
    ],
    layers: [
        {
            id: "districtLayer",
            title: "Nanjing District Boundary",
            type: "vector",
            source: "districtSource",
            visible: true,
            style: {type: "simple", fillColor: "rgba(124,58,237,.05)", strokeColor: "#7c3aed", strokeWidth: 1.4}
        },
        {id: "poiLayer", title: "POI", type: "vector", source: "poiSource", visible: true, style: poiStyle}
    ],
    widgets: [
        {id: "layers", type: "layer-list", region: "left", title: "Layer Control", layers: ["districtLayer", "poiLayer"]},
        {
            id: "poiFilter",
            type: "filter-panel",
            region: "left",
            title: "POI Category Query",
            statePath: "data.poi",
            performanceTask: "poi-query",
            fields: [
                {field: "district", label: "District", value: "__all__", options: districtOptions},
                {field: "category_l1", label: "Primary Category", options: categoryOptions},
                {
                    field: "category_l2",
                    label: "Secondary Category",
                    options: [allOption],
                    dependsOn: "category_l1",
                    optionGroups: subcategoryOptionGroups
                }
            ]
        },
        {
            id: "gridAnalysis",
            type: "poi-grid-analysis-panel",
            region: "left",
            title: "POI Grid Density",
            description: "Replay a recorded 1,000 m regular-grid result for the released Nanjing OSM snapshot.",
            sourceLayer: "poiLayer",
            gridSizeMeters: 1000,
            queryStatePath: "data.poi.query",
            statePath: "analysis.poiGrid",
            performanceTask: "grid-density",
            valueLabels
        },
        {
            id: "hotspotAnalysis",
            type: "dbscan-clustering-panel",
            region: "left",
            title: "DBSCAN Hotspot Clustering",
            description: "Identify hotspot clusters, centers, extents, and noise points.",
            sourceLayer: "poiLayer",
            epsMeters: 400,
            minPoints: 10,
            queryStatePath: "data.poi.query",
            statePath: "analysis.dbscan",
            performanceTask: "dbscan",
            valueLabels
        },
        {
            id: "functionAnalysis",
            type: "urban-function-analysis-panel",
            region: "left",
            title: "Urban Functional Zone Identification",
            description: "Identify dominant or mixed-use functions using location quotient and Shannon mixed-use degree.",
            sourceLayer: "poiLayer",
            gridSizeMeters: 1000,
            minPoi: 10,
            mixedThreshold: 0.7,
            queryStatePath: "data.poi.query",
            statePath: "analysis.urbanFunction",
            performanceTask: "ufz",
            valueLabels
        },
        {
            id: "poiStats",
            type: "statistics-panel",
            region: "right",
            title: "Current POI Overview",
            sourceLayer: "poiLayer",
            valueLabels,
            metrics: [
                {type: "count", label: "Loaded POIs"},
                {type: "group-count", groupBy: "function_type", label: "Urban Function Composition"},
                {type: "group-count", groupBy: "category_l1", label: "Primary Category Composition"}
            ]
        },
        {
            id: "functionProfile",
            type: "urban-function-profile",
            region: "right",
            title: "Functional Grid Profile",
            valueLabels,
            bind: {feature: "selection.feature"}
        },
        {
            id: "details",
            type: "attribute-panel",
            region: "right",
            title: "Feature Details",
            fields: ["name", "category_l1", "category_l2", "function_type", "district", "address", "poiCount", "density", "mixedDegree", "dominantFunction"],
            fieldLabels,
            valueLabels,
            bind: {feature: "selection.feature"}
        },
        {
            id: "analysisState",
            type: "state-inspector",
            region: "right",
            title: "Spatial Analysis Runtime State",
            path: "analysis"
        },
        {
            id: "poiTable",
            type: "attribute-table",
            region: "bottom",
            title: "POI Attribute Table",
            sourceLayer: "poiLayer",
            maxRows: 200,
            fields: ["name", "category_l1", "category_l2", "function_type", "district", "address"],
            fieldLabels,
            valueLabels
        }
    ],
    interactions: [
        {
            id: "clickPoi",
            type: "feature-click",
            targetLayer: "poiLayer",
            actions: [
                {type: "set-state", path: "selection.feature", value: "$event.feature"},
                {type: "highlight-feature", feature: "$event.feature"},
                {
                    type: "show-popup",
                    feature: "$event.feature",
                    fields: poiPopupFields,
                    valueLabels
                }
            ]
        },
        {
            id: "clickDistrict",
            type: "feature-click",
            targetLayer: "districtLayer",
            actions: [
                {type: "set-state", path: "selection.feature", value: "$event.feature"},
                {type: "highlight-feature", feature: "$event.feature"},
                {
                    type: "show-popup",
                    feature: "$event.feature",
                    fields: [{field: "name", label: "District"}, {field: "adcode", label: "Adcode"}],
                    valueLabels
                }
            ]
        }
    ],
    bindings: [
        {
            event: "widget.layers.layer-visibility-change",
            actions: [{type: "set-layer-visible", target: "$event.layerId", visible: "$event.visible"}]
        },
        {
            event: "widget.poiFilter.filter-change",
            actions: [
                {type: "set-state", path: "data.poi.query", value: "$event.query"},
                {type: "refresh-geojson-source", source: "poiSource", query: "$event.query", statePath: "data.poi", performanceTask: "poi-query"},
                {type: "set-state", path: "selection.feature", value: null},
                {type: "clear-highlight"}
            ]
        },
        {
            event: "widget.gridAnalysis.run",
            actions: [{
                type: "run-poi-grid-analysis",
                performanceTask: "grid-density",
                endpoint: `${analysisBaseUrl}/api/analysis/poi-grid`,
                sourceLayer: "$event.sourceLayer",
                gridSizeMeters: "$event.gridSizeMeters",
                query: "$event.query",
                statePath: "analysis.poiGrid",
                resultLayerId: "poiDensityGrid",
                resultLayerTitle: "POI Density Grid",
                valueLabels
            }]
        },
        {
            event: "widget.hotspotAnalysis.run",
            actions: [{
                type: "run-dbscan-clustering",
                performanceTask: "dbscan",
                endpoint: `${analysisBaseUrl}/api/analysis/dbscan`,
                sourceLayer: "$event.sourceLayer",
                epsMeters: "$event.epsMeters",
                minPoints: "$event.minPoints",
                query: "$event.query",
                statePath: "analysis.dbscan",
                resultLayerId: "poiHotspots",
                resultLayerTitle: "POI Hotspot Clusters",
                hullLayerTitle: "DBSCAN Hotspot Extents",
                centerLayerTitle: "DBSCAN Hotspot Centers",
                valueLabels
            }]
        },
        {
            event: "widget.functionAnalysis.run",
            actions: [{
                type: "run-urban-function-analysis",
                performanceTask: "ufz",
                endpoint: `${analysisBaseUrl}/api/analysis/urban-function`,
                sourceLayer: "$event.sourceLayer",
                gridSizeMeters: "$event.gridSizeMeters",
                minPoi: "$event.minPoi",
                mixedThreshold: "$event.mixedThreshold",
                query: "$event.query",
                statePath: "analysis.urbanFunction",
                resultLayerId: "urbanFunctionZones",
                resultLayerTitle: "Urban Functional Zones",
                mixedLayerTitle: "Functional Mixed-use Degree",
                functionField: "functionZone",
                valueLabels
            }]
        },
        {
            event: "widget.poiTable.row-click",
            actions: [
                {type: "set-state", path: "selection.feature", value: "$event.feature"},
                {type: "highlight-feature", feature: "$event.feature"},
                {type: "zoom-to-feature", feature: "$event.feature"},
                {
                    type: "show-popup",
                    feature: "$event.feature",
                    fields: poiPopupFields,
                    valueLabels
                }
            ]
        },
        {
            event: "benchmark.poi-feature-interaction",
            actions: [
                {type: "set-state", path: "selection.feature", value: "$event.feature"},
                {type: "highlight-feature", feature: "$event.feature"},
                {type: "show-popup", feature: "$event.feature", fields: poiPopupFields, valueLabels}
            ]
        }
    ]
};
