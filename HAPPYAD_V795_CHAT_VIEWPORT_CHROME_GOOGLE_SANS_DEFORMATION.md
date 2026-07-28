# HAPPYAD V795 — Chat viewport Chrome/Google sans déformation

Base reprise strictement : `HAPPYAD_V793_CHAT_V37_INTEGRATION_ISOLEE.zip`.

Correction unique :
- suppression du plancher `min-height: 100vh` qui pouvait forcer la frame sous les barres de Chrome/Google ;
- hauteur de la frame synchronisée avec la zone réellement visible du navigateur via `visualViewport.height` ;
- adaptation lors de l’ouverture/fermeture du clavier, du changement d’orientation et du retour dans l’application ;
- aucun remplacement des styles internes du Chat V37 ;
- aucune modification de l’Accueil, du sticker V791, des Annonces, des profils ou du maître Messages.

Le composeur reste celui de la V793, mais il doit rester entièrement visible au-dessus des barres du navigateur et du clavier.
