import {readFile} from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";

const schema = JSON.parse(await readFile(new URL("../appspec/appspec-v0.1.schema.json", import.meta.url), "utf8"));
const spec = JSON.parse(await readFile(new URL("../appspec/iufzs-reproduction-appspec.json", import.meta.url), "utf8"));
const ajv = new Ajv2020({allErrors: true, strict: false});
const validate = ajv.compile(schema);

if (!validate(spec)) {
    console.error(validate.errors);
    process.exitCode = 1;
    throw new Error("AppSpec structural validation failed.");
}

const errors = [];
for (const key of ["sources", "layers", "widgets", "interactions"]) {
    const ids = (spec[key] ?? []).map(item => item.id);
    const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    if (duplicates.length) errors.push(`Duplicate ${key} identifiers: ${duplicates.join(", ")}`);
}
const sourceIds = new Set((spec.sources ?? []).map(item => item.id));
const layerIds = new Set((spec.layers ?? []).map(item => item.id));
for (const layer of spec.layers ?? []) {
    if (!sourceIds.has(layer.source)) errors.push(`Layer ${layer.id} references unknown source ${layer.source}`);
}
for (const interaction of spec.interactions ?? []) {
    if (interaction.targetLayer && !layerIds.has(interaction.targetLayer)) {
        errors.push(`Interaction ${interaction.id} references unknown layer ${interaction.targetLayer}`);
    }
}
if (errors.length) throw new Error(`AppSpec semantic validation failed:\n${errors.join("\n")}`);

console.log(JSON.stringify({
    status: "passed",
    appSpec: "materials/appspec/iufzs-reproduction-appspec.json",
    sourceCount: spec.sources?.length ?? 0,
    layerCount: spec.layers?.length ?? 0,
    widgetCount: spec.widgets?.length ?? 0,
    bindingCount: spec.bindings?.length ?? 0
}, null, 2));
