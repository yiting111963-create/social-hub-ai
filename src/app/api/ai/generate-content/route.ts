import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import type { Platform } from '@/types';

async function generateWithGemini(topic: string, platforms: Platform[]) {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });
  console.log('Calling Gemini, key prefix:', process.env.GOOGLE_GEMINI_API_KEY?.slice(0, 8));

  const platformSpecs = platforms
    .map((p) => {
      switch (p) {
        case 'facebook':
          return `"facebook": { "caption": "繁體中文，200字以內，有故事感，像真人在說話", "hashtags": ["3-5個相關標籤"] }`;
        case 'instagram':
          return `"instagram": { "caption": "繁體中文，120字以內，有個性有溫度，用換行和Emoji讓人想停下來看", "hashtags": ["10-15個標籤，中英文混合"] }`;
        case 'threads':
          return `"threads": { "caption": "繁體中文，80字以內，像在跟朋友聊天，結尾問問題引發互動" }`;
        case 'youtube':
          return `"youtube": { "title": "繁體中文，35字以內，讓人忍不住點進去", "description": "繁體中文，100字以內，描述內容並引導訂閱", "hashtags": ["5個標籤"] }`;
      }
    })
    .join(',\n  ');

  const prompt = `你是台灣人氣社群創作者，擅長寫讓人有共鳴、忍不住按讚的貼文。

主題：「${topic}」

要求：
- 內容必須緊扣主題，不能偏離（例如主題是拉麵就寫拉麵，不要變成旅遊文）
- 用台灣日常說話方式，有情緒和細節，不要廣告感
- 避免：「小確幸」「每一個當下」「值得被記錄」這類過於通用詞彙
- 結尾要有互動感（問問題或呼籲留言）

只回傳 JSON，格式：
{
  ${platformSpecs}
}`;

  // Try models in order — each has its own quota bucket
  const MODELS = ['gemini-1.5-flash-8b', 'gemini-1.5-flash', 'gemini-2.0-flash-lite', 'gemini-2.0-flash'];
  let response;
  let lastErr: unknown;
  for (const model of MODELS) {
    try {
      response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' },
      });
      console.log('Gemini success with model:', model);
      break;
    } catch (e) {
      console.warn(`Model ${model} failed:`, (e as Error).message?.slice(0, 80));
      lastErr = e;
    }
  }
  if (!response) throw lastErr;

  const text = response.text ?? '';
  console.log('Gemini raw response (first 200):', text.slice(0, 200));
  // Strip markdown code fences if present
  const clean = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(clean);
}

// ── Fallback templates (used when no API key or Gemini fails) ──────────────

type Category = 'cherry' | 'food' | 'cafe' | 'travel' | 'night' | 'work' | 'life';

function detectCategory(topic: string): Category {
  // Cherry blossom (most specific first)
  if (/賞櫻|櫻花/.test(topic)) return 'cherry';
  // Food types (before travel — "日本拉麵" is food, not travel)
  if (/拉麵|壽司|火鍋|燒肉|烤肉|壽喜燒|天婦羅|烏龍麵|蕎麥麵/.test(topic)) return 'food';
  if (/咖啡|café|下午茶|甜點|蛋糕|烘焙|馬卡龍|鬆餅/.test(topic)) return 'cafe';
  if (/美食|料理|吃|餐廳|食記|小吃|夜市|好吃|必吃/.test(topic)) return 'food';
  // Travel (after food)
  if (/旅遊|旅行|出發|出國|行程|景點|日本|東京|大阪|京都|台灣|台北|高雄/.test(topic)) return 'travel';
  // Others
  if (/夜景|夜市(?!.*美食)|城市|燈光/.test(topic)) return 'night';
  if (/工作|創業|開店|新品|活動|推出|上市/.test(topic)) return 'work';
  return 'life';
}

function pickVariant<T>(arr: T[], topic: string): T {
  const idx = Math.abs(topic.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % arr.length;
  return arr[idx];
}

interface Templates {
  ig: string[]; igTags: string[][];
  fb: string[]; fbTags: string[][];
  threads: string[];
  ytTitle: string[]; ytDesc: string[]; ytTags: string[][];
}

const TEMPLATES: Record<Category, Templates> = {
  cherry: {
    ig: [
      `🌸 ${'{t}'}\n\n花開就那幾天，所以才美得讓人心疼\n今年終於排到假期，說走就走 ✈️\n\n跟我說你也想去 👇`,
      `🌸 ${'{t}'}\n\n4月的空氣裡都是粉色的⋯⋯\n這輩子一定要在日本看一次夜櫻！你去過了嗎？`,
    ],
    igTags: [
      ['#賞櫻', '#日本旅遊', '#春天', '#cherry_blossom', '#sakura', '#旅遊日記', '#ig旅遊', '#台灣旅遊', '#打卡', '#花季'],
      ['#賞櫻2025', '#日本', '#sakura', '#春季旅遊', '#cherry_blossom', '#旅拍', '#ig台灣', '#旅遊分享', '#出發', '#花見'],
    ],
    fb: [
      `🌸 ${'{t}'}\n\n第一次看到滿開的櫻花真的整個人傻掉，那個粉紅色根本不真實 😭\n\n你有在花期去過日本嗎？留言跟我說哪裡最美！`,
      `每年看別人去賞櫻，今年終於換我了！🌸\n\n${'{t}'} — 光想到就已經興奮到睡不著\n有沒有行家推薦哪個景點必去的？💬`,
    ],
    fbTags: [['#賞櫻'], ['#日本旅遊']],
    threads: [
      `${'{t}'} 🌸\n\n不是說好只去一次嗎⋯⋯怎麼每年都想回去 😂\n大家說，日本賞櫻排名第一的地方是哪裡？`,
      `今年的賞櫻計畫：${'{t}'} ✈️\n\n機票已買，就差有人一起去了——`,
    ],
    ytTitle: [`${'{t}'} 🌸｜這輩子必去一次的花景`, `日本賞櫻全攻略｜${'{t}'}`],
    ytDesc: [
      `${'{t}'}\n\n從訂機票到每日行程全都記錄下來了！\n記得訂閱開鈴鐺 🔔，更多旅遊乾貨持續更新中`,
      `${'{t}'} — 整趟旅程完整記錄，行程規劃、必吃美食、拍照技巧全公開！\n喜歡的話按個讚 ❤️`,
    ],
    ytTags: [['#賞櫻', '#日本旅遊', '#旅遊vlog', '#sakura', '#旅行']],
  },

  food: {
    ig: [
      `🍜 ${'{t}'}\n\n吃一口就知道，這家下週還要再來 😭\n台灣人真的太幸福了，這種東西隨便找都有`,
      `🔥 ${'{t}'}\n\n湯頭喝一口整個靈魂都被暖到！\n這種天氣就是要吃這個，快拉著你的人來 👇`,
    ],
    igTags: [
      ['#台灣美食', '#美食推薦', '#食記', '#ig美食', '#吃貨', '#台灣小吃', '#美食日記', '#好吃', '#必吃', '#foodie'],
      ['#美食', '#食記分享', '#台北美食', '#ig食記', '#foodporn', '#吃貨日記', '#台灣', '#必吃清單', '#美食控', '#food'],
    ],
    fb: [
      `${'{t}'} 🍜\n\n老闆應該要感謝我，因為我決定把這個祕密說出去了 😂\n這家真的太厲害，吃完會想馬上預訂下次\n\n有去過的朋友嗎？一起來討論！`,
      `🔥 ${'{t}'}\n\n冷天氣吃這個根本是人生巔峰！\n已經默默記下來下次要帶誰去了——你們有沒有「必帶朋友去的店」？`,
    ],
    fbTags: [['#美食'], ['#台灣美食']],
    threads: [
      `${'{t}'} 🍜\n\n吃之前：「點這樣夠嗎？」\n吃完後：「再來一份好嗎⋯⋯」\n\n有人跟我一樣嗎 😂`,
      `今天的${'{t}'}讓我重新相信人間值得 🙏\n\n認真，快去，不用謝`,
    ],
    ytTitle: [`${'{t}'}｜好吃到沉默的那種`, `${'{t}'} 老實評測｜值不值得排隊？`],
    ytDesc: [
      `${'{t}'}\n\n這次帶大家去吃讓我回訪三次的店！環境、口味、CP值全部幫你評測好了 🍜\n訂閱頻道，每週都有最新美食探店！`,
      `${'{t}'} — 點了什麼、哪道必吃、哪道略過，這支影片都告訴你！\n喜歡美食內容記得按讚訂閱 ❤️`,
    ],
    ytTags: [['#美食vlog', '#台灣美食', '#食記', '#探店', '#吃貨']],
  },

  cafe: {
    ig: [
      `☕ ${'{t}'}\n\n找到一間讓我願意大老遠跑去的咖啡廳\n光是那個氛圍就已經值回票價了 🤍`,
      `🧋 ${'{t}'}\n\n下午3點，一杯咖啡，什麼都不想——\n這就是我需要的 therapy ✨`,
    ],
    igTags: [
      ['#咖啡', '#咖啡廳', '#下午茶', '#café', '#coffee', '#ig咖啡', '#台灣咖啡', '#咖啡時光', '#打卡', '#咖啡日記'],
      ['#咖啡控', '#下午茶推薦', '#café打卡', '#coffeelovers', '#coffee_shop', '#台北咖啡', '#ig打卡', '#咖啡廳推薦', '#甜點', '#afternoon_tea'],
    ],
    fb: [
      `☕ ${'{t}'}\n\n一個人坐在窗邊、一杯咖啡、一本書——\n有時候最好的約會對象就是自己 😌\n\n你們喜歡一個人出門喝咖啡嗎？`,
      `${'{t}'} — 今天帶大家來這間我已經偷偷去了三次的咖啡廳 ☕\n環境、甜點、咖啡都讓我整個人放鬆下來\n\n喜歡這種風格的朋友快收藏！`,
    ],
    fbTags: [['#咖啡廳'], ['#下午茶']],
    threads: [
      `${'{t}'} ☕\n\n為什麼咖啡廳的椅子坐起來特別舒服，一坐就三小時——`,
      `今天的${'{t}'}讓我暫時忘記所有deadline\n\n這才是週末應有的樣子 🧘`,
    ],
    ytTitle: [`${'{t}'}｜讓我放空一整個下午的咖啡廳`, `${'{t}'} 探店｜隱藏版質感咖啡廳推薦`],
    ytDesc: [
      `${'{t}'}\n\n這間咖啡廳讓我來了就不想走！環境、飲品、甜點全部都有詳細介紹 ☕`,
      `${'{t}'} — 帶你走進這間讓我反覆回訪的咖啡廳，點什麼最值、哪個位置最美都在影片裡！`,
    ],
    ytTags: [['#咖啡廳', '#下午茶', '#café', '#探店', '#台灣咖啡']],
  },

  travel: {
    ig: [
      `✈️ ${'{t}'}\n\n行李箱還沒關上，心已經飛過去了 🫠\n每次出發前的那種期待感——有人懂嗎？`,
      `🗺️ ${'{t}'}\n\n這次說什麼都要把每個角落都走到！\n你有沒有「非去不可」的私房景點推薦？👇`,
    ],
    igTags: [
      ['#旅遊', '#旅行日記', '#出發', '#ig旅遊', '#旅拍', '#台灣旅遊', '#打卡景點', '#旅遊分享', '#旅人', '#wanderlust'],
      ['#旅遊日記', '#旅行', '#ig打卡', '#出遊', '#旅拍', '#旅遊推薦', '#跟我去旅行', '#行程分享', '#旅遊控', '#travel'],
    ],
    fb: [
      `✈️ ${'{t}'}\n\n行程排了三個月，終於要成行了！\n最期待的環節是美食，第二期待的還是美食 😂\n\n有去過的朋友，有什麼一定要吃的嗎？`,
      `${'{t}'} — 說了很久終於成真的旅行 🎒\n每次出發前都覺得「好麻煩」，但到了之後就完全後悔沒早點去\n\n你最近有什麼旅遊計畫嗎？`,
    ],
    fbTags: [['#旅遊'], ['#旅行']],
    threads: [
      `${'{t}'} ✈️\n\n旅行最快樂的時刻，不是在景點拍照，是在路邊亂吃東西——你同意嗎？`,
      `剛訂好${'{t}'}的機票，人已飄了 🫠\n\n每次出發前的那種焦慮又期待，有沒有人懂？`,
    ],
    ytTitle: [`${'{t}'}｜跟我去這趟說走就走的旅行`, `${'{t}'} 完整vlog｜行程、美食、踩雷全紀錄`],
    ytDesc: [
      `${'{t}'}\n\n這次旅行的所有行程、住宿、必吃美食和踩雷地雷，都在這支影片裡！\n喜歡旅遊內容的朋友記得訂閱 🔔`,
      `${'{t}'} — 完整記錄這趟旅程的每個精彩瞬間 ❤️`,
    ],
    ytTags: [['#旅遊vlog', '#旅行', '#vlog', '#旅遊日記', '#台灣youtuber']],
  },

  night: {
    ig: [
      `🌃 ${'{t}'}\n\n這個城市入夜之後才開始它最美的樣子\n有些風景只屬於捨不得回家的人 ✨`,
      `🌙 ${'{t}'}\n\n夜晚的空氣跟白天完全不一樣\n喜歡在燈光裡迷路的感覺 🫶`,
    ],
    igTags: [
      ['#夜景', '#城市', '#夜拍', '#台灣', '#ig夜景', '#城市攝影', '#夜晚', '#燈光', '#打卡', '#攝影'],
      ['#夜景攝影', '#台北夜景', '#citylights', '#nightphotography', '#夜間散步', '#ig台灣', '#城市漫遊', '#街拍', '#夜市', '#night'],
    ],
    fb: [
      `🌃 ${'{t}'}\n\n有時候需要一個人在城市裡走走，讓腦袋放空一下\n夜晚的燈光有種莫名的治癒感\n\n你們喜歡夜晚出門嗎？`,
      `${'{t}'} — 這個夜景已經被我收進最喜歡的口袋名單裡了 🌃`,
    ],
    fbTags: [['#夜景'], ['#城市']],
    threads: [
      `${'{t}'} 🌙\n\n夜晚出門的理由：「只是去透透氣」\n回家時間：凌晨兩點\n\n這個循環是不是很熟悉 😂`,
      `喜歡${'{t}'}的夜晚勝過任何白天的風景——有人懂嗎？`,
    ],
    ytTitle: [`${'{t}'}｜讓你愛上這個城市的夜晚`, `${'{t}'} 夜間漫步｜找到最美的那個角度`],
    ytDesc: [`${'{t}'}\n\n帶你去我最喜歡的夜景地點，拍攝角度、最佳時間點全都分享給你！🌃`, `${'{t}'} — 城市入夜後才是最美的時候。`],
    ytTags: [['#夜景', '#城市攝影', '#vlog', '#台灣', '#夜拍']],
  },

  work: {
    ig: [
      `🎉 ${'{t}'}\n\n準備了好久，終於可以跟大家說了！\n這次真的很期待大家的反應 👀`,
      `💪 ${'{t}'}\n\n每一個開始都需要勇氣，這件事我想了很久才決定\n感謝一路支持我的你們 🙏`,
    ],
    igTags: [
      ['#創業', '#台灣', '#新品', '#分享', '#ig台灣', '#生活', '#打卡', '#品牌', '#推薦', '#開心'],
      ['#創業日記', '#品牌故事', '#新品發布', '#台灣品牌', '#ig分享', '#努力', '#夢想', '#堅持', '#生活', '#日常'],
    ],
    fb: [
      `🎉 ${'{t}'}\n\n這件事我們準備了很久，今天終於可以跟大家宣布了！\n謝謝一直以來支持我們的每一個人 💪\n\n有任何問題都歡迎留言問我！`,
      `${'{t}'} — 好消息來了！\n\n很多人問我什麼時候會有這個，答案就是：現在 🙌`,
    ],
    fbTags: [['#創業'], ['#台灣品牌']],
    threads: [
      `${'{t}'} 🎉\n\n說了好久「快了快了」，現在真的來了\n\n大家準備好了嗎？`,
      `宣布一件事：${'{t}'}\n\n做這個決定前想了很久，但現在超開心做了 💪`,
    ],
    ytTitle: [`${'{t}'}｜我們終於做到了`, `${'{t}'} 完整幕後｜從零開始的故事`],
    ytDesc: [`${'{t}'}\n\n這支影片完整記錄了整個過程——謝謝你們的支持！🙏`, `${'{t}'} — 幕後的故事比結果更值得被看見 ❤️`],
    ytTags: [['#創業', '#vlog', '#台灣youtuber', '#品牌', '#幕後']],
  },

  life: {
    ig: [
      `✨ ${'{t}'}\n\n有些事情不說出來會後悔\n所以我決定把它記錄下來 📱`,
      `🌿 ${'{t}'}\n\n生活裡的這些片段，回頭看的時候總是最珍貴的\n你今天有好好記錄了嗎？`,
    ],
    igTags: [
      ['#生活日常', '#台灣', '#日常', '#ig台灣', '#分享', '#生活', '#記錄', '#打卡', '#日記', '#life'],
      ['#生活風格', '#日常記錄', '#ig分享', '#台灣生活', '#日常vlog', '#生活美學', '#慢活', '#每日', '#lifestyle', '#日記'],
    ],
    fb: [
      `${'{t}'} ✨\n\n有時候最平凡的事，說出來之後會發現很多人都有同感\n\n你有沒有類似的經驗？歡迎留言 👇`,
      `想跟大家分享一件事：${'{t}'}\n\n不一定是什麼大事，但就是想記錄下來 📝\n你有在記錄自己的生活嗎？`,
    ],
    fbTags: [['#生活'], ['#日常']],
    threads: [
      `${'{t}'} ✨\n\n這件事讓我今天心情變好了，分享給你\n\n你呢？今天有什麼讓你開心的事嗎？`,
      `${'{t}'}\n\n說出來感覺輕鬆很多——有時候就是需要這樣 😮‍💨`,
    ],
    ytTitle: [`${'{t}'}｜真實記錄我的日常`, `${'{t}'} | 這週發生了這些事`],
    ytDesc: [`${'{t}'}\n\n這次把日常完整記錄下來，沒有濾鏡只有真實 🙏`, `${'{t}'} — 生活就是這樣，記錄下來才知道有多值得 ❤️`],
    ytTags: [['#日常vlog', '#生活', '#vlog', '#台灣', '#日記']],
  },
};

function applyTopic(template: string, topic: string): string {
  return template.replace(/\{t\}/g, topic);
}

function generateFallbackContent(topic: string, platforms: Platform[]) {
  const cat = detectCategory(topic);
  const t = TEMPLATES[cat];
  const content: Record<string, unknown> = {};

  for (const platform of platforms) {
    switch (platform) {
      case 'instagram':
        content.instagram = {
          caption: applyTopic(pickVariant(t.ig, topic), topic),
          hashtags: pickVariant(t.igTags, topic),
        };
        break;
      case 'facebook':
        content.facebook = {
          caption: applyTopic(pickVariant(t.fb, topic), topic),
          hashtags: pickVariant(t.fbTags, topic),
        };
        break;
      case 'threads':
        content.threads = { caption: applyTopic(pickVariant(t.threads, topic), topic) };
        break;
      case 'youtube':
        content.youtube = {
          title: applyTopic(pickVariant(t.ytTitle, topic), topic),
          description: applyTopic(pickVariant(t.ytDesc, topic), topic),
          hashtags: pickVariant(t.ytTags, topic),
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

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    const isRealKey = apiKey && apiKey !== 'placeholder_gemini_key' && apiKey.length > 10;

    if (isRealKey) {
      try {
        const variants = await generateWithGemini(topic, platforms);
        return NextResponse.json({ postId: randomUUID(), variants, _ai: true });
      } catch (aiError) {
        const msg = aiError instanceof Error ? aiError.message : String(aiError);
        return NextResponse.json({ postId: randomUUID(), variants: generateFallbackContent(topic, platforms), _ai_error: msg });
      }
    }

    return NextResponse.json({ postId: randomUUID(), variants: generateFallbackContent(topic, platforms), _ai: false, _key: !!apiKey });
  } catch (error) {
    console.error('Generate content error:', error);
    return NextResponse.json({ error: '內容生成失敗，請再試一次' }, { status: 500 });
  }
}
