# Contrôles V621 — centrale vidéo

- 54 fichiers JavaScript externes : syntaxe valide.
- 191 scripts JavaScript intégrés : syntaxe valide.
- 134 références locales : aucune référence manquante.
- Ancien rendu de 80 reels supprimé.
- Ancien IntersectionObserver du fil vidéo supprimé.
- Ancien second écouteur de scroll audio supprimé.
- Test navigateur isolé avec 10 vidéos : 3 reels au démarrage.
- Après défilement : fenêtre recyclée de `[0,1,2]` vers `[1,2,3]`, toujours 3 reels.
- Ouverture directe de la vidéo 8 : fenêtre `[7,8,9]`.
- Recherche « User 2 » : un seul résultat monté, puis restauration à 3 reels.
- Aucune erreur JavaScript dans le test isolé.

Le test complet avec les vraies vidéos, Supabase et le tactile Android reste nécessaire.
