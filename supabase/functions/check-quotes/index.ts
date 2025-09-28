import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Quote {
  text: string;
  verified: boolean;
  source: string;
  snippet?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { draft, transcript, sources } = await req.json();

    if (!draft) {
      return new Response(JSON.stringify({ error: 'Draft text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Checking quotes in draft...');

    // Extract quotes using regex
    const quoteRegex = /["'](.*?)["']/g;
    const quotes: string[] = [];
    let match;

    while ((match = quoteRegex.exec(draft)) !== null) {
      const quote = match[1].trim();
      if (quote.length > 10) { // Only consider substantial quotes
        quotes.push(quote);
      }
    }

    console.log('Found', quotes.length, 'quotes to verify');

    if (quotes.length === 0) {
      return new Response(JSON.stringify({ quotes: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare source materials
    let sourceMaterials = '';
    if (transcript) {
      sourceMaterials += `TRANSCRIPT:\n${transcript}\n\n`;
    }

    if (sources && sources.length > 0) {
      sources.forEach((source: any, index: number) => {
        sourceMaterials += `SUPPORTING SOURCE ${index + 1} (${source.type}): ${source.value || source.name}\n\n`;
      });
    }

    // Use AI to verify quotes if we have source materials
    const verifiedQuotes: Quote[] = [];

    for (const quote of quotes) {
      let verified = false;
      let source = '';
      let snippet = '';

      if (sourceMaterials) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: 'You are a fact-checker. Your job is to verify if a quote appears in the provided source materials. Return a JSON response with: {"found": boolean, "source": string, "snippet": string}. If found, provide the source name and a snippet of surrounding context (50-100 words). If not found, set found to false.'
                },
                {
                  role: 'user',
                  content: `Please verify if this quote appears in the source materials:

QUOTE TO VERIFY: "${quote}"

SOURCE MATERIALS:
${sourceMaterials}`
                }
              ],
              temperature: 0.1,
              max_tokens: 300,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const content = data.choices[0].message.content;
            
            try {
              // Remove markdown code blocks if present
              const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
              const result = JSON.parse(cleanContent);
              verified = result.found;
              source = result.source || 'Unknown';
              snippet = result.snippet || '';
            } catch (parseError) {
              console.error('Error parsing AI response:', parseError);
              // Fallback to simple text search
              verified = sourceMaterials.toLowerCase().includes(quote.toLowerCase());
              source = verified ? 'Source Material' : '';
            }
          }
        } catch (aiError) {
          console.error('AI verification failed, falling back to text search:', aiError);
          // Fallback to simple text search
          verified = sourceMaterials.toLowerCase().includes(quote.toLowerCase());
          source = verified ? 'Source Material' : '';
        }
      }

      verifiedQuotes.push({
        text: quote,
        verified,
        source: verified ? source : '',
        snippet: verified ? snippet : undefined
      });
    }

    console.log('Quote verification complete:', verifiedQuotes.length, 'quotes processed');

    return new Response(JSON.stringify({ quotes: verifiedQuotes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in check-quotes function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});