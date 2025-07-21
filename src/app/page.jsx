"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Share2,
  CornerDownLeft,
  Sparkles,
  Download,
} from "lucide-react";
import { generateSocialMediaPostImage } from "@/ai/flows/generate-social-media-post-image";
import { improvePromptSuggestion } from "@/ai/flows/improve-prompt-suggestions";
import { useToast } from "@/hooks/use-toast";
import TopPrompts, { TOP_PROMPTS, PROMPT_IMAGE_MAP } from "@/components/TopPrompts";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [history, setHistory] = useState([]);
  const [instaUser, setInstaUser] = useState("");
  const [instaPass, setInstaPass] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("promptHistory");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
      localStorage.removeItem("promptHistory");
    }
  }, []);

  const handleImprovePrompt = useCallback(async () => {
    if (!prompt) {
      toast({
        title: "Prompt is empty",
        description: "Please enter a prompt to improve.",
        variant: "destructive",
      });
      return;
    }
    setIsImproving(true);

    try {
      const result = await improvePromptSuggestion({ prompt });
      setImprovedPrompt(result.improvedPrompt);
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to improve prompt",
        description:
          "An error occurred while improving the prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImproving(false);
    }
  }, [prompt, toast]);

  function handleTopPromptSelect(prompt, imagePath) {
    setPrompt(prompt);
    setImprovedPrompt("");
    setIsLoading(true);
    setGeneratedImage(null);
    
    // Simulate loading for a better UX
    setTimeout(() => {
      setGeneratedImage(imagePath);
      setIsLoading(false);
      
      if (!history.includes(prompt)) {
        const newHistory = [prompt, ...history].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem("promptHistory", JSON.stringify(newHistory));
      }
    }, 1200);
  }

  const handleGenerate = useCallback(
    async (promptToUse) => {
      if (!promptToUse) {
        toast({
          title: "Prompt is empty",
          description: "Please enter a prompt to generate an image.",
          variant: "destructive",
        });
        return;
      }
      setIsLoading(true);
      setGeneratedImage(null);
      
      // Check if it's a top prompt first
      if (TOP_PROMPTS.includes(promptToUse)) {
        const imagePath = PROMPT_IMAGE_MAP[promptToUse];
        // Simulate loading for a better UX
        setTimeout(() => {
          setGeneratedImage(imagePath);
          setIsLoading(false);
          
          if (!history.includes(promptToUse)) {
            const newHistory = [promptToUse, ...history].slice(0, 10);
            setHistory(newHistory);
            localStorage.setItem("promptHistory", JSON.stringify(newHistory));
          }
        }, 1200);
        return;
      }
      
      // Otherwise proceed with API call
      try {
        const result = await generateSocialMediaPostImage({
          prompt: promptToUse,
        });
        setGeneratedImage(result.imageDataUri);

        if (!history.includes(promptToUse)) {
          const newHistory = [promptToUse, ...history].slice(0, 10);
          setHistory(newHistory);
          localStorage.setItem("promptHistory", JSON.stringify(newHistory));
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Image generation failed",
          description:
            "An error occurred while generating the image. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setImprovedPrompt("");
      }
    },
    [history, toast]
  );

  const handleHistoryClick = useCallback((histPrompt) => {
    setPrompt(histPrompt);
    setImprovedPrompt("");
  }, []);

  const handleDownload = useCallback(() => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `${
      prompt
        .slice(0, 30)
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase() || "postcraft_image"
    }.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedImage, prompt]);

  const handleInstagramPost = useCallback(async () => {
    if (!generatedImage) return;
    
    async function compressImage(dataUri, maxSizeKB = 1000) {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = function () {
          const canvas = document.createElement('canvas');
          const maxDim = 1024;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          let quality = 0.9;
          let compressedDataUri = canvas.toDataURL('image/jpeg', quality);
          while (
            compressedDataUri.length / 1024 > maxSizeKB && quality > 0.1
          ) {
            quality -= 0.1;
            compressedDataUri = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(compressedDataUri);
        };
        img.src = dataUri;
      });
    }
    
    const compressedImage = await compressImage(generatedImage, 1000);
    try {
      const response = await fetch('/api/postToInstagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: compressedImage,
          caption: prompt,
          instaUser,
          instaPass,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Posted to Instagram!',
          description: `Media ID: ${data.mediaId}`,
        });
      } else {
        toast({
          title: 'Instagram Post Failed',
          description: data.error || 'Unknown error',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Instagram Post Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  }, [generatedImage, prompt, instaUser, instaPass, toast]);

  return (
    <div className="min-h-screen w-full text-white relative overflow-hidden" style={{backgroundColor: '#444444'}}>
      {/* Enhanced Dark Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/30 via-transparent to-slate-800/20"></div>
      <div className="absolute inset-0 backdrop-blur-3xl"></div>
      
      <main className="relative z-10 container mx-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row items-start justify-between mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">✨</span>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                PostCraft AI
              </h1>
              <p className="text-slate-300 text-lg">
                Turn your ideas into stunning social media posts in seconds
              </p>
            </div>
          </div>
          
          {/* Instagram Credentials - Top Right */}
          <div className="flex flex-col gap-2 mt-2 md:mt-0 min-w-[240px]">
            <input
              type="text"
              placeholder="Instagram Username"
              className="px-3 py-1 text-sm rounded-lg bg-black/30 border border-white/10 text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 backdrop-blur-sm"
              value={instaUser}
              onChange={e => setInstaUser(e.target.value)}
              maxLength={32}
            />
            <input
              type="password"
              placeholder="Instagram Password"
              className="px-3 py-1 text-sm rounded-lg bg-black/30 border border-white/10 text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 backdrop-blur-sm"
              value={instaPass}
              onChange={e => setInstaPass(e.target.value)}
              maxLength={32}
            />
            <Button
              disabled={!generatedImage || isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-1 text-sm rounded-lg"
              onClick={handleInstagramPost}
            >
              Post
            </Button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
          {/* Left Column - Controls */}
          <div className="lg:w-96 flex flex-col gap-6">
            {/* Describe your post Card - Moved to top */}
            <div className="backdrop-blur-xl bg-black/40 rounded-2xl border border-white/10 p-6 shadow-2xl">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white mb-2">Describe your post</h2>
                <p className="text-white/60 text-sm">Enter a prompt, improve it for better results, then generate!</p>
              </div>
              
              <div className="space-y-4">
                <Textarea
                  placeholder="e.g., A vibrant abstract painting of a cat wearing sunglasses, synthwave style"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none text-base bg-black/30 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20 focus:bg-black/50"
                />
                
                <Button
                  onClick={handleImprovePrompt}
                  disabled={isImproving || isLoading || !prompt}
                  variant="outline"
                  className="w-full bg-black/30 border-white/10 text-white hover:bg-black/50 hover:border-white/20"
                >
                  {isImproving ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Improve Prompt
                </Button>

                {improvedPrompt && (
                  <div className="bg-gradient-to-r from-black/60 to-black/50 rounded-xl p-4 border border-blue-400/20 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-blue-300" />
                      <span className="text-blue-300 font-medium text-sm">Improved Prompt</span>
                    </div>
                    <p className="text-white/80 text-sm">{improvedPrompt}</p>
                  </div>
                )}
                
                <Button
                  onClick={() => handleGenerate(improvedPrompt || prompt)}
                  disabled={isLoading || !prompt}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-3 rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Generating...
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
            </div>

            {/* Suggestion Card - Moved below describe your post */}
            <div className="backdrop-blur-xl bg-black/40 rounded-2xl border border-white/10 p-6 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-4">Suggestion</h2>
              <div className="space-y-3">
                {TOP_PROMPTS.map((prompt, index) => (
                  <button
                    key={prompt}
                    onClick={() => handleTopPromptSelect(prompt, PROMPT_IMAGE_MAP[prompt])}
                    className="w-full text-left px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white/80 hover:bg-black/50 hover:border-white/20 transition-all duration-200 text-sm backdrop-blur-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Generated Image */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Main Image Display */}
            <div className="backdrop-blur-xl bg-black/40 rounded-2xl border border-white/10 p-6 flex-1 shadow-2xl">
              <div className="aspect-square w-full max-w-2xl mx-auto rounded-xl bg-black/20 border border-white/10 flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
                {isLoading && (
                  <div className="z-10 flex flex-col items-center gap-4 text-white/90">
                    <Loader2 className="w-16 h-16 animate-spin text-blue-300" />
                    <p className="text-lg font-medium">Generating your masterpiece...</p>
                    <p className="text-sm text-white/50">This can take a moment.</p>
                  </div>
                )}
                {generatedImage && (
                  <Image
                    src={generatedImage}
                    alt={prompt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={`object-cover rounded-lg transition-opacity duration-500 ${
                      isLoading ? "opacity-20 blur-sm" : "opacity-100 blur-0"
                    }`}
                    data-ai-hint="social media post"
                  />
                )}
                {!isLoading && !generatedImage && (
                  <div className="text-center text-white/60 p-4">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-black/30 flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <span className="text-4xl">🖼️</span>
                    </div>
                    <p className="font-semibold text-lg mb-2">Your generated image will appear here</p>
                    <p className="text-sm text-white/40">Just type a prompt and click generate!</p>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 justify-center">
                <Button
                  onClick={handleDownload}
                  disabled={!generatedImage || isLoading}
                  variant="outline"
                  className="bg-black/30 border-white/10 text-white hover:bg-black/50 hover:border-white/20 px-8 backdrop-blur-sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  disabled={!generatedImage || isLoading}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8"
                  onClick={handleInstagramPost}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* History Card */}
            <div className="backdrop-blur-xl bg-black/40 rounded-2xl border border-white/10 p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4">History</h3>
              <ScrollArea className="h-48 w-full">
                {history.length > 0 ? (
                  <div className="space-y-2">
                    {history.map((histPrompt, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white/80 hover:bg-black/50 hover:border-white/20 transition-all duration-200 text-sm backdrop-blur-sm"
                        onClick={() => handleHistoryClick(histPrompt)}
                        title={histPrompt}
                      >
                        {histPrompt.length > 60 ? histPrompt.slice(0, 57) + '...' : histPrompt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-center py-8">
                    No history yet. Generate an image to start!
                  </p>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
