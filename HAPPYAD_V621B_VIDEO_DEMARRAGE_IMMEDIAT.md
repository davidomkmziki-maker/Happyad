# HAPPYAD V621B — démarrage immédiat de la centrale Vidéo

Base : V621.

## Cause corrigée

La centrale Vidéo était montée dans une iframe initialement considérée comme cachée. Le message `HAPPYAD_APP_FRAME_VISIBLE` pouvait arriver avant l’installation de l’ancien écouteur situé vers la fin de `video.html`. L’image de couverture apparaissait, mais la lecture restait bloquée jusqu’à un nouveau changement de module, par exemple Profil puis retour Vidéo.

## Correction

- écoute de visibilité installée dans le `<head>` avant le chargement du moteur vidéo ;
- prise en compte de `HAPPYAD_APP_FRAME_VISIBLE` et `HAPPYAD_MODULE_RESUME` ;
- vérification directe de l’état réel de l’iframe (`on`, `inert`, `aria-hidden`) ;
- mémorisation d’une lecture en attente si la vidéo est montée avant la visibilité ;
- démarrage immédiat après le montage des trois emplacements si l’iframe est visible ;
- double reprise courte et bornée à 0/100–220 ms, sans intervalle permanent ;
- aucune dépendance à l’ouverture du Profil ;
- virtualisation V621 à trois vidéos conservée.

Aucune modification du design, du scroll, des actions ou de Supabase.
