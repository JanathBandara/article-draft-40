import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, ArrowRight, Zap, Shield, Download } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-editorial-background">
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Article Drafting <span className="text-primary">MVP</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform interview transcripts and supporting sources into professional article drafts 
            with automated key point extraction and provenance tracking.
          </p>
          <Button asChild size="lg" className="px-8 py-6 text-lg">
            <a href="/setup">
              Start New Project
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 shadow-editorial hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Smart Extraction</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Automatically extract and organize key points from interview transcripts and supporting materials.
              </p>
            </div>
          </Card>

          <Card className="p-6 shadow-editorial hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Editorial Control</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Review, edit, and reorder key points with full editorial control before draft generation.
              </p>
            </div>
          </Card>

          <Card className="p-6 shadow-editorial hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Source Tracking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Built-in quote verification and complete provenance tracking for editorial integrity.
              </p>
            </div>
          </Card>
        </div>

        {/* Workflow Steps */}
        <Card className="p-8 shadow-editorial">
          <h2 className="text-2xl font-bold text-center mb-8">Simple 4-Step Workflow</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-8 h-8 bg-primary rounded-full text-primary-foreground font-bold flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h4 className="font-semibold mb-2">Setup Project</h4>
              <p className="text-sm text-muted-foreground">Upload transcript and sources</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-primary rounded-full text-primary-foreground font-bold flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h4 className="font-semibold mb-2">Review Points</h4>
              <p className="text-sm text-muted-foreground">Edit and organize key insights</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-primary rounded-full text-primary-foreground font-bold flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h4 className="font-semibold mb-2">Generate Draft</h4>
              <p className="text-sm text-muted-foreground">Choose tone and create article</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-primary rounded-full text-primary-foreground font-bold flex items-center justify-center mx-auto mb-3">
                4
              </div>
              <h4 className="font-semibold mb-2">Export & Review</h4>
              <p className="text-sm text-muted-foreground">Download with full provenance</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
