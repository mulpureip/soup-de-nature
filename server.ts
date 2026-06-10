import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Firebase client for persistent server-side store
let db: any = null;
try {
  const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(firebaseConfigPath)) {
    const configRaw = fs.readFileSync(firebaseConfigPath, "utf-8");
    const firebaseConfig = JSON.parse(configRaw);
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.log("Firebase Firestore initialized successfully on service project:", firebaseConfig.projectId);
  } else {
    console.warn("firebase-applet-config.json not found. Running with in-memory persistence fallback.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase database:", error);
}

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("GEMINI_API_KEY is not defined in environment variables.");
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI:", error);
}

// Memory-based contact and feedback store (simulated DB for seamless local interaction)
const contacts: any[] = [];
const reviews: any[] = [
  {
    id: "review-1",
    author: "김태희",
    rating: 5,
    skinType: "민감성 피부",
    product: "카렌듈라 비누",
    content: "세안 후 늘 얼굴이 붉어지고 건조했는데, 카렌듈라 비누를 쓰고 나서 진정 효과가 바로 보이네요! 거품도 아주 드밀하게 잘 나고 향도 은은해서 너무 좋습니다.",
    beforeText: "하얗게 트고 붉어짐",
    afterText: "건강하고 촉촉하게 보습",
    date: "2026-05-12"
  },
  {
    id: "review-2",
    author: "박서준",
    rating: 5,
    skinType: "지성 피부",
    product: "숯 비누",
    content: "지성 피부라 유분이 고민이었는데, 이 숯 비누를 쓰고 기름기가 싹 가셨습니다! 그렇다고 당기지도 않고 블랙헤드도 옅어지는 느낌을 받았습니다.",
    beforeText: "유분기 번들거림",
    afterText: "보송하고 매끄러운 맑은 피부",
    date: "2026-06-02"
  },
  {
    id: "review-3",
    author: "최윤아",
    rating: 4,
    skinType: "건성 피부",
    product: "시어버터 비누",
    content: "환절기만 되면 당기던 볼 부위가 정말 편안해졌어요. 아침 세안용으로 가볍게 쓰기 아주 좋습니다. 보습력 최강이에요!",
    beforeText: "거칠고 심한 당김",
    afterText: "부드럽고 윤택함 공급",
    date: "2026-06-08"
  }
];

// 1. Contact submission API
app.post("/api/contact", async (req, res) => {
  const { name, phone, email, content } = req.body;
  if (!name || !phone || !email || !content) {
    return res.status(400).json({ error: "모든 상담 정보를 입력해주세요." });
  }
  const id = `contact-${Date.now()}`;
  const newContact = {
    id,
    name,
    phone,
    email,
    content,
    createdAt: new Date().toISOString()
  };

  try {
    if (db) {
      const contactRef = doc(db, "contacts", id);
      await setDoc(contactRef, newContact);
      console.log("Successfully saved contact inquiry to Firestore:", id);
      return res.status(200).json({ message: "상담이 정상적으로 신청되었습니다. 빠른 시일 내 연락드리겠습니다.", contact: newContact });
    }
  } catch (error) {
    console.error("Failed to write contact inquiry to Firestore. Saving in-memory.", error);
  }

  contacts.push(newContact);
  res.status(200).json({ message: "상담이 정상적으로 신청되었습니다. 빠른 시일 내 연락드리겠습니다.", contact: newContact });
});

// 2. Add customer feedback API
app.post("/api/reviews", async (req, res) => {
  const { author, rating, skinType, product, content, beforeText, afterText } = req.body;
  if (!author || !rating || !skinType || !product || !content) {
    return res.status(400).json({ error: "필수 정보를 기입해주세요." });
  }
  const id = `review-${Date.now()}`;
  const newReview = {
    id,
    author,
    rating: Number(rating),
    skinType,
    product,
    content,
    beforeText: beforeText || "평범한 피부결",
    afterText: afterText || "촉촉하고 산뜻한 변화",
    date: new Date().toISOString().split('T')[0]
  };

  try {
    if (db) {
      const reviewRef = doc(db, "reviews", id);
      await setDoc(reviewRef, newReview);
      console.log("Successfully saved customer review to Firestore:", id);
      return res.status(201).json({ message: "후기가 정상적으로 등록되었습니다.", review: newReview });
    }
  } catch (error) {
    console.error("Failed to write review to Firestore. Saving in-memory.", error);
  }

  reviews.push(newReview);
  res.status(201).json({ message: "후기가 정상적으로 등록되었습니다.", review: newReview });
});

// 3. Get reviews API
app.get("/api/reviews", async (req, res) => {
  try {
    if (db) {
      const colRef = collection(db, "reviews");
      const snap = await getDocs(colRef);
      const list: any[] = [];
      snap.forEach(docSnap => {
        list.push(docSnap.data());
      });
      if (list.length > 0) {
        // Sort by date or id descending to put newest first
        list.sort((a, b) => b.id.localeCompare(a.id));
        return res.json(list);
      }
    }
  } catch (error) {
    console.error("Failed to fetch reviews from Firestore. Falling back to local data.", error);
  }
  res.json(reviews);
});

// 4. AI Skin Diagnosis API
app.post("/api/diagnose", async (req, res) => {
  const { q1, q2, q3, q4 } = req.body;

  if (!q1 || !q2 || !q3 || !q4) {
    return res.status(400).json({ error: "성실한 진단을 위해 모든 질문에 답변해주세요!" });
  }

  const prompt = `천연비누 브랜드의 피부진단 어드바이저 역할을 해주세요.
사용자의 아래 설문 답변을 진단하고, 맞춤 분석 및 추천을 도출해주세요:
- 세안 후 피부 상태: "${q1}"
- 트러블 발생 빈도: "${q2}"
- 피부 민감도: "${q3}"
- 가장 고민되는 피부 문제: "${q4}"

이 답변을 심층 분석하여 아래의 구조화된 한글 JSON 템플릿에 맞추어 완벽한 응답을 생성해주세요.
JSON 스키마 규격에 완벽히 매칭되어야 합니다. 절대 마크다운 백틱없이 순수 JSON만 반환하거나 올바른 JSON 문자열을 생성하세요.

추천 비누:
- 지성/트러블: 숯 비누, 티트리 비누 (유수분 밸런스, 모공, 피지 케어)
- 민감성: 카렌듈라 비누, 오트밀 비누 (피부 진정, 저자극 케어)
- 건성: 시어버터 비누, 꿀 비누, 아보카도 비누 (보습 강화, 피부막 보호)
- 복합성: 녹차 비누, 어성초 비누 (피부 밸런스, 트러블 케어)`;

  if (!ai) {
    // Non-AI fallback when API key is missing
    return res.json(getFallbackDiagnosis(q1, q2, q3, q4));
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skinType: {
              type: Type.STRING,
              description: "사용자의 최종 판정 피부 타입 (예: 민감성 피부, 건성 피부, 지성 피부, 복합성 피부, 지복합성 민감성 피부 등)"
            },
            summary: {
              type: Type.STRING,
              description: "피부 유형 한 줄 요약 및 격려하는 멘트"
            },
            analysis: {
              type: Type.STRING,
              description: "설문 답변을 토대로 분석한 사용자의 현재 피부 장벽 및 유수분 밸런스 상태 분석 (한국어 3~4문장)"
            },
            recommendedSoaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "비누 이름 (예: 카렌듈라 비누, 어성초 비누, 시어버터 비누 등)" },
                  keyBenefits: { type: Type.STRING, description: "추천 비누의 핵심 오가닉 효능 (예: 뛰어난 진정 및 유연 작용)" },
                  reason: { type: Type.STRING, description: "상세 추천 사유 (설문 및 분석 결과와 연계하여 친절하게 설명)" }
                },
                required: ["name", "keyBenefits", "reason"]
              }
            },
            skincareGuide: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "사용자 만을 위한 아침/저녁 세안 법, 수분 공급 팁, 습도 관리 등 데일리 스킨케어 실천 꿀팁 3가지 리스트"
            }
          },
          required: ["skinType", "summary", "analysis", "recommendedSoaps", "skincareGuide"]
        }
      }
    });

    const resultText = response.text;
    if (resultText) {
      const data = JSON.parse(resultText);
      res.json(data);
    } else {
      res.status(500).json({ error: "AI 응답을 추출할 수 없습니다." });
    }
  } catch (error) {
    console.error("AI Diagnosis Error:", error);
    // Return graceful fallback of deterministic logic which perfectly fits the brand guidelines
    res.json(getFallbackDiagnosis(q1, q2, q3, q4));
  }
});

// 5. Get AI-generated Organic Naturals & Tips articles
app.get("/api/content/tips", async (req, res) => {
  const prompt = `천연비누 브랜드의 '자연 이야기 콘텐츠' 매거진 코너를 위한 에세이 아티클 3개를 작성해주세요.
각 아티클은 청정 자연, 친환경 스키케어, 오가닉 에센셜 오일의 비밀, 올바른 저자극 비누 세안법 중 하나를 주제로 해야 합니다.
반드시 아래 JSON 스키마에 따라 응답해주세요.`;

  if (!ai) {
    return res.json(getFallbackArticles());
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "풍부한 감성과 기사의 매력을 담은 한글 기사 제목" },
              category: { type: Type.STRING, description: "카테고리 (예: 자연의 가치, 핸드메이드 라이프, 피부 케어 팁, 친환경 라이프)" },
              excerpt: { type: Type.STRING, description: "기사 한 줄 요약 혹은 멋진 서두" },
              content: { type: Type.STRING, description: "약 2~3문단의 심도 있고 따뜻한 자연 친화 에세이 본문" },
              readingTime: { type: Type.STRING, description: "예상 읽기 시간 (예: '3분 소요')" },
              date: { type: Type.STRING, description: "작성일 (예: '2026.06.10')" }
            },
            required: ["title", "category", "excerpt", "content", "readingTime", "date"]
          }
        }
      }
    });

    const resultText = response.text;
    if (resultText) {
      const data = JSON.parse(resultText);
      res.json(data);
    } else {
      res.status(500).json({ error: "AI 이야기 콘텐츠를 생성할 수 없습니다." });
    }
  } catch (error) {
    console.error("AI Content Generation Error:", error);
    res.json(getFallbackArticles());
  }
});

// Local Fallback Data generators to make sure it always builds/works perfectly
function getFallbackDiagnosis(q1: string, q2: string, q3: string, q4: string) {
  let skinType = "민감성 피부";
  let summary = "풍부한 자연 영양으로 자극을 줄여주는 세심한 케어가 필요합니다.";
  let analysis = "설문 결과 세안 후 자극을 민감하게 느끼시는 편이군요. 피부 장벽이 얇아진 상태에서 가벼운 외부 자극에도 붉어지거나 유수분 균형이 무너질 수 있습니다. 합성 계면활성제를 철저하게 배제한 순한 비누로 유수분 보호막을 가꿔야 할 때입니다.";
  let recommendedSoaps = [
    {
      name: "카렌듈라 비누",
      keyBenefits: "자극 완화와 편안한 피부 진정 효과",
      reason: "카렌듈라 꽃잎을 숙성시켜 우려낸 성분이 자극받은 피부 장벽을 편안하게 감싸 흡수됩니다."
    },
    {
      name: "오트밀 비누",
      keyBenefits: "순한 보습막 및 저자극 스크럽 기능",
      reason: "밀도 높은 오트밀 가루가 각질을 부드럽게 케어하면서, 피부 건조를 원천 차단합니다."
    }
  ];
  let skincareGuide = [
    "미온수로 손을 깨끗이 씻은 후 비누 거품망을 사용해 생크림 같은 조밀한 거품을 내어 가볍게 마사지하듯 세안합니다.",
    "화학 세안제 사용은 주 1회 미만으로 줄이고, 수건으로 문질러 닦기보다 가볍게 톡톡 두드려 물기만 걷어냅니다.",
    "세안 후 즉시 약산성 오가닉 에센스를 바르고, 건조할 때는 시어버터 계열 크림으로 가릴 수 있는 보습 장벽을 쌓아주세요."
  ];

  // Simple customization based on user answers
  if (q1.includes("번들") || q4.includes("유분") || q4.includes("피지")) {
    skinType = "지성 피부";
    summary = "모공 속 피지를 가볍게 비우고 청량한 수분을 채우는 숯과 티트리가 필요합니다.";
    analysis = "지성 또는 복합성 유형의 양상을 보이고 계십니다. 피지 분비율이 활발하지만 속은 당길 수 있는 전형적인 수부지(수분 부족형 지성) 상태일 가능성이 높습니다. 과다 오일을 닦아주되 필수 영양은 지켜주는 저자극 정화 비누가 적합니다.";
    recommendedSoaps = [
      {
        name: "숯 비누",
        keyBenefits: "탁월한 피지 흡착 및 청량한 모공 관리",
        reason: "여과 정제된 미세 참숯 가루가 세안 시 모공 깊은 곳의 오염물질을 안전하게 흡착 배출해 줍니다."
      },
      {
        name: "티트리 비누",
        keyBenefits: "트러블 케어 및 오일 컨트롤 기능",
        reason: "천연 티트리 에센셜 오일의 고유 성분이 트러블 부위를 청정하고 상쾌하게 가꿔줍니다."
      }
    ];
    skincareGuide = [
      "피지가 많이 올라오는 T존과 콧망울 주변 위주로 조밀한 숯 비누 거품을 올린 후 약 30초 대기 후 따뜻한 물로 세안하세요.",
      "오일 기반 메이크업 클렌저는 사용을 피하시고, 티트리 세안을 통해 유분 불순물을 걷어내 주는 것이 좋습니다.",
      "세안 후 오일프리 수분 에센스 혹은 허브 성분 미스트를 통해 진정과 충분한 스킨 수딩을 공급하세요."
    ];
  } else if (q1.includes("매우 당긴다") || q4.includes("건조함")) {
    skinType = "건성 피부";
    summary = "귀중한 촉촉함이 증발하기 전, 풍성한 오가닉 보습막을 씌워줄 차례입니다.";
    analysis = "세안 시 수분을 격렬히 손실받는 건성 상태입니다. 천연 보습 인자와 글리세린이 풍부한 식물성 세안비누가 꼭 필요합니다. 오랫동안 숙성하는 제조 방법으로 수분 증발을 완화해야 탄성을 지킬 수 있습니다.";
    recommendedSoaps = [
      {
        name: "시어버터 비누",
        keyBenefits: "보습 강화 및 오가닉 피부 보호막 형성",
        reason: "천연 카리테 지방산이 풍부한 시어버터를 넉넉히 비누 속에 녹여 넣어 세안 직후 보송함과 탁월한 촉촉함을 선사합니다."
      },
      {
        name: "아보카도 비누",
        keyBenefits: "비타민 영양 보습 및 각질 진정",
        reason: "숲의 버터라 불리는 아보카도 오일의 유효 지방 성분이 메마른 피부에 스며들어 보들보들한 살결을 완성합니다."
      }
    ];
    skincareGuide = [
      "아침 세안 시에는 맹물 대신 가벼운 비누 거품으로 밤새 쌓인 노폐물만 순하게 쓸어내 주는 것이 보습 유지에 유리합니다.",
      "세안 직후 타올을 쓰기 전에 물기를 남겨둔 상태에서 영양 페이스 오일을 한 두 방울 레이어링 해 줍니다.",
      "피부 안팎의 균형을 위해 따뜻한 차를 수시로 음용하여 수분 보습력을 상시 높여주세요."
    ];
  }

  return { skinType, summary, analysis, recommendedSoaps, skincareGuide };
}

function getFallbackArticles() {
  return [
    {
      title: "기다림 속에 탄생하는 가치, 천연비누 저온 숙성의 미학",
      category: "자연의 가치",
      excerpt: "화학 반응을 인위적으로 촉진하지 않고, 숲의 흐름처럼 한 배치의 비누가 성숙하는 시간이 자아내는 특별함.",
      content: "일반적으로 흔히 쓰이는 공업용 비누는 기계적인 고온 고압 공정으로 한 공장 안에서 초단위에 제조됩니다. 하지만 자연주의 핸드메이드 비누는 다릅니다. 고체 오일과 에센셜 정제액을 세심히 혼합한 수제비누는 특유의 온화한 건조방에서 최소 4주에서 6주간의 숙성 시기를 거칩니다.\n\n이 느림과 기다림의 과정 동안 천연 식물성 오일에 포함된 보습의 제왕 '천연 글리세린'이 자연스럽게 유지되어 축적됩니다. 그리하여 물에 잘 씻겨내려 가면서도, 피부에는 마르지 않는 산뜻한 보습과 영양만을 고스란히 담아주는 고품질 명품 비누가 마침내 성형됩니다.",
      readingTime: "3분 소요",
      date: "2026.06.10"
    },
    {
      title: "오가닉 허브 카렌듈라와 라벤더가 선사하는 온전한 휴식",
      category: "피부 케어 팁",
      excerpt: "매일 반복되는 지진 저녁 세안을 나만의 오가닉 스파 테라피로 만드는 천연 허브 에센스의 비밀.",
      content: "오늘 하루 무수한 먼지와 스트레스에 시달려 지친 나의 피부를 위해, 세안용 천연 비누의 원료 명단을 다시 살펴볼 때입니다. 민감성 피부의 대명사인 카렌듈라는 옛 시절부터 자극된 상처를 다스리기 위해 으뜸으로 사용되어 온 허브입니다. 비누 속에서 노랗게 부서진 채 머무는 유기농 카렌듈라 잎새는 보습력을 끌어올리고 여린 염증을 편안히 가라앉힙니다.\n\n여기에 그윽히 어우러지는 라벤더 에센셜 오일은 천연 아로마 보습뿐만 아니라 지친 하루의 끝을 상쾌하면서도 깊고 가라앉은 편안함으로 감싸 안아 숙면을 도우며 몸과 마음에 온전한 휴식을 안겨줍니다.",
      readingTime: "2분 소요",
      date: "2026.06.09"
    },
    {
      title: "지구를 지키는 작은 한 걸음: 제로 웨이스트 욕실의 시작",
      category: "친환경 라이프",
      excerpt: "플라스틱 용기를 버리고 오롯이 자연으로 회귀하는 고체 비누 한 장의 위대한 날갯짓.",
      content: "리퀴드 형태의 바디워시나 폼 클렌저는 우리 삶에 편리함을 제공하지만, 플라스틱 용기라는 처분하기 까다로운 껍데기를 숙제처럼 떠맡깁니다. 또 인체와 수질을 해칠 염려가 깊은 계면활성제 성분이 섞여 강으로 흘러갑니다.\n\n이와 달리 고체의 천연 수제비누는 썩어 분해되는 친환경 종이 포장이나 면 끈만을 지향하며, 플라스틱 폐기물을 전혀 배출하지 않는 완벽한 제로 웨이스트 상품입니다. 생분해 속도 또한 일반 화학 제품에 비해 월등히 빨라 흘러가는 모든 물방울조차 자연스레 자가 정화됩니다. 비누 한 장으로 욕실의 미니멀리즘과 지속가능성의 진정한 우아함을 실현할 수 있습니다.",
      readingTime: "3분 소요",
      date: "2026.06.05"
    }
  ];
}

// Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully running on http://localhost:${PORT}`);
  });
}

startServer();
