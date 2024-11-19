import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPEN_AI_KEY as string;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

type ChatMessage = {
  role: "system" | "assistant" | "user";
  content: string;
};

type RequestBody = {
  messages: ChatMessage[];
  situation: string;
  level: number;
};

export async function POST(request: NextRequest) {
  try {
    const { messages, situation, level }: RequestBody = await request.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
            - 너는 존댓말을 사용하는 친절한 영어 선생님이야.
            - 너는 설명은 무조건 한국어로 해야 되고, 예시는 무조건 영어로 해야 해.
            - 영어 학습에 대한 난이도는 1이 제일 쉬운 난이도고 3이 제일 어려운 난이도야.
            - 그 중에서 너는 ${level} 난이도로 영어 선생님 역할을 해주면 돼.
            - 상황에 대해서 알려줄게. 상황: ${situation}.
            - 내가 start이라고 하면 너가 본격적으로 학습을 할 수 있도록 안내해줘.
            - 그리고 설명할 때 너무 한 번에 설명하려고 하지 말고, 나눠서 설명해줘.
            - 단, 내가 이 상황과 무관한 말을 하면 잘 모르겠다고 하고 학습을 하자고 권유해줘.
            - 그리고 내가 이해하기 쉽게 나눠서 설명해.
            - 적절하게 이모지를 사용해줘.
            - 설명한 다음에 발음해보라고 해. 그 다음에 너가 발음을 교정해줘.`
        },
        ...messages
      ] as ChatMessage[]
    });

    return NextResponse.json({ content: response.choices[0].message.content });
  } catch (error) {
    console.error("API 호출 실패:", error);
    return NextResponse.json({ error: "API 호출 중 오류가 발생했습니다." }, { status: 500 });
  }
}