# HAPPYAD V747 — Assistance ouverture fluide, réponse immédiate et X direct

Base : V746.

Corrections ciblées :
- frame Assistance préchauffée dès le démarrage (80 ms en réseau normal, 650 ms en économie de données/2G) ;
- la frame est déclarée prête dès son événement load, sans attente de second rendu ;
- aucune fonction reopen n'est relancée à chaque ouverture ;
- réponse automatique locale livrée en 35 à 110 ms, avec secours à 850 ms ;
- Supabase reste synchronisé après la réponse locale et ne bloque jamais le moteur automatique ;
- le X ferme au pointerdown/touchstart, avec une zone de capture parent au-dessus du X visible ;
- fermeture directe sans history.back, popstate ni rechargement.
