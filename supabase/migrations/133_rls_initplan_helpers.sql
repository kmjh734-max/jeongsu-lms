-- 행마다 다시 계산하던 사용자 판별 함수를 쿼리당 한 번만 계산하도록 정책 식을 감싼다(뜻은 같다).

alter policy "Super admins manage academies" on public."academies"
  using (( SELECT is_super_admin()))
  with check (( SELECT is_super_admin()));
alter policy "Members read own academy" on public."academies"
  using ((( SELECT is_super_admin()) OR (id = ( SELECT current_user_academy_id()))));
alter policy "Staff read own wallet" on public."academy_wallets"
  using ((( SELECT is_super_admin()) OR ((( SELECT current_user_academy_id()) IS NOT NULL) AND (academy_id = ( SELECT current_user_academy_id())) AND (( SELECT current_user_role()) = ANY (ARRAY['admin'::text, 'teacher'::text])))));
alter policy "Super admins manage wallets" on public."academy_wallets"
  using (( SELECT is_super_admin()))
  with check (( SELECT is_super_admin()));
alter policy "Teachers read class_courses for own classes" on public."class_courses"
  using ((( SELECT is_teacher()) AND teacher_owns_class(class_id)));
alter policy "Admins insert class_courses" on public."class_courses"
  with check ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM classes c
  WHERE ((c.id = class_courses.class_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (c.academy_id = ( SELECT current_user_academy_id())))))))));
alter policy "Admins delete class_courses" on public."class_courses"
  using ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM classes c
  WHERE ((c.id = class_courses.class_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (c.academy_id = ( SELECT current_user_academy_id())))))))));
alter policy "Admins select class_courses" on public."class_courses"
  using ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM classes c
  WHERE ((c.id = class_courses.class_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (c.academy_id = ( SELECT current_user_academy_id())))))))));
alter policy "Teachers delete class_courses for own classes" on public."class_courses"
  using ((( SELECT is_teacher()) AND teacher_owns_class(class_id)));
alter policy "Admins update class_courses" on public."class_courses"
  using ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM classes c
  WHERE ((c.id = class_courses.class_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (c.academy_id = ( SELECT current_user_academy_id())))))))))
  with check ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM classes c
  WHERE ((c.id = class_courses.class_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (c.academy_id = ( SELECT current_user_academy_id())))))))));
alter policy "Teachers insert class_courses for own classes" on public."class_courses"
  with check ((( SELECT is_teacher()) AND teacher_owns_class(class_id) AND (EXISTS ( SELECT 1
   FROM courses c
  WHERE ((c.id = class_courses.course_id) AND (c.teacher_id = ( SELECT auth.uid())))))));
alter policy "Admins delete class_students" on public."class_students"
  using ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM classes c
  WHERE ((c.id = class_students.class_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (c.academy_id = ( SELECT current_user_academy_id())))))))));
alter policy "Admins insert class_students" on public."class_students"
  with check ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM classes c
  WHERE ((c.id = class_students.class_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (c.academy_id = ( SELECT current_user_academy_id())))))))));
alter policy "Admins select class_students" on public."class_students"
  using ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM classes c
  WHERE ((c.id = class_students.class_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (c.academy_id = ( SELECT current_user_academy_id())))))))));
alter policy "Admins update class_students" on public."class_students"
  using ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM classes c
  WHERE ((c.id = class_students.class_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (c.academy_id = ( SELECT current_user_academy_id())))))))))
  with check ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM classes c
  WHERE ((c.id = class_students.class_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (c.academy_id = ( SELECT current_user_academy_id())))))))));
alter policy "Students read own class_students" on public."class_students"
  using ((( SELECT is_student()) AND (student_id = ( SELECT auth.uid()))));
alter policy "Teachers delete class_students for own classes" on public."class_students"
  using ((( SELECT is_teacher()) AND teacher_owns_class(class_id)));
alter policy "Teachers insert class_students for own classes" on public."class_students"
  with check ((( SELECT is_teacher()) AND teacher_owns_class(class_id)));
alter policy "Teachers read class_students for own classes" on public."class_students"
  using ((( SELECT is_teacher()) AND teacher_owns_class(class_id)));
alter policy "Admins update classes" on public."classes"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins delete classes" on public."classes"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins insert classes" on public."classes"
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins select classes" on public."classes"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Teachers read own classes" on public."classes"
  using ((( SELECT is_teacher()) AND (teacher_id = ( SELECT auth.uid()))));
alter policy "Students read own classes" on public."classes"
  using ((( SELECT is_student()) AND student_in_class(id)));
alter policy "Students read enrolled courses" on public."courses"
  using ((( SELECT is_student()) AND student_enrolled_in_course(id)));
alter policy "Teachers update own courses" on public."courses"
  using ((teacher_id = ( SELECT auth.uid())))
  with check ((teacher_id = ( SELECT auth.uid())));
alter policy "Teachers read own courses" on public."courses"
  using ((teacher_id = ( SELECT auth.uid())));
alter policy "Teachers insert own courses" on public."courses"
  with check ((( SELECT is_teacher()) AND (teacher_id = ( SELECT auth.uid()))));
alter policy "Admins full access courses" on public."courses"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Teachers delete own courses" on public."courses"
  using ((teacher_id = ( SELECT auth.uid())));
alter policy "Super admins manage credit_packages" on public."credit_packages"
  using (( SELECT is_super_admin()))
  with check (( SELECT is_super_admin()));
alter policy "Staff read active credit_packages" on public."credit_packages"
  using ((( SELECT is_super_admin()) OR ((is_active = true) AND (( SELECT current_user_role()) = ANY (ARRAY['admin'::text, 'teacher'::text])))));
alter policy "Super admins manage credit_payment_orders" on public."credit_payment_orders"
  using (( SELECT is_super_admin()))
  with check (( SELECT is_super_admin()));
alter policy "Admin read own credit_payment_orders" on public."credit_payment_orders"
  using ((( SELECT is_super_admin()) OR ((( SELECT current_user_role()) = 'admin'::text) AND (( SELECT current_user_academy_id()) IS NOT NULL) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Super admins manage credit_transactions" on public."credit_transactions"
  using (( SELECT is_super_admin()))
  with check (( SELECT is_super_admin()));
alter policy "Staff read own credit_transactions" on public."credit_transactions"
  using ((( SELECT is_super_admin()) OR ((( SELECT current_user_academy_id()) IS NOT NULL) AND (academy_id = ( SELECT current_user_academy_id())) AND (( SELECT current_user_role()) = ANY (ARRAY['admin'::text, 'teacher'::text])))));
alter policy "Admins manage question sets" on public."english_question_sets"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Teachers manage own question sets" on public."english_question_sets"
  using (((created_by = ( SELECT auth.uid())) AND ( SELECT is_teacher())))
  with check (((created_by = ( SELECT auth.uid())) AND ( SELECT is_teacher())));
alter policy "Teachers manage own english passages" on public."english_source_passages"
  using (((created_by = ( SELECT auth.uid())) AND ( SELECT is_teacher())))
  with check (((created_by = ( SELECT auth.uid())) AND ( SELECT is_teacher())));
alter policy "Admins manage english passages" on public."english_source_passages"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins insert enrollments" on public."enrollments"
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (EXISTS ( SELECT 1
   FROM courses c
  WHERE ((c.id = enrollments.course_id) AND (c.academy_id = ( SELECT current_user_academy_id()))))))));
alter policy "Admins delete enrollments" on public."enrollments"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (EXISTS ( SELECT 1
   FROM courses c
  WHERE ((c.id = enrollments.course_id) AND (c.academy_id = ( SELECT current_user_academy_id()))))))));
alter policy "Admins update enrollments" on public."enrollments"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (EXISTS ( SELECT 1
   FROM courses c
  WHERE ((c.id = enrollments.course_id) AND (c.academy_id = ( SELECT current_user_academy_id()))))))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (EXISTS ( SELECT 1
   FROM courses c
  WHERE ((c.id = enrollments.course_id) AND (c.academy_id = ( SELECT current_user_academy_id()))))))));
alter policy "Students read own enrollments" on public."enrollments"
  using ((student_id = ( SELECT auth.uid())));
alter policy "Teachers delete enrollments for own courses" on public."enrollments"
  using ((( SELECT is_teacher()) AND teacher_owns_course(course_id) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = enrollments.student_id) AND (p.created_by = ( SELECT auth.uid())))))));
alter policy "Teachers insert enrollments for class students" on public."enrollments"
  with check ((( SELECT is_teacher()) AND teacher_owns_course(course_id) AND (EXISTS ( SELECT 1
   FROM (class_students cs
     JOIN classes cl ON ((cl.id = cs.class_id)))
  WHERE ((cs.student_id = enrollments.student_id) AND (cl.teacher_id = ( SELECT auth.uid())))))));
alter policy "Teachers insert enrollments for own courses" on public."enrollments"
  with check ((( SELECT is_teacher()) AND teacher_owns_course(course_id) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = enrollments.student_id) AND (p.role = 'student'::text) AND (p.created_by = ( SELECT auth.uid())))))));
alter policy "Admins select enrollments" on public."enrollments"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (EXISTS ( SELECT 1
   FROM courses c
  WHERE ((c.id = enrollments.course_id) AND (c.academy_id = ( SELECT current_user_academy_id()))))))));
alter policy "Staff read feature_pricing" on public."feature_pricing"
  using ((( SELECT is_super_admin()) OR (( SELECT current_user_role()) = ANY (ARRAY['admin'::text, 'teacher'::text]))));
alter policy "Super admins manage feature_pricing" on public."feature_pricing"
  using (( SELECT is_super_admin()))
  with check (( SELECT is_super_admin()));
alter policy "Teachers manage own generated questions" on public."generated_english_questions"
  using (((created_by = ( SELECT auth.uid())) AND ( SELECT is_teacher())))
  with check (((created_by = ( SELECT auth.uid())) AND ( SELECT is_teacher())));
alter policy "Admins manage generated questions" on public."generated_english_questions"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Teachers select own lesson_material_documents" on public."lesson_material_documents"
  using ((( SELECT is_teacher()) AND ((teacher_id = ( SELECT auth.uid())) OR (created_by = ( SELECT auth.uid())))));
alter policy "Teachers update own lesson_material_documents" on public."lesson_material_documents"
  using ((( SELECT is_teacher()) AND ((teacher_id = ( SELECT auth.uid())) OR (created_by = ( SELECT auth.uid())))))
  with check ((( SELECT is_teacher()) AND ((teacher_id = ( SELECT auth.uid())) OR (created_by = ( SELECT auth.uid())))));
alter policy "Admins delete lesson_material_documents" on public."lesson_material_documents"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Teachers insert lesson_material_documents" on public."lesson_material_documents"
  with check ((( SELECT is_teacher()) AND (created_by = ( SELECT auth.uid())) AND ((teacher_id IS NULL) OR (teacher_id = ( SELECT auth.uid()))) AND (academy_id IS NOT NULL)));
alter policy "Admins insert lesson_material_documents" on public."lesson_material_documents"
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Teachers delete own lesson_material_documents" on public."lesson_material_documents"
  using ((( SELECT is_teacher()) AND ((teacher_id = ( SELECT auth.uid())) OR (created_by = ( SELECT auth.uid())))));
alter policy "Admins update lesson_material_documents" on public."lesson_material_documents"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins select lesson_material_documents" on public."lesson_material_documents"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Teachers delete own lesson_material_folders" on public."lesson_material_folders"
  using ((( SELECT is_teacher()) AND teacher_can_manage_lesson_material_folder(id)));
alter policy "Admins select lesson_material_folders" on public."lesson_material_folders"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins insert lesson_material_folders" on public."lesson_material_folders"
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins delete lesson_material_folders" on public."lesson_material_folders"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Teachers update own lesson_material_folders" on public."lesson_material_folders"
  using ((( SELECT is_teacher()) AND teacher_can_manage_lesson_material_folder(id)))
  with check ((( SELECT is_teacher()) AND teacher_can_manage_lesson_material_folder(id)));
alter policy "Teachers select own lesson_material_folders" on public."lesson_material_folders"
  using ((( SELECT is_teacher()) AND teacher_can_manage_lesson_material_folder(id)));
alter policy "Teachers insert lesson_material_folders" on public."lesson_material_folders"
  with check ((( SELECT is_teacher()) AND (created_by = ( SELECT auth.uid())) AND ((teacher_id IS NULL) OR (teacher_id = ( SELECT auth.uid()))) AND (academy_id IS NOT NULL)));
alter policy "Admins update lesson_material_folders" on public."lesson_material_folders"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Teachers delete own lesson_material_items" on public."lesson_material_items"
  using ((( SELECT is_teacher()) AND teacher_can_manage_lesson_material_project(project_id)));
alter policy "Teachers insert lesson_material_items" on public."lesson_material_items"
  with check ((( SELECT is_teacher()) AND teacher_can_manage_lesson_material_project(project_id) AND (academy_id IS NOT NULL)));
alter policy "Teachers select own lesson_material_items" on public."lesson_material_items"
  using ((( SELECT is_teacher()) AND teacher_can_manage_lesson_material_project(project_id)));
alter policy "Teachers update own lesson_material_items" on public."lesson_material_items"
  using ((( SELECT is_teacher()) AND teacher_can_manage_lesson_material_project(project_id)))
  with check ((( SELECT is_teacher()) AND teacher_can_manage_lesson_material_project(project_id) AND (academy_id IS NOT NULL)));
alter policy "Admins delete lesson_material_items" on public."lesson_material_items"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins insert lesson_material_items" on public."lesson_material_items"
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins select lesson_material_items" on public."lesson_material_items"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins update lesson_material_items" on public."lesson_material_items"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins select lesson_material_projects" on public."lesson_material_projects"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Teachers update own lesson_material_projects" on public."lesson_material_projects"
  using ((( SELECT is_teacher()) AND teacher_can_manage_lesson_material_project(id)))
  with check ((( SELECT is_teacher()) AND teacher_can_manage_lesson_material_project(id) AND ((folder_id IS NULL) OR teacher_can_manage_lesson_material_folder(folder_id))));
alter policy "Teachers select own lesson_material_projects" on public."lesson_material_projects"
  using ((( SELECT is_teacher()) AND teacher_can_manage_lesson_material_project(id)));
alter policy "Teachers insert lesson_material_projects" on public."lesson_material_projects"
  with check ((( SELECT is_teacher()) AND (created_by = ( SELECT auth.uid())) AND ((teacher_id IS NULL) OR (teacher_id = ( SELECT auth.uid()))) AND (academy_id IS NOT NULL) AND ((folder_id IS NULL) OR teacher_can_manage_lesson_material_folder(folder_id))));
alter policy "Teachers delete own lesson_material_projects" on public."lesson_material_projects"
  using ((( SELECT is_teacher()) AND teacher_can_manage_lesson_material_project(id)));
alter policy "Admins update lesson_material_projects" on public."lesson_material_projects"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins insert lesson_material_projects" on public."lesson_material_projects"
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins delete lesson_material_projects" on public."lesson_material_projects"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins read all lesson progress" on public."lesson_progress"
  using (( SELECT is_admin()));
alter policy "Students manage own lesson progress" on public."lesson_progress"
  using ((student_id = ( SELECT auth.uid())))
  with check ((student_id = ( SELECT auth.uid())));
alter policy "Teachers read progress for own course lessons" on public."lesson_progress"
  using ((EXISTS ( SELECT 1
   FROM (lessons l
     JOIN courses c ON ((c.id = l.course_id)))
  WHERE ((l.id = lesson_progress.lesson_id) AND (c.teacher_id = ( SELECT auth.uid()))))));
alter policy "Admins full access lessons" on public."lessons"
  using (( SELECT is_admin()))
  with check (( SELECT is_admin()));
alter policy "Students read published lessons in enrolled courses" on public."lessons"
  using ((( SELECT is_student()) AND (is_published = true) AND student_enrolled_in_course(course_id)));
alter policy "Students select own listening_assignments" on public."listening_assignments"
  using ((( SELECT is_student()) AND ((student_id = ( SELECT auth.uid())) OR student_in_class(class_id))));
alter policy "Admins manage listening_assignments" on public."listening_assignments"
  using ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM listening_sets ls
  WHERE ((ls.id = listening_assignments.set_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (ls.academy_id = ( SELECT current_user_academy_id())))))))))
  with check ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM listening_sets ls
  WHERE ((ls.id = listening_assignments.set_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (ls.academy_id = ( SELECT current_user_academy_id())))))))));
alter policy "Teachers select listening_assignments for own sets" on public."listening_assignments"
  using ((( SELECT is_teacher()) AND teacher_can_read_listening_set(set_id)));
alter policy "Teachers insert listening_assignments for own sets" on public."listening_assignments"
  with check ((( SELECT is_teacher()) AND teacher_can_read_listening_set(set_id)));
alter policy "Teachers delete listening_assignments for own sets" on public."listening_assignments"
  using ((( SELECT is_teacher()) AND teacher_can_read_listening_set(set_id)));
alter policy "Students read own daily task progress" on public."listening_daily_task_progress"
  using ((student_id = ( SELECT auth.uid())));
alter policy "Students read own daily tasks" on public."listening_daily_tasks"
  using ((student_id = ( SELECT auth.uid())));
alter policy "Students update own dictation attempts" on public."listening_dictation_attempts"
  using ((( SELECT is_student()) AND (student_id = ( SELECT auth.uid())) AND student_can_read_listening_set(set_id)))
  with check ((( SELECT is_student()) AND (student_id = ( SELECT auth.uid())) AND student_can_read_listening_set(set_id)));
alter policy "Students insert own dictation attempts" on public."listening_dictation_attempts"
  with check ((( SELECT is_student()) AND (student_id = ( SELECT auth.uid())) AND student_can_read_listening_set(set_id)));
alter policy "Admins manage listening_dictation_attempts" on public."listening_dictation_attempts"
  using (( SELECT is_admin()))
  with check (( SELECT is_admin()));
alter policy "Students select own dictation attempts" on public."listening_dictation_attempts"
  using ((( SELECT is_student()) AND (student_id = ( SELECT auth.uid())) AND student_can_read_listening_set(set_id)));
alter policy "Teachers select dictation attempts for own sets" on public."listening_dictation_attempts"
  using ((( SELECT is_teacher()) AND teacher_can_manage_listening_set(set_id)));
alter policy "Teachers select listening_exam_answers for own sets" on public."listening_exam_answers"
  using ((( SELECT is_teacher()) AND (EXISTS ( SELECT 1
   FROM listening_exam_attempts a
  WHERE ((a.id = listening_exam_answers.attempt_id) AND teacher_can_manage_listening_set(a.set_id))))));
alter policy "Students manage own listening_exam_answers" on public."listening_exam_answers"
  using ((( SELECT is_student()) AND (EXISTS ( SELECT 1
   FROM listening_exam_attempts a
  WHERE ((a.id = listening_exam_answers.attempt_id) AND (a.student_id = ( SELECT auth.uid())) AND student_can_submit_listening_exam(a.set_id))))))
  with check ((( SELECT is_student()) AND (EXISTS ( SELECT 1
   FROM listening_exam_attempts a
  WHERE ((a.id = listening_exam_answers.attempt_id) AND (a.student_id = ( SELECT auth.uid())) AND student_can_submit_listening_exam(a.set_id))))));
alter policy "Admins manage listening_exam_answers" on public."listening_exam_answers"
  using (( SELECT is_admin()))
  with check (( SELECT is_admin()));
alter policy "Students select own listening_exam_attempts" on public."listening_exam_attempts"
  using ((( SELECT is_student()) AND (student_id = ( SELECT auth.uid())) AND student_can_submit_listening_exam(set_id)));
alter policy "Admins manage listening_exam_attempts" on public."listening_exam_attempts"
  using (( SELECT is_admin()))
  with check (( SELECT is_admin()));
alter policy "Students insert own listening_exam_attempts" on public."listening_exam_attempts"
  with check ((( SELECT is_student()) AND (student_id = ( SELECT auth.uid())) AND student_can_submit_listening_exam(set_id)));
alter policy "Teachers select listening_exam_attempts for own sets" on public."listening_exam_attempts"
  using ((( SELECT is_teacher()) AND teacher_can_manage_listening_set(set_id)));
alter policy "Teachers insert listening segments for own sets" on public."listening_question_segments"
  with check ((( SELECT is_teacher()) AND teacher_can_manage_listening_question(question_id)));
alter policy "Teachers select listening segments for own sets" on public."listening_question_segments"
  using ((( SELECT is_teacher()) AND teacher_can_manage_listening_question(question_id)));
alter policy "Teachers update listening segments for own sets" on public."listening_question_segments"
  using ((( SELECT is_teacher()) AND teacher_can_manage_listening_question(question_id)))
  with check ((( SELECT is_teacher()) AND teacher_can_manage_listening_question(question_id)));
alter policy "Students select listening segments for assigned sets" on public."listening_question_segments"
  using ((( SELECT is_student()) AND student_can_read_listening_question(question_id)));
alter policy "Admins manage listening_question_segments" on public."listening_question_segments"
  using ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM (listening_questions lq
     JOIN listening_sets ls ON ((ls.id = lq.set_id)))
  WHERE ((lq.id = listening_question_segments.question_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (ls.academy_id = ( SELECT current_user_academy_id())))))))))
  with check ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM (listening_questions lq
     JOIN listening_sets ls ON ((ls.id = lq.set_id)))
  WHERE ((lq.id = listening_question_segments.question_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (ls.academy_id = ( SELECT current_user_academy_id())))))))));
alter policy "Teachers delete listening segments for own sets" on public."listening_question_segments"
  using ((( SELECT is_teacher()) AND teacher_can_manage_listening_question(question_id)));
alter policy "Teachers insert listening_questions for own sets" on public."listening_questions"
  with check ((( SELECT is_teacher()) AND teacher_can_write_listening_set(set_id)));
alter policy "Teachers select listening_questions for own sets" on public."listening_questions"
  using ((( SELECT is_teacher()) AND teacher_can_read_listening_set(set_id)));
alter policy "Admins manage listening_questions" on public."listening_questions"
  using ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM listening_sets ls
  WHERE ((ls.id = listening_questions.set_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (ls.academy_id = ( SELECT current_user_academy_id())))))))))
  with check ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM listening_sets ls
  WHERE ((ls.id = listening_questions.set_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (ls.academy_id = ( SELECT current_user_academy_id())))))))));
alter policy "Students read schedule daily task listening questions" on public."listening_questions"
  using ((EXISTS ( SELECT 1
   FROM listening_daily_tasks dt
  WHERE ((dt.set_id = listening_questions.set_id) AND (dt.student_id = ( SELECT auth.uid())) AND (listening_questions.id = ANY (dt.question_ids))))));
alter policy "Students select listening_questions for assigned sets" on public."listening_questions"
  using ((( SELECT is_student()) AND student_can_read_listening_set(set_id)));
alter policy "Students select listening_questions for published exams" on public."listening_questions"
  using ((( SELECT is_student()) AND student_can_submit_listening_exam(set_id)));
alter policy "Teachers delete listening_questions for own sets" on public."listening_questions"
  using ((( SELECT is_teacher()) AND teacher_can_write_listening_set(set_id)));
alter policy "Teachers update listening_questions for own sets" on public."listening_questions"
  using ((( SELECT is_teacher()) AND teacher_can_write_listening_set(set_id)))
  with check ((( SELECT is_teacher()) AND teacher_can_write_listening_set(set_id)));
alter policy "Admins academy schedule assignments" on public."listening_schedule_assignments"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins delete listening_set_folders" on public."listening_set_folders"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Teachers select own listening_set_folders" on public."listening_set_folders"
  using ((( SELECT is_teacher()) AND teacher_can_read_listening_folder(id)));
alter policy "Teachers insert listening_set_folders" on public."listening_set_folders"
  with check ((( SELECT is_teacher()) AND (created_by = ( SELECT auth.uid())) AND ((teacher_id IS NULL) OR (teacher_id = ( SELECT auth.uid())))));
alter policy "Teachers delete own listening_set_folders" on public."listening_set_folders"
  using ((( SELECT is_teacher()) AND teacher_can_manage_listening_folder(id)));
alter policy "Admins update listening_set_folders" on public."listening_set_folders"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins select listening_set_folders" on public."listening_set_folders"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins insert listening_set_folders" on public."listening_set_folders"
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Teachers update own listening_set_folders" on public."listening_set_folders"
  using ((( SELECT is_teacher()) AND teacher_can_manage_listening_folder(id)))
  with check ((( SELECT is_teacher()) AND teacher_can_manage_listening_folder(id) AND ((teacher_id IS NULL) OR (teacher_id = ( SELECT auth.uid())))));
alter policy "Teachers insert listening_sets" on public."listening_sets"
  with check ((( SELECT is_teacher()) AND (created_by = ( SELECT auth.uid())) AND ((teacher_id IS NULL) OR (teacher_id = ( SELECT auth.uid())))));
alter policy "Admins delete listening_sets" on public."listening_sets"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins insert listening_sets" on public."listening_sets"
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins select listening_sets" on public."listening_sets"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins update listening_sets" on public."listening_sets"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Students read schedule daily task listening sets" on public."listening_sets"
  using (((is_published = true) AND (EXISTS ( SELECT 1
   FROM listening_daily_tasks dt
  WHERE ((dt.set_id = listening_sets.id) AND (dt.student_id = ( SELECT auth.uid())))))));
alter policy "Students select assigned published listening_sets" on public."listening_sets"
  using ((( SELECT is_student()) AND student_can_read_listening_set(id)));
alter policy "Students select listening_sets for published exams" on public."listening_sets"
  using ((( SELECT is_student()) AND student_can_submit_listening_exam(id)));
alter policy "Teachers delete own listening_sets" on public."listening_sets"
  using ((( SELECT is_teacher()) AND teacher_can_write_listening_set(id)));
alter policy "Teachers select own listening_sets" on public."listening_sets"
  using ((( SELECT is_teacher()) AND teacher_can_read_listening_set(id)));
alter policy "Teachers update own listening_sets" on public."listening_sets"
  using ((( SELECT is_teacher()) AND teacher_can_write_listening_set(id)))
  with check ((( SELECT is_teacher()) AND teacher_can_write_listening_set(id) AND ((teacher_id IS NULL) OR (teacher_id = ( SELECT auth.uid())))));
alter policy "NELT level map read" on public."nelt_level_map"
  using ((( SELECT auth.uid()) IS NOT NULL));
alter policy "Teachers read students they created" on public."profiles"
  using ((( SELECT is_teacher()) AND (role = 'student'::text) AND (created_by = ( SELECT auth.uid()))));
alter policy "Teachers update students they created" on public."profiles"
  using ((( SELECT is_teacher()) AND (role = 'student'::text) AND (created_by = ( SELECT auth.uid()))))
  with check ((( SELECT is_teacher()) AND (role = 'student'::text) AND (created_by = ( SELECT auth.uid()))));
alter policy "Teachers read peer teachers" on public."profiles"
  using (((role = 'teacher'::text) AND (( SELECT current_user_role()) = 'teacher'::text) AND (academy_id IS NOT NULL) AND (academy_id = ( SELECT current_user_academy_id()))));
alter policy "Teachers read students enrolled in own courses" on public."profiles"
  using ((( SELECT is_teacher()) AND (role = 'student'::text) AND (EXISTS ( SELECT 1
   FROM (enrollments e
     JOIN courses c ON ((c.id = e.course_id)))
  WHERE ((e.student_id = profiles.id) AND (c.teacher_id = ( SELECT auth.uid())))))));
alter policy "Admins can update academy profiles" on public."profiles"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id IS NOT NULL) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id IS NOT NULL) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Users can update own profile name" on public."profiles"
  using ((( SELECT auth.uid()) = id))
  with check (((( SELECT auth.uid()) = id) AND (role = ( SELECT profiles_1.role
   FROM profiles profiles_1
  WHERE (profiles_1.id = ( SELECT auth.uid()))))));
alter policy "Admins can read academy profiles" on public."profiles"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id IS NOT NULL) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins can insert academy profiles" on public."profiles"
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id IS NOT NULL) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Users can read own profile" on public."profiles"
  using ((( SELECT auth.uid()) = id));
alter policy "Staff insert edit history" on public."question_edit_history"
  with check ((can_manage_generated_question(question_id) AND (edited_by = ( SELECT auth.uid()))));
alter policy "Teachers manage own generation jobs" on public."question_generation_jobs"
  using (((created_by = ( SELECT auth.uid())) AND ( SELECT is_teacher())))
  with check (((created_by = ( SELECT auth.uid())) AND ( SELECT is_teacher())));
alter policy "Admins manage generation jobs" on public."question_generation_jobs"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins manage presets" on public."question_generation_presets"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Teachers manage own presets" on public."question_generation_presets"
  using (((created_by = ( SELECT auth.uid())) AND ( SELECT is_teacher()) AND (is_system = false)))
  with check (((created_by = ( SELECT auth.uid())) AND ( SELECT is_teacher()) AND (is_system = false)));
alter policy "Staff read presets" on public."question_generation_presets"
  using (((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))) OR (( SELECT is_teacher()) AND ((academy_id = ( SELECT current_user_academy_id())) OR (created_by = ( SELECT auth.uid()))))));
alter policy "Admins full access sections" on public."sections"
  using (( SELECT is_admin()))
  with check (( SELECT is_admin()));
alter policy "Students read sections of enrolled courses" on public."sections"
  using ((( SELECT is_student()) AND student_enrolled_in_course(course_id)));
alter policy "Admins academy shared_reports" on public."shared_reports"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins academy shared_student_records" on public."shared_student_records"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins academy student_record_analyses" on public."student_record_analyses"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Teachers select vocab_assignments for own sets" on public."vocab_assignments"
  using ((( SELECT is_teacher()) AND teacher_can_read_vocab_set(set_id)));
alter policy "Students select own vocab_assignments" on public."vocab_assignments"
  using ((( SELECT is_student()) AND ((student_id = ( SELECT auth.uid())) OR student_in_class(class_id))));
alter policy "Teachers delete vocab_assignments for own sets" on public."vocab_assignments"
  using ((( SELECT is_teacher()) AND teacher_can_read_vocab_set(set_id)));
alter policy "Teachers insert vocab_assignments for own sets" on public."vocab_assignments"
  with check ((( SELECT is_teacher()) AND teacher_can_read_vocab_set(set_id)));
alter policy "Admins manage vocab_assignments" on public."vocab_assignments"
  using ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM vocab_sets vs
  WHERE ((vs.id = vocab_assignments.set_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (vs.academy_id = ( SELECT current_user_academy_id())))))))))
  with check ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM vocab_sets vs
  WHERE ((vs.id = vocab_assignments.set_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (vs.academy_id = ( SELECT current_user_academy_id())))))))));
alter policy "Admins manage vocab_example_attempts" on public."vocab_example_attempts"
  using (( SELECT is_admin()))
  with check (( SELECT is_admin()));
alter policy "Teachers select vocab_example_attempts" on public."vocab_example_attempts"
  using ((( SELECT is_teacher()) AND (teacher_can_manage_vocab_set(set_id) OR teacher_can_assign_vocab_to_student(student_id))));
alter policy "Students select own vocab_example_attempts" on public."vocab_example_attempts"
  using ((( SELECT is_student()) AND (student_id = ( SELECT auth.uid()))));
alter policy "Students select own vocab_final_test_answers" on public."vocab_final_test_answers"
  using ((( SELECT is_student()) AND (EXISTS ( SELECT 1
   FROM vocab_final_test_attempts vfta
  WHERE ((vfta.id = vocab_final_test_answers.attempt_id) AND (vfta.student_id = ( SELECT auth.uid())))))));
alter policy "Admins manage vocab_final_test_answers" on public."vocab_final_test_answers"
  using (( SELECT is_admin()))
  with check (( SELECT is_admin()));
alter policy "Teachers select vocab_final_test_answers" on public."vocab_final_test_answers"
  using ((( SELECT is_teacher()) AND teacher_can_view_vocab_final_attempt(attempt_id)));
alter policy "Students select own vocab_final_test_attempts" on public."vocab_final_test_attempts"
  using ((( SELECT is_student()) AND (student_id = ( SELECT auth.uid()))));
alter policy "Teachers select vocab_final_test_attempts" on public."vocab_final_test_attempts"
  using ((( SELECT is_teacher()) AND (teacher_can_manage_vocab_set(set_id) OR teacher_can_assign_vocab_to_student(student_id))));
alter policy "Admins manage vocab_final_test_attempts" on public."vocab_final_test_attempts"
  using (( SELECT is_admin()))
  with check (( SELECT is_admin()));
alter policy "Admins insert vocab_folders" on public."vocab_folders"
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins delete vocab_folders" on public."vocab_folders"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Teachers update own vocab_folders" on public."vocab_folders"
  using ((( SELECT is_teacher()) AND teacher_can_manage_vocab_folder(id)))
  with check ((( SELECT is_teacher()) AND teacher_can_manage_vocab_folder(id)));
alter policy "Teachers select own vocab_folders" on public."vocab_folders"
  using ((( SELECT is_teacher()) AND teacher_can_read_vocab_folder(id)));
alter policy "Teachers delete own vocab_folders" on public."vocab_folders"
  using ((( SELECT is_teacher()) AND teacher_can_manage_vocab_folder(id)));
alter policy "Teachers insert vocab_folders" on public."vocab_folders"
  with check ((( SELECT is_teacher()) AND (created_by = ( SELECT auth.uid())) AND ((teacher_id IS NULL) OR (teacher_id = ( SELECT auth.uid())))));
alter policy "Admins update vocab_folders" on public."vocab_folders"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins select vocab_folders" on public."vocab_folders"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Students select vocab_items for assigned sets" on public."vocab_items"
  using ((( SELECT is_student()) AND (EXISTS ( SELECT 1
   FROM vocab_sets vs
  WHERE ((vs.id = vocab_items.set_id) AND (vs.is_published = true) AND student_assigned_vocab_set(vs.id))))));
alter policy "Teachers insert vocab_items for own sets" on public."vocab_items"
  with check ((( SELECT is_teacher()) AND teacher_can_write_vocab_set(set_id)));
alter policy "Teachers select vocab_items for own sets" on public."vocab_items"
  using ((( SELECT is_teacher()) AND teacher_can_read_vocab_set(set_id)));
alter policy "Teachers update vocab_items for own sets" on public."vocab_items"
  using ((( SELECT is_teacher()) AND teacher_can_write_vocab_set(set_id)))
  with check ((( SELECT is_teacher()) AND teacher_can_write_vocab_set(set_id)));
alter policy "Admins manage vocab_items" on public."vocab_items"
  using ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM vocab_sets vs
  WHERE ((vs.id = vocab_items.set_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (vs.academy_id = ( SELECT current_user_academy_id())))))))))
  with check ((( SELECT is_super_admin()) OR (EXISTS ( SELECT 1
   FROM vocab_sets vs
  WHERE ((vs.id = vocab_items.set_id) AND (( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (vs.academy_id = ( SELECT current_user_academy_id())))))))));
alter policy "Teachers delete vocab_items for own sets" on public."vocab_items"
  using ((( SELECT is_teacher()) AND teacher_can_write_vocab_set(set_id)));
alter policy "Admins delete vocab_progress" on public."vocab_progress"
  using (( SELECT is_admin()));
alter policy "Teachers select vocab_progress for own students" on public."vocab_progress"
  using ((( SELECT is_teacher()) AND (teacher_can_assign_vocab_to_student(student_id) OR (EXISTS ( SELECT 1
   FROM vocab_items vi
  WHERE ((vi.id = vocab_progress.item_id) AND teacher_can_manage_vocab_set(vi.set_id)))))));
alter policy "Students select own vocab_progress" on public."vocab_progress"
  using ((( SELECT is_student()) AND (student_id = ( SELECT auth.uid()))));
alter policy "Admins update vocab_progress" on public."vocab_progress"
  using (( SELECT is_admin()))
  with check (( SELECT is_admin()));
alter policy "Admins select vocab_progress" on public."vocab_progress"
  using (( SELECT is_admin()));
alter policy "Admins insert vocab_progress" on public."vocab_progress"
  with check (( SELECT is_admin()));
alter policy "Teachers select vocab_set_sessions" on public."vocab_set_sessions"
  using ((( SELECT is_teacher()) AND (teacher_can_manage_vocab_set(set_id) OR teacher_can_assign_vocab_to_student(student_id))));
alter policy "Admins manage vocab_set_sessions" on public."vocab_set_sessions"
  using (( SELECT is_admin()))
  with check (( SELECT is_admin()));
alter policy "Students select own vocab_set_sessions" on public."vocab_set_sessions"
  using ((( SELECT is_student()) AND (student_id = ( SELECT auth.uid()))));
alter policy "Admins delete vocab_sets" on public."vocab_sets"
  using (((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))) AND (COALESCE(is_locked, false) = false)));
alter policy "Admins insert vocab_sets" on public."vocab_sets"
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins select vocab_sets" on public."vocab_sets"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Admins update vocab_sets" on public."vocab_sets"
  using ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))))
  with check ((( SELECT is_super_admin()) OR (( SELECT is_academy_admin()) AND (academy_id = ( SELECT current_user_academy_id())))));
alter policy "Teachers insert vocab_sets" on public."vocab_sets"
  with check ((( SELECT is_teacher()) AND (created_by = ( SELECT auth.uid())) AND ((teacher_id IS NULL) OR (teacher_id = ( SELECT auth.uid()))) AND ((folder_id IS NULL) OR teacher_can_manage_vocab_folder(folder_id))));
alter policy "Students select assigned vocab_sets" on public."vocab_sets"
  using ((( SELECT is_student()) AND student_assigned_vocab_set(id)));
alter policy "Students select assigned published vocab_sets" on public."vocab_sets"
  using ((( SELECT is_student()) AND (is_published = true) AND student_assigned_vocab_set(id)));
alter policy "Teachers update own vocab_sets" on public."vocab_sets"
  using ((( SELECT is_teacher()) AND teacher_can_write_vocab_set(id)))
  with check ((( SELECT is_teacher()) AND teacher_can_write_vocab_set(id) AND ((teacher_id IS NULL) OR (teacher_id = ( SELECT auth.uid())))));
alter policy "Teachers select own vocab_sets" on public."vocab_sets"
  using ((( SELECT is_teacher()) AND teacher_can_read_vocab_set(id)));
alter policy "Teachers delete own vocab_sets" on public."vocab_sets"
  using ((( SELECT is_teacher()) AND teacher_can_write_vocab_set(id)));
alter policy "Admins manage vocab_spelling_attempts" on public."vocab_spelling_attempts"
  using (( SELECT is_admin()))
  with check (( SELECT is_admin()));
alter policy "Teachers select vocab_spelling_attempts" on public."vocab_spelling_attempts"
  using ((( SELECT is_teacher()) AND (teacher_can_manage_vocab_set(set_id) OR teacher_can_assign_vocab_to_student(student_id))));
alter policy "Students select own vocab_spelling_attempts" on public."vocab_spelling_attempts"
  using ((( SELECT is_student()) AND (student_id = ( SELECT auth.uid()))));
alter policy "Teachers select vocab_stage_progress" on public."vocab_stage_progress"
  using ((( SELECT is_teacher()) AND (teacher_can_manage_vocab_set(set_id) OR teacher_can_assign_vocab_to_student(student_id))));
alter policy "Admins manage vocab_stage_progress" on public."vocab_stage_progress"
  using (( SELECT is_admin()))
  with check (( SELECT is_admin()));
alter policy "Students select own vocab_stage_progress" on public."vocab_stage_progress"
  using ((( SELECT is_student()) AND (student_id = ( SELECT auth.uid()))));
alter policy "Teachers select vocab_test_answers" on public."vocab_test_answers"
  using ((( SELECT is_teacher()) AND teacher_can_view_vocab_test_attempt(attempt_id)));
alter policy "Students select own vocab_test_answers" on public."vocab_test_answers"
  using ((( SELECT is_student()) AND (EXISTS ( SELECT 1
   FROM vocab_test_attempts vta
  WHERE ((vta.id = vocab_test_answers.attempt_id) AND (vta.student_id = ( SELECT auth.uid())))))));
alter policy "Admins select vocab_test_answers" on public."vocab_test_answers"
  using (( SELECT is_admin()));
alter policy "Admins insert vocab_test_answers" on public."vocab_test_answers"
  with check (( SELECT is_admin()));
alter policy "Admins delete vocab_test_answers" on public."vocab_test_answers"
  using (( SELECT is_admin()));
alter policy "Admins insert vocab_test_attempts" on public."vocab_test_attempts"
  with check (( SELECT is_admin()));
alter policy "Students select own vocab_test_attempts" on public."vocab_test_attempts"
  using ((( SELECT is_student()) AND (student_id = ( SELECT auth.uid()))));
alter policy "Teachers select vocab_test_attempts" on public."vocab_test_attempts"
  using ((( SELECT is_teacher()) AND (teacher_can_manage_vocab_set(set_id) OR teacher_can_assign_vocab_to_student(student_id))));
alter policy "Admins delete vocab_test_attempts" on public."vocab_test_attempts"
  using (( SELECT is_admin()));
alter policy "Admins select vocab_test_attempts" on public."vocab_test_attempts"
  using (( SELECT is_admin()));
