# Plugin contract summary

A plugin exports a manifest and a runtime registration function. The manifest declares widget, interaction, Action, and event capabilities, their configuration schemas, emitted events, and required map-adapter capabilities. At startup, the runtime registers implementations by their declared type names. AppSpec `type` values select the corresponding implementation.

During execution, a Binding associates a named event with an ordered Action list. The runtime resolves complete-string `$event`, `$event.path`, `$state`, and `$state.path` references when each Action is invoked. Actions receive access to shared State, the map adapter, the event bus, value resolution, and optional performance tracing.

The core contract and released manifests are executable in this repository. Framework implementations are provided as obfuscated JavaScript distributions with TypeScript declaration files; implementation source is not included. Automatic composition of all type-specific schemas, compatibility validation among independently developed plugins, dependency resolution, and version negotiation are outside the current implementation.

Released contract and distribution locations:

- `framework/packages/core/dist/`
- `framework/packages/core/schemas/plugin-manifest-v1.schema.json`
- `framework/packages/webgis-plugin/maploom.plugin.json`
- `framework/packages/webgis-plugin/schemas/`
- `framework/packages/spatial-analysis-plugin/maploom.plugin.json`
- `framework/packages/spatial-analysis-plugin/schemas/`
