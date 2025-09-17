import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WorkflowLayout } from "@/components/WorkflowLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, Link, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ProjectSetup = () => {
  const [transcript, setTranscript] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleExtractKeyPoints = async () => {
    if (!transcript.trim()) {
      toast({
        title: "Missing transcript",
        description: "Please paste an interview transcript to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      // Store the transcript and source for later use
      localStorage.setItem("transcript", transcript);
      if (sourceUrl) localStorage.setItem("sourceUrl", sourceUrl);
      if (file) localStorage.setItem("fileName", file.name);
      
      setIsProcessing(false);
      navigate("/key-points");
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast({
        title: "File uploaded",
        description: `${selectedFile.name} has been uploaded successfully.`,
      });
    }
  };

  return (
    <WorkflowLayout title="Create Project" step={1} totalSteps={4}>
      <div className="space-y-8">
        {/* Transcript Input */}
        <div className="space-y-3">
          <Label htmlFor="transcript" className="text-base font-medium">
            Paste Interview Transcript
          </Label>
          <Textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your interview transcript here..."
            className="min-h-[300px] resize-none text-sm leading-relaxed"
          />
          <p className="text-xs text-muted-foreground">
            {transcript.length} characters
          </p>
        </div>

        {/* Supporting Source */}
        <div className="space-y-4">
          <Label className="text-base font-medium">
            Attach Supporting Source (Optional)
          </Label>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* File Upload */}
            <Card className="p-4 border-dashed border-2 hover:border-primary/50 transition-colors">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-primary hover:text-primary/80">
                    Upload PDF File
                  </span>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </Label>
                {file && (
                  <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    {file.name}
                  </div>
                )}
              </div>
            </Card>

            {/* URL Input */}
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Link className="w-4 h-4" />
                  Add URL Link
                </div>
                <Input
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  type="url"
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-6 border-t border-border">
          <Button
            onClick={handleExtractKeyPoints}
            disabled={!transcript.trim() || isProcessing}
            size="lg"
            className="min-w-[160px]"
          >
            {isProcessing ? "Extracting..." : "Extract Key Points"}
          </Button>
        </div>
      </div>
    </WorkflowLayout>
  );
};