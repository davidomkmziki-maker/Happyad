# HAPPYAD V781 — Avatar réel et activation volontaire

Base : V780B.

## Corrections

- Le moteur de livraison des popups V780B reste inchangé.
- L’identité serveur recherche le profil par `profiles.id`, puis par `profiles.user_id`, puis dans Supabase Auth.
- Les chemins Storage sont convertis en URL publique HTTPS avant l’envoi.
- La photo réelle devient `sender_avatar` et `icon`; le logo HAPPYAD reste uniquement le badge et le fallback.
- Profil → Paramètres contient maintenant une ligne explicite **Notifications du téléphone**.
- La page dédiée propose **Activer/Réenregistrer**, **Tester hors application** et **Désactiver sur cet appareil**.
- L’état Active / À activer / Bloquées est visible depuis la liste principale des Paramètres.

## Déploiement

1. Déployer la fonction Edge V781 dans `happyad-push-test`.
2. Déployer le ZIP V781 sur Netlify.
3. Ouvrir HAPPYAD et actualiser une fois.
4. Ouvrir Profil → Paramètres → Notifications du téléphone.
5. Toucher Réenregistrer ce lien.

Aucune nouvelle migration SQL n’est nécessaire après V780B.
