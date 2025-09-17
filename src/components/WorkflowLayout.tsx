import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface WorkflowLayoutProps {
  children: ReactNode;
  title: string;
  step: number;
  totalSteps: number;
}

export const WorkflowLayout = ({ children, title, step, totalSteps }: WorkflowLayoutProps) => {
  return (
    <div className="min-h-screen bg-editorial-background">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            <div className="text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </div>
          </div>
          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  index < step
                    ? "bg-editorial-completed"
                    : index === step - 1
                    ? "bg-editorial-step"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main content card */}
        <Card className="p-8 shadow-editorial bg-editorial-focus">
          {children}
        </Card>
      </div>
    </div>
  );
};