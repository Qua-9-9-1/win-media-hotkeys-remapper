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
  "nativeShortcuts": [
    { "layer": "fn", "key": "F10", "action": "media.prev" },
    { "layer": "base", "key": "AudioVolumeMute", "action": "media.mute" }
  ],
  "sources": [{ "label": "Manuel officiel", "url": "https://..." }],
  "confidence": "high",
  "notes": "Précisions affichées sous les raccourcis natifs."
}
```

- **Gabarits** : `fullsize` (100 %), `tkl` (sans pavé numérique), `75` (compact). Options :
  `leftMods` / `rightMods` (modificateurs autour de la barre d'espace), `omit` (touches absentes),
  `extraKeys` (touches dédiées placées à la main), `offsetX` / `offsetY` (place pour une rangée ou colonne en plus).
  Pour une géométrie exotique, `"template": "custom"` avec une liste `keys` (`id`, `x`, `y`, `w`, `h` en unités).
- **Raccourcis natifs** : `layer: "fn"` pour une combinaison Fn + touche, `layer: "base"` pour une touche
  dédiée ou une rangée F qui envoie le multimédia par défaut.
- **Sources obligatoires** dès qu'un profil a des raccourcis natifs (vérifié par les tests) : manuel ou fiche
  technique du fabricant en priorité. `confidence` vaut `high` (documentation officielle), `medium` (fonctions
  officielles, positions estimées) ou `low` (sources tierces).
- Les touches propriétaires sans code standard (Easy-Switch, macro G1-G6…) sont affichées mais jamais remappables.
