import "ol/ol.css";
import {AppRuntime} from "@maploom/core";
import {OpenLayersAdapter} from "@maploom/openlayers-adapter";
import {MapLoomWebGISPlugin} from "@maploom/webgis-plugin";
import {MapLoomSpatialAnalysisPlugin} from "@maploom/spatial-analysis-plugin";
import "@maploom/openlayers-adapter/styles.css";
import "@maploom/webgis-plugin/styles.css";
import "@maploom/spatial-analysis-plugin/styles.css";
import "./app.css";
import "./case.css";
import {appSpec} from "./appSpec";
import {installBenchmarkApi} from "./benchmark";

const runtime = new AppRuntime(appSpec, new OpenLayersAdapter());
runtime.use(MapLoomWebGISPlugin).use(MapLoomSpatialAnalysisPlugin).mount();
installBenchmarkApi(runtime);
(window as any).runtime = runtime;
