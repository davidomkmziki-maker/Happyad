# HAPPYAD V763 — Accueil scroll et médias stables

Base : `HAPPYAD_V762_PROFIL_VISITEUR_PUBLICATIONS_UID_REEL.zip`

Correction isolée du point 4 :

- Les médias des cartes Accueil sont préparés environ deux écrans avant leur arrivée dans la zone visible.
- Une carte déjà proche de l’écran utilise un chargement immédiat au lieu de rester bloquée en `loading=lazy`.
- Les six premières publications sont préchargées légèrement pour éviter les surfaces noires au démarrage.
- Le maître V742 ne réécrit plus toutes les cartes et tous les caches à chaque mutation du DOM. Il ne modifie que les avatars, noms ou badges réellement différents.
- L’observateur V743 ne surveille plus toutes les images et toutes les cartes de l’Accueil. Il intervient uniquement sur l’avatar principal du profil.
- Le nettoyage de quota V752 évacue d’abord les miniatures et caches médias lourds. Les snapshots maîtres de l’Accueil sont conservés et compactés au lieu d’être supprimés brutalement.
- Les publications déjà présentes restent dans le DOM et conservent leur média pendant le scroll.

Parties non modifiées : Messages V761, Profil visiteur V762, Assistance, système Admin, Supabase et SQL.
