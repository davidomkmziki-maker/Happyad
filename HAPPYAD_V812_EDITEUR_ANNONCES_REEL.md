# HAPPYAD V812 — Éditeur réel des annonces

Base : V811 Publication toutes catégories.

Corrections ciblées :
- description minimale ramenée de 50 à 10 caractères, avec compteur visible ;
- sélection cumulative de 1 à 6 médias : un nouveau choix ne remplace plus les précédents ;
- bouton + permanent pour ajouter d’autres photos ou vidéos ;
- suppression individuelle des médias ;
- aperçu plein écran de chaque média avant publication ;
- aperçu complet de la publication avec galerie, informations, description et plein écran ;
- recadrage réel des images avec formats Carré 1:1, Portrait 4:5 et Paysage 16:9 ;
- zoom et déplacement tactile dans le cadre ;
- le fichier recadré est réellement envoyé à Supabase ;
- vidéos conservées sans conversion ;
- correction du gestionnaire d’URL locales (Map au lieu de WeakMap non itérable) ;
- nouveau cache Service Worker V812.

SQL : exécuter `SUPABASE_HAPPYAD_V812_DESCRIPTION_10_CARACTERES.sql` une seule fois.
