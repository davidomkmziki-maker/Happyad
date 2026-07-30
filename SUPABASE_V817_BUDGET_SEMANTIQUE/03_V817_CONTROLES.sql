-- HAPPYAD V817 — PARTIE 03/03 — CONTRÔLES SANS ÉCRITURE
-- Prérequis : parties 01 et 02 réussies.

select public.happyad_ai_extract_budget_v1('Téléphone Samsung à Bunia environ 400$') as budget_autour;
select public.happyad_ai_extract_budget_v1('Téléphone maximum 400 USD') as budget_maximum;
select public.happyad_ai_extract_budget_v1('Téléphone entre 350 et 450 USD') as budget_fourchette;

select public.happyad_chat_understand_v1(
  'Bonjour je cherche un téléphone Samsung à Bunia environ 400$',
  'fr',null,null,'{}'::jsonb
) as comprehension_complete;
