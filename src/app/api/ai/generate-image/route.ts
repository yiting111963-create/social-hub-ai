import { NextRequest, NextResponse } from 'next/server';

// Map Chinese keywords to Unsplash-friendly English search terms
function topicToUnsplashQuery(topic: string): string {
  const map: Array<[RegExp, string]> = [
    [/賞櫻|櫻花/, 'cherry blossom japan spring'],
    [/日本|東京|大阪|京都/, 'japan travel city'],
    [/台灣|台北|高雄/, 'taiwan city street'],
    [/旅遊|旅行|出發|出國/, 'travel adventure landscape'],
    [/火鍋|拉麵|壽司|美食|吃|料理/, 'food restaurant delicious'],
    [/咖啡|下午茶|甜點/, 'coffee cafe dessert'],
    [/海邊|海灘|沙灘/, 'beach ocean sea'],
    [/山|健行|爬山|登山/, 'mountain hiking nature'],
    [/花|公園|森林/, 'nature flowers park'],
    [/購物|逛街|市場/, 'shopping street market'],
    [/音樂|演唱會|表演/, 'music concert performance'],
    [/寵物|狗|貓/, 'cute pet dog cat'],
    [/運動|健身|跑步/, 'fitness sport exercise'],
    [/工作|辦公|創業/, 'workspace office business'],
    [/夜景|夜市/, 'night city lights'],
  ];

  for (const [pattern, query] of map) {
    if (pattern.test(topic)) return query;
  }

  // Fallback: use the topic text directly (works for English topics)
  return 'lifestyle photography aesthetic';
}

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

    if (process.env.IMAGE_GEN_API_URL && process.env.IMAGE_GEN_API_KEY) {
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
      // Use Unsplash source with topic-relevant keywords + seed for variety
      const query = topicToUnsplashQuery(topic);
      const encodedQuery = encodeURIComponent(query);
      // sig param makes each image request unique (prevents same image for same query)
      const sig = seed + Math.abs(topic.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0));
      imageUrl = `https://source.unsplash.com/${w}x${h}/?${encodedQuery}&sig=${sig}`;
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ imageUrl: 'https://source.unsplash.com/800x800/?nature' });
  }
}
