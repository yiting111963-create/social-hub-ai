import { NextRequest, NextResponse } from 'next/server';

function topicToKeywords(topic: string): string {
  const map: Array<[RegExp, string]> = [
    [/賞櫻|櫻花/, 'cherry-blossom,spring,japan'],
    [/日本|東京|大阪|京都/, 'japan,travel,street'],
    [/台灣|台北|高雄|夜市/, 'taiwan,street,night'],
    [/旅遊|旅行|出發|出國|行程/, 'travel,landscape,adventure'],
    [/火鍋/, 'hotpot,food,restaurant'],
    [/拉麵|壽司|日式/, 'japanese-food,ramen,noodles'],
    [/咖啡|café|下午茶/, 'coffee,cafe,latte'],
    [/甜點|蛋糕|烘焙/, 'dessert,cake,sweets'],
    [/美食|吃|料理|餐廳/, 'food,meal,delicious'],
    [/海邊|海灘|沙灘/, 'beach,ocean,sea'],
    [/山|健行|爬山|登山/, 'mountain,hiking,nature'],
    [/花|公園|森林/, 'flowers,park,nature'],
    [/購物|逛街|市場/, 'shopping,street,market'],
    [/音樂|演唱會|表演/, 'music,concert,live'],
    [/寵物|狗|貓/, 'pet,dog,cat'],
    [/運動|健身|跑步/, 'fitness,sport,gym'],
    [/工作|辦公|創業/, 'workspace,office,desk'],
    [/夜景|城市/, 'cityscape,night,lights'],
    [/婚禮|婚紗/, 'wedding,bride,romance'],
    [/家|室內|裝潢/, 'interior,home,cozy'],
  ];

  for (const [pattern, keywords] of map) {
    if (pattern.test(topic)) return keywords;
  }
  return 'lifestyle,photography,aesthetic';
}

export async function POST(req: NextRequest) {
  try {
    const { topic, aspectRatio = '1:1', seed = 0 } = await req.json();

    const dimensions: Record<string, { w: number; h: number }> = {
      '1:1':  { w: 800, h: 800 },
      '16:9': { w: 1280, h: 720 },
      '4:5':  { w: 800, h: 1000 },
    };
    const { w, h } = dimensions[aspectRatio] ?? dimensions['1:1'];

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
      // loremflickr.com: reliable, free, keyword-based, no API key needed
      const keywords = topicToKeywords(topic);
      const lock = seed + Math.abs(
        topic.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0)
      );
      imageUrl = `https://loremflickr.com/${w}/${h}/${keywords}/lock/${lock}`;
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ imageUrl: 'https://loremflickr.com/800/800/lifestyle' });
  }
}
