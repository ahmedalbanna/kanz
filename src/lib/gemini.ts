import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function transcribeAndAnalyzeHeritage(audioBlobProxy: string, description: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    أنت خبير في التراث اليمني. بناءً على هذا الوصف الصوتي أو المكتوب:
    "${description}"
    
    قم بما يلي:
    1. استخرج اسم القطعة أو الحكاية.
    2. صنفها ضمن الفئات التالية: [حلي، أسلحة، مخطوطات، عمارة، مطبخ، أزياء، تراث شفهي].
    3. قدم شرحاً تاريخياً بسيطاً (50-100 كلمة) يبرز أهمية هذا النوع من التراث في اليمن.
    4. استخرج الكلمات المفتاحية (تاغات).
    
    أجب بتنسيق JSON:
    {
      "title": "...",
      "category": "...",
      "historicalContext": "...",
      "tags": ["...", "..."]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Simple JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
}

export async function getCulturalRecommendation(userInterest: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `بصفتك دليلاً سياحياً افتراضياً لليمن، اقترح 3 مواقع أثرية أو تقاليد يمنية تناسب اهتمام المستخدم بـ: ${userInterest}. باللغة العربية.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}
