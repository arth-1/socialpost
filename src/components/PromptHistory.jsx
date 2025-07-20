import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function PromptHistory({ history, onPromptClick }) {
  return (
    <Card className="shadow-lg border-2 border-transparent hover:border-primary/20 transition-all duration-300">
      <CardHeader>
        <CardTitle>Prompt History</CardTitle>
        <CardDescription>Click a previous prompt to reuse it.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-40 w-full">
          {history.length > 0 ? (
            <div className="flex flex-col gap-2 w-full">
              {history.map((histPrompt, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer bg-background border border-muted hover:bg-primary/10 flex items-center justify-start h-12 w-full text-base font-medium px-4 py-2 rounded-md"
                  style={{ 
                    borderRadius: '6px', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    textAlign: 'left', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'flex-start', 
                    minHeight: '3rem', 
                    maxWidth: '100%' 
                  }}
                  onClick={() => onPromptClick(histPrompt)}
                  title={histPrompt}
                >
                  {histPrompt.length > 60 ? histPrompt.slice(0, 57) + '...' : histPrompt}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No history yet. Generate an image to start!
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default PromptHistory;
