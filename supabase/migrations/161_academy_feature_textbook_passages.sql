-- 교과서 지문 불러오기를 학원마다 켜고 끈다.
-- 값은 academies.settings.features.textbook_passages 에 담고,
-- 슈퍼관리자 화면의 「기능」 탭에서 켜고 끈다.
-- 여기서는 지금 쓰기로 한 학원만 켜 두고, 나머지는 꺼 둔다.

update public.academies
   set settings = coalesce(settings, '{}'::jsonb)
                  || jsonb_build_object(
                       'features',
                       coalesce(settings -> 'features', '{}'::jsonb)
                       || jsonb_build_object('textbook_passages', true)
                     ),
       updated_at = now()
 where slug in ('jeongsu', 'willing', 'dyoong94', 'gukje', 'blueway');

update public.academies
   set settings = coalesce(settings, '{}'::jsonb)
                  || jsonb_build_object(
                       'features',
                       coalesce(settings -> 'features', '{}'::jsonb)
                       || jsonb_build_object('textbook_passages', false)
                     ),
       updated_at = now()
 where slug not in ('jeongsu', 'willing', 'dyoong94', 'gukje', 'blueway');
