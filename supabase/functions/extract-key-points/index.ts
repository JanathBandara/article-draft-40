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

    console.log('Extracting key points from transcript (streaming mode):', transcript.substring(0, 100) + '...');

    // Prepare sources context if available
    let sourcesContext = '';
    if (sources && sources.length > 0) {
      sourcesContext = '\n\nSupporting Sources:\n' + sources.map((source: any, index: number) => 
        `${index + 1}. ${source.type === 'url' ? source.value : source.name || 'Document'}`
      ).join('\n');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: `Please extract the key points from this interview transcript:

${transcript}${sourcesContext}

Return 5-10 bullet points that would be most valuable for writing an article. Focus on unique insights, important quotes, and main themes.`
          }]
        }],
        systemInstruction: {
          parts: [{ 
            text: 'You are an expert at extracting key points from interview transcripts. Extract 5-10 clear, concise bullet points that capture the most important insights, quotes, and themes from the transcript. Each bullet point should be specific and actionable for article writing.'
          }]
        },
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 3000,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'Failed to extract key points' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          if (!reader) {
            controller.close();
            return;
          }

          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              if (buffer.trim()) {
                controller.enqueue(new TextEncoder().encode(`data: ${buffer}\n\n`));
              }
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
              controller.close();
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.trim() === '') continue;
              
              try {
                const jsonStr = line.replace(/^data: /, '').trim();
                if (jsonStr && jsonStr !== '[DONE]') {
                  const data = JSON.parse(jsonStr);
                  
                  if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    const text = data.candidates[0].content.parts[0].text;
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
                  }
                }
              } catch (parseError) {
                console.error('Error parsing chunk:', parseError);
              }
            }
          }
        } catch (error) {
          console.error('Error in stream:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in extract-key-points function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});