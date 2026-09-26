# MapLoom framework release packages

This directory contains the executable distribution used by the reproducibility artifact. Framework implementation source files are not included.

Each package contains:

- obfuscated ES-module JavaScript under `dist/`;
- TypeScript declaration files describing the public and linked module contracts;
- package metadata;
- applicable plugin manifests, JSON Schemas, examples, and styles.

The JavaScript was compiled from the evaluated prototype and then obfuscated before release. Obfuscation reduces casual implementation disclosure but is not a cryptographic protection mechanism. The packages are intended to execute the released case, not to support framework modification or independent rebuilding.

Released packages:

- `@maploom/core`
- `@maploom/openlayers-adapter`
- `@maploom/webgis-plugin`
- `@maploom/spatial-analysis-plugin`
