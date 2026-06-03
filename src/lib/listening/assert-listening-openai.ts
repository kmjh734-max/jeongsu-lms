import { getListeningGeneratorModel } from "@/lib/listening/openai-listening-model";

/** 듣기 생성 API 진입 시 API 키·모델 환경변수 확인 */
export function assertListeningOpenAiEnv(): { apiKey: string; model: string } {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY가 설정되어 있지 않습니다. .env.local에 키를 추가한 뒤 서버를 재시작해 주세요."
    );
  }
  const model = getListeningGeneratorModel();
  return { apiKey, model };
}
