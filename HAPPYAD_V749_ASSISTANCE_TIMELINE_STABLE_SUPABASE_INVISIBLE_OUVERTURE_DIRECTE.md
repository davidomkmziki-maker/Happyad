# HAPPYAD V749 — Assistance timeline stable, Supabase invisible, ouverture directe

Base: V748.

Corrections:
- ordre immuable des messages et cartes grâce à timelineOrder ;
- confirmation Supabase enrichit les messages sans les déplacer ;
- aucun rendu complet du fil pendant une vérification ou confirmation distante ;
- événements Realtime retardés pendant les interactions locales pour éviter flash, saut et écran noir ;
- messages agent ajoutés seuls au bas du fil ;
- préchauffage Assistance à 280 ms sur réseau normal et 1150 ms sur réseau lent ;
- ouverture au pointerup dans Paramètres et Messages avec click de secours ;
- un seul maître Realtime V749.
