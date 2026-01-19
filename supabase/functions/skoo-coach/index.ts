import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudentContext {
  firstName?: string;
  totalHoursThisWeek?: number;
  completedHoursThisWeek?: number;
  nextExamSubject?: string;
  nextExamDays?: number;
  todaySessionsCount?: number;
  streakDays?: number;
  lastActivity?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, messageType = 'motivation' } = await req.json() as { 
      context: StudentContext; 
      messageType: 'motivation' | 'greeting' | 'reminder' | 'celebration' | 'tip';
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Tu es Skoo, un coach d'études bienveillant et motivant pour les étudiants français. Tu parles de manière décontractée mais professionnelle, comme un grand frère/grande sœur qui aide avec les révisions.

Règles:
- Réponds UNIQUEMENT en français
- Messages courts (1-2 phrases max, 15-30 mots)
- Ton chaleureux, encourageant, jamais condescendant
- Utilise le prénom de l'étudiant si disponible
- Évite les emojis dans le texte (c'est pour de la synthèse vocale)
- Sois spécifique aux données fournies quand disponibles
- Ne commence jamais par "Salut" ou "Bonjour" pour les messages de motivation (seulement pour greeting)`;

    let userPrompt = '';

    switch (messageType) {
      case 'greeting':
        userPrompt = `Génère un message d'accueil pour un étudiant${context.firstName ? ` nommé ${context.firstName}` : ''} qui vient d'ouvrir l'application. Sois chaleureux et motivant.`;
        break;
      
      case 'motivation':
        userPrompt = `Génère un message de motivation pour un étudiant${context.firstName ? ` nommé ${context.firstName}` : ''}.
${context.totalHoursThisWeek ? `Cette semaine: ${context.completedHoursThisWeek || 0}h faites sur ${context.totalHoursThisWeek}h planifiées.` : ''}
${context.nextExamSubject && context.nextExamDays ? `Prochain examen: ${context.nextExamSubject} dans ${context.nextExamDays} jours.` : ''}
${context.todaySessionsCount ? `Aujourd'hui: ${context.todaySessionsCount} sessions prévues.` : ''}`;
        break;
      
      case 'reminder':
        userPrompt = `Génère un rappel doux pour un étudiant${context.firstName ? ` nommé ${context.firstName}` : ''} qui doit commencer ses révisions. Ne sois pas moralisateur, juste encourageant.
${context.todaySessionsCount ? `Il a ${context.todaySessionsCount} sessions prévues aujourd'hui.` : ''}`;
        break;
      
      case 'celebration':
        userPrompt = `Génère un message de félicitations pour un étudiant${context.firstName ? ` nommé ${context.firstName}` : ''} qui a accompli quelque chose.
${context.completedHoursThisWeek ? `Il a fait ${context.completedHoursThisWeek}h de révision cette semaine!` : 'Il a terminé une session de révision!'}`;
        break;
      
      case 'tip':
        userPrompt = `Génère un conseil d'étude court et actionnable pour un étudiant${context.firstName ? ` nommé ${context.firstName}` : ''}. Sois pratique et motivant.`;
        break;
    }

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
          { role: "user", content: userPrompt }
        ],
        max_tokens: 100,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      // Fallback messages
      const fallbacks: Record<string, string[]> = {
        greeting: [
          "Content de te revoir ! Prêt à avancer dans tes révisions ?",
          "Hey ! C'est le moment de briller !",
        ],
        motivation: [
          "Chaque session compte. Tu fais du super boulot !",
          "Continue comme ça, tu es sur la bonne voie !",
        ],
        reminder: [
          "Une petite session de révision ? Tu vas voir, ça passe vite !",
          "C'est le moment idéal pour commencer !",
        ],
        celebration: [
          "Bravo ! Continue sur cette lancée !",
          "Excellent travail ! Tu peux être fier de toi !",
        ],
        tip: [
          "Essaie la technique Pomodoro : 25 minutes de focus, 5 de pause.",
          "Révise le matin quand ton cerveau est frais !",
        ],
      };
      
      const messages = fallbacks[messageType] || fallbacks.motivation;
      const message = messages[Math.floor(Math.random() * messages.length)];
      
      return new Response(
        JSON.stringify({ message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content?.trim() || "Continue comme ça !";

    return new Response(
      JSON.stringify({ message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Coach error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Continue comme ça, tu fais du super boulot !"
      }),
      {
        status: 200, // Return 200 with fallback message
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
