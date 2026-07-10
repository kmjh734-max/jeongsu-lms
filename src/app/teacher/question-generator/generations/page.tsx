import { GenerationsListClient } from "@/components/question-generator/GenerationsListClient";

export default function Page() {
  return <GenerationsListClient basePath="/teacher/question-generator" />;
}
