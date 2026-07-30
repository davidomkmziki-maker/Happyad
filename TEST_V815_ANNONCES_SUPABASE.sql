-- Contrôle facultatif : ne modifie aucune donnée.
select
  id, title, marketplace_category, marketplace_price, currency, city,
  availability, listing_status, is_active, created_at
from public.happyad_posts
where happyad_marketplace = true
order by created_at desc;
