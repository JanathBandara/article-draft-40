import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WorkflowLayout } from "@/components/WorkflowLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const DraftGeneration = () => {
  const [selectedTone, setSelectedTone] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  
  const navigate = useNavigate();

  const toneOptions = [
    { value: "professional", label: "Professional" },
    { value: "conversational", label: "Conversational" },
    { value: "analytical", label: "Analytical" },
    { value: "storytelling", label: "Storytelling" },
  ];

  useEffect(() => {
    // Load key points from localStorage
    const storedKeyPoints = localStorage.getItem('keyPoints');
    if (storedKeyPoints) {
      try {
        setKeyPoints(JSON.parse(storedKeyPoints));
      } catch (error) {
        console.error('Error parsing key points:', error);
        navigate('/key-points'); // Redirect back if no valid key points
      }
    } else {
      navigate('/key-points'); // Redirect back if no key points found
    }
  }, [navigate]);

  const handleGenerateDraft = async () => {
    if (!selectedTone || keyPoints.length === 0) {
      alert("Please select a tone and ensure key points are available.");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Call Supabase Edge Function to generate draft using AI
      const { data, error } = await supabase.functions.invoke('generate-draft', {
        body: {
          keyPoints,
          tone: selectedTone,
          customPrompt: customPrompt || undefined
        }
      });

      if (error) throw error;

      setGeneratedDraft(data.draft);
    } catch (error) {
      console.error('Error generating draft:', error);
      alert('Failed to generate draft. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getToneTitle = (tone: string) => {
    switch (tone) {
      case "neutral":
        return "Product Development Update: Key Insights from Recent Interview";
      case "excited":
        return "Exciting New Product Launch: Behind the Scenes with the Development Team";
      case "critical":
        return "Development Challenges and Opportunities: A Critical Analysis";
      default:
        return "Article Draft";
    }
  };

  const handleContinue = () => {
    localStorage.setItem("generatedDraft", generatedDraft);
    localStorage.setItem("selectedTone", selectedTone);
    navigate("/review-export");
  };

  return (
    <WorkflowLayout title="Set Story Direction" step={3} totalSteps={4}>
      <div className="space-y-8">
        {/* Story Configuration */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="tone" className="text-base font-medium">
              Select Story Tone/Angle
            </Label>
            <Select value={selectedTone} onValueChange={setSelectedTone}>
              <SelectTrigger>
                <SelectValue placeholder="Choose article tone..." />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="custom-prompt" className="text-base font-medium">
              Custom Direction Prompt (Optional)
            </Label>
            <Input
              id="custom-prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., Focus on technical aspects..."
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleGenerateDraft}
            disabled={!selectedTone || isGenerating}
            size="lg"
            className="min-w-[200px]"
          >
            {isGenerating ? "Generating Draft..." : "Generate Draft"}
          </Button>
        </div>

        {/* Generated Draft Output */}
        {generatedDraft && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Generated Draft Article</Label>
              <span className="text-xs text-muted-foreground">
                {generatedDraft.length} characters
              </span>
            </div>
            <Textarea
              value={generatedDraft}
              onChange={(e) => setGeneratedDraft(e.target.value)}
              className="min-h-[400px] resize-none text-sm leading-relaxed font-mono"
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-border">
          <Button onClick={() => navigate("/key-points")} variant="outline">
            Back to Key Points
          </Button>
          {generatedDraft && (
            <Button onClick={handleContinue} size="lg">
              Review & Export
            </Button>
          )}
        </div>
      </div>
    </WorkflowLayout>
  );
};