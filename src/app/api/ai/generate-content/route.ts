import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import type { Platform } from '@/types';

async function generateWithGemini(topic: string, platforms: Platform[]) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const platformSpecs = platforms
    .map((p) => {
      switch (p) {
        case 'facebook':
          return `"facebook": {"caption": "繁體中文，300字以內，親切有趣", "hashtags": ["繁中或英文標籤"]}`;
        case 'instagram':
          return `"instagram": {"caption": "繁體中文，200字以內，有換行和表情符號", "hashtags": ["10-15個標籤"]}`;
        case 'threads':
          return `"threads": {"caption": "繁體中文，150字以內，對話感強"}`;
        case 'youtube':
          return `"youtube": {"title": "繁體中文，50字以內，吸睛標題", "description": "繁體中文，150字以內", "hashtags": ["標籤"]}`;
      }
    })
    .join(', ');

  const prompt = `你是一位台灣社群媒體創作者，請用繁體中文（台灣用語）為以下主題創作社群內容。
語氣：親切、溫暖，適度使用 Emoji，符合台灣年輕人的說話方式。
重要：內容必須緊扣主題，不要使用通用模板文字。

主題：「${topic}」

請只回傳以下 JSON（只包含指定的平台）：
{${platformSpecs}}`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });

  return JSON.parse(result.response.text());
}

// Detect topic category and return relevant template phrases
function detectCategory(topic: string): {
  emoji: string;
  igBody: string;
  fbBody: string;
  threadsBody: string;
  ytSuffix: string;
} {
  const t = topic;

  // Travel / Japan / cherry blossom
  if (/日本|東京|大阪|京都|賞櫻|旅遊|旅行|出發|出國|機票|行程/.test(t)) {
    return {
      emoji: '✈️',
      igBody: `行程終於排好了！\n每次出發前都超興奮，這次一定要好好記錄每個瞬間 📸\n\n喜歡旅遊的朋友快收藏這篇！`,
      fbBody: `終於要出發了！計畫了好久的行程，期待指數直接破表 🙌\n大家有沒有推薦的景點？留言告訴我！`,
      threadsBody: `準備出發了！大家有沒有去過？給我一些建議吧 🙋`,
      ytSuffix: `｜你一定要看！`,
    };
  }

  // Food / restaurant / eat
  if (/美食|吃|料理|火鍋|拉麵|壽司|甜點|咖啡|餐廳|食記|好吃|推薦/.test(t)) {
    return {
      emoji: '🍜',
      igBody: `這家真的太厲害了！\n每一口都讓人回味無窮，來台灣必吃清單又多了一項 😋\n\n吃貨朋友快存起來！`,
      fbBody: `吃到這個真的超滿足！已經打算下週再去了 😂\n有去過的朋友嗎？一起來分享心得吧！`,
      threadsBody: `說真的這個真的好吃到不像話，推爆！大家快去 👇`,
      ytSuffix: `｜必吃推薦！`,
    };
  }

  // Life / daily
  if (/生活|日常|今天|分享|感受|心情|發現|試試|體驗/.test(t)) {
    return {
      emoji: '🌿',
      igBody: `生活裡的小確幸，最值得被記錄 🌸\n把這些平凡又珍貴的時刻留下來，是我最喜歡做的事。`,
      fbBody: `生活中的小事，有時候最打動人心。\n希望你看到這篇也能會心一笑 😊`,
      threadsBody: `分享一下今天的小確幸，希望你看了也開心 🌸`,
      ytSuffix: `｜日常vlog`,
    };
  }

  // Work / business / product
  if (/店|生意|開幕|活動|推出|新品|優惠|促銷|工作/.test(t)) {
    return {
      emoji: '🎉',
      igBody: `大家久等了！📣\n這次真的拿出了全力，希望大家會喜歡 💪\n\n快來看看我們準備了什麼！`,
      fbBody: `重磅消息來了！這次我們準備了很多驚喜，歡迎大家來看看 👀`,
      threadsBody: `好消息！這次終於推出了，快來看 👇`,
      ytSuffix: `｜完整介紹`,
    };
  }

  // Default
  return {
    emoji: '✨',
    igBody: `每一個值得分享的瞬間，都有它獨特的故事 💛\n把最真實的感受留給每一個看到這裡的你。`,
    fbBody: `今天想跟大家分享這件事，希望你們喜歡！\n有共鳴的朋友歡迎留言交流 👇`,
    threadsBody: `想分享一下這個，你們覺得呢？🤔`,
    ytSuffix: `｜完整版`,
  };
}

function generateFallbackContent(topic: string, platforms: Platform[]) {
  const content: Record<string, unknown> = {};
  const shortTopic = topic.length > 30 ? topic.substring(0, 28) + '...' : topic;
  const cat = detectCategory(topic);

  for (const platform of platforms) {
    switch (platform) {
      case 'instagram':
        content.instagram = {
          caption: `${cat.emoji} ${topic}\n\n${cat.igBody}\n\n追蹤我獲得更多 🙏`,
          hashtags: [
            '#台灣',
            '#生活日常',
            '#日常分享',
            '#ig台灣',
            '#精選',
            '#打卡',
            '#推薦',
            '#生活風格',
            '#分享',
            '#記錄',
          ],
        };
        break;
      case 'facebook':
        content.facebook = {
          caption: `${cat.emoji} ${topic}\n\n${cat.fbBody}\n\n記得按讚追蹤，獲取更多最新資訊！`,
          hashtags: ['#台灣', '#分享', '#推薦'],
        };
        break;
      case 'threads':
        content.threads = {
          caption: `${topic} ${cat.emoji}\n\n${cat.threadsBody}`,
        };
        break;
      case 'youtube':
        content.youtube = {
          title: `${shortTopic} 🔥${cat.ytSuffix}`,
          description: `${topic}\n\n完整影片都在這裡！記得按讚、留言、訂閱，開啟小鈴鐺 🔔\n\n${cat.igBody}`,
          hashtags: ['#youtube', '#台灣youtuber', '#推薦', '#vlog'],
        };
        break;
    }
  }

  return content;
}

export async function POST(req: NextRequest) {
  try {
    const { topic, platforms } = await req.json();

    if (!topic?.trim() || !platforms?.length) {
      return NextResponse.json({ error: '請輸入主題並選擇平台' }, { status: 400 });
    }

    let variants: Record<string, unknown>;
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    const isRealKey = apiKey && apiKey !== 'placeholder_gemini_key' && apiKey.length > 10;

    if (isRealKey) {
      try {
        variants = await generateWithGemini(topic, platforms);
      } catch (aiError) {
        console.warn('Gemini API error, using fallback:', aiError);
        variants = generateFallbackContent(topic, platforms);
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      variants = generateFallbackContent(topic, platforms);
    }

    return NextResponse.json({ postId: randomUUID(), variants });
  } catch (error) {
    console.error('Generate content error:', error);
    return NextResponse.json({ error: '內容生成失敗，請再試一次' }, { status: 500 });
  }
}
