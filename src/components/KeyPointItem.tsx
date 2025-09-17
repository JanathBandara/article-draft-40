import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, ArrowUp, ArrowDown, Check, X } from "lucide-react";

interface KeyPointItemProps {
  point: string;
  index: number;
  onEdit: (index: number, newText: string) => void;
  onDelete: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

export const KeyPointItem = ({
  point,
  index,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: KeyPointItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(point);

  const handleSave = () => {
    onEdit(index, editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(point);
    setIsEditing(false);
  };

  return (
    <div className="group p-4 border border-border rounded-lg bg-card hover:shadow-sm transition-all duration-200">
      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} variant="default">
              <Check className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button size="sm" onClick={handleCancel} variant="outline">
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <p className="text-sm leading-relaxed text-foreground">{point}</p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(index)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            {!isFirst && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onMoveUp(index)}
                className="h-8 w-8 p-0"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            )}
            {!isLast && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onMoveDown(index)}
                className="h-8 w-8 p-0"
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};