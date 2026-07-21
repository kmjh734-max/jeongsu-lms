-- New listening sets default to「보통」(0.75)
alter table public.listening_sets
  alter column speech_speed set default 0.75;
