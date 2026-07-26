# HAPPYAD V681 — Commentaires sans menu superposé, retour du dock stable

Base : HAPPYAD V680.

## Zone corrigée

Interface Commentaires ouverte depuis :

- Accueil ;
- Mon profil ;
- Profil visiteur ;
- Centrale photo ;
- Centrale vidéo.

## Cause

Le panneau Commentaires est rendu dans la page active ou dans une iframe, tandis que le menu inférieur appartient à la page principale. Le z-index du menu principal pouvait donc rester au-dessus de la barre de saisie. Après certains scrolls ou certaines fermetures tactiles, l'ancien moteur d'auto-masquage pouvait aussi conserver son état caché.

## Correction

- ajout d'un maître unique `comment-overlay-dock-master-v681` dans la page principale ;
- ajout d'un client léger dans les modules Profil, Photo et Vidéo ;
- détection immédiate de l'ouverture et de la fermeture des interfaces Commentaires ;
- menu inférieur entièrement masqué pendant les commentaires ;
- restauration explicite après fermeture, glissement, retour, changement de page, reprise Android et `pageshow` ;
- contrôle de secours périodique : un message de fermeture perdu ne peut plus laisser le menu bloqué ;
- suppression de l'ancien état `happyadDockAutoHidden` lors de la restauration ;
- aucune modification des commentaires, des actions sociales, des profils, des vidéos ou de Supabase.

## Cache

Cache PWA renouvelé en V681. Aucun SQL nécessaire.
