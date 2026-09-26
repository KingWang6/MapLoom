import {cpSync, existsSync, mkdirSync, rmSync} from "node:fs";
import {join} from "node:path";

const packages = ["core", "openlayers-adapter", "webgis-plugin", "spatial-analysis-plugin"];
const targetRoot = join("node_modules", "@maploom");
const sourceRoot = join("..", "..", "framework", "packages");

mkdirSync(targetRoot, {recursive: true});
for (const name of packages) {
    const source = join(sourceRoot, name);
    const target = join(targetRoot, name);
    if (!existsSync(source)) continue;
    rmSync(target, {recursive: true, force: true});
    cpSync(source, target, {recursive: true});
    rmSync(join(target, "src"), {recursive: true, force: true});
    rmSync(join(target, "tsconfig.json"), {force: true});
}
