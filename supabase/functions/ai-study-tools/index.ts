import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  quiz: `Tu es un professeur expert qui crée des quiz de révision pour des étudiants français.
Quand on te donne un sujet et optionnellement un contenu, génère un quiz de 5 à 10 questions.
Chaque question doit avoir 4 propositions (A, B, C, D) et une seule bonne réponse.
Réponds UNIQUEMENT avec le JSON structuré via l'outil fourni, sans texte supplémentaire.`,

  fiche: `Tu es un professeur expert qui crée des fiches de révision synthétiques pour des étudiants français.
Quand on te donne un sujet et optionnellement un contenu, génère une fiche de révision claire et structurée.
La fiche doit contenir: un titre, les points clés (5-10 bullet points), les définitions importantes, et un résumé.
Réponds UNIQUEMENT avec le JSON structuré via l'outil fourni, sans texte supplémentaire.`,

  flashcards: `Tu es un professeur expert qui crée des flashcards de révision pour des étudiants français.
Quand on te donne un sujet et optionnellement un contenu, génère 8 à 15 flashcards.
Chaque flashcard a un recto (question/terme) et un verso (réponse/définition).
Réponds UNIQUEMENT avec le JSON structuré via l'outil fourni, sans texte supplémentaire.`,
};

const TOOLS: Record<string, any[]> = {
  quiz: [
    {
      type: "function",
      function: {
        name: "generate_quiz",
        description: "Génère un quiz structuré",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Titre du quiz" },
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: {
                    type: "object",
                    properties: {
                      A: { type: "string" },
                      B: { type: "string" },
                      C: { type: "string" },
                      D: { type: "string" },
                    },
                    required: ["A", "B", "C", "D"],
                    additionalProperties: false,
                  },
                  correct_answer: { type: "string", enum: ["A", "B", "C", "D"] },
                  explanation: { type: "string" },
                },
                required: ["question", "options", "correct_answer", "explanation"],
                additionalProperties: false,
              },
            },
          },
          required: ["title", "questions"],
          additionalProperties: false,
        },
      },
    },
  ],
  fiche: [
    {
      type: "function",
      function: {
        name: "generate_fiche",
        description: "Génère une fiche de révision structurée",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" },
            key_points: { type: "array", items: { type: "string" } },
            definitions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  term: { type: "string" },
                  definition: { type: "string" },
                },
                required: ["term", "definition"],
                additionalProperties: false,
              },
            },
            summary: { type: "string" },
          },
          required: ["title", "key_points", "definitions", "summary"],
          additionalProperties: false,
        },
      },
    },
  ],
  flashcards: [
    {
      type: "function",
      function: {
        name: "generate_flashcards",
        description: "Génère des flashcards de révision",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" },
            cards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  front: { type: "string" },
                  back: { type: "string" },
                },
                required: ["front", "back"],
                additionalProperties: false,
              },
            },
          },
          required: ["title", "cards"],
          additionalProperties: false,
        },
      },
    },
  ],
};

const TOOL_CHOICES: Record<string, any> = {
  quiz: { type: "function", function: { name: "generate_quiz" } },
  fiche: { type: "function", function: { name: "generate_fiche" } },
  flashcards: { type: "function", function: { name: "generate_flashcards" } },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, subject, content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = SYSTEM_PROMPTS[type];
    if (!systemPrompt) throw new Error(`Unknown type: ${type}`);

    let userMessage = `Sujet : ${subject}`;
    if (content) userMessage += `\n\nContenu fourni :\n${content}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        tools: TOOLS[type],
        tool_choice: TOOL_CHOICES[type],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessaie dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA insuffisants." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    let result;
    if (toolCall) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try parsing content directly
      const content = data.choices?.[0]?.message?.content;
      result = content ? JSON.parse(content) : null;
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-study-tools error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
