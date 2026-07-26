# HAPPYAD V756 — X Assistance direct + Mon profil persistant

Base : V755 issue directement de V752.

Corrections ciblées :
- le X Assistance masque immédiatement l'iframe, révèle la page précédente et conserve un bouclier transparent 120 ms contre le clic fantôme Android ;
- aucun bouton de Paramètres derrière ne reçoit le même geste ;
- Mon profil utilise une seule iframe propriétaire persistante ;
- la frame n'est plus rechargée lors des passages Accueil ↔ Profil ;
- un seul signal visible est envoyé au profil lors de la reprise ;
- le premier chargement est préchauffé plus tôt et la page précédente reste visible jusqu'au vrai READY, sans écran noir ni spinner ;
- Auth/Storage V752 et Assistance Realtime V750 restent inchangés.
