import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, learningGoal } = await req.json();

    if (!messages || !learningGoal) {
      return NextResponse.json({ error: 'Messages and learning goal are required' }, { status: 400 });
    }

    const transcript = messages
      .filter((msg: any) => msg.type === 'MESSAGE' && (msg.role === 'user' || msg.role === 'assistant'))
      .map((msg: any) => `${msg.role === 'user' ? 'ユーザー' : 'アシスタント'}: ${msg.title}`)
      .join('\n');

    const systemPrompt = `あなたは、小学生向けの教育プログラムの評価者です。以下のルールに従って、会話の評価をJSON形式で返してください。
ルール:
- 提供された「学習目標」を、**ユーザーが**どれだけ達成できたかを会話内容から評価します。
- **評価のコメントには、アシスタントの性能や応答に関する言及を一切含めず、純粋にユーザーの会話行動のみを評価してください。**
- 評価は100点満点で行い、点数を 'score' というキーに数値で格納します。
- なぜその点数になったのかの理由を、小学生にも分かるように、具体的かつ簡潔に説明し、'reason' というキーに文字列で格納します。
- 返答はJSONオブジェクトのみとし、他のテキストは一切含めないでください。`;

    const userPrompt = `以下の会話を評価してください。

## 学習目標
${learningGoal}

## 会話の履歴
${transcript}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const evaluation = JSON.parse(response.choices[0].message.content || '{}');

    return NextResponse.json(evaluation);

  } catch (error) {
    console.error('Evaluation API error:', error);
    return NextResponse.json({ error: 'Failed to evaluate conversation' }, { status: 500 });
  }
}