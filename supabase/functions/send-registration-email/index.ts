import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { participantName, participantEmail, eventTitle, eventDate, eventVenue } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Use AI to generate a nice email body
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "You are an email writer. Generate ONLY the HTML body content (no <html>, <head>, or <body> tags) for a professional, friendly event registration confirmation email. Use inline CSS styles. Keep it concise and visually appealing with a clean layout. Use a primary color of #6366f1 (indigo) for accents."
          },
          {
            role: "user",
            content: `Write a registration confirmation email for:
- Participant: ${participantName}
- Email: ${participantEmail}
- Event: ${eventTitle}
- Date: ${eventDate}
- Venue: ${eventVenue || "TBA"}

Include a warm greeting, event details summary, and a note to arrive on time.`
          }
        ],
        max_tokens: 1000,
      }),
    });

    let emailHtml: string;

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      emailHtml = aiData.choices?.[0]?.message?.content || "";
      // Strip markdown code fences if present
      emailHtml = emailHtml.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();
    } else {
      // Fallback email
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Registration Confirmed! 🎉</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #374151; font-size: 16px;">Hi <strong>${participantName}</strong>,</p>
            <p style="color: #6b7280;">You've been successfully registered for:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 16px 0;">
              <h2 style="color: #111827; margin: 0 0 12px 0;">${eventTitle}</h2>
              <p style="color: #6b7280; margin: 4px 0;">📅 ${eventDate}</p>
              <p style="color: #6b7280; margin: 4px 0;">📍 ${eventVenue || "TBA"}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Please arrive on time. We look forward to seeing you there!</p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">— EventHub Team</p>
          </div>
        </div>
      `;
    }

    // Log the email (in production, integrate with an email service)
    console.log(`Registration email generated for ${participantEmail}`);
    console.log(`Email HTML length: ${emailHtml.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Registration email generated",
        emailHtml,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
