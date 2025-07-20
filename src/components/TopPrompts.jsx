import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export const TOP_PROMPTS = [
  'A futuristic city skyline at sunset',
  'A cat astronaut floating in space',
  'A serene mountain landscape with a lake',
  'A vibrant street market in Tokyo',
  'A vintage car driving through the desert',
];

export const PROMPT_IMAGE_MAP = {
  'A futuristic city skyline at sunset': '/top_gen/img1.png',
  'A cat astronaut floating in space': '/top_gen/img2.png',
  'A serene mountain landscape with a lake': '/top_gen/img3.png',
  'A vibrant street market in Tokyo': '/top_gen/img4.png',
  'A vintage car driving through the desert': '/top_gen/img5.png',
};

function TopPrompts({ onPromptSelect }) {
  const [selectedPrompt, setSelectedPrompt] = useState('');

  const handlePromptClick = (prompt) => {
    setSelectedPrompt(prompt);
    const path = PROMPT_IMAGE_MAP[prompt];
    if (onPromptSelect) onPromptSelect(prompt, path);
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-3">Example Prompts</h2>
      <div className="grid grid-cols-1 gap-2">
        {TOP_PROMPTS.map((prompt) => (
          <Badge
            key={prompt}
            variant="secondary"
            className={`cursor-pointer bg-background border hover:bg-primary/10 flex items-center justify-start h-12 w-full text-base font-medium px-4 py-2 rounded-md ${
              selectedPrompt === prompt ? 'border-primary bg-primary/5' : 'border-muted'
            }`}
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
            onClick={() => handlePromptClick(prompt)}
            title={prompt}
          >
            {prompt}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default TopPrompts;

