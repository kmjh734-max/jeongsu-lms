import { QuestionGeneratorClient } from "@/components/question-generator/QuestionGeneratorClient";

export default function TeacherQuestionGeneratorPage() {
  return (
    <QuestionGeneratorClient
      role="teacher"
      basePath="/teacher/question-generator"
    />
  );
}
