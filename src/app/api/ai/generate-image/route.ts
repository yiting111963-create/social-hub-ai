import { NextRequest, NextResponse } from 'next/server';

// Order matters: more specific / compound patterns first
function buildImagenPrompt(topic: string): string {
  const map: Array<[RegExp, string]> = [
    // Compound: food + location (must be before single-word patterns)
    [/日本.*(美食|料理|拉麵|壽司|食|吃)|(美食|料理|拉麵|壽司|食|吃).*日本/,
      'Japanese food photography, ramen bowl, sushi platter, Japanese cuisine, appetizing, professional food photo'],
    [/台灣.*(美食|小吃|料理|夜市)|(美食|小吃|料理|夜市).*台灣/,
      'Taiwan street food, night market, beef noodles, bubble tea, delicious, colorful food stalls'],
    // Specific food types
    [/火鍋/, 'steaming hotpot, rich broth, fresh ingredients, cozy restaurant, appetizing'],
    [/拉麵/, 'Japanese ramen bowl, rich tonkotsu broth, soft-boiled egg, nori, close-up food photography'],
    [/壽司|握壽司/, 'fresh sushi platter, nigiri, sashimi, Japanese cuisine, elegant presentation'],
    [/燒肉|烤肉/, 'Korean BBQ, grilling meat, smoke, delicious, restaurant atmosphere'],
    [/咖哩/, 'Japanese curry rice, rich golden sauce, tender meat, comfort food'],
    [/甜點|蛋糕|烘焙/, 'beautiful dessert photography, elegant plating, pastel colors, artisan cake'],
    [/咖啡|café/, 'cozy coffee shop, latte art, warm lighting, aesthetic café interior'],
    [/下午茶/, 'afternoon tea setup, tiered stand, scones, fine china, elegant'],
    [/美食|吃|料理|餐廳|食記/, 'delicious food photography, restaurant meal, appetizing dish, professional lighting'],
    // Travel / places
    [/賞櫻|櫻花/, 'cherry blossoms in full bloom, Japan spring, pink sakura, beautiful scenery, soft light'],
    [/日本|東京|大阪|京都/, 'Japan travel, city streets, Japanese architecture, vibrant cityscape'],
    [/台灣|台北|高雄/, 'Taiwan city, night market, colorful street scene'],
    [/旅遊|旅行|出發|出國/, 'travel photography, scenic landscape, adventure, beautiful destination'],
    // Nature / activities
    [/海邊|海灘|沙灘/, 'beautiful beach, crystal clear ocean, golden sand, sunset'],
    [/山|健行|爬山|登山/, 'mountain hiking trail, misty peaks, lush green nature, adventure'],
    [/花|公園|森林/, 'blooming flowers, peaceful park, lush greenery, nature photography'],
    [/夜景|城市|燈光/, 'city night skyline, glittering lights, urban photography, long exposure'],
    [/寵物|狗|貓/, 'adorable pet portrait, cute animal, soft lighting, joyful'],
    [/運動|健身|跑步/, 'fitness motivation, athletic training, dynamic sports photography'],
  ];

  for (const [pattern, englishPrompt] of map) {
    if (pattern.test(topic)) {
      return `${englishPrompt}, high quality photography, vibrant colors, social media style`;
    }
  }
  return `${topic}, lifestyle photography, beautiful composition, vibrant, high quality, social media`;
}

async function tryImagen3(prompt: string, count: number, aspectRatio: string): Promise<string[]> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });

  const response = await ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt,
    config: { numberOfImages: count, aspectRatio, outputMimeType: 'image/jpeg' },
  });

  const urls: string[] = [];
  for (const img of response.generatedImages ?? []) {
    const bytes = img.image?.imageBytes;
    if (bytes) {
      const base64 = Buffer.from(bytes).toString('base64');
      urls.push(`data:image/jpeg;base64,${base64}`);
    }
  }
  return urls;
}

async function tryGeminiFlash(prompt: string): Promise<string | null> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-preview-image-generation',
    contents: prompt,
    config: { responseModalities: ['IMAGE'] },
  });

  const part = response.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { mimeType?: string; data?: string } }) => p.inlineData?.mimeType?.startsWith('image/')
  );
  if (part?.inlineData?.data) {
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { topic, aspectRatio = '1:1', seed = 0, count = 1 } = await req.json();

    const dimensions: Record<string, { w: number; h: number }> = {
      '1:1':  { w: 800, h: 800 },
      '16:9': { w: 1280, h: 720 },
      '4:5':  { w: 800, h: 1000 },
    };
    const { w, h } = dimensions[aspectRatio] ?? dimensions['1:1'];

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    const isRealKey = apiKey && apiKey !== 'placeholder_gemini_key' && apiKey.length > 10;

    if (isRealKey) {
      const prompt = buildImagenPrompt(topic);

      // Try Imagen 3 first
      try {
        const urls = await tryImagen3(prompt, count, aspectRatio);
        if (urls.length > 0) {
          console.log(`Imagen 3 success: ${urls.length} image(s)`);
          return NextResponse.json({ imageUrl: urls[0], imageUrls: urls });
        }
      } catch (e) {
        console.warn('Imagen 3 failed:', (e as Error).message);
      }

      // Fall back to Gemini 2.0 Flash image generation
      try {
        const url = await tryGeminiFlash(prompt);
        if (url) {
          console.log('Gemini Flash image success');
          const urls = Array(count).fill(url); // Flash only returns 1
          return NextResponse.json({ imageUrl: url, imageUrls: urls });
        }
      } catch (e) {
        console.warn('Gemini Flash image failed:', (e as Error).message);
      }
    }

    // Final fallback: picsum with topic-based seed
    const topicSeed = Math.abs(
      topic.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0)
    );
    const urls = Array.from({ length: count }, (_, i) =>
      `https://picsum.photos/seed/${topicSeed + seed + i}/${w}/${h}`
    );
    return NextResponse.json({ imageUrl: urls[0], imageUrls: urls });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ imageUrl: 'https://picsum.photos/seed/42/800/800' });
  }
}
