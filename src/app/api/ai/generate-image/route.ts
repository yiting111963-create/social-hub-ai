import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { topic, aspectRatio = '1:1', seed = 0 } = await req.json();

    const dimensions: Record<string, { w: number; h: number }> = {
      '1:1': { w: 800, h: 800 },
      '16:9': { w: 1280, h: 720 },
      '4:5': { w: 800, h: 1000 },
    };
    const { w, h } = dimensions[aspectRatio] || dimensions['1:1'];

    let imageUrl: string;

    if (
      process.env.IMAGE_GEN_API_URL &&
      process.env.IMAGE_GEN_API_KEY
    ) {
      const res = await fetch(process.env.IMAGE_GEN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.IMAGE_GEN_API_KEY}`,
        },
        body: JSON.stringify({ prompt: topic, width: w, height: h }),
      });
      const data = await res.json();
      imageUrl = data.url || data.image_url;
    } else {
      // Fallback: picsum with a seed derived from topic + index so each image differs
      const topicSeed = Math.abs(
        (topic as string).split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0)
      ) % 1000;
      imageUrl = `https://picsum.photos/seed/${topicSeed + seed}/${w}/${h}`;
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ imageUrl: 'https://picsum.photos/seed/42/800/800' });
  }
}
