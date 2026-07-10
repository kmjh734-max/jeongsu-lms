import { QuestionGeneratorClient } from "@/components/question-generator/QuestionGeneratorClient";

export default function TeacherQuestionGeneratorNewPage() {
  return (
    <QuestionGeneratorClient
      role="teacher"
      basePath="/teacher/question-generator"
    />
  );
}
