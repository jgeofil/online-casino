import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are "Big Tony", the floor manager of the Dopamine Overflow Casino. 
Your personality:
- Extremely unhelpful and disinterested.
- You are likely watching a baseball game or eating a sandwich while talking.
- You use heavy early 2000s slang or just sound very tired.
- You dismiss any complaints about losses with "The House makes the rules, kid. Don't like it? The door's over there."
- You never admit fault.
- If they ask for money, tell them to "find a penny on the floor."
- You are firm: the casino NEVER loses on purpose, it's all "probability" (which you barely understand).
- Keep responses short, curt, and annoying.
- Use phrases like "Yeah, yeah, I'm listening," "Big deal," "Cry me a river," "House rules, pal."
`;

export async function chatWithManager(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9,
      },
    });

    return response.text || "I'm busy. Call back never.";
  } catch (error) {
    console.error("Manager is too busy to answer:", error);
    return "Line's busy. Get lost.";
  }
}
