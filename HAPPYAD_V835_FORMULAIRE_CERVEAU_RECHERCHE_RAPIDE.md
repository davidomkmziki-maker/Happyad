# HAPPYAD V835 — Formulaire cerveau et recherche rapide

Base : `HAPPYAD_V834_CHAT_CONTEXTE_MEMOIRE_NOUVELLE_RECHERCHE.zip`

## Corrections

- Le Chat appelle toujours `happyad_chat_understand_v2` puis `happyad_chat_search_posts_v1`.
- Le formulaire de publication Marketplace devient le catalogue officiel des champs de recherche.
- Le serveur reconstruit le sens global de la phrase : salutation + demande, objet, catégorie, marque, modèle, ville, pays, budget et champs propres à la catégorie.
- Les précisions sont fusionnées dans `context.slots` ; les champs déjà fournis ne sont plus redemandés.
- Une nouvelle demande complète remplace immédiatement l’ancien contexte.
- La recherche démarre dès que les trois éléments minimaux sont disponibles : catégorie, objet et ville/pays.
- Si une précision manque, une seule question ciblée est posée.
- Si la même précision a déjà été demandée, le moteur lance une recherche élargie au lieu de répéter la question.
- Les annonces sont lues directement depuis la vue des annonces Marketplace actives, pas depuis les 3 cartes initiales de la centrale.
- Les critères explicitement écrits sont comparés aux champs exacts du formulaire. Les critères non écrits ne sont pas inventés.
- Marque, modèle, ville, pays, transaction et type de bien sont des incompatibilités fortes.
- Les résultats exacts sont prioritaires ; les alternatives ne sont utilisées que lorsqu’aucun résultat exact ou proche n’existe.
- Aucun formulaire générique automatique n’est affiché dans le chemin Supabase V835.
- Le cache Service Worker est renouvelé en V835.

## SQL requis avant déploiement

Exécuter les fichiers du paquet `HAPPYAD_V835_SQL_FORMULAIRE_CERVEAU.zip` dans l’ordre 01 à 05.
