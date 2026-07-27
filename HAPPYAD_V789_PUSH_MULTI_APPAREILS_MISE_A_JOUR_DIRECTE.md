# HAPPYAD V789 — PUSH MULTI-APPAREILS ET MISE À JOUR DIRECTE

Base : V785. Les essais V786–V788 ne sont pas repris.

## Correction
- Plusieurs téléphones peuvent rester actifs pour le même compte.
- Un seul endpoint est conservé par compte + installation, sans supprimer les autres appareils.
- La fonction Push envoie chaque nouveau message à tous les endpoints actifs du destinataire.
- « Désactiver sur cet appareil » ne coupe plus les autres téléphones.
- Le Service Worker est enregistré et vérifié immédiatement, sans délai de démarrage.
- Une notification Push reçue lorsque HAPPYAD est fermé déclenche aussi une vérification de mise à jour du Service Worker, sans retarder le popup courant.
- Le point avatar n'est pas modifié dans cette version.

## Déploiement obligatoire
1. Exécuter `SUPABASE_HAPPYAD_V789_PUSH_MULTI_APPAREILS_MISE_A_JOUR_DIRECTE.sql`.
2. Déployer `SUPABASE_EDGE_FUNCTION_HAPPYAD_PUSH_PRODUCTION_V789.ts` dans `happyad-push-test`.
3. Déployer le ZIP V789 sur Netlify.

Les anciens endpoints supprimés par le SQL V780B ne peuvent pas être recréés depuis le serveur. Chaque téléphone concerné doit ouvrir HAPPYAD une fois après le déploiement V789 afin de réenregistrer son endpoint. Après cette réparation initiale, les appareils ne s'éliminent plus entre eux.
