import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const tools = [
  {
    type: "function",
    function: {
      name: "create_revision_session",
      description: "Crée une session de révision dans le planning de l'étudiant",
      parameters: {
        type: "object",
        properties: {
          subject_id: { type: "string", description: "UUID de la matière" },
          date: { type: "string", description: "Date YYYY-MM-DD" },
          start_time: { type: "string", description: "Heure début HH:MM" },
          end_time: { type: "string", description: "Heure fin HH:MM" },
          notes: { type: "string", description: "Notes optionnelles" },
        },
        required: ["subject_id", "date", "start_time", "end_time"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_session_status",
      description: "Met à jour le statut d'une session (planned, completed, skipped)",
      parameters: {
        type: "object",
        properties: {
          session_id: { type: "string" },
          status: { type: "string", enum: ["planned", "completed", "skipped"] },
        },
        required: ["session_id", "status"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Crée une tâche pour l'étudiant",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          subject_id: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          due_date: { type: "string", description: "Date YYYY-MM-DD" },
        },
        required: ["title"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_quiz",
      description: "Génère un quiz interactif sur un sujet donné",
      parameters: {
        type: "object",
        properties: {
          subject: { type: "string", description: "Sujet du quiz" },
          num_questions: { type: "integer" },
          difficulty: { type: "string", enum: ["facile", "moyen", "difficile"] },
        },
        required: ["subject"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_revision_sheet",
      description: "Génère une fiche de révision structurée",
      parameters: {
        type: "object",
        properties: {
          subject: { type: "string" },
          topics: { type: "array", items: { type: "string" } },
        },
        required: ["subject"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_study_stats",
      description: "Récupère les statistiques de révision de l'étudiant",
      parameters: {
        type: "object",
        properties: {
          period: { type: "string", enum: ["today", "this_week", "this_month"] },
        },
        required: ["period"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "suggest_study_plan",
      description: "Propose un plan de révision optimisé pour la semaine",
      parameters: {
        type: "object",
        properties: {
          focus_subjects: {
            type: "array",
            items: { type: "string" },
            description: "UUIDs des matières à prioriser",
          },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_flashcard_deck",
      description: "Crée un deck de flashcards sur un sujet",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          subject_id: { type: "string" },
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
        required: ["name", "cards"],
        additionalProperties: false,
      },
    },
  },
];

async function executeTool(
  toolName: string,
  toolInput: Record<string, any>,
  supabaseAdmin: any,
  userId: string
): Promise<Record<string, any>> {
  try {
    switch (toolName) {
      case "create_revision_session": {
        const { data, error } = await supabaseAdmin
          .from("revision_sessions")
          .insert({
            user_id: userId,
            subject_id: toolInput.subject_id,
            date: toolInput.date,
            start_time: toolInput.start_time,
            end_time: toolInput.end_time,
            notes: toolInput.notes || null,
            status: "planned",
          })
          .select("*, subjects(name)")
          .single();
        if (error) return { success: false, error: error.message };
        return { success: true, session: data };
      }
      case "update_session_status": {
        const { error } = await supabaseAdmin
          .from("revision_sessions")
          .update({ status: toolInput.status })
          .eq("id", toolInput.session_id)
          .eq("user_id", userId);
        if (error) return { success: false, error: error.message };
        return { success: true, status: toolInput.status };
      }
      case "create_task": {
        const { data, error } = await supabaseAdmin
          .from("tasks")
          .insert({
            user_id: userId,
            title: toolInput.title,
            description: toolInput.description || null,
            subject_id: toolInput.subject_id || null,
            priority: toolInput.priority || "medium",
            due_date: toolInput.due_date || null,
            status: "todo",
          })
          .select()
          .single();
        if (error) return { success: false, error: error.message };
        return { success: true, task: data };
      }
      case "generate_quiz":
        return { success: true, message: "Quiz prêt à être généré dans la réponse" };
      case "generate_revision_sheet":
        return { success: true, message: "Fiche prête à être générée dans la réponse" };
      case "get_study_stats": {
        const now = new Date();
        let dateFilter: string;
        if (toolInput.period === "today") {
          dateFilter = now.toISOString().split("T")[0];
        } else if (toolInput.period === "this_week") {
          const d = new Date(now);
          d.setDate(d.getDate() - d.getDay() + 1);
          dateFilter = d.toISOString().split("T")[0];
        } else {
          const d = new Date(now.getFullYear(), now.getMonth(), 1);
          dateFilter = d.toISOString().split("T")[0];
        }
        const { data } = await supabaseAdmin
          .from("revision_sessions")
          .select("*, subjects(name)")
          .eq("user_id", userId)
          .gte("date", dateFilter);
        const sessions = data || [];
        const completed = sessions.filter((s: any) => s.status === "completed");
        const totalMins = completed.reduce((acc: number, s: any) => {
          if (!s.start_time || !s.end_time) return acc;
          const [sh, sm] = s.start_time.split(":").map(Number);
          const [eh, em] = s.end_time.split(":").map(Number);
          return acc + (eh * 60 + em) - (sh * 60 + sm);
        }, 0);
        return {
          success: true,
          stats: {
            total_sessions: sessions.length,
            completed_sessions: completed.length,
            total_hours: Math.round((totalMins / 60) * 10) / 10,
            period: toolInput.period,
          },
        };
      }
      case "suggest_study_plan":
        return { success: true, message: "Plan de révision prêt à être proposé" };
      case "create_flashcard_deck": {
        const { data: deck, error: deckError } = await supabaseAdmin
          .from("flashcard_decks")
          .insert({
            user_id: userId,
            name: toolInput.name,
            subject_id: toolInput.subject_id || null,
          })
          .select()
          .single();
        if (deckError) return { success: false, error: deckError.message };
        const cards = toolInput.cards.map((c: any) => ({
          deck_id: deck.id,
          front: c.front,
          back: c.back,
          user_id: userId,
        }));
        const { error: cardsError } = await supabaseAdmin
          .from("flashcards")
          .insert(cards);
        if (cardsError) return { success: false, error: cardsError.message };
        return { success: true, deck_id: deck.id, cards_count: cards.length };
      }
      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

function buildSystemPrompt(userContext: any): string {
  const p = userContext.profile || {};
  const subjects = (userContext.subjects || [])
    .map((s: any) => `- ${s.name} (coef: ${s.coefficient || "?"})`)
    .join("\n");
  const todaySessions = (userContext.sessions || [])
    .filter((s: any) => s.date === new Date().toISOString().split("T")[0])
    .map(
      (s: any) =>
        `- ${s.subjects?.name || "?"}: ${s.start_time?.slice(0, 5)}-${s.end_time?.slice(0, 5)} [${s.status}]`
    )
    .join("\n");
  const tasks = (userContext.tasks || [])
    .map((t: any) => `- ${t.title} [${t.priority}] ${t.status}`)
    .join("\n");

  return `Tu es Skoo, le coach de révision IA de l'étudiant. Tu es bienveillant, motivant et concret.

CONTEXTE ÉTUDIANT :
- Prénom : ${p.first_name || "Étudiant"}
- Niveau : ${p.study_level || "?"}
- Domaine : ${p.study_domain || "?"}
- Période d'examens : ${p.exam_period || "?"}
- Objectif hebdo : ${p.weekly_revision_hours || 10}h

Matières :
${subjects || "Aucune matière configurée"}

Sessions aujourd'hui :
${todaySessions || "Aucune session aujourd'hui"}

Tâches en cours :
${tasks || "Aucune tâche en cours"}

Date du jour : ${new Date().toISOString().split("T")[0]}

RÈGLES :
1. Parle TOUJOURS en français, tutoie l'étudiant
2. Sois concis (max 3-4 phrases par message sauf si explication demandée)
3. Quand l'étudiant demande une action, utilise les outils disponibles
4. Propose proactivement des actions quand c'est pertinent
5. Utilise des émojis avec modération (1-2 par message max)
6. Si l'étudiant semble stressé, priorise le réconfort avant les actions
7. Ne mens jamais sur les données`;
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { messages, user_context } = await req.json();
    const systemPrompt = buildSystemPrompt(user_context);

    // Convert messages to OpenAI format
    let openaiMessages: any[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ];
    const allToolCalls: any[] = [];

    for (let i = 0; i < 5; i++) {
      const response = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: openaiMessages,
          tools,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Trop de requêtes, réessaie dans quelques instants." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Crédits IA insuffisants." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const errText = await response.text();
        console.error("Lovable AI error:", response.status, errText);
        return new Response(
          JSON.stringify({ error: "AI service error", details: errText }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await response.json();
      const choice = result.choices?.[0];
      const message = choice?.message;

      if (!message) {
        return new Response(
          JSON.stringify({ response: "Désolé, je n'ai pas pu répondre. Réessaie !", tool_calls: allToolCalls }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if the model wants to call tools
      if (choice.finish_reason === "tool_calls" && message.tool_calls?.length > 0) {
        const toolResultMessages: any[] = [];
        for (const tc of message.tool_calls) {
          const toolInput = typeof tc.function.arguments === "string"
            ? JSON.parse(tc.function.arguments)
            : tc.function.arguments;
          const toolResult = await executeTool(tc.function.name, toolInput, supabaseAdmin, userId);
          allToolCalls.push({ name: tc.function.name, input: toolInput, result: toolResult });
          toolResultMessages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(toolResult),
          });
        }

        // Add assistant message with tool calls + tool results, then loop
        openaiMessages = [
          ...openaiMessages,
          message,
          ...toolResultMessages,
        ];
        continue;
      }

      // No tool calls — return the text response
      const responseText = message.content || "";
      return new Response(
        JSON.stringify({ response: responseText, tool_calls: allToolCalls }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ response: "Désolé, j'ai eu un problème. Réessaie !", tool_calls: allToolCalls }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
