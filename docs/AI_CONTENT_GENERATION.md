# AI Content Generation Documentation (Google Gemini Integration)

This document describes the implementation, architecture, security, and usage of the **Auto Generate Content** feature in the Nectar Admin Dashboard.

---

## 1. Overview

The **Auto Generate Content** feature allows administrators to quickly generate e-commerce product details (Description, Nutrition Info, and SKU suggestions) directly within the Product Create/Edit form using **Google Gemini AI**.

- **SDK**: `@google/genai` (Official Google SDK)
- **Model**: `gemini-2.5-flash-lite` (with automatic fallback to `gemini-2.5-flash`)
- **API Key Scope**: Server-Side only (`GEMINI_API_KEY` in `.env.local`). Never exposed to browser/client.

---

## 2. Architecture & Data Flow

```
Admin Product Form (ProductModal.tsx)
  │
  ├── 1. Admin enters Product Name (& optional Category/Brand)
  ├── 2. Clicks "Auto Generate Content" button (✨)
  │
  ▼
Next.js Server API Route (/api/ai/generate-product)
  │
  ├── 3. Validates request body & checks GEMINI_API_KEY
  ├── 4. Constructs prompt & invokes Gemini API with JSON Schema output
  ├── 5. Parses & validates output using Zod schema
  │
  ▼
Structured JSON Response ({ description, nutrition, suggestedSku })
  │
  ▼
React Hook Form (ProductModal.tsx)
  │
  ├── 6. Auto-fills Description, Nutrition Info, and SKU fields
  ├── 7. Admin reviews, edits, and verifies the generated data
  │
  ▼
Existing Create Product Mutation (RTK Query -> Backend API -> Database)
```

> **IMPORTANT**: AI content generation **never** saves data directly to MongoDB. The existing Product Create API remains 100% responsible for validation and database persistence.

---

## 3. Environment Variable Setup

Add your Gemini API key to `.env.local`:

```env
# Server-side only key - NEVER add NEXT_PUBLIC_ prefix
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

See `.env.example` for reference.

---

## 4. API Route Details

- **Endpoint**: `POST /api/ai/generate-product`
- **Request Body**:
  ```json
  {
    "name": "Organic Heirloom Kale",
    "categoryName": "Vegetables",
    "brandName": "Nectar Fresh",
    "measurementUnit": "kg"
  }
  ```
- **Response Format**:
  ```json
  {
    "success": true,
    "data": {
      "description": "Fresh, crisp organic heirloom kale harvested daily. Packed with essential vitamins A, C, and K.",
      "nutrition": "Calories: 35 kcal, Vitamin A: 133%, Vitamin C: 134%, Fiber: 2.5g",
      "suggestedSku": "NF-VEG-KALE-001"
    }
  }
  ```

---

## 5. Security & Validation

1. **Server-Side Key Isolation**: The API key is accessed strictly inside Node.js server routes via `process.env.GEMINI_API_KEY`.
2. **Structured JSON Output**: Gemini is instructed via `responseMimeType: "application/json"` and `responseSchema` to output valid JSON with no markdown formatting.
3. **Zod Schema Validation**: Server-side output is validated using `zod` before returning to the client.
4. **Graceful Fallbacks**: If Gemini fails or key is missing, friendly error toasts notify the admin without breaking the existing product creation flow.

---

## 6. How to Use

1. Open **Products** page in Admin Dashboard.
2. Click **Create New Product**.
3. Enter the **Product Name** (e.g. `Organic Honey Crisp Apples`).
4. Click the **"Auto Generate Content"** button (✨) in the Description section header.
5. Review the auto-generated **Description**, **Nutrition Info**, and **SKU**.
6. Make any edits if desired, then click **Create Product** to save via the normal backend API.
