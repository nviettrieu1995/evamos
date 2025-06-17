
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MOCK_API_KEY } from '../constants'; // Use the constant for API key

// Ensure API_KEY is accessed correctly via process.env or your constants
const API_KEY = process.env.API_KEY || MOCK_API_KEY;

let ai: GoogleGenAI | null = null;

try {
    if(!API_KEY || API_KEY === "mock_api_key_not_set_in_env") {
        console.warn("Gemini API key is not set. Using mock service. Set API_KEY environment variable.");
    } else {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    }
} catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    // Fallback to mock or disable AI features
}


/**
 * Example function to get a summary from Gemini.
 * This is a placeholder and would need specific implementation based on requirements.
 * For example, this could be used on the dashboard to summarize recent activities or data trends.
 */
export const getDashboardSummary = async (dataForSummary: string): Promise<string> => {
  if (!ai) {
    console.warn('Gemini AI client not initialized. Returning mock summary.');
    return Promise.resolve("Mock summary: Recent activities show an increase in production and new customer registrations.");
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17', // Use appropriate model
      contents: `Summarize the following garment factory data in a short paragraph for a dashboard: ${dataForSummary}`,
      // config: { thinkingConfig: { thinkingBudget: 0 } } // Disable thinking for low latency if needed
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching summary from Gemini API:", error);
    // Consider more sophisticated error handling, like retries or specific error messages
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
             return "Error: Invalid Gemini API Key. Please check your configuration.";
        }
    }
    return "Error: Could not retrieve summary from AI.";
  }
};

/**
 * Example function for parsing JSON from Gemini response.
 */
interface ExampleDataType {
  key: string;
  value: string;
}
export const getStructuredDataFromGemini = async (prompt: string): Promise<ExampleDataType | ExampleDataType[] | null> => {
    if (!ai) {
        console.warn('Gemini AI client not initialized. Returning mock structured data.');
        return Promise.resolve({ key: "mockKey", value: "mockValue" });
    }
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt, // e.g., "Extract key information as JSON from: ..."
            config: {
                responseMimeType: "application/json",
            },
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        
        const parsedData = JSON.parse(jsonStr) as ExampleDataType | ExampleDataType[];
        return parsedData;

    } catch (e) {
        console.error("Failed to parse JSON response from Gemini:", e);
        return null;
    }
}

// Add more Gemini API functions as needed for specific features.
// For instance, analyzing production data, suggesting optimizations, customer sentiment analysis from feedback, etc.
// Remember to handle API errors, rate limits, and provide fallbacks.
