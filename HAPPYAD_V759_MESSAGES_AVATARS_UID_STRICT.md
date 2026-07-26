# HAPPYAD V759 — Messages : avatars strictement liés à l’UID

Base : `HAPPYAD_V758_PROFIL_VISITEUR_IDENTITE_ISOLEE.zip`.

## Correction isolée du point 2

- Les secours visuels du parent (`happyadCurrentUser`, V743 et `avatarPreview`) sont désormais réservés uniquement à l’UID du compte connecté.
- Un correspondant sans photo affiche ses initiales ; la photo du compte connecté ne peut plus être utilisée comme secours.
- La valeur réelle de `profiles` est autoritaire : si `profiles` ne contient aucune photo, un ancien cache ne peut pas en remettre une.
- Les anciennes conversations IndexedDB contaminées sont nettoyées au chargement puis réenregistrées sans la mauvaise photo.
- Les conversations, le chat ouvert et le sélecteur de contacts utilisent le même contrôle par UID.
- Aucun changement SQL, Supabase, Assistance, Profil visiteur ou Accueil.

## Cache

Les routes Messages, les maîtres de navigation actifs et le Service Worker passent à la signature V759 afin d’éviter le retour de l’ancien HTML mis en cache.
