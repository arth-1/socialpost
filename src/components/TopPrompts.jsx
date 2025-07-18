import { useState } from 'react';

const TOP_PROMPTS = [
  'A futuristic city skyline at sunset',
  'A cat astronaut floating in space',
  'A serene mountain landscape with a lake',
  'A vibrant street market in Tokyo',
  'A vintage car driving through the desert',
];

const PROMPT_IMAGE_MAP = {
  'A futuristic city skyline at sunset': '',
  'A cat astronaut floating in space': '',
  'A serene mountain landscape with a lake': '',
  'A vibrant street market in Tokyo': '',
  'A vintage car driving through the desert': '',
};

export default function TopPrompts({ onPromptSelect }) {
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [imagePath, setImagePath] = useState('');

  const handlePromptClick = (prompt) => {
    setSelectedPrompt(prompt);
    const path = PROMPT_IMAGE_MAP[prompt];
    if (path) {
      setImagePath(path);
      if (onPromptSelect) onPromptSelect(prompt, path);
    } else {
      setImagePath('');
      if (onPromptSelect) onPromptSelect(prompt, null);
    }
  };

  return (
    <div className="my-6">
      <h2 className="text-lg font-bold mb-2">Example Prompts</h2>
      <ul className="space-y-2">
        {TOP_PROMPTS.map((prompt) => (
          <li key={prompt}>
            <button
              className={`w-full text-left px-4 py-2 rounded border border-primary hover:bg-primary hover:text-primary-foreground transition ${selectedPrompt === prompt ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={() => handlePromptClick(prompt)}
            >
              {prompt}
            </button>
          </li>
        ))}
      </ul>
      {imagePath && (
        <div className="mt-4">
          <img src={imagePath} alt="Generated" className="rounded shadow max-w-full h-auto" />
        </div>
      )}
    </div>
  );
}
