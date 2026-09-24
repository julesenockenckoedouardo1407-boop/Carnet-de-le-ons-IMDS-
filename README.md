# Carnet de leçons — Jules Enock

PWA installable sur Android pour noter les leçons et devoirs, suivre leur
statut, et rédiger une mise au net.

## Contenu du dossier (tout est à la racine, aucun sous-dossier)

```
index.html          page + styles + script, tout en un seul fichier
manifest.json        description de l'app pour l'installation
sw.js                 service worker (fonctionnement hors-ligne)
icon-48.png … icon-512.png    icônes normales
maskable-192.png, maskable-512.png   icônes "maskable"
```

Aucune donnée ne quitte le téléphone : tout est enregistré en local sur
l'appareil (localStorage).

## Déployer depuis un téléphone (important)

Sur mobile, GitHub n'accepte généralement pas l'envoi d'un **dossier**
(comme un `icons/` ou `css/`) via "Add file → Upload files" : seuls des
fichiers isolés passent. C'est pour ça que tous les fichiers de ce zip
sont directement à la racine, sans sous-dossier — il suffit de les
envoyer tels quels.

1. Dézippe le fichier sur ton téléphone (une app comme *Fichiers* ou
   *ZArchiver* sait le faire).
2. Sur GitHub, ouvre ton dépôt → **Add file → Upload files**.
3. Sélectionne **tous les fichiers** du dossier dézippé en une fois
   (index.html, manifest.json, sw.js, et toutes les images .png) — ne
   sélectionne pas le dossier lui-même, mais bien chaque fichier à
   l'intérieur.
4. Valide le commit.
5. Dans **Settings → Pages**, vérifie que la source est bien la branche
   `main`, dossier `/ (root)`.
6. Attends une minute, puis ouvre l'URL fournie par GitHub Pages et
   vérifie que l'icône et le style s'affichent correctement.

## Générer l'APK avec PWABuilder

1. Va sur https://www.pwabuilder.com
2. Colle l'URL GitHub Pages et lance l'analyse.
3. Vérifie que le rapport n'affiche plus d'erreur sur les icônes ni sur
   le service worker (relance l'analyse si besoin, le cache de
   PWABuilder met parfois quelques minutes à se rafraîchir).
4. Choisis la plateforme **Android**, génère le paquet, télécharge
   l'APK.

## Remarques

- Le bouton « Imprimer / PDF » de la feuille de mise au net utilise
  l'impression native du téléphone (choisir *Enregistrer en PDF* dans
  la boîte de dialogue).
- Ne vide pas les données du navigateur/de l'application installée,
  sous peine de perdre le contenu du carnet.
