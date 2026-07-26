# HAPPYAD V686 — Ouverture onglets Profil et Publications par défaut

## Défauts corrigés

1. Les cartes de Favoris, Republier et Privé pouvaient ne plus ouvrir photo ou vidéo après V685.
2. Mon profil pouvait se rouvrir directement sur Favoris à cause de l’onglet mémorisé.

## Correction

- Ouvreur unique délégué au panneau des onglets spécialisés.
- Déduplication clic/pointerup Android.
- Jeton de geste réel accepté par le verrou Fullscreen photo.
- Vidéo ouverte par le chemin existant `openLongPublishedVideo` avec secours navigation interne.
- Ouverture normale du profil : Publications.
- Retour depuis un média d’un onglet spécialisé : même onglet conservé.
- Regroupement des signaux `PROFILE_SHOW`, `APP_FRAME_VISIBLE` et reprise pour ne pas réinitialiser deux fois.

Aucun SQL.
