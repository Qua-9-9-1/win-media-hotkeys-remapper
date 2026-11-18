# Keyboard Remapper

Configurateur visuel, 100 % côté navigateur, pour recréer ses raccourcis clavier sur n'importe quel clavier
et générer des fichiers prêts à l'emploi pour [Kanata](https://github.com/jtroo/kanata) (`.kbd`) et
[AutoHotkey v2](https://www.autohotkey.com/) (`.ahk`).

Exemple : retrouver les touches `Fn + F10/F11/F12` (Précédent / Lecture-Pause / Suivant) d'un Dell KB216
sur un Logitech K120 qui n'a pas de touche Fn, en utilisant `Verr. Maj` comme touche Fn virtuelle.

## Développement

```bash
npm install
npm run dev      # serveur de dev
npm test         # tests des générateurs
npm run build    # build statique dans dist/
```

Le déploiement sur GitHub Pages est automatique à chaque push sur `main`
(`.github/workflows/deploy.yml`). Activez *Settings → Pages → Source : GitHub Actions* sur le dépôt.

## Architecture

```
src/
├── types/                  Modèle de données (clavier, actions, configuration)
├── data/
│   ├── keyboards/*.json    Profils matériels (1 fichier = 1 clavier, chargés automatiquement)
│   └── actions.ts          Bibliothèque d'actions + sorties Kanata / AHK
├── core/
│   ├── keycodes.ts         Touche physique → nom Kanata / scan code AHK
│   ├── layouts.ts          Légendes AZERTY / QWERTY
│   ├── geometry.ts         Génération de la géométrie (gabarit plein format ISO/ANSI)
│   ├── detection.ts        Détection OS, disposition, WebHID
│   ├── migration.ts        Import des raccourcis natifs d'un autre clavier
│   └── generators/         Générateurs .kbd et .ahk (fonctions pures, testées)
├── state/                  Reducer de configuration + persistance localStorage
└── components/             UI React
```

Les touches sont identifiées par leur **position physique** (vocabulaire `KeyboardEvent.code`), ce qui rend
les fichiers générés indépendants de la disposition (AZERTY, QWERTY…).

## Ajouter un clavier

Créez `src/data/keyboards/<id>.json` :

```json
{
  "id": "mon-clavier",
  "name": "Mon clavier",
  "vendor": "Marque",
  "layout": "fr-azerty",
  "geometry": { "template": "fullsize", "standard": "ISO", "rightOfAltGr": "Fn" },
  "hasFnKey": true,
  "hid": [{ "vendorId": "0x1234", "productId": "0x5678" }],
  "nativeShortcuts": [{ "layer": "fn", "key": "F10", "action": "media.prev" }]
}
```

Pour une géométrie non standard, utilisez `"template": "custom"` avec une liste `keys` (`id`, `x`, `y`, `w`, `h` en unités de touche).
