import { GenerationsListClient } from "@/components/question-generator/GenerationsListClient";

export default function Page() {
  return <GenerationsListClient basePath="/admin/question-generator" />;
}
