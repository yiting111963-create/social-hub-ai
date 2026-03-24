import { NextRequest, NextResponse } from 'next/server';

// Translate Chinese topic keywords to English for Imagen prompt
function buildImagenPrompt(topic: string): string {
  const map: Array<[RegExp, string]> = [
    [/賞櫻|櫻花/, 'cherry blossoms in full bloom, Japan spring, pink sakura trees, beautiful scenery'],
    [/日本|東京|大阪|京都/, 'Japan travel, city streets, Japanese architecture, vibrant cityscape'],
    [/台灣|台北|高雄|夜市/, 'Taiwan night market, colorful street food stalls, vibrant atmosphere'],
    [/旅遊|旅行|出發|出國|行程/, 'travel photography, scenic landscape, adventure, beautiful destination'],
    [/火鍋/, 'steaming hotpot, rich broth, fresh ingredients, cozy restaurant'],
    [/拉麵/, 'Japanese ramen bowl, rich tonkotsu broth, soft egg, close-up food photography'],
    [/壽司/, 'fresh sushi platter, Japanese cuisine, elegant presentation'],
    [/咖啡|café/, 'cozy coffee shop, latte art, warm lighting, aesthetic café interior'],
    [/甜點|蛋糕/, 'beautiful dessert, elegant plating, pastel colors, sweet photography'],
    [/美食|吃|料理|餐廳/, 'delicious food photography, restaurant meal, appetizing dish, professional lighting'],
    [/海邊|海灘|沙灘/, 'beautiful beach, crystal clear ocean, golden sand, sunset'],
    [/山|健行|爬山|登山/, 'mountain hiking trail, misty peaks, lush green nature, adventure'],
    [/花|公園|森林/, 'blooming flowers, peaceful park, lush greenery, nature photography'],
    [/夜景|城市|燈光/, 'city night skyline, glittering lights, urban photography, long exposure'],
    [/寵物|狗|貓/, 'adorable pet, cute animal portrait, soft lighting, joyful'],
    [/運動|健身|跑步/, 'fitness motivation, athletic training, dynamic sports photography'],
    [/咖啡廳|下午茶/, 'afternoon tea setup, elegant table, scones and tea, cozy ambiance'],
  ];

  for (const [pattern, englishPrompt] of map) {
    if (pattern.test(topic)) {
      return `${englishPrompt}, high quality photography, vibrant colors, social media style, 4K`;
    }
  }

  // Generic fallback
  return `${topic}, lifestyle photography, beautiful composition, vibrant, high quality, social media`;
}

async function generateWithImagen(topic: string, count: number, w: number, h: number): Promise<string[]> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });

  const prompt = buildImagenPrompt(topic);
  const aspectRatio = w === h ? '1:1' : w > h ? '16:9' : '4:5';

  const response = await ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt,
    config: {
      numberOfImages: count,
      aspectRatio,
      outputMimeType: 'image/jpeg',
    },
  });

  const urls: string[] = [];
  for (const img of response.generatedImages ?? []) {
    if (img.image?.imageBytes) {
      // Convert Uint8Array to base64 data URL
      const bytes = img.image.imageBytes;
      const base64 = Buffer.from(bytes).toString('base64');
      urls.push(`data:image/jpeg;base64,${base64}`);
    }
  }
  return urls;
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
      try {
        const urls = await generateWithImagen(topic, count, w, h);
        if (urls.length > 0) {
          // Return all URLs; caller picks by index
          return NextResponse.json({ imageUrl: urls[0], imageUrls: urls });
        }
      } catch (err) {
        console.warn('Imagen generation failed, using fallback:', err);
      }
    }

    // Reliable fallback: picsum.photos never fails
    const topicSeed = Math.abs(
      topic.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0)
    );
    const imageUrl = `https://picsum.photos/seed/${topicSeed + seed}/${w}/${h}`;
    return NextResponse.json({ imageUrl, imageUrls: [imageUrl] });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ imageUrl: 'https://picsum.photos/seed/42/800/800' });
  }
}
