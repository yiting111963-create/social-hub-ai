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

主題：「${topic}」

請只回傳以下 JSON（只包含指定的平台）：
{${platformSpecs}}`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });

  return JSON.parse(result.response.text());
}

function generateFallbackContent(topic: string, platforms: Platform[]) {
  const content: Record<string, unknown> = {};
  const shortTopic = topic.length > 40 ? topic.substring(0, 38) + '...' : topic;

  for (const platform of platforms) {
    switch (platform) {
      case 'instagram':
        content.instagram = {
          caption: `✨ ${topic}\n\n每一個當下都值得被記錄下來！\n無論是生活中的小確幸，還是讓你印象深刻的瞬間，都是值得分享的故事 💛\n\n喜歡的話記得收藏起來！📌\n追蹤我們獲得更多日常靈感 🙏`,
          hashtags: [
            '#生活日常',
            '#台灣',
            '#日常分享',
            '#生活風格',
            '#精選',
            '#打卡',
            '#ig台灣',
            '#生活記錄',
            '#日常',
            '#分享',
          ],
        };
        break;
      case 'facebook':
        content.facebook = {
          caption: `🔥 ${topic}\n\n這個真的太值得分享給大家了！你們有沒有類似的經驗呢？\n留言告訴我你的想法 👇\n\n記得按讚追蹤，獲取更多最新資訊！`,
          hashtags: ['#生活', '#分享', '#台灣'],
        };
        break;
      case 'threads':
        content.threads = {
          caption: `${topic} ✨\n\n這種感覺真的太棒了，忍不住想分享給大家！你們覺得呢？🤔`,
        };
        break;
      case 'youtube':
        content.youtube = {
          title: `${shortTopic} 🔥｜你一定要看！`,
          description: `${topic}\n\n完整影片都在這裡！記得按讚、留言、訂閱，開啟小鈴鐺獲得最新通知 🔔`,
          hashtags: ['#youtube', '#台灣youtuber', '#推薦', '#shorts'],
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
      await new Promise((resolve) => setTimeout(resolve, 1800));
      variants = generateFallbackContent(topic, platforms);
    }

    return NextResponse.json({ postId: randomUUID(), variants });
  } catch (error) {
    console.error('Generate content error:', error);
    return NextResponse.json({ error: '內容生成失敗，請再試一次' }, { status: 500 });
  }
}
