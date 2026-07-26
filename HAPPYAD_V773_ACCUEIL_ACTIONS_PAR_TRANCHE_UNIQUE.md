# HAPPYAD V773 — Accueil : actions par tranche unique

Base : V772.

## Correction isolée du point 8

- Suppression de la lecture Supabase individuelle des actions dans l’IntersectionObserver de chaque carte.
- Les nouvelles cartes sont regroupées et synchronisées par un seul batch.
- Une pagination locale de cinq cartes ne relit plus toutes les anciennes publications.
- Une pagination distante ne lance plus un batch puis une seconde actualisation globale.
- `refreshHomeVisibleActionsNow()` est désormais borné aux cartes proches de l’écran, douze maximum.
- TTL de 60 secondes par publication pour éviter les relectures répétitives sur focus/pageshow/realtime.
- Les valeurs déjà en cache sont repeintes immédiatement sans requête.
- Les médias restent sous l’IntersectionObserver unique de la V767.
- Les corrections V766 à V772 restent conservées.

## Éléments non modifiés

- Pagination et taille des tranches.
- Radar et Sponsor.
- Structure des albums.
- Tables, RPC, RLS ou schéma Supabase.
- Messages, Profils, Vidéos, Stories, Notifications, Assistance et Admin.
