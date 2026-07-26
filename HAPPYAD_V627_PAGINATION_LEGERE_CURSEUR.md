HAPPYAD V627 — PAGINATION LÉGÈRE PAR CURSEUR

Base active : V626 Notifications directes sans squelette.

Cette version modifie uniquement le volume de chargement des publications. Les ouvertures directes V625/V626, le squelette du Profil visiteur, la navigation, les retours, le design, Messages, Notifications et la centrale Vidéo restent inchangés.

ACCUEIL
- 10 publications affichées au départ.
- 10 publications supplémentaires au scroll.
- Requêtes Supabase par lots de 20.
- Pagination stable avec le couple created_at + id, sans offset.
- Cache local limité aux 100 publications les plus récentes.
- La mémoire active peut continuer à charger les anciennes publications pendant la session, tandis que le DOM reste borné.
- Trois médias seulement sont prioritaires.
- Les nouvelles publications reçues lorsque l’utilisateur lit plus bas sont conservées sans déplacer le scroll, puis rendues au retour en haut.

MON PROFIL
- 9 publications affichées au départ.
- 9 publications supplémentaires au scroll.
- Requêtes Supabase par lots de 18 avec curseur created_at + id.
- Cache limité à 60 publications.
- Trois médias prioritaires, médias suivants différés près de l’écran.
- Le compteur Publications est récupéré séparément avec une requête de comptage légère et mis en cache cinq minutes.

PROFIL VISITEUR
- Le squelette validé est conservé uniquement pour sécuriser le bon UID.
- 9 publications réelles affichées dès qu’elles sont prêtes.
- 9 supplémentaires au scroll.
- Requêtes Supabase par lots de 18 avec curseur created_at + id.
- Cache limité à 60 publications par profil.
- Trois médias prioritaires, médias suivants différés près de l’écran.
- Le compteur Publications est récupéré séparément et ne dépend plus du nombre de cartes déjà chargées.

STABILITÉ DES COMPTES TRÈS ACTIFS
- Les nouvelles publications insérées en haut ne changent pas le curseur des pages anciennes.
- created_at trie chronologiquement et id départage les publications ayant la même date.
- Déduplication systématique par identifiant.
- Aucun chargement global de 80, 100, 600 ou plusieurs milliers de publications pour ces trois zones.

VALIDATION
- Ouvertures directes non modifiées.
- Syntaxe des scripts intégrés vérifiée avec Node.js.
- Test final sur téléphone Android requis après déploiement et renouvellement du cache V627.
