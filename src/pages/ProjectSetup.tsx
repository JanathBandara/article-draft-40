import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WorkflowLayout } from "@/components/WorkflowLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, Link, FileText, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Source = {
  id: string;
  type: 'url' | 'file';
  value: string;
  name?: string;
};

export const ProjectSetup = () => {
  const [transcript, setTranscript] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [currentUrl, setCurrentUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const addUrlSource = () => {
    if (!currentUrl.trim()) return;
    
    const newSource: Source = {
      id: crypto.randomUUID(),
      type: 'url',
      value: currentUrl,
      name: currentUrl,
    };
    
    setSources([...sources, newSource]);
    setCurrentUrl("");
    
    toast({
      title: "URL added",
      description: "URL source has been added successfully.",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const newSource: Source = {
        id: crypto.randomUUID(),
        type: 'file',
        value: selectedFile.name,
        name: selectedFile.name,
      };
      
      setSources([...sources, newSource]);
      
      toast({
        title: "File uploaded",
        description: `${selectedFile.name} has been uploaded successfully.`,
      });
    }
  };

  const removeSource = (id: string) => {
    setSources(sources.filter(source => source.id !== id));
    toast({
      title: "Source removed",
      description: "Source has been removed successfully.",
    });
  };

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
      // Store the transcript and sources for later use
      localStorage.setItem("transcript", transcript);
      localStorage.setItem("sources", JSON.stringify(sources));
      
      setIsProcessing(false);
      navigate("/key-points");
    }, 2000);
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

        {/* Supporting Sources */}
        <div className="space-y-4">
          <Label className="text-base font-medium">
            Supporting Sources (Optional)
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
              </div>
            </Card>

            {/* URL Input */}
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Link className="w-4 h-4" />
                  Add URL Link
                </div>
                <div className="flex gap-2">
                  <Input
                    value={currentUrl}
                    onChange={(e) => setCurrentUrl(e.target.value)}
                    placeholder="https://example.com/article"
                    type="url"
                    onKeyPress={(e) => e.key === 'Enter' && addUrlSource()}
                  />
                  <Button 
                    onClick={addUrlSource} 
                    disabled={!currentUrl.trim()}
                    size="icon"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sources List */}
          {sources.length > 0 && (
            <Card className="p-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Added Sources</Label>
                <div className="space-y-2">
                  {sources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        {source.type === 'file' ? (
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Link className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium">{source.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {source.type}
                        </span>
                      </div>
                      <Button
                        onClick={() => removeSource(source.id)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
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