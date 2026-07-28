# HAPPYAD V800 — Audit de conflits et champs Vérification / Produit

Base stricte : `HAPPYAD_V799_STICKER_PLUS_PETIT_CENTRE_BOUCHE_SEULE.zip`.

## Audit avant correction

- un seul maître Sticker est chargé ;
- un seul maître d’intégration Chat est chargé ;
- aucun identifiant HTML du Chat n’est dupliqué ;
- les scripts modifiés et le script intégré du Chat passent le contrôle de syntaxe ;
- la fenêtre locale de faux Messages a été retirée : le bouton de contact utilise uniquement le vrai pont Messages HAPPYAD ;
- les futurs maîtres Vérification et Publication ne sont plus écrasés : V800 délègue à un maître déjà présent et garde seulement un refus contrôlé tant que Supabase n’est pas connecté ;
- aucune table Supabase et aucune donnée des 60 000 entrées ne sont ajoutées dans cette version.

## Demande de vérification vendeur

- nom complet légal ;
- pays de résidence ;
- ville de résidence ;
- type de pièce ;
- numéro de pièce ;
- 1 ou 2 fichiers pour le document officiel ;
- photo récente ;
- consentement explicite ;
- préremplissage depuis le vrai profil HAPPYAD lorsque les informations sont disponibles ;
- validation des formats, du nombre de fichiers et de leur taille ;
- statuts compatibles : `verified`, `approved`, `validated`, `active`, ainsi que les statuts d’attente courants.

## Publication Produit

Champs obligatoires conservés : pays, ville, prix, monnaie, disponibilité, état/qualité, quantité, description et médias.

Améliorations :

- marque et modèle/référence facultatifs pour préparer le futur classement intelligent ;
- états limités à Neuf, Comme neuf, Occasion et Reconditionné ;
- prix obligatoirement supérieur à zéro ;
- 1 à 6 images ou vidéos réelles ;
- aperçu des images et vidéos choisies ;
- aucun reçu obligatoire pour un produit simple ;
- identité vendeur vérifiée et attestation toujours obligatoires ;
- payloads versionnés `happyad_seller_verification_v1` et `happyad_marketplace_offer_v1`, prêts pour la prochaine connexion Supabase.

## Conservé intact

- sticker V799 ;
- bouche seule animée ;
- emplacement après Ta story ;
- bouton `📍 Annonces` ;
- compatibilité Chrome/Google de la frame Chat ;
- Je cherche, Je propose, Annonces et Conversations de recherche ;
- Accueil, Stories, publications, profils et maître Messages existant.
