import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyPoints, tone, customPrompt } = await req.json();

    if (!keyPoints || !Array.isArray(keyPoints)) {
      return new Response(JSON.stringify({ error: 'Key points are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating draft with tone:', tone, 'and', keyPoints.length, 'key points');

    // Define tone characteristics
    const toneInstructions = {
      professional: 'Write in a professional, authoritative tone suitable for business publications. Use clear, direct language and maintain objectivity.',
      conversational: 'Write in a friendly, conversational tone as if speaking directly to the reader. Use accessible language and personal pronouns.',
      analytical: 'Write in an analytical, data-driven tone. Focus on insights, implications, and logical conclusions. Use precise language.',
      storytelling: 'Write in an engaging, narrative style that tells a story. Use vivid descriptions and create emotional connections with readers.'
    };

    const selectedToneInstruction = toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.professional;

    let systemPrompt = `You are an expert article writer. ${selectedToneInstruction}

Structure your article with:
1. A compelling headline
2. An engaging introduction
3. 3-4 main sections with subheadings
4. A strong conclusion

Make sure to incorporate direct quotes where appropriate and reference supporting sources when relevant.`;

    if (customPrompt) {
      systemPrompt += `\n\nAdditional instructions: ${customPrompt}`;
    }

    const keyPointsList = keyPoints.map((point: string, index: number) => `${index + 1}. ${point}`).join('\n');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}

Please write a comprehensive article based on these key points:

${keyPointsList}

The article should be approximately 800-1200 words and include relevant quotes and insights from the key points. Make it engaging and informative for readers.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', response.status, data);
      throw new Error('Failed to generate draft');
    }

    console.log('Gemini API response:', JSON.stringify(data));

    if (!data.candidates || !data.candidates[0]) {
      console.error('Unexpected Gemini API response structure:', data);
      throw new Error('Invalid response from Gemini API');
    }

    const candidate = data.candidates[0];
    
    // Check for MAX_TOKENS finish reason
    if (candidate.finishReason === 'MAX_TOKENS') {
      console.error('Response was cut off due to token limit:', data);
      throw new Error('Draft too long - try with fewer key points');
    }

    if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
      console.error('Missing content parts in response:', data);
      throw new Error('Invalid response structure from Gemini API');
    }

    const draft = candidate.content.parts[0].text;

    console.log('Generated draft length:', draft.length);

    return new Response(JSON.stringify({ draft }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-draft function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});