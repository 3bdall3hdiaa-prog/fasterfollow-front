
import { GoogleGenAI } from "@google/genai";

// FIX: Updated GoogleGenAI initialization to use process.env.API_KEY directly,
// and inlined the model name in generateContent to adhere to Gemini API guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const systemInstruction = `أنت مساعد ذكي وودود لمتجر إلكتروني يسمى "متابع برو" متخصص في بيع خدمات المتابعين لمنصات التواصل الاجتماعي مثل انستغرام، تيك توك، تويتر، وفيسبوك.
مهمتك هي الإجابة على أسئلة العملاء بخصوص الخدمات، الأسعار، كيفية عمل الموقع، وسرعة التسليم.
كن مهذباً ومحترفاً. إذا سأل العميل عن شيء خارج نطاق خدماتنا (مثل طلب متابعين لمنصة لا ندعمها، أو سؤال عن أمور تقنية معقدة في حساباتهم، أو أي موضوع عام)، أجب بلطف أنك متخصص فقط في خدمات "متابع برو" ولا يمكنك المساعدة في هذا الأمر.
لا تذكر أبداً أنك نموذج لغوي أو ذكاء اصطناعي. تحدث كأنك موظف دعم فني حقيقي.
أجب باللغة العربية.`;

export const askBot = async (question: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: question,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get response from the assistant.");
    }
};