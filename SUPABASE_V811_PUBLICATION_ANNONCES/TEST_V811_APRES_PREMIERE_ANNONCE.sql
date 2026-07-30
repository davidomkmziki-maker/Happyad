-- Exécuter seulement après avoir publié une première annonce depuis HAPPYAD V811.
select
  marketplace_category as categorie,
  count(*) as annonces_actives
from public.happyad_posts
where happyad_marketplace = true
  and listing_status = 'active'
  and is_active = true
group by marketplace_category
order by marketplace_category;

select
  id,
  title,
  marketplace_category,
  listing_type,
  marketplace_price,
  currency,
  city,
  marketplace_proof_status,
  marketplace_details,
  created_at
from public.happyad_posts
where happyad_marketplace = true
order by created_at desc
limit 5;
