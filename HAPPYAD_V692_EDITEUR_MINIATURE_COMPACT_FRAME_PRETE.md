# HAPPYAD V692 — Éditeur miniature vidéo compact et frame prête

Base : V691, elle-même construite depuis V688.

Corrections ciblées :
- le menu inférieur du parent est masqué pendant l’éditeur et l’espace du module est étendu à tout l’écran ;
- restauration exacte du menu à la fermeture ;
- entête horizontal compact, scène et contrôles réduits, boutons Annuler/Enregistrer toujours accessibles ;
- le temps choisi est mémorisé même si Android remet momentanément le lecteur à 0 ;
- avant capture, HAPPYAD attend metadata, seeked, loadeddata/canplay ou une vraie frame présentée ;
- jusqu’à trois préparations silencieuses de la frame avant d’échouer ;
- la capture utilise la position sélectionnée et non une position réinitialisée ;
- l’image du téléphone reste le secours pour les anciennes vidéos bloquées par codec/CORS.

Aucun SQL supplémentaire.
