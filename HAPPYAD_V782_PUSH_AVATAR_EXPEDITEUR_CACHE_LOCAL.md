# HAPPYAD V782 — Avatar expéditeur réel avec cache local

## Défaut confirmé

La notification Android affichait le logo HAPPYAD à gauche et à droite alors que l’expéditeur possédait une photo.

La cause principale était dans l’archive V781 : le fichier réellement placé dans `supabase/functions/happyad-push-test/index.ts` était encore la fonction V777. Le ZIP et la fonction externe n’étaient donc pas alignés.

De plus, `showNotification()` ne signale pas toujours l’échec de téléchargement d’une icône distante. Android pouvait accepter le popup, échouer silencieusement à lire la photo, puis conserver le logo.

## Corrections V782

- La vraie fonction V782 est maintenant intégrée dans `supabase/functions/happyad-push-test/index.ts`.
- Recherche de l’identité dans `profiles`, les anciennes colonnes UID, `happyad_profiles`, `happyad_presence`, les métadonnées Auth et le message.
- Prise en charge de toutes les anciennes appellations de photo utilisées par HAPPYAD.
- Vérification serveur que l’URL répond réellement comme une image.
- Création d’une URL signée pendant sept jours lorsque le bucket Storage n’est pas public.
- Transmission de `sender_avatar` et `sender_avatar_source` dans le payload Push.
- Le Service Worker télécharge la photo avant d’afficher le popup.
- La photo est enregistrée temporairement dans un cache local même origine, puis cette URL locale est utilisée comme `icon`.
- Si aucune photo valide n’est disponible, le logo HAPPYAD reste le secours.
- Le logo de droite reste normal : il identifie HAPPYAD/l’application. Le visuel de gauche doit être la photo de l’expéditeur.
- Les contrôles volontaires dans Profil → Paramètres → Notifications du téléphone restent conservés.

## Déploiement

1. Remplacer entièrement la fonction Supabase `happyad-push-test` par `SUPABASE_EDGE_FUNCTION_HAPPYAD_PUSH_PRODUCTION_V782.ts`.
2. Déployer la fonction Supabase.
3. Déployer le ZIP V782 sur Netlify.
4. Ouvrir HAPPYAD avec Internet et actualiser une fois.
5. Dans Profil → Paramètres → Notifications du téléphone, toucher Réenregistrer ce lien.
6. Envoyer un nouveau message depuis un compte possédant une photo.

Les anciennes notifications déjà reçues ne changent pas. Le test doit être effectué avec un nouveau message après le déploiement.
