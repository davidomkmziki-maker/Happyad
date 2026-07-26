# HAPPYAD V766 — Accueil : scrollBy protégé

Base : `HAPPYAD_V765_ACCUEIL_FIN_REELLE_SCROLL_SANS_DEPLACEMENT.zip`

Correction isolée du point 1 de l’audit Accueil :

- Le mouvement du doigt, la molette, l’inertie et les événements de scroll marquent désormais l’Accueil comme « scroll actif ».
- La capture et la restauration de l’ancre sont abandonnées pendant ce scroll actif. Aucun déplacement n’est mis en attente pour se produire après le geste.
- Un ajout simple de nouvelles publications à la fin de la liste est reconnu par comparaison stricte des cartes déjà présentes. Dans ce cas, `window.scrollBy()` n’est jamais appelé.
- La restauration d’ancre reste disponible uniquement pour une vraie modification non triviale de la liste, par exemple une insertion au-dessus, et seulement lorsque l’écran est au repos.
- La version du Service Worker est renouvelée afin que l’ancien `index.html` V765 ne reste pas servi depuis le cache.

Parties non modifiées : moteurs d’hydratation des médias, moteur de prépeint V696, pagination et ses distances, Radar, Sponsor, compteurs Supabase, Profils, Messages, Vidéos, Notifications, Assistance, Admin et SQL.
