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
import PromptHistory from "@/components/PromptHistory";

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

  return (
    <div className="min-h-screen bg-background w-full text-foreground">
      <main className="container mx-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary font-headline">
              PostCraft AI
            </h1>
            <p className="text-muted-foreground mt-2 md:text-lg">
              Turn your ideas into stunning social media posts in seconds.
            </p>
          </div>
          <form
            className="flex flex-col gap-2 items-end mt-4 md:mt-0 w-full max-w-xs"
            onSubmit={e => { e.preventDefault(); }}
          >
            <input
              type="text"
              placeholder="Instagram Username (optional)"
              className="border border-primary/30 rounded-md px-3 py-2 text-sm bg-background text-foreground w-full focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
              value={instaUser}
              onChange={e => setInstaUser(e.target.value)}
              maxLength={32}
              style={{ minWidth: 0, width: '100%' }}
            />
            <input
              type="password"
              placeholder="Instagram Password (optional)"
              className="border border-primary/30 rounded-md px-3 py-2 text-sm bg-background text-foreground w-full focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
              value={instaPass}
              onChange={e => setInstaPass(e.target.value)}
              maxLength={32}
              style={{ minWidth: 0, width: '100%' }}
            />
          </form>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <Card className="shadow-lg border-2 border-transparent hover:border-primary/20 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <CornerDownLeft />
                  1. Describe your post
                </CardTitle>
                <CardDescription>
                  Enter a prompt, improve it for better results, then generate!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="e.g., A vibrant abstract painting of a cat wearing sunglasses, synthwave style"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none text-base"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleImprovePrompt}
                    disabled={isImproving || isLoading || !prompt}
                    variant="outline"
                    className="w-full"
                  >
                    {isImproving ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" /> Improve Prompt
                      </>
                    )}
                  </Button>
                </div>
                {improvedPrompt && (
                  <Card className="bg-secondary/50 border-accent/50">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base flex items-center gap-2 text-accent">
                        <Sparkles />
                        Improved Prompt
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-secondary-foreground">
                        {improvedPrompt}
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                {/* Top Prompts Section */}
                <div className="mt-6 border-t pt-6 border-border">
                  <TopPrompts onPromptSelect={handleTopPromptSelect} />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleGenerate(improvedPrompt || prompt)}
                  disabled={isLoading || !prompt}
                  className="w-full text-lg py-6"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "2. Generate Image"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <PromptHistory 
              history={history}
              onPromptClick={handleHistoryClick}
            />
          </div>

          <div className="lg:col-span-3 flex flex-col gap-4">
            <Card className="flex-grow flex flex-col shadow-lg border-2 border-transparent sticky top-8">
              <CardHeader>
                <CardTitle className="text-primary">
                  3. Your Generated Post
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex items-center justify-center">
                <div className="aspect-square w-full rounded-lg bg-muted/50 flex items-center justify-center relative overflow-hidden border-2 border-dashed">
                  {isLoading && (
                    <div className="z-10 flex flex-col items-center gap-4 text-muted-foreground">
                      <Loader2 className="w-16 h-16 animate-spin text-primary" />
                      <p className="text-lg font-medium">
                        Generating your masterpiece...
                      </p>
                      <p className="text-sm">This can take a moment.</p>
                    </div>
                  )}
                  {generatedImage && (
                    <Image
                      src={generatedImage}
                      alt={prompt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className={`object-cover transition-opacity duration-500 ${
                        isLoading ? "opacity-20 blur-sm" : "opacity-100 blur-0"
                      }`}
                      data-ai-hint="social media post"
                    />
                  )}
                  {!isLoading && !generatedImage && (
                    <div className="text-center text-muted-foreground p-4">
                      <p className="font-semibold text-lg">
                        Your generated image will appear here.
                      </p>
                      <p className="text-sm">
                        Just type a prompt and click generate!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex-col sm:flex-row gap-2 pt-6">
                <Button
                  onClick={handleDownload}
                  disabled={!generatedImage || isLoading}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  disabled={!generatedImage || isLoading}
                  className="w-full bg-accent hover:bg-accent/90"
                  onClick={async () => {
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
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Post to Instagram
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
