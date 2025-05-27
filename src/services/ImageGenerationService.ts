import { GoogleGenerativeAI, Part } from '@google/generative-ai';
// import * as fs from 'node:fs'; // Not strictly needed if not writing to file system directly

export class ImageGenerationService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any; // Consider using a more specific type if available from the SDK

  constructor(apiKey: string = process.env.GEMINI_API_KEY || '') {
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY not provided for ImageGenerationService. Image generation will be disabled.');
      return;
    }
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Note: The user provided docs mention "gemini-2.0-flash-preview-image-generation"
      // Using the model specifically for image generation as per docs.
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-preview-image-generation" });
    } catch (error) {
      console.error("Failed to initialize GoogleGenerativeAI in ImageGenerationService:", error);
      this.genAI = null;
    }
  }

  async generateImageFromPrompt(prompt: string): Promise<string | null> {
    if (!this.genAI || !this.model) {
      console.warn('ImageGenerationService: Gemini API not initialized. Skipping image generation.');
      return this.getDefaultImagePlaceholder(prompt);
    }

    console.log('ImageGenerationService: Received prompt for actual generation:', prompt);

    try {
      const generationConfig = {
        // temperature: 0.9, // Example, adjust as needed
        // topK: 1,
        // topP: 1,
        // maxOutputTokens: 2048, // Example, adjust as needed
        responseModalities: ["TEXT", "IMAGE"], // Using string literals
      };
      
      const contents: Part[] = [{text: prompt}];

      // According to the new docs, the model instance (this.model) should be used.
      // And generateContent should be called on it.
      // The response structure needs careful handling for image data.
      const result = await this.model.generateContent({
        contents: [{ parts: contents, role: "user" }],
        generationConfig: generationConfig,
      });
      
      const response = result.response;

      if (response && response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
              // Return the base64 encoded image data directly
              return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
          }
        }
      }
      console.warn('No image data found in Gemini response for prompt:', prompt, 'Response:', JSON.stringify(response, null, 2));
      return this.getDefaultImagePlaceholder(prompt);

    } catch (error) {
      console.error('Error generating image with Gemini API:', error);
      return this.getDefaultImagePlaceholder(prompt);
    }
  }

  private getDefaultImagePlaceholder(prompt: string): string | null {
    console.log('ImageGenerationService: Using placeholder for prompt:', prompt);
    if (prompt.toLowerCase().includes('trader')) {
      return 'https://images.unsplash.com/photo-1639809200199-7ifeaa8e0d37?q=80&w=2070&auto=format&fit=crop'; // Abstract financial graph
    }
    if (prompt.toLowerCase().includes('collector') || prompt.toLowerCase().includes('art')) {
      return 'https://images.unsplash.com/photo-1620421680300-b6b55ce359de?q=80&w=1974&auto=format&fit=crop'; // Abstract art
    }
    if (prompt.toLowerCase().includes('owl')) {
      return 'https://images.unsplash.com/photo-1543548596-00ebf9f9f849?q=80&w=1974&auto=format&fit=crop'; // Owl
    }
    return 'https://images.unsplash.com/photo-1639762681057-408e52192e50?q=80&w=1932&auto=format&fit=crop'; // Abstract crypto
  }
} 