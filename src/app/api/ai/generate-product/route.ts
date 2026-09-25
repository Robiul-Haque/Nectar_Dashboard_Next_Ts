import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

// Zod schema for validating input payload from client
const requestInputSchema = z.object({
    name: z.string().min(1, "Product name is required").max(150),
    categoryName: z.string().optional(),
    brandName: z.string().optional(),
    measurementUnit: z.string().optional(),
});

// Zod schema for strictly validating AI generated response
const aiOutputSchema = z.object({
    description: z.string().max(2000),
    nutrition: z.string().max(1000),
    suggestedSku: z.string().max(50),
});

export async function POST(req: Request) {
    try {
        let apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            try {
                const fs = await import("fs");
                const path = await import("path");
                const envPath = path.resolve(process.cwd(), ".env.local");
                if (fs.existsSync(envPath)) {
                    const content = fs.readFileSync(envPath, "utf-8");
                    const match = content.match(/GEMINI_API_KEY\s*=\s*([^\r\n]+)/);
                    if (match && match[1]) {
                        apiKey = match[1].trim().replace(/^['"]|['"]$/g, "");
                    }
                }
            } catch {}
        }

        if (!apiKey) {
            return NextResponse.json(
                {
                    success: false,
                    message: "GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in .env.local",
                },
                { status: 500 }
            );
        }

        const body = await req.json();
        const parseResult = requestInputSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: parseResult.error.issues[0]?.message || "Invalid input data",
                },
                { status: 400 }
            );
        }

        const { name, categoryName, brandName, measurementUnit } = parseResult.data;

        // Construct prompt for Gemini
        const prompt = `You are a professional e-commerce product content generator for an online grocery store called Nectar.
Generate structured, appealing, concise, and accurate content for the following product:
- Product Name: ${name}
${categoryName ? `- Category: ${categoryName}` : ""}
${brandName ? `- Brand: ${brandName}` : ""}
${measurementUnit ? `- Sold per: ${measurementUnit}` : ""}

Content Generation Rules:
1. Description: Write an attractive, natural 2-3 sentence product description highlighting freshness, quality, or usage. Do NOT use markdown. Max 500 characters.
2. Nutrition: Provide concise nutrition summary (e.g., "Calories: 120 kcal, Vitamin C: 25%, Fiber: 3g"). If not food item, write "N/A". Max 200 characters.
3. Suggested SKU: Create a clean uppercase alphanumeric SKU code based on the product name and brand/category (e.g. "LFG-KALE-001"). Max 30 characters.
4. Do NOT invent prices, stock, database IDs, or unsupported medical claims.`;

        const ai = new GoogleGenAI({ apiKey });

        // Use modern Gemini 3.5 / 3.8 flash models
        const modelName = "gemini-3.5-flash-lite";

        let response;
        try {
            response = await ai.models.generateContent({
                model: modelName,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            description: {
                                type: Type.STRING,
                                description: "Product description without markdown",
                            },
                            nutrition: {
                                type: Type.STRING,
                                description: "Concise nutrition facts string",
                            },
                            suggestedSku: {
                                type: Type.STRING,
                                description: "Uppercase product SKU code",
                            },
                        },
                        required: ["description", "nutrition", "suggestedSku"],
                    },
                },
            });
        } catch (sdkError: any) {
            // Fallback to gemini-3.8-flash if flash-lite is unavailable
            console.warn("Falling back to gemini-3.8-flash model due to:", sdkError?.message);
            response = await ai.models.generateContent({
                model: "gemini-3.8-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            description: { type: Type.STRING },
                            nutrition: { type: Type.STRING },
                            suggestedSku: { type: Type.STRING },
                        },
                        required: ["description", "nutrition", "suggestedSku"],
                    },
                },
            });
        }

        const responseText = response.text;
        if (!responseText) {
            return NextResponse.json(
                { success: false, message: "Empty response received from Gemini API" },
                { status: 500 }
            );
        }

        // Parse JSON output from Gemini
        let parsedJson;
        try {
            parsedJson = JSON.parse(responseText);
        } catch (e) {
            return NextResponse.json(
                { success: false, message: "Failed to parse structured JSON from AI output" },
                { status: 500 }
            );
        }

        // Validate structure with Zod
        const validatedOutput = aiOutputSchema.safeParse(parsedJson);
        if (!validatedOutput.success) {
            return NextResponse.json(
                { success: false, message: "AI response did not match required product data schema" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                description: validatedOutput.data.description.trim(),
                nutrition: validatedOutput.data.nutrition.trim(),
                suggestedSku: validatedOutput.data.suggestedSku.trim().toUpperCase(),
            },
        });
    } catch (error: any) {
        console.error("AI Content Generation Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error?.message || "An unexpected error occurred while generating content",
            },
            { status: 500 }
        );
    }
}
