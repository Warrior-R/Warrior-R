import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ProductAnalysis {
  category: string;
  subcategory: string;
  tags: string[];
  enhancedDescription: string;
  suggestedPrice?: number;
  condition?: string;
}

export interface SearchAnalysis {
  intent: string;
  categories: string[];
  keywords: string[];
  priceRange?: { min?: number; max?: number };
  condition?: string;
}

export async function analyzeProduct(
  title: string,
  description: string,
  imageBase64?: string
): Promise<ProductAnalysis> {
  const content: Anthropic.ContentBlockParam[] = [];

  if (imageBase64) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
        data: imageBase64,
      },
    });
  }

  content.push({
    type: "text",
    text: `Eres un experto en e-commerce para el mercado dominicano. Analiza este producto y proporciona:
1. Categoría principal (en español)
2. Subcategoría (en español)
3. Tags relevantes (máximo 8, en español)
4. Descripción mejorada y detallada del producto (en español, para marketplace RD)

Título: ${title}
Descripción: ${description}

Responde SOLO en formato JSON válido con esta estructura exacta:
{
  "category": "string",
  "subcategory": "string",
  "tags": ["tag1", "tag2"],
  "enhancedDescription": "string"
}`,
  });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      category: "General",
      subcategory: "Otros",
      tags: [],
      enhancedDescription: description,
    };
  }

  try {
    return JSON.parse(jsonMatch[0]) as ProductAnalysis;
  } catch {
    return {
      category: "General",
      subcategory: "Otros",
      tags: [],
      enhancedDescription: description,
    };
  }
}

export async function analyzeSearchQuery(query: string): Promise<SearchAnalysis> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Eres un asistente de búsqueda para un marketplace dominicano. Analiza esta búsqueda del usuario y extrae la intención y parámetros.

Búsqueda: "${query}"

Responde SOLO en formato JSON válido:
{
  "intent": "descripción corta de lo que busca",
  "categories": ["categoria1", "categoria2"],
  "keywords": ["keyword1", "keyword2"],
  "priceRange": {"min": null, "max": null},
  "condition": null
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return {
      intent: query,
      categories: [],
      keywords: query.split(" "),
    };
  }

  try {
    return JSON.parse(jsonMatch[0]) as SearchAnalysis;
  } catch {
    return {
      intent: query,
      categories: [],
      keywords: query.split(" "),
    };
  }
}

export async function verifyDocumentWithAI(
  documentImageBase64: string,
  side: "front" | "back"
): Promise<{ isValid: boolean; cedula?: string; name?: string; message: string }> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: documentImageBase64,
              },
            },
            {
              type: "text",
              text: `Analiza esta imagen del ${side === "front" ? "frente" : "reverso"} de una cédula de identidad dominicana.

${side === "front" ? `Extrae:
1. ¿Es una cédula dominicana válida? (true/false)
2. Número de cédula (formato: XXX-XXXXXXX-X)
3. Nombre completo del titular` : `Verifica:
1. ¿Es el reverso de una cédula dominicana válida? (true/false)
2. Cualquier información relevante visible`}

Responde SOLO en JSON:
{
  "isValid": boolean,
  "cedula": "string o null",
  "name": "string o null",
  "message": "descripción breve"
}`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) return { isValid: false, message: "No se pudo analizar el documento" };

    return JSON.parse(jsonMatch[0]);
  } catch {
    return { isValid: false, message: "Error al procesar el documento" };
  }
}

export async function generateProductSuggestions(category: string, query: string): Promise<string[]> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `Genera 5 sugerencias de búsqueda relacionadas para un marketplace dominicano.
Categoría: ${category}
Búsqueda inicial: ${query}

Responde SOLO con un array JSON de strings: ["sugerencia1", "sugerencia2", ...]`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);

  if (!jsonMatch) return [];
  try {
    return JSON.parse(jsonMatch[0]) as string[];
  } catch {
    return [];
  }
}
