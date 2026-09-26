# Case applications

## IUFZs-App

`IUFZs-App/` is the executable case-study application for POI spatial-pattern exploration and urban functional-zone identification. It consumes the obfuscated framework packages under `../framework/` and the recorded-response mock supplied with the reproducibility materials.

From the repository root, install and run the complete artifact with:

```powershell
npm run install:web
npm run dev:analysis
```

In a second terminal:

```powershell
npm run dev:case
```

Open <http://127.0.0.1:5176>.
