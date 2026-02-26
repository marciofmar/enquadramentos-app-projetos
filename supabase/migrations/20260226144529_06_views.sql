create or replace view "public"."v_projeto_status" as SELECT id,
    nome,
    setor_lider_id,
        CASE
            WHEN (EXISTS ( SELECT 1
               FROM public.entregas e
              WHERE ((e.projeto_id = p.id) AND (e.status <> ALL (ARRAY['resolvida'::text, 'cancelada'::text])) AND (e.data_final_prevista < CURRENT_DATE)))) THEN 'atrasado'::text
            WHEN (EXISTS ( SELECT 1
               FROM public.entregas e
              WHERE ((e.projeto_id = p.id) AND (e.status <> ALL (ARRAY['resolvida'::text, 'cancelada'::text])) AND (e.data_final_prevista >= CURRENT_DATE) AND (e.data_final_prevista <= (CURRENT_DATE + '15 days'::interval))))) THEN 'proximo'::text
            ELSE 'em_dia'::text
        END AS pontualidade,
    ( SELECT min(e.data_final_prevista) AS min
           FROM public.entregas e
          WHERE ((e.projeto_id = p.id) AND (e.status <> ALL (ARRAY['resolvida'::text, 'cancelada'::text])) AND (e.data_final_prevista >= CURRENT_DATE))) AS proxima_entrega
   FROM public.projetos p;
