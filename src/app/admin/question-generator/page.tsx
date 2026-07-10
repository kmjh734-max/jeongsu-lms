import { QuestionGeneratorClient } from "@/components/question-generator/QuestionGeneratorClient";

export default function AdminQuestionGeneratorPage() {
  return (
    <QuestionGeneratorClient role="admin" basePath="/admin/question-generator" />
  );
}
