update public.resources
set
  content_json = content_json || jsonb_build_array(jsonb_build_object(
    'type', 'reflection_questions',
    'questions', reflection_prompts
  )),
  reflection_prompts = '[]'::jsonb,
  updated_at = now()
where jsonb_typeof(content_json) = 'array'
  and jsonb_typeof(reflection_prompts) = 'array'
  and jsonb_array_length(reflection_prompts) > 0
  and not exists (
    select 1
    from jsonb_array_elements(content_json) as block
    where block->>'type' = 'reflection_questions'
      and block->'questions' = reflection_prompts
  );
