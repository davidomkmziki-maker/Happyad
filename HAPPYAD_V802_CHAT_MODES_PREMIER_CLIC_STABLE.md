# HAPPYAD V802 — Modes Chat stables dès le premier clic

Base : V801.

Correction isolée :
- une initialisation Supabase lente ne peut plus ramener le Chat vers « Je cherche » après un clic sur « Je propose » ou « Annonces » ;
- le Chat informe le parent dès qu’un mode est choisi manuellement ;
- le parent conserve le dernier mode demandé pendant le chargement de l’utilisateur, des annonces et du statut de vérification ;
- les initialisations provenant d’une ancienne ouverture sont ignorées ;
- vérification vendeur Supabase/admin V801, sticker V799, Messages, Accueil et viewport Chrome restent inchangés.
