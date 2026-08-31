import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { GeneratedSummary, SummaryCandidate, SummaryGenerator } from "./summary-service.js";

const SummarySchema = z.object({
  summary: z.string().min(1),
  keyPoints: z.array(z.string().min(1)).max(3),
});

export class OpenAiSummaryGenerator implements SummaryGenerator {
  readonly model: string;

  constructor(private readonly client: OpenAI, model = process.env.OPENAI_SUMMARY_MODEL ?? "gpt-5-nano") {
    this.model = model;
  }

  static fromEnvironment(env: NodeJS.ProcessEnv = process.env): OpenAiSummaryGenerator {
    if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY environment variable is missing.");
    return new OpenAiSummaryGenerator(new OpenAI({ apiKey: env.OPENAI_API_KEY }), env.OPENAI_SUMMARY_MODEL);
  }

  async generate(article: SummaryCandidate): Promise<GeneratedSummary> {
    const response = await this.client.responses.parse({
      model: this.model,
      instructions: [
        "당신은 남원시 행정정보를 시민이 빠르게 이해하도록 정리하는 편집자입니다.",
        "제공된 원문에 명시된 사실만 사용하고 추측하거나 정보를 추가하지 마세요.",
        "summary는 쉬운 한국어 2~3문장으로 작성하세요.",
        "keyPoints는 신청기간, 대상, 장소, 문의처처럼 시민 행동에 중요한 내용만 최대 3개 작성하세요.",
      ].join(" "),
      input: `제목: ${article.title}\n담당부서: ${article.department ?? "없음"}\n등록일: ${article.registeredDate}\n원문:\n${article.body ?? "본문 없음"}`,
      text: { format: zodTextFormat(SummarySchema, "namwon_article_summary") },
      max_output_tokens: 500,
    });
    if (!response.output_parsed) throw new Error("OpenAI returned no parsed summary.");
    return response.output_parsed;
  }
}
