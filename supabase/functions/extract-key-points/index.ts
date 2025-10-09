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
    const { transcript, sources } = await req.json();

    if (!transcript) {
      return new Response(JSON.stringify({ error: 'Transcript is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Extracting key points from transcript:', transcript.substring(0, 100) + '...');

    // Prepare sources context if available
    let sourcesContext = '';
    if (sources && sources.length > 0) {
      sourcesContext = '\n\nSupporting Sources:\n' + sources.map((source: any, index: number) => 
        `${index + 1}. ${source.type === 'url' ? source.value : source.name || 'Document'}`
      ).join('\n');
    }

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
                text: `You are an expert at extracting key points from interview transcripts. Extract 5-10 clear, concise bullet points that capture the most important insights, quotes, and themes from the transcript. Each bullet point should be specific and actionable for article writing.

Please extract the key points from this interview transcript:

${transcript}${sourcesContext}

Return 5-10 bullet points that would be most valuable for writing an article. Focus on unique insights, important quotes, and main themes.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text());
      throw new Error('Failed to extract key points');
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    // Parse the response to extract bullet points
    const keyPoints = content
      .split('\n')
      .filter((line: string) => line.trim().match(/^[-•*]\s+/) || line.trim().match(/^\d+\.\s+/))
      .map((line: string) => line.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, '').trim())
      .filter((point: string) => point.length > 0);

    console.log('Extracted key points:', keyPoints);

    return new Response(JSON.stringify({ keyPoints }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in extract-key-points function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});