# Carnet de leçons — Jules Enock

Application web progressive (PWA) installable sur Android pour noter les
leçons et devoirs, suivre leur statut et rédiger une mise au net.

## Contenu du dossier

```
index.html        page principale
manifest.json      description de l'app pour l'installation
sw.js               service worker (fonctionnement hors-ligne)
css/style.css       styles
js/app.js           logique (stockage local, formulaire, feuille)
icons/               icônes de l'application
```

Toutes les données (leçons, devoirs, brouillons) sont enregistrées
uniquement sur l'appareil de l'élève (localStorage), sans compte ni
serveur.

## 1. Déployer sur GitHub Pages

1. Crée un nouveau dépôt sur GitHub (par ex. `carnet-lecons`).
2. Dépose **tout le contenu de ce dossier** à la racine du dépôt (pas
   dans un sous-dossier), puis fais un commit + push.
3. Dans le dépôt : **Settings → Pages**.
4. Source : *Deploy from a branch* → branche `main`, dossier `/ (root)`.
5. Attends une minute, puis ouvre l'URL donnée par GitHub, du style :
   `https://<ton-nom-utilisateur>.github.io/carnet-lecons/`
6. Vérifie que la page s'affiche bien et que les onglets fonctionnent.

Sur mobile (Chrome Android), un bandeau ou le menu « ⋮ → Installer
l'application » doit apparaître automatiquement.

## 2. Générer l'APK avec PWABuilder

1. Va sur https://www.pwabuilder.com
2. Colle l'URL GitHub Pages de l'étape précédente et lance l'analyse.
3. PWABuilder doit détecter le manifest et le service worker
   automatiquement (icônes, nom, couleurs).
4. Choisis la plateforme **Android**, puis génère le paquet.
5. Télécharge l'APK (ou le Android App Bundle) proposé et installe-le
   sur le téléphone, ou publie-le sur le Play Store si tu le souhaites.

## Remarques

- L'icône est générée automatiquement (dossier `icons/`) ; tu peux la
  remplacer par ton propre visuel en gardant les mêmes noms de fichiers
  et tailles (192×192 et 512×512).
- Le bouton « Imprimer / PDF » de la feuille de mise au net utilise
  l'impression native du téléphone (choisir *Enregistrer en PDF* dans
  la boîte de dialogue d'impression).
- Comme tout est enregistré en local sur l'appareil, penser à ne pas
  vider les données du navigateur/de l'application, sous peine de
  perdre le carnet.
