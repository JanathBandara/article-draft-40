import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WorkflowLayout } from "@/components/WorkflowLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const DraftGeneration = () => {
  const [selectedTone, setSelectedTone] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const navigate = useNavigate();

  const toneOptions = [
    { value: "neutral", label: "Neutral Explainer" },
    { value: "excited", label: "Excited Launch Article" },
    { value: "critical", label: "Critical Analysis" },
  ];

  const handleGenerateDraft = async () => {
    if (!selectedTone) return;
    
    setIsGenerating(true);
    
    // Simulate AI draft generation
    setTimeout(() => {
      const simulatedDraft = `# ${getToneTitle(selectedTone)}

In a recent interview, key insights were revealed about the upcoming product launch that highlight both opportunities and challenges facing the development team.

## User Experience as Core Priority

The development team has placed user experience at the center of their strategy. As noted in the interview, "users should never have to think about how to use our product." This philosophy has guided major design decisions and reflects the company's commitment to intuitive interfaces.

## Budget and Timeline Pressures

The project faces significant constraints that have reshaped the original vision. Budget limitations have forced the team to reduce scope by approximately 30% from the original plan. Additionally, competitive pressure has accelerated the timeline, moving the launch up by two weeks from the initially planned date.

## Beta Testing Results

Customer feedback from the beta testing phase shows promising results, with an 85% satisfaction rate among participants. However, performance issues have emerged as the primary concern, with users reporting slow loading times as the main complaint requiring immediate attention.

## Future Implementation Strategy

Looking ahead, the team has outlined a measured approach to feature rollout. A/B testing will be implemented for the new feature set before full deployment, ensuring that user experience remains optimal while managing risk.

${customPrompt ? `\n## Additional Context\n\n${customPrompt}` : ""}

---
*This draft was generated from interview transcript and supporting materials. All quotes and data points have been sourced from the provided materials.*`;

      setGeneratedDraft(simulatedDraft);
      setIsGenerating(false);
    }, 3000);
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