# HAPPYAD V643 — Accueil : ordre serveur réel, dates et médias propres

Base : V642.

## Cause corrigée
- V642 pouvait fabriquer un « snapshot confirmé » depuis un ancien cache avant toute réponse Supabase.
- Une ligne sans date valide pouvait encore être affichée comme récente à cause du fallback `Date.now()`.
- Les anciens caches/session étaient ensuite fusionnés avec la première page distante.
- Une vidéo en cache sans miniature produisait une grande zone noire.

## Nouveau chemin unique
1. Le cache `HAPPYAD_HOME_CONFIRMED_ORDER_V643` est écrit uniquement après une réponse réelle de `happyad_posts`.
2. La première page Supabase remplace toujours le haut du fil.
3. Seules les pages plus anciennes déjà confirmées restent en dessous.
4. Les anciens caches ne sont plus fusionnés après une réponse serveur.
5. Une date invalide reste invalide : elle ne devient jamais « il y a 8 min ».
6. Les vidéos obsolètes sans miniature sont exclues du fallback hors ligne.
7. Un média en erreur montre un emplacement propre, jamais une icône cassée ou un écran noir vide.

Les cartes vidéo de Mon profil V642, le total J’aime V640, les albums, les Stories, le zoom fullscreen et les ouvertures directes restent inchangés.
