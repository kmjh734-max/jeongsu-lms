import { QuestionGeneratorClient } from "@/components/question-generator/QuestionGeneratorClient";

export default function AdminQuestionGeneratorNewPage() {
  return (
    <QuestionGeneratorClient
      role="admin"
      basePath="/admin/question-generator"
    />
  );
}
