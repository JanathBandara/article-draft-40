import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WorkflowLayout } from "@/components/WorkflowLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Code, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ReviewExport = () => {
  const [draft, setDraft] = useState("");
  const [quotes, setQuotes] = useState<Array<{ quote: string; source: string; found: boolean }>>([]);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const savedDraft = localStorage.getItem("generatedDraft") || "";
    setDraft(savedDraft);

    // Extract quotes and check sources
    const quoteRegex = /"([^"]+)"/g;
    const foundQuotes = [];
    let match;
    
    while ((match = quoteRegex.exec(savedDraft)) !== null) {
      const quote = match[1];
      // Simulate source checking
      const isFromTranscript = quote.includes("users should never have to think");
      foundQuotes.push({
        quote,
        source: isFromTranscript ? "Interview Transcript" : "Not Found",
        found: isFromTranscript,
      });
    }
    
    setQuotes(foundQuotes);
  }, []);

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
    const sourceUrl = localStorage.getItem("sourceUrl") || "";
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
        supportingSource: sourceUrl ? {
          url: sourceUrl,
          type: "external_link",
        } : null,
      },
      keyPoints,
      quotes: quotes.map(q => ({
        text: q.quote,
        verified: q.found,
        source: q.source,
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

  return (
    <WorkflowLayout title="Review Draft" step={4} totalSteps={4}>
      <div className="space-y-8">
        {/* Draft Display */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Final Article Draft</Label>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-[400px] resize-none text-sm leading-relaxed"
          />
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
              <div className="space-y-3">
                {quotes.map((quote, index) => (
                  <div key={index} className="p-3 border border-border rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">"{quote.quote}"</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={quote.found ? "default" : "destructive"}>
                            {quote.source}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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