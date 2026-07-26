# HAPPYAD V698 — Barre de réponse Story extensible

Base : V697.

Correction ciblée uniquement sur la barre de saisie du visiteur dans le lecteur Story :

- le champ simple est remplacé par une zone de texte à une ligne au repos ;
- la zone grandit automatiquement vers le haut lorsque le texte devient long ;
- la hauteur maximale est limitée pour conserver la Story visible ;
- au-delà de cette hauteur, le texte défile à l’intérieur du champ ;
- aucune barre ni ligne de défilement n’est visible ;
- le bouton Envoyer reste fixé en bas à droite de la zone de saisie ;
- les boutons J’aime et Partager restent alignés en bas ;
- la légende de la Story remonte automatiquement avec la barre pour éviter tout chevauchement ;
- après envoi, la barre revient immédiatement à sa hauteur compacte ;
- en cas d’échec, le texte et sa hauteur sont restaurés.

Aucun changement Supabase et aucun SQL supplémentaire.
