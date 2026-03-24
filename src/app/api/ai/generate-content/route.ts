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
          return `"facebook": {"caption": "繁體中文，300字以內，親切有趣，有故事感", "hashtags": ["3-5個相關標籤"]}`;
        case 'instagram':
          return `"instagram": {"caption": "繁體中文，150字以內，有個性有溫度，善用換行和Emoji讓人停下來看", "hashtags": ["10-15個標籤，混合中英文"]}`;
        case 'threads':
          return `"threads": {"caption": "繁體中文，100字以內，像在跟朋友聊天，直接說重點，結尾可以問問題引發互動"}`;
        case 'youtube':
          return `"youtube": {"title": "繁體中文，40字以內，讓人忍不住點進去的標題", "description": "繁體中文，描述影片內容，引導訂閱，150字以內", "hashtags": ["5個標籤"]}`;
      }
    })
    .join(', ');

  const prompt = `你是一位在台灣很受歡迎的社群媒體創作者，擅長寫出讓人有共鳴、忍不住按讚的貼文。

請根據以下主題，用繁體中文（台灣日常用語）為各平台創作內容。
要求：
- 有真實感，像真人在說話，不要像廣告稿
- 加入情緒和細節，讓讀者有畫面
- 結尾有互動感（問問題、號召行動）
- 不要用「小確幸」「無論是」「都是值得」這類過於通用的詞

主題：「${topic}」

只回傳 JSON：{${platformSpecs}}`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });

  return JSON.parse(result.response.text());
}

type Category = 'travel' | 'food' | 'cherry' | 'night' | 'cafe' | 'life' | 'work';

function detectCategory(topic: string): Category {
  if (/賞櫻|櫻花/.test(topic)) return 'cherry';
  if (/旅遊|旅行|出發|出國|日本|東京|京都|大阪|台灣|台北/.test(topic)) return 'travel';
  if (/火鍋|拉麵|壽司|美食|吃|料理|餐廳|小吃|夜市/.test(topic)) return 'food';
  if (/咖啡|café|下午茶|甜點|蛋糕/.test(topic)) return 'cafe';
  if (/夜景|夜市|城市|燈光/.test(topic)) return 'night';
  if (/工作|創業|開店|新品|活動|推出/.test(topic)) return 'work';
  return 'life';
}

// Multiple variants per category — pick by topic hash to keep deterministic
function pickVariant<T>(arr: T[], topic: string): T {
  const idx = Math.abs(topic.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % arr.length;
  return arr[idx];
}

function buildCaption(topic: string): {
  ig: string; igTags: string[];
  fb: string; fbTags: string[];
  threads: string;
  ytTitle: string; ytDesc: string; ytTags: string[];
} {
  const cat = detectCategory(topic);

  const templates: Record<Category, {
    ig: string[]; igTags: string[][];
    fb: string[]; fbTags: string[][];
    threads: string[];
    ytTitle: string[]; ytDesc: string[]; ytTags: string[][];
  }> = {
    cherry: {
      ig: [
        `🌸 ${topic}\n\n4月的空氣裡都是粉色的⋯⋯\n這輩子一定要在日本賞一次夜櫻！你去過了嗎？✨`,
        `🌸 ${topic}\n\n花開就那幾天，所以才美得讓人心疼\n今年終於排到假期，說走就走 ✈️\n\n跟我說你也想去 👇`,
      ],
      igTags: [
        ['#賞櫻', '#日本旅遊', '#春天', '#cherry_blossom', '#sakura', '#旅遊日記', '#ig旅遊', '#台灣旅遊', '#打卡', '#花季'],
        ['#賞櫻2025', '#日本', '#sakura', '#春季旅遊', '#cherry_blossom', '#旅拍', '#ig台灣', '#旅遊分享', '#出發', '#花見'],
      ],
      fb: [
        `🌸 ${topic}\n\n終於等到這一年一度的花季！\n第一次看到滿開的櫻花真的整個人傻掉，那個粉紅色根本不真實 😭\n\n你有在花期去過日本嗎？留言跟我說哪裡最美！`,
        `每年看別人去賞櫻，今年終於換我了！🌸\n\n${topic} — 光想到就已經興奮到睡不著\n有沒有行家推薦哪個景點必去的？💬`,
      ],
      fbTags: [['#賞櫻'], ['#日本旅遊']],
      threads: [
        `${topic} 🌸\n\n不是說好只去一次嗎⋯⋯怎麼每年都想回去 😂\n大家說，日本賞櫻排名第一的地方是哪裡？`,
        `今年的賞櫻計畫：${topic} ✈️\n\n機票已買，就差有人一起去了——`,
      ],
      ytTitle: [
        `${topic} 🌸｜這輩子必去一次的花景`,
        `日本賞櫻全攻略｜${topic}`,
      ],
      ytDesc: [
        `${topic}\n\n從訂機票到每日行程全都記錄下來了，花季去日本到底要怎麼玩才不虧？這支影片都有！\n\n記得訂閱開鈴鐺 🔔，更多旅遊乾貨持續更新中`,
        `${topic} — 花季限定的浪漫，只有親眼見過才知道有多美。\n\n這次把整趟旅程都拍下來了，行程規劃、必吃美食、拍照技巧全公開！\n\n喜歡的話按個讚，幫我讓更多人看到 ❤️`,
      ],
      ytTags: [['#賞櫻', '#日本旅遊', '#旅遊vlog', '#sakura', '#旅行']],
    },

    travel: {
      ig: [
        `✈️ ${topic}\n\n行李箱還沒關上，心已經飛過去了 🫠\n每次出發前的那種期待感——有人懂嗎？`,
        `🗺️ ${topic}\n\n這次說什麼都要把每個角落都走到！\n你有沒有「非去不可」的私房景點推薦？👇`,
      ],
      igTags: [
        ['#旅遊', '#旅行日記', '#出發', '#ig旅遊', '#旅拍', '#台灣旅遊', '#打卡景點', '#旅遊分享', '#旅人', '#wanderlust'],
        ['#旅遊日記', '#旅行', '#ig打卡', '#出遊', '#旅拍', '#旅遊推薦', '#跟我去旅行', '#行程分享', '#旅遊控', '#travel'],
      ],
      fb: [
        `✈️ ${topic}\n\n行程排了三個月，終於要成行了！\n最期待的環節是美食，第二期待的還是美食 😂\n\n有去過的朋友，有什麼一定要吃的嗎？`,
        `${topic} — 這趟是說了很久終於成真的旅行 🎒\n\n每次出發前都覺得「好麻煩」，但到了之後就完全後悔沒有早點去\n\n你最近有什麼旅遊計畫嗎？`,
      ],
      fbTags: [['#旅遊'], ['#旅行']],
      threads: [
        `${topic} ✈️\n\n旅行最快樂的時刻，不是在景點拍照，是在路邊亂吃東西——你同意嗎？`,
        `剛訂好${topic}的機票，人已飄了 🫠\n\n每次出發前的那種焦慮又期待的感覺，有沒有人懂？`,
      ],
      ytTitle: [
        `${topic}｜跟我去這趟說走就走的旅行`,
        `${topic} 完整vlog｜行程、美食、踩雷全紀錄`,
      ],
      ytDesc: [
        `${topic}\n\n這次旅行的所有行程、住宿選擇、必吃美食和踩雷地雷，都在這支影片裡了！\n\n喜歡旅遊內容的朋友記得訂閱 🔔`,
        `${topic} — 完整記錄這趟旅程的每個精彩瞬間。\n\n有任何問題歡迎留言，我會一一回覆！❤️`,
      ],
      ytTags: [['#旅遊vlog', '#旅行', '#vlog', '#旅遊日記', '#台灣youtuber']],
    },

    food: {
      ig: [
        `🍜 ${topic}\n\n吃一口就知道，這家下週還要再來 😭\n台灣美食真的是我留在這裡最大的理由`,
        `🔥 ${topic}\n\n湯頭喝一口整個靈魂都被暖到！\n這種天氣就是要吃這個，快拉著你的人來 👇`,
      ],
      igTags: [
        ['#台灣美食', '#美食推薦', '#食記', '#ig美食', '#吃貨', '#台灣小吃', '#美食日記', '#好吃', '#必吃', '#foodie'],
        ['#美食', '#食記分享', '#台北美食', '#ig食記', '#foodporn', '#吃貨日記', '#台灣', '#必吃清單', '#美食控', '#food'],
      ],
      fb: [
        `${topic} 🍜\n\n老闆應該要感謝我，因為我決定把這個祕密說出去了 😂\n這家真的太厲害，吃完會想馬上打電話預訂下次\n\n有沒有人去過？一起來討論！`,
        `🔥 ${topic}\n\n冷天氣吃這個根本是人生巔峰\n已經默默記下來下次要帶誰去了——你們有沒有這種「必帶朋友去的店」？`,
      ],
      fbTags: [['#美食'], ['#台灣美食']],
      threads: [
        `${topic} 🍜\n\n吃之前：「點這樣夠嗎？」\n吃完後：「再來一份好嗎⋯⋯」\n\n有人跟我一樣嗎😂`,
        `今天的${topic}讓我重新相信人間值得 🙏\n\n認真，快去`,
      ],
      ytTitle: [
        `${topic}｜好吃到沉默的那種`,
        `${topic} 老實評測｜值不值得排隊？`,
      ],
      ytDesc: [
        `${topic}\n\n這次帶大家去吃這間讓我回訪三次的店！環境、口味、CP值全部幫你評測好了 🍜\n\n訂閱頻道，每週都有最新美食探店！`,
        `${topic} 完整探店紀錄——點了什麼、哪道必吃、哪道略過，這支影片都告訴你！\n\n喜歡美食內容記得按讚訂閱 ❤️`,
      ],
      ytTags: [['#美食vlog', '#台灣美食', '#食記', '#探店', '#吃貨']],
    },

    cafe: {
      ig: [
        `☕ ${topic}\n\n找到一間讓我願意大老遠跑去的咖啡廳\n光是那個氛圍就已經值回票價了 🤍`,
        `🧋 ${topic}\n\n下午3點，一杯咖啡，什麼都不想——\n這就是我需要的 therapy ✨`,
      ],
      igTags: [
        ['#咖啡', '#咖啡廳', '#下午茶', '#café', '#coffee', '#ig咖啡', '#台灣咖啡', '#咖啡時光', '#打卡', '#咖啡日記'],
        ['#咖啡控', '#下午茶推薦', '#café打卡', '#coffeelovers', '#coffee_shop', '#台北咖啡', '#ig打卡', '#咖啡廳推薦', '#甜點', '#afternoon_tea'],
      ],
      fb: [
        `☕ ${topic}\n\n一個人坐在窗邊、一杯咖啡、一本書——\n有時候最好的約會對象就是自己 😌\n\n你們喜歡一個人出門喝咖啡嗎？`,
        `${topic} — 今天帶大家來這間我已經偷偷去了三次的咖啡廳 ☕\n環境、甜點、咖啡都讓我整個人放鬆下來\n\n喜歡這種風格的朋友快收藏！`,
      ],
      fbTags: [['#咖啡廳'], ['#下午茶']],
      threads: [
        `${topic} ☕\n\n為什麼咖啡廳的椅子坐起來特別舒服，一坐就三小時——`,
        `今天的${topic}讓我暫時忘記所有deadline\n\n這才是週末應有的樣子 🧘`,
      ],
      ytTitle: [
        `${topic}｜讓我放空一整個下午的咖啡廳`,
        `${topic} 探店｜隱藏版質感咖啡廳推薦`,
      ],
      ytDesc: [
        `${topic}\n\n這間咖啡廳讓我來了就不想走，環境、飲品、甜點全部都有詳細介紹！\n喜歡咖啡廳探店內容記得訂閱 ☕`,
        `${topic} — 帶你走進這間讓我反覆回訪的咖啡廳，點什麼最值、哪個位置最美都在影片裡！`,
      ],
      ytTags: [['#咖啡廳', '#下午茶', '#café', '#探店', '#台灣咖啡']],
    },

    night: {
      ig: [
        `🌃 ${topic}\n\n這個城市入夜之後才開始它最美的樣子\n有些風景只屬於捨不得回家的人 ✨`,
        `🌙 ${topic}\n\n夜晚的空氣跟白天完全不一樣\n喜歡在燈光裡迷路的感覺 🫶`,
      ],
      igTags: [
        ['#夜景', '#城市', '#夜拍', '#台灣', '#ig夜景', '#城市攝影', '#夜晚', '#燈光', '#打卡', '#攝影'],
        ['#夜景攝影', '#台北夜景', '#citylights', '#nightphotography', '#夜間散步', '#ig台灣', '#城市漫遊', '#街拍', '#夜市', '#night'],
      ],
      fb: [
        `🌃 ${topic}\n\n有時候需要一個人在城市裡走走，讓腦袋放空一下\n夜晚的燈光有種莫名的治癒感\n\n你們喜歡夜晚出門嗎？`,
        `${topic} — 這個夜景已經被我收進最喜歡的口袋名單裡了 🌃\n\n台灣的夜晚真的太美，每次看都還是會覺得感動`,
      ],
      fbTags: [['#夜景'], ['#城市']],
      threads: [
        `${topic} 🌙\n\n夜晚出門的理由：「只是去透透氣」\n回家時間：凌晨兩點\n\n這個循環是不是很熟悉😂`,
        `喜歡${topic}的夜晚勝過任何白天的風景——有人懂嗎？`,
      ],
      ytTitle: [
        `${topic}｜讓你愛上這個城市的夜晚`,
        `${topic} 夜間漫步｜找到最美的那個角度`,
      ],
      ytDesc: [
        `${topic}\n\n帶你去我最喜歡的夜景地點，拍攝角度、最佳時間點全都分享給你！\n喜歡城市攝影的朋友記得訂閱 🌃`,
        `${topic} — 城市入夜後才是最美的時候，這次完整記錄下來分享給你。`,
      ],
      ytTags: [['#夜景', '#城市攝影', '#vlog', '#台灣', '#夜拍']],
    },

    work: {
      ig: [
        `🎉 ${topic}\n\n準備了好久，終於可以跟大家說了！\n這次真的很期待大家的反應 👀`,
        `💪 ${topic}\n\n每一個開始都需要勇氣，這件事我想了很久才決定\n感謝一路支持我的你們 🙏`,
      ],
      igTags: [
        ['#創業', '#台灣', '#新品', '#分享', '#ig台灣', '#生活', '#打卡', '#品牌', '#推薦', '#開心'],
        ['#創業日記', '#品牌故事', '#新品發布', '#台灣品牌', '#ig分享', '#努力', '#夢想', '#堅持', '#生活', '#日常'],
      ],
      fb: [
        `🎉 ${topic}\n\n這件事我們準備了很久，今天終於可以跟大家宣布了！\n謝謝一直以來支持我們的每一個人，你們是最大的動力 💪\n\n有任何問題都歡迎留言問我！`,
        `${topic} — 好消息來了！\n\n很多人問我什麼時候會有這個，答案就是：現在 🙌\n歡迎大家來看看，有問題都可以留言`,
      ],
      fbTags: [['#創業'], ['#台灣品牌']],
      threads: [
        `${topic} 🎉\n\n說了好久「快了快了」，現在真的來了\n\n大家準備好了嗎？`,
        `宣布一件事：${topic}\n\n做這個決定前想了很久，但現在超開心做了 💪`,
      ],
      ytTitle: [
        `${topic}｜我們終於做到了`,
        `${topic} 完整幕後｜從零開始的故事`,
      ],
      ytDesc: [
        `${topic}\n\n這支影片完整記錄了整個過程，從最初的想法到現在——謝謝你們的支持！\n喜歡的話記得訂閱讓我繼續分享 🙏`,
        `${topic} — 幕後的故事比結果更值得被看見。\n\n有任何問題歡迎留言，我都會回！❤️`,
      ],
      ytTags: [['#創業', '#vlog', '#台灣youtuber', '#品牌', '#幕後']],
    },

    life: {
      ig: [
        `✨ ${topic}\n\n有些事情不說出來會後悔\n所以我決定把它記錄下來 📱`,
        `🌿 ${topic}\n\n生活裡的這些片段，回頭看的時候總是最珍貴的\n你今天有好好記錄了嗎？`,
      ],
      igTags: [
        ['#生活日常', '#台灣', '#日常', '#ig台灣', '#分享', '#生活', '#記錄', '#打卡', '#日記', '#life'],
        ['#生活風格', '#日常記錄', '#ig分享', '#台灣生活', '#日常vlog', '#生活美學', '#慢活', '#每日', '#lifestyle', '#日記'],
      ],
      fb: [
        `${topic} ✨\n\n有時候最平凡的事，說出來之後會發現很多人都有同感\n\n你有沒有類似的經驗？歡迎留言跟我說說 👇`,
        `想跟大家分享一件事：${topic}\n\n不一定是什麼大事，但就是想記錄下來 📝\n你有在記錄自己的生活嗎？`,
      ],
      fbTags: [['#生活'], ['#日常']],
      threads: [
        `${topic} ✨\n\n這件事讓我今天心情變好了，分享給你\n\n你呢？今天有什麼讓你開心的事嗎？`,
        `${topic}\n\n說出來感覺輕鬆很多——有時候就是需要這樣 😮‍💨`,
      ],
      ytTitle: [
        `${topic}｜真實記錄我的日常`,
        `${topic} | 這週發生了這些事`,
      ],
      ytDesc: [
        `${topic}\n\n這次把日常完整記錄下來，沒有濾鏡只有真實。\n喜歡這類型內容的朋友歡迎訂閱 🙏`,
        `${topic} — 生活就是這樣，有時好有時壞，但記錄下來才知道有多值得。\n\n訂閱頻道，每週都有更新 ❤️`,
      ],
      ytTags: [['#日常vlog', '#生活', '#vlog', '#台灣', '#日記']],
    },
  };

  const t = templates[cat];

  return {
    ig: pickVariant(t.ig, topic),
    igTags: pickVariant(t.igTags, topic),
    fb: pickVariant(t.fb, topic),
    fbTags: pickVariant(t.fbTags, topic),
    threads: pickVariant(t.threads, topic),
    ytTitle: pickVariant(t.ytTitle, topic),
    ytDesc: pickVariant(t.ytDesc, topic),
    ytTags: pickVariant(t.ytTags, topic),
  };
}

function generateFallbackContent(topic: string, platforms: Platform[]) {
  const content: Record<string, unknown> = {};
  const c = buildCaption(topic);

  for (const platform of platforms) {
    switch (platform) {
      case 'instagram':
        content.instagram = { caption: c.ig, hashtags: c.igTags };
        break;
      case 'facebook':
        content.facebook = { caption: c.fb, hashtags: c.fbTags };
        break;
      case 'threads':
        content.threads = { caption: c.threads };
        break;
      case 'youtube':
        content.youtube = { title: c.ytTitle, description: c.ytDesc, hashtags: c.ytTags };
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
