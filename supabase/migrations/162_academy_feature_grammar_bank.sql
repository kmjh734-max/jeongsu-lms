-- 중학 문법 문제 은행은 정수학원에서만 쓴다.
-- 값은 academies.settings.features.grammar_bank 에 담고,
-- 슈퍼관리자 화면의 「기능」 탭에서 켜고 끈다.

update public.academies
   set settings = coalesce(settings, '{}'::jsonb)
                  || jsonb_build_object(
                       'features',
                       coalesce(settings -> 'features', '{}'::jsonb)
                       || jsonb_build_object('grammar_bank', slug = 'jeongsu')
                     ),
       updated_at = now();
