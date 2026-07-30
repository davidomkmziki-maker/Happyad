# HAPPYAD V839 — Requêtes multiples prudentes

Base : V838.

- Une liste numérotée ou à puces peut lancer jusqu’à 6 recherches séparées.
- Une phrase contenant plusieurs objets de catégories différentes est divisée avec prudence.
- Les caractéristiques d’un seul objet ne sont pas divisées : marque, modèle, carburant, couleur, capacité, état, « qui ressemble à », « avec » et « sans ».
- Deux objets naturels de la même catégorie déclenchent une clarification au lieu d’une mauvaise séparation.
- Le lieu commun placé à la fin est appliqué à toutes les demandes.
- La bulle utilisateur conserve les retours à la ligne et la numérotation saisis.
- Le frontend appelle `happyad_chat_decompose_requests_v1`; cette RPC pourra être améliorée plus tard uniquement par SQL.
