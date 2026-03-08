import { GoogleGenAI, Type } from '@google/genai';
import { IAIService } from '../../interfaces/IAIService';

// Initialize the Gemini client. It connects automatically using process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({});

export class GeminiAIService implements IAIService {
    /**
     * Process entire bank statement in a single pass to extract transactions and generate insights simultaneously.
     * This cuts processing time by 50% vs two sequential calls.
     */
    async processStatement(rawText: string): Promise<{ transactions: any[], insights: any }> {
        console.log("Using Gemini for Single-Pass Processing...");
        const prompt = `You are a financial analysis AI. Process the following bank statement text.
Extract all transactions AND generate insights in a single response.

Return ONLY a valid JSON object with the following structure:
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "Cleaned up merchant name",
      "category": "Best guess category (e.g. Groceries, Dining, Shopping, Income, SaaS)",
      "amount": number (absolute value),
      "type": "DEBIT" or "CREDIT",
      "balance": number (Running balance or 0)
    }
  ],
  "insights": {
    "totalTransactions": integer count,
    "topCategories": ["cat1", "cat2", "cat3"],
    "largestTransaction": { "description": "name", "amount": number },
    "subscriptionAlerts": ["array of descriptions that look like recurring subscriptions"],
    "savingsTip": "A short, personalized one-sentence financial tip based on spending",
    "currency": "ISO currency code or symbol detected (e.g. $, €, ₹, USD, GBP, INR. Default to '$')"
  }
}

Statement text:
${rawText.substring(0, 15000)}`; // Truncate to avoid context limits if extremely large

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            transactions: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        date: { type: Type.STRING },
                                        description: { type: Type.STRING },
                                        category: { type: Type.STRING },
                                        amount: { type: Type.NUMBER },
                                        type: { type: Type.STRING, enum: ['DEBIT', 'CREDIT'] },
                                        balance: { type: Type.NUMBER }
                                    }
                                }
                            },
                            insights: {
                                type: Type.OBJECT,
                                properties: {
                                    totalTransactions: { type: Type.INTEGER },
                                    topCategories: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    largestTransaction: {
                                        type: Type.OBJECT,
                                        properties: { description: { type: Type.STRING }, amount: { type: Type.NUMBER } }
                                    },
                                    subscriptionAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    savingsTip: { type: Type.STRING },
                                    currency: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            });
            const text = response.text || '{"transactions":[],"insights":{}}';
            const parsed = JSON.parse(text);

            return {
                transactions: parsed.transactions || [],
                insights: parsed.insights || {}
            };

        } catch (error) {
            console.error("Gemini Processing Error:", error);
            throw new Error("Failed to process statement. Ensure GEMINI_API_KEY is set in backend .env");
        }
    }

    // Kept for backward compatibility if /insights endpoint is called directly
    async generateInsights(transactions: any[], rawText?: string): Promise<any> {
        console.log("Using Gemini for generic Insights...");
        // Fast mock-fallback or lightweight prompt since it's now mostly single-pass
        const prompt = `Analyze the following JSON list of transactions and provide insights.
        Return ONLY a valid JSON object matching the insights schema above.\n\nTransactions:\n${JSON.stringify(transactions.slice(0, 100))}`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });
            return JSON.parse(response.text || '{}');
        } catch (e) {
            return {};
        }
    }

    /**
     * Answer natural language query using Gemini
     */
    async answerQuery(query: string, dataContext: any[]): Promise<string> {
        const prompt = `You are a financial assistant. Answer the user's query based ONLY on the provided transaction data. Keep your answer brief, direct, and helpful. Do not mention that you are an AI or using the provided data.

        Transactions:
${JSON.stringify(dataContext.slice(0, 100))}

User Query: ${query}`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return response.text || "I'm sorry, I couldn't process that query.";
        } catch (error) {
            console.error("Gemini Query Error:", error);
            throw new Error("Failed to answer query.");
        }
    }
}
