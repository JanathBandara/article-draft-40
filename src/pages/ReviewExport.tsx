import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WorkflowLayout } from "@/components/WorkflowLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Code, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Source = {
  id: string;
  type: 'url' | 'file';
  value: string;
  name?: string;
};

type Quote = {
  text: string;
  verified: boolean;
  source: string;
  snippet?: string;
};

export const ReviewExport = () => {
  const [draft, setDraft] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Load draft and metadata from localStorage
    const storedDraft = localStorage.getItem('generatedDraft');
    const storedTone = localStorage.getItem('selectedTone');
    const storedSources = localStorage.getItem('sources');
    const transcript = localStorage.getItem('transcript');

    if (storedDraft) {
      setDraft(storedDraft);
      
      // Use AI-powered quote verification
      verifyQuotes(storedDraft, transcript, storedSources);
    }

    // Load sources for attribution
    if (storedSources) {
      try {
        setSources(JSON.parse(storedSources));
      } catch (error) {
        console.error('Error parsing sources:', error);
      }
    }
  }, []);

  const verifyQuotes = async (draftText: string, transcript: string | null, sourcesStr: string | null) => {
    try {
      let sourcesData = [];
      if (sourcesStr) {
        sourcesData = JSON.parse(sourcesStr);
      }

      // Call Supabase Edge Function for AI-powered quote checking
      const { data, error } = await supabase.functions.invoke('check-quotes', {
        body: {
          draft: draftText,
          transcript: transcript || '',
          sources: sourcesData
        }
      });

      if (error) throw error;

      setQuotes(data.quotes || []);
    } catch (error) {
      console.error('Error verifying quotes:', error);
      // Fallback to simple regex extraction (handles both straight and curly quotes)
      const quoteRegex = /["'""''](.*?)["'""'']/g;
      const extractedQuotes: Quote[] = [];
      let match;

      while ((match = quoteRegex.exec(draftText)) !== null) {
        const quoteText = match[1];
        if (quoteText.length > 10) {
          extractedQuotes.push({
            text: quoteText,
            verified: false,
            source: "Unable to verify"
          });
        }
      }

      setQuotes(extractedQuotes);
    }
  };

  // Add source attribution to paragraphs
  const addSourceAttribution = (text: string) => {
    const paragraphs = text.split('\n\n');
    return paragraphs.map((paragraph, index) => {
      if (!paragraph.trim()) return paragraph;
      
      // Simulate source attribution logic
      let attribution = "Source: Transcript";
      
      if (paragraph.includes("innovation") || paragraph.includes("technology")) {
        attribution = sources.length > 0 ? "Source: Transcript + Supporting Source 1" : "Source: Transcript";
      } else if (paragraph.includes("data") || paragraph.includes("research")) {
        attribution = sources.length > 1 ? "Source: Supporting Source 2" : "Source: Transcript";
      }
      
      return (
        <div key={index} className="mb-6">
          <p className="text-sm leading-relaxed mb-1">{paragraph}</p>
          <div className="text-xs text-muted-foreground italic">{attribution}</div>
        </div>
      );
    }).filter(p => p);
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([draft], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "article-draft.md";
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Draft exported",
      description: "Your article draft has been downloaded as Markdown.",
    });
  };

  const handleExportProvenance = () => {
    const keyPoints = JSON.parse(localStorage.getItem("keyPoints") || "[]");
    const transcript = localStorage.getItem("transcript") || "";
    const selectedTone = localStorage.getItem("selectedTone") || "";

    const provenance = {
      metadata: {
        generatedAt: new Date().toISOString(),
        tone: selectedTone,
        wordCount: draft.split(/\s+/).length,
      },
      sources: {
        transcript: {
          content: transcript,
          type: "interview_transcript",
        },
        supportingSources: sources.map((source, index) => ({
          id: source.id,
          name: source.name,
          type: source.type,
          value: source.value,
          index: index + 1,
        })),
      },
      keyPoints,
      quotes: quotes.map(q => ({
        text: q.text,
        verified: q.verified,
        source: q.source,
        snippet: q.snippet,
      })),
      draft: {
        content: draft,
        characterCount: draft.length,
      },
    };

    const blob = new Blob([JSON.stringify(provenance, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "article-provenance.json";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Provenance exported",
      description: "Complete source tracking data has been downloaded.",
    });
  };

  const handleStartOver = () => {
    localStorage.clear();
    navigate("/");
  };

  const verifiedQuotes = quotes.filter(q => q.verified);
  const unverifiedQuotes = quotes.filter(q => !q.verified);

  return (
    <WorkflowLayout title="Review Draft" step={4} totalSteps={4}>
      <div className="space-y-8">
        {/* Draft Display with Source Attribution */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Final Article Draft</Label>
          <Card className="p-6">
            <div className="space-y-4">
              {addSourceAttribution(draft)}
            </div>
          </Card>
          <div className="text-xs text-muted-foreground">
            {draft.split(/\s+/).length} words • {draft.length} characters
          </div>
        </div>

        {/* Quote Checker */}
        {quotes.length > 0 && (
          <Card className="p-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Quote Verification</Label>
              <p className="text-sm text-muted-foreground">
                Detected quoted text and source verification:
              </p>
              
              <div className="space-y-4">
                {quotes.map((quote, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-2">"{quote.text}"</p>
                          <div className="flex items-center gap-2">
                            {quote.verified ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <Badge variant={quote.verified ? "default" : "destructive"}>
                              {quote.source}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {quote.snippet && (
                        <div className="mt-3 p-3 bg-muted rounded text-sm">
                          <Label className="text-xs font-medium text-muted-foreground">Matching snippet:</Label>
                          <p className="mt-1 text-muted-foreground italic">{quote.snippet}</p>
                        </div>
                      )}
                      
                      {!quote.verified && (
                        <div className="mt-3 p-3 bg-destructive/10 rounded text-sm">
                          <p className="text-destructive font-medium">Not Found</p>
                          <p className="text-destructive/80 text-xs mt-1">
                            This quote could not be verified in the transcript or supporting sources.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Quote Checker Results Summary */}
        {quotes.length > 0 && (
          <Card className="p-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Quote Verification Summary</Label>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Verified Quotes */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Verified Quotes ({verifiedQuotes.length})</span>
                  </div>
                  <div className="space-y-2">
                    {verifiedQuotes.map((quote, index) => (
                      <div key={index} className="text-sm p-2 bg-green-50 rounded">
                        <div className="font-medium">"{quote.text}"</div>
                        <div className="text-xs text-green-700 mt-1">
                          → {quote.source}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Unverified Quotes */}
                {unverifiedQuotes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium">Unverified Quotes ({unverifiedQuotes.length})</span>
                    </div>
                    <div className="space-y-2">
                      {unverifiedQuotes.map((quote, index) => (
                        <div key={index} className="text-sm p-2 bg-red-50 rounded">
                          <div className="font-medium">"{quote.text}"</div>
                          <div className="text-xs text-red-700 mt-1">→ Not Found</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Export Options */}
        <Card className="p-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">Export Options</Label>
            <div className="grid sm:grid-cols-2 gap-4">
              <Button onClick={handleExportMarkdown} className="justify-start h-auto p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Export as Markdown</div>
                    <div className="text-xs text-muted-foreground">
                      Download .md file for publication
                    </div>
                  </div>
                </div>
              </Button>

              <Button onClick={handleExportProvenance} variant="outline" className="justify-start h-auto p-4">
                <div className="flex items-center gap-3">
                  <Code className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Export Provenance</div>
                    <div className="text-xs text-muted-foreground">
                      Download source tracking (JSON)
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-border">
          <div className="flex gap-3">
            <Button onClick={() => navigate("/draft-generation")} variant="outline">
              Back to Generation
            </Button>
            <Button onClick={handleStartOver} variant="outline" className="text-destructive">
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleExportMarkdown} size="lg">
              <Download className="w-4 h-4 mr-2" />
              Export Draft
            </Button>
          </div>
        </div>
      </div>
    </WorkflowLayout>
  );
};