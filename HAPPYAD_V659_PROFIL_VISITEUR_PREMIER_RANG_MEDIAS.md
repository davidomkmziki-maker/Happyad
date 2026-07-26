# HAPPYAD V659 — Premier rang du Profil visiteur

Base : V658 validée.

Correction ciblée : les trois premières cartes étaient mises à jour avant leur insertion dans la grille. Leur chargement prioritaire rencontrait `mediaBox.isConnected === false`, s’arrêtait et ne redémarrait pas.

V659 attend désormais la connexion réelle du média au DOM avant de démarrer son chargement. Les autres rangées, la pagination, le zoom, le scroll, le retour fullscreen et le verrou UID restent inchangés.
