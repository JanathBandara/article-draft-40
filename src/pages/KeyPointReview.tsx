import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WorkflowLayout } from "@/components/WorkflowLayout";
import { KeyPointItem } from "@/components/KeyPointItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const KeyPointReview = () => {
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load extracted key points from localStorage (set by AI extraction)
    const extractedKeyPoints = localStorage.getItem('extractedKeyPoints');
    if (extractedKeyPoints) {
      try {
        const keyPointsData = JSON.parse(extractedKeyPoints);
        setKeyPoints(keyPointsData);
      } catch (error) {
        console.error('Error parsing extracted key points:', error);
        // Fallback to empty array
        setKeyPoints([]);
      }
    } else {
      // Fallback in case no extracted key points are found
      setKeyPoints(["No key points extracted. Please go back and try again."]);
    }
  }, []);

  const handleEdit = (index: number, newText: string) => {
    const updated = [...keyPoints];
    updated[index] = newText;
    setKeyPoints(updated);
  };

  const handleDelete = (index: number) => {
    setKeyPoints(keyPoints.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...keyPoints];
    [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    setKeyPoints(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === keyPoints.length - 1) return;
    const updated = [...keyPoints];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setKeyPoints(updated);
  };

  const handleAddKeyPoint = () => {
    setKeyPoints([...keyPoints, "New key point - click edit to modify"]);
  };

  const handleContinue = () => {
    localStorage.setItem("keyPoints", JSON.stringify(keyPoints));
    navigate("/draft-generation");
  };

  return (
    <WorkflowLayout title="Review Key Points" step={2} totalSteps={4}>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Automatically extracted key points (edit, approve, reorder):
          </p>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {keyPoints.length} key points identified
            </p>
            <Button onClick={handleAddKeyPoint} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Point
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {keyPoints.map((point, index) => (
            <KeyPointItem
              key={index}
              point={point}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              isFirst={index === 0}
              isLast={index === keyPoints.length - 1}
            />
          ))}
        </div>

        <div className="flex justify-between pt-6 border-t border-border">
          <Button onClick={() => navigate("/")} variant="outline">
            Back to Setup
          </Button>
          <Button onClick={handleContinue} size="lg">
            Approve & Continue
          </Button>
        </div>
      </div>
    </WorkflowLayout>
  );
};