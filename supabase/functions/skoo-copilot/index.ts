import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const tools = [
  {
    name: "create_revision_session",
    description: "Crée une session de révision dans le planning de l'étudiant",
    input_schema: {
      type: "object",
      properties: {
        subject_id: { type: "string", description: "UUID de la matière" },
        date: { type: "string", description: "Date YYYY-MM-DD" },
        start_time: { type: "string", description: "Heure début HH:MM" },
        end_time: { type: "string", description: "Heure fin HH:MM" },
        notes: { type: "string", description: "Notes optionnelles" },
      },
      required: ["subject_id", "date", "start_time", "end_time"],
    },
  },
  {
    name: "update_session_status",
    description: "Met à jour le statut d'une session (planned, completed, skipped)",
    input_schema: {
      type: "object",
      properties: {
        session_id: { type: "string" },
        status: { type: "string", enum: ["planned", "completed", "skipped"] },
      },
      required: ["session_id", "status"],
    },
  },
  {
    name: "create_task",
    description: "Crée une tâche pour l'étudiant",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        subject_id: { type: "string" },
        priority: { type: "string", enum: ["low", "medium", "high"] },
        due_date: { type: "string", description: "Date YYYY-MM-DD" },
      },
      required: ["title"],
    },
  },
  {
    name: "generate_quiz",
    description: "Génère un quiz interactif sur un sujet donné",
    input_schema: {
      type: "object",
      properties: {
        subject: { type: "string", description: "Sujet du quiz" },
        num_questions: { type: "integer" },
        difficulty: { type: "string", enum: ["facile", "moyen", "difficile"] },
      },
      required: ["subject"],
    },
  },
  {
    name: "generate_revision_sheet",
    description: "Génère une fiche de révision structurée",
    input_schema: {
      type: "object",
      properties: {
        subject: { type: "string" },
        topics: { type: "array", items: { type: "string" } },
      },
      required: ["subject"],
    },
  },
  {
    name: "get_study_stats",
    description: "Récupère les statistiques de révision de l'étudiant",
    input_schema: {
      type: "object",
      properties: {
        period: { type: "string", enum: ["today", "this_week", "this_month"] },
      },
      required: ["period"],
    },
  },
  {
    name: "suggest_study_plan",
    description: "Propose un plan de révision optimisé pour la semaine",
    input_schema: {
      type: "object",
      properties: {
        focus_subjects: {
          type: "array",
          items: { type: "string" },
          description: "UUIDs des matières à prioriser",
        },
      },
    },
  },
  {
    name: "create_flashcard_deck",
    description: "Crée un deck de flashcards sur un sujet",
    input_schema: {
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
          },
        },
      },
      required: ["name", "cards"],
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
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
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

    let claudeMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));
    const allToolCalls: any[] = [];

    for (let i = 0; i < 5; i++) {
      const response = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: systemPrompt,
          tools,
          messages: claudeMessages,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Anthropic error:", response.status, errText);
        return new Response(
          JSON.stringify({ error: "AI service error", details: errText }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await response.json();
      const textBlocks = result.content.filter((b: any) => b.type === "text");
      const toolUseBlocks = result.content.filter((b: any) => b.type === "tool_use");

      if (result.stop_reason === "tool_use" && toolUseBlocks.length > 0) {
        const toolResults = [];
        for (const tb of toolUseBlocks) {
          const toolResult = await executeTool(tb.name, tb.input, supabaseAdmin, userId);
          allToolCalls.push({ name: tb.name, input: tb.input, result: toolResult });
          toolResults.push({
            type: "tool_result",
            tool_use_id: tb.id,
            content: JSON.stringify(toolResult),
          });
        }

        claudeMessages = [
          ...claudeMessages,
          { role: "assistant", content: result.content },
          { role: "user", content: toolResults },
        ];
        continue;
      }

      const responseText = textBlocks.map((b: any) => b.text).join("");
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
