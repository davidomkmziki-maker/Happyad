# HAPPYAD V757 — Audit conflits stable

Base : V756.

Corrections après audit :
- un seul signal visible pour Mon profil lors de la réutilisation de l’iframe ;
- suppression du double rafraîchissement interne à +45 ms ;
- pile de retour Assistance protégée contre une réouverture pendant la fermeture ;
- polling READY Assistance limité ;
- protocole Assistance V757 avec compatibilité V755 ;
- restauration du fichier overlay legacy manquant dans neuf modules ;
- les caches temporaires explicitement listés peuvent réellement être supprimés avant la protection large PROFILE/MESSAGE ;
- cache PWA renouvelé.

Aucune logique Realtime V750, aucun schéma Supabase et aucun design n’ont été modifiés.
