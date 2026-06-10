import { useState, useEffect, FormEvent } from "react";
import { 
  Leaf, Sparkles, Heart, Shield, Flame, 
  Trash, MessageSquare, ChevronDown, ChevronUp, Star, MapPin, 
  Clock, Phone, Mail, Check, AlertCircle, Compass, Award, PenSquare, 
  Send, RefreshCw, Scroll, FileText, CheckCircle
} from "lucide-react";
import { SOAP_PRODUCTS, INGREDIENTS, FAQ_LIST, PROCESS_STEPS } from "./data";
import { SoapProduct, Ingredient, Review, DiagnosisResult, Article } from "./types";

export default function App() {
  // Current Navigation State
  const [activeSection, setActiveSection] = useState("home");

  // Web State managers
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [activeSoapTab, setActiveSoapTab] = useState<string>("전체");
  const [highlightedSoapId, setHighlightedSoapId] = useState<string | null>(null);

  // Diagnostic Test State
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [diagnosisAnswers, setDiagnosisAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: ""
  });
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [diagnosisError, setDiagnosisError] = useState("");

  // Customer Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    author: "",
    rating: 5,
    skinType: "민감성 피부",
    product: "카렌듈라 캄 비누",
    content: "",
    beforeText: "",
    afterText: ""
  });
  const [reviewSubmitMessage, setReviewSubmitMessage] = useState("");

  // Natural Magazine Magazine articles
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);

  // FAQ Accordion Open Items
  const [openFAQIdx, setOpenFAQIdx] = useState<number | null>(null);

  // Consultation Contact State
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    email: "",
    content: ""
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactResponse, setContactResponse] = useState({
    success: false,
    message: ""
  });

  // Diagnostic Test Questions list
  const DIAGNOSTIC_QUESTIONS = [
    {
      key: "q1",
      title: "Q1. 세안 후 약 10분이 지났을 때의 피부 상태는 어떤가요?",
      options: [
        { value: "매우 당긴다", label: "매우 당기고 하얗게 각질이 일어난다." },
        { value: "약간 당긴다", label: "볼 부위가 약간 가렵거나 당기지만 이마는 편안하다." },
        { value: "보통이다", label: "당김 없이 유수분이 적당하게 조화를 이룬다." },
        { value: "번들거린다", label: "T존부터 얼굴 전체가 번들거리고 개기름이 많이 올라온다." }
      ]
    },
    {
      key: "q2",
      title: "Q2. 뾰루지나 여드름 같은 붉은 트러블의 발생 빈도는 어떤가요?",
      options: [
        { value: "자주 발생", label: "환절기뿐만 아니라 평소에도 트러블이 자주 올라와 고생한다." },
        { value: "가끔 발생", label: "피로가 누적되거나 계절이 변할 때 한두 개씩 가끔 발생한다." },
        { value: "거의 없음", label: "트러블이 생기는 일이 거의 없으며 늘 결이 일정하다." }
      ]
    },
    {
      key: "q3",
      title: "Q3. 화장품을 바꾸거나 외부 자극(황사, 마찰)을 받았을 때의 피부 민감도는?",
      options: [
        { value: "매우 민감", label: "즉각적으로 붉어지고, 화끈거리거나 가려움을 잘 느낀다." },
        { value: "보통", label: "자극에 크게 민감하지 않으나 환절기에는 가볍게 반응한다." },
        { value: "둔감", label: "자극에 전혀 반응하지 않고 어떤 화장품이든 무던하게 잘 맞는다." }
      ]
    },
    {
      key: "q4",
      title: "Q4. 현재 본인의 피부 고민 중 가장 근본적으로 해결하고 싶은 문제는 무엇인가요?",
      options: [
        { value: "건조함", label: "쩍쩍 갈라지는 듯한 피부 속 건조와 거친 버짐 해결" },
        { value: "트러블", label: "트러블 진정과 좁쌀 여드름의 맑은 케어" },
        { value: "유분", label: "넓은 모공, 과도하게 짜이는 블랙헤드 및 과잉 피지 조절" },
        { value: "홍조", label: "온도 변화가 있을 때 쉽게 붉어지고 화끈거리는 민감 장벽 완화" },
        { value: "각질", label: "거무튀튀하고 거칠게 안착된 묵은 노폐물 및 각질 탈락" }
      ]
    }
  ];

  // Fetch reviews and articles on mount
  useEffect(() => {
    fetchReviews();
    fetchArticles();
  }, []);

  const fetchReviews = async () => {
    setReviewLoading(true);
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (e) {
      console.error("Error fetching reviews:", e);
    } finally {
      setReviewLoading(false);
    }
  };

  const fetchArticles = async () => {
    setArticlesLoading(true);
    try {
      const res = await fetch("/api/content/tips");
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (e) {
      console.error("Error fetching articles:", e);
    } finally {
      setArticlesLoading(false);
    }
  };

  // Nav scroll helper
  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Soap Filtering
  const filteredSoaps = activeSoapTab === "전체" 
    ? SOAP_PRODUCTS 
    : SOAP_PRODUCTS.filter(soap => soap.skinType === activeSoapTab);

  // Jump and highlight soap after diagnosis recommendation
  const handleRecommendClick = (soapName: string) => {
    // Find soap ID matching recommended soap name
    const matchesSoap = SOAP_PRODUCTS.find(p => soapName.toLowerCase().includes(p.name.slice(0, 3).toLowerCase()));
    if (matchesSoap) {
       setActiveSoapTab("전체");
       setHighlightedSoapId(matchesSoap.id);
       setTimeout(() => {
         scrollToSection("soap-catalog");
       }, 100);

       // Fade out highlight after 4 seconds
       setTimeout(() => {
         setHighlightedSoapId(null);
       }, 4000);
    } else {
      scrollToSection("soap-catalog");
    }
  };

  // Diagnostic Test Handle Click Options
  const handleDiagnosisOption = (key: string, value: string) => {
    setDiagnosisAnswers(prev => ({ ...prev, [key]: value }));
    
    if (currentQuestionIdx < DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Calculate and trigger diagnostic submission
      submitDiagnosis({ ...diagnosisAnswers, [key]: value });
    }
  };

  // Submit Diagnosis to AI api
  const submitDiagnosis = async (finalAnswers: typeof diagnosisAnswers) => {
    setIsDiagnosing(true);
    setDiagnosisError("");
    setDiagnosisResult(null);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalAnswers)
      });
      if (res.ok) {
        const data = await res.json();
        setDiagnosisResult(data);
      } else {
        setDiagnosisError("진단 중에 오류를 발생했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } catch (err) {
      console.error(err);
      setDiagnosisError("서버와의 오가닉 통신이 원활하지 않습니다.");
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Reset diagnostic test state
  const resetDiagnosis = () => {
    setDiagnosisAnswers({ q1: "", q2: "", q3: "", q4: "" });
    setCurrentQuestionIdx(0);
    setDiagnosisResult(null);
    setDiagnosisError("");
    setTestStarted(false);
  };

  // Submit Reviews handler
  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newReviewForm.author || !newReviewForm.content) {
      setReviewSubmitMessage("이름과 사용 후기 본문을 기입해 주세요.");
      return;
    }

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReviewForm)
      });
      if (res.ok) {
        setReviewSubmitMessage("후기가 소중하게 등록되었습니다. 정직한 평가 감사드립니다.");
        setNewReviewForm({
          author: "",
          rating: 5,
          skinType: "민감성 피부",
          product: "카렌듈라 캄 비누",
          content: "",
          beforeText: "",
          afterText: ""
        });
        setTimeout(() => {
          setWriteReviewOpen(false);
          setReviewSubmitMessage("");
        }, 2000);
        // Refresh feed list
        fetchReviews();
      } else {
        setReviewSubmitMessage("후기 등록에 실패했습니다. 형식 규격에 맞춰 다시 입력해 주세요.");
      }
    } catch (err) {
      console.error(err);
      setReviewSubmitMessage("인터넷 연동 오류가 발생했습니다.");
    }
  };

  // Counsel submission handler
  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone || !contactForm.email || !contactForm.content) {
      setContactResponse({ success: false, message: "모든 상담 양식 기입란을 정밀하게 채워주세요." });
      return;
    }
    setContactSubmitting(true);
    setContactResponse({ success: false, message: "" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm)
      });

      const data = await res.json();
      if (res.ok) {
        setContactResponse({ success: true, message: data.message });
        setContactForm({ name: "", phone: "", email: "", content: "" });
      } else {
        setContactResponse({ success: false, message: data.error || "상담 접수 도중 오류가 발생했습니다." });
      }
    } catch (err) {
       console.error(err);
       setContactResponse({ success: false, message: "네트워크 연결 불안정으로 상담 신청을 보낼 수 없습니다." });
    } finally {
       setContactSubmitting(false);
    }
  };

  // Icon Matcher for Natural Map Dictionary
  const renderIngredientIcon = (name: string) => {
    switch (name) {
      case "Leaf": return <Leaf className="w-5 h-5 text-white" />;
      case "Sparkles": return <Sparkles className="w-5 h-5 text-white" />;
      case "Heart": return <Heart className="w-5 h-5 text-white" />;
      case "Cookie": return <Compass className="w-5 h-5 text-white" />;
      case "Flame": return <Flame className="w-5 h-5 text-white" />;
      case "Shield": return <Shield className="w-5 h-5 text-white" />;
      default: return <Leaf className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-light text-neutral-800 selection:bg-sage selection:text-white antialiased font-sans transition-all duration-300">
      
      {/* 1. Header & Brand Banner */}
      <header id="header-bar" className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-cream-dark/40 shadow-sm transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => scrollToSection("home")}>
            <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center shadow-inner">
              <Leaf className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="serif-title font-bold text-xl tracking-widest text-[#5C4D3E]">SOUP DE NATURE</span>
              <span className="text-[10px] uppercase tracking-widest text-sage-dark font-medium">Soap Specialist</span>
            </div>
          </div>

          {/* Desktop Nav Actions */}
          <nav className="hidden lg:flex items-center space-x-6">
            <button id="nav-btn-story" onClick={() => scrollToSection("brand-story")} className="text-sm font-medium text-neutral-600 hover:text-sage-dark transition-colors">브랜드 스토리</button>
            <button id="nav-btn-ingredient" onClick={() => scrollToSection("natural-dict")} className="text-sm font-medium text-neutral-600 hover:text-sage-dark transition-colors">천연 원료</button>
            <button id="nav-btn-soaps" onClick={() => scrollToSection("soap-catalog")} className="text-sm font-medium text-neutral-600 hover:text-sage-dark transition-colors">피부 타입별 비누</button>
            <button id="nav-btn-diagnosis" onClick={() => scrollToSection("diagnose-skin")} className="text-sm font-bold text-sage-dark hover:text-emerald-700 transition-colors flex items-center space-x-1">
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span>피부 진단 테스트</span>
            </button>
            <button id="nav-btn-process" onClick={() => scrollToSection("craft-process")} className="text-sm font-medium text-neutral-600 hover:text-sage-dark transition-colors">제작 과정</button>
            <button id="nav-btn-reviews" onClick={() => scrollToSection("reviews-board")} className="text-sm font-medium text-neutral-600 hover:text-sage-dark transition-colors">고객 후기</button>
            <button id="nav-btn-faq" onClick={() => scrollToSection("faq-accordion")} className="text-sm font-medium text-neutral-600 hover:text-sage-dark transition-colors">FAQ</button>
            <button id="nav-btn-contact" onClick={() => scrollToSection("contact-us")} className="bg-sage hover:bg-sage-hover text-white text-xs font-semibold py-2.5 px-4 rounded-full transition-all tracking-wider shadow-sm">상담 신청</button>
          </nav>

          {/* Mobile Direct Target Actions */}
          <div className="flex lg:hidden items-center space-x-2">
            <button 
              id="mobile-btn-quick-diagnose" 
              onClick={() => scrollToSection("diagnose-skin")}
              className="bg-sage text-white text-xs font-bold px-3 py-2 rounded-full flex items-center space-x-1"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>피부 테스트</span>
            </button>
            <button 
              id="mobile-btn-quick-contact" 
              onClick={() => scrollToSection("contact-us")}
              className="bg-wood text-white text-xs font-bold px-3 py-2 rounded-full"
            >
              <span>문의</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="home" className="relative min-h-[85vh] flex items-center justify-center bg-cream overflow-hidden">
        {/* Decorative organic lights/grains */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,rgba(167,184,154,0.15),transparent_50%)]"></div>
        <div className="absolute -left-20 bottom-0 w-96 h-96 rounded-full bg-sage-light/40 blur-3xl"></div>
        <div className="absolute right-10 top-20 w-80 h-80 rounded-full bg-[#E2D9C8]/10 blur-2xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-1.5 self-center lg:self-start bg-sage/15 text-sage-dark rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest leading-none">
              <Award className="w-3.5 h-3.5" />
              <span>100% Organics Cold Process Soap</span>
            </div>
            
            <h1 id="hero-main-title" className="serif-title text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-800 leading-tight">
              자연이 만든 가장<br />
              <span className="text-[#6c7c59] underline decoration-[#A7B89A] underline-offset-8 decoration-wavy">순한 피부 습관</span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              청정 자연의 귀중한 숲 향과 영양을 수작업으로 가득 담았습니다.<br className="hidden sm:inline" />
              피부 장벽을 파괴하는 합성 계면활성제나 인공 시료 없이,<br className="hidden sm:inline" />
              자연 저온 숙성(Cold Process)으로 완성한 최상급 보습을 약속합니다.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button 
                id="hero-btn-diagnosis" 
                onClick={() => scrollToSection("diagnose-skin")} 
                className="w-full sm:w-auto bg-[#6C7D5D] hover:bg-emerald-800 text-white font-bold px-8 py-4 rounded-full shadow-md text-sm transition-all hover:-translate-y-0.5 flex items-center justify-center space-x-2 tracking-wide"
              >
                <Compass className="w-5 h-5 text-cream animate-pulse" />
                <span>나의 맞춤 피부 테스트</span>
              </button>
              <button 
                id="hero-btn-story" 
                onClick={() => scrollToSection("brand-story")} 
                className="w-full sm:w-auto border-2 border-neutral-700/60 hover:bg-neutral-800 hover:text-white hover:border-neutral-800 font-bold px-8 py-4 rounded-full text-neutral-700 text-sm transition-all text-center"
              >
                브랜드 철학 보기
              </button>
            </div>

            {/* Nature badges */}
            <div className="grid grid-cols-3 gap-4 pt-10 border-t border-cream-dark/60 max-w-md mx-auto lg:mx-0">
              <div>
                <div className="serif-title font-bold text-2xl text-sage-dark">1,000h</div>
                <div className="text-xs text-neutral-500">정밀 숙성 시간</div>
              </div>
              <div>
                <div className="serif-title font-bold text-2xl text-sage-dark">100%</div>
                <div className="text-xs text-neutral-500">식물성 오가닉</div>
              </div>
              <div>
                <div className="serif-title font-bold text-2xl text-sage-dark">Zero</div>
                <div className="text-xs text-neutral-500">플라스틱 포장</div>
              </div>
            </div>
          </div>

          {/* Visual Showcase - Magazine Frame */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-80 sm:w-96 aspect-[3/4] bg-[#F3ECE0] rounded-[40px] shadow-2xl overflow-hidden border-8 border-white p-6 flex flex-col justify-between">
              {/* Natural background illustration wrapper */}
              <div className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1546554137-f86b9593a222?q=80&w=600&auto=format&fit=crop')" }}></div>
              
              <div className="flex justify-between items-start relative z-10">
                <span className="serif-title text-[10px] tracking-widest text-[#8B6E54] uppercase font-bold">Nature Premium Collection</span>
                <span className="text-[10px] text-sage-dark font-mono font-semibold">EST. 2026</span>
              </div>

              {/* Minimal Organic Graphic mockup inside card */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto py-10">
                <div className="w-32 h-20 bg-cream/70 rounded-lg shadow-inner border border-cream-dark/50 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute top-1 left-2 text-[6px] text-neutral-400">100% HANDMADE</div>
                  <div className="serif-title text-sm tracking-widest text-wood font-extrabold">SOUP</div>
                  <div className="text-[6px] text-sage font-bold tracking-widest">SAGE & HERB</div>
                  <div className="w-16 h-0.5 bg-sage/60 mt-1"></div>
                </div>
                <span className="text-xs text-neutral-500 mt-4 italic font-medium">Soap matured like forest breathing</span>
              </div>

              <div className="relative z-10 text-center border-t border-[#D9CEBA] pt-4">
                <p className="noto-serif text-sm font-bold text-[#5C4633] tracking-wide">수작업 아로마 테라피 비누</p>
                <p className="text-[9px] text-[#8B7E6F] tracking-tight mt-1">식물 고유 영양이 살아 숨 쉬는 촉촉한 유수분 보호 필터</p>
              </div>
            </div>

            {/* Floating leaf icon indicator */}
            <div className="absolute -right-4 bottom-8 bg-white/90 shadow-lg px-4 py-3 rounded-2xl flex items-center space-x-2 border border-cream border-cream-dark/30 animate-bounce">
              <div className="w-8 h-8 rounded-full bg-[#EBF0E6] flex items-center justify-center">
                <Leaf className="w-4 h-4 text-sage" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] text-neutral-400 font-semibold uppercase">Clean Care</span>
                <span className="block text-xs font-bold text-neutral-700">인공 유해 방부제 무첨가</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Brand Story (브랜드 철학) */}
      <section id="brand-story" className="py-24 bg-white transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold tracking-widest text-sage uppercase">Brand Philosophy</h2>
            <p className="serif-title text-3xl sm:text-4xl font-bold tracking-wide text-neutral-800">
              자연 고유의 치유력만을<br className="sm:hidden" /> 그대로 담아내다
            </p>
            <div className="w-12 h-1 bg-sage mx-auto rounded-full mt-4"></div>
            <p className="text-neutral-500 leading-relaxed pt-2">
              우리는 인위적이고 빠른 화학 결합보다, 오래 걸리더라도 피부가 가만히 반기는<br className="hidden sm:inline" />
              자연 한 조각을 만듭니다. 천연비누 속 풍성함은 시간이 주는 선물입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Philosophy Card 1 */}
            <div id="story-card-nature" className="bg-[#FAF8F5] p-8 rounded-3xl border border-[#EDE7DF]/60 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-center">
              <div className="w-14 h-14 bg-sage/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-7 h-7 text-sage-dark" />
              </div>
              <h3 className="noto-serif font-bold text-xl text-neutral-800 mb-3">자연 그대로의 건강함</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                화학 성분 및 합성 파라벤, 계면활성제를 철저히 배제하고 깨끗한 야생 허브와 식물성 에스테르 오일만을 정갈하게 배합하여 피부 고유의 평화를 유지합니다.
              </p>
            </div>

            {/* Philosophy Card 2 */}
            <div id="story-card-handmade" className="bg-[#FAF8F5] p-8 rounded-3xl border border-[#EDE7DF]/60 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-center">
              <div className="w-14 h-14 bg-sage/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-7 h-7 text-sage-dark" />
              </div>
              <h3 className="noto-serif font-bold text-xl text-neutral-800 mb-3">손으로 만드는 정성</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                수작업 장인들이 온도부터 커팅까지 전 제작 과정을 섬세한 감각으로 컨트롤합니다. 소량 생산 및 1000시간 냉온 정지 숙성 기법을 타협하지 않습니다.
              </p>
            </div>

            {/* Philosophy Card 3 */}
            <div id="story-card-eco" className="bg-[#FAF8F5] p-8 rounded-3xl border border-[#EDE7DF]/60 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-center">
              <div className="w-14 h-14 bg-sage/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-7 h-7 text-sage-dark" />
              </div>
              <h3 className="noto-serif font-bold text-xl text-neutral-800 mb-3">지속가능한 상생 가치</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                지구를 지키는 제로 웨이스트 실천을 위해 플라스틱 포장을 금하며, 국산 무농약 원재료 배합 및 친환경 패키징 방식을 전적으로 지향합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Natural Ingredients Introduction & Map (천연 원료 도감) */}
      <section id="natural-dict" className="py-24 bg-cream transition-all duration-300 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Narrative and clickable elements */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest text-[#8B6E54] uppercase">Organic Encyclopedia</span>
                <h2 className="serif-title text-3xl sm:text-4xl font-bold text-neutral-800">청정 원료 도감</h2>
              </div>
              <p className="text-neutral-600 text-sm leading-relaxed">
                산지 특성별 건강한 유기 기운을 지닌 엄선된 대표 원재료들입니다.<br />
                원료를 클릭하시면 숨겨진 구체적인 오가닉 효능과 원산지를 더 깊이 확인하실 수 있습니다.
              </p>

              {/* Grid selectors */}
              <div className="grid grid-cols-2 gap-3 pt-3">
                {INGREDIENTS.map(item => (
                  <button
                    key={item.id}
                    id={`dict-btn-${item.id}`}
                    onClick={() => setSelectedIngredient(item)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      selectedIngredient?.id === item.id 
                        ? "bg-sage text-white border-sage shadow-md scale-[1.02]" 
                        : "bg-white border-[#E2D9C8] hover:border-sage text-neutral-700"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center`} style={{ backgroundColor: selectedIngredient?.id === item.id ? "rgba(255,255,255,0.25)" : `${item.color}25` }}>
                        <span className="text-xs font-bold" style={{ color: selectedIngredient?.id === item.id ? "#ffffff" : item.color }}>
                          {item.name.slice(0, 1)}
                        </span>
                      </div>
                      <span className="font-bold text-xs sm:text-sm tracking-wide">{item.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Map/Visual Interactive Panel */}
            <div className="lg:col-span-7">
              <div className="bg-[#FAF8F5] border border-[#E2D9C8] rounded-[36px] p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[440px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Compass className="w-64 h-64 text-neutral-800" />
                </div>

                {selectedIngredient ? (
                  <div className="relative z-10 space-y-6 flex flex-col justify-between h-full animate-fadeIn">
                    <div className="flex justify-between items-start border-b border-cream-dark/60 pb-4">
                      <div>
                        <div className="inline-flex items-center space-x-1 text-[11px] font-bold text-sage-dark bg-sage/10 rounded-full px-2.5 py-0.5 mb-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{selectedIngredient.location}</span>
                        </div>
                        <h3 className="noto-serif text-2xl font-black text-neutral-800 tracking-wide">{selectedIngredient.name}</h3>
                      </div>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md animate-pulse" style={{ backgroundColor: selectedIngredient.color }}>
                        {renderIngredientIcon(selectedIngredient.iconName)}
                      </div>
                    </div>

                    <div className="space-y-3 py-2">
                      <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold">주요 유기 효능</p>
                      <p className="noto-serif font-black text-lg text-sage-dark">{selectedIngredient.benefit}</p>
                      <p className="text-neutral-600 text-sm leading-relaxed">{selectedIngredient.fullDesc}</p>
                    </div>

                    <div className="bg-sage/10 p-4 rounded-2xl flex items-center space-x-2.5 border border-sage/15">
                      <Sparkles className="w-5 h-5 text-sage" />
                      <span className="text-xs text-[#5C4D3E] font-medium leading-relaxed">
                        이 원료는 독보적인 에센셜 스팀 여과 공법을 거쳐 당사 수제 <strong>{selectedIngredient.name}</strong> 계열 비누에 수작업 함유되어 있습니다.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-cream-dark/30 flex items-center justify-center">
                      <Compass className="w-8 h-8 text-[#8B6E54] animate-spin-slow" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="noto-serif font-bold text-lg text-neutral-700">전국 청정지역의 우수한 원료 분포</h3>
                      <p className="text-xs text-neutral-500 max-w-sm">
                        왼쪽 원료 목록에서 궁금하신 재료를 클릭해보세요.<br />
                        자연주의 수제비누를 채운 고유 약효와 원산지 에세이가 다정하게 펼쳐집니다.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Soap Catalog (피부 타입별 비누) */}
      <section id="soap-catalog" className="py-24 bg-white transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
            <span className="text-xs font-bold tracking-widest text-sage uppercase">Handcrafted Botanical Soaps</span>
            <h2 className="serif-title text-3xl sm:text-4xl font-bold text-neutral-800">피부 유형별 식물성 수제비누</h2>
            <div className="w-12 h-1 bg-sage mx-auto rounded-full mt-2"></div>
            <p className="text-neutral-500 text-xs sm:text-sm">
              사람마다 피부 결은 모두 다릅니다. 본인의 피부 고민에 맞게 과학적으로 설계된<br className="hidden sm:inline" />
              천연 테라피 비누 라인을 만나보세요. 순하게 감기는 피부 편안함을 전합니다.
            </p>
          </div>

          {/* Filtering Tab Group */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {["전체", "건성 피부", "지성 피부", "민감성 피부", "복합성 피부"].map(tabName => (
              <button
                key={tabName}
                id={`catalog-tab-${tabName}`}
                onClick={() => setActiveSoapTab(tabName)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider transition-all cursor-pointer ${
                  activeSoapTab === tabName
                    ? "bg-sage text-white shadow-md scale-102"
                    : "bg-[#FAF8F5] border border-cream-dark/50 text-neutral-600 hover:border-sage"
                }`}
              >
                {tabName}
              </button>
            ))}
          </div>

          {/* Catalog Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSoaps.map(soap => {
              const isRecommended = highlightedSoapId === soap.id;
              return (
                <div 
                  key={soap.id} 
                  id={`soap-card-${soap.id}`}
                  className={`bg-cream-light/30 border rounded-[32px] p-6 flex flex-col justify-between transition-all duration-300 ${
                    isRecommended 
                      ? "ring-4 ring-sage border-sage scale-[1.03] shadow-lg bg-emerald-50/20" 
                      : "border-[#EDE7DF] hover:shadow-lg hover:border-sage/40"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header tags */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                        soap.skinType === "건성 피부" ? "bg-amber-100 text-amber-800" :
                        soap.skinType === "지성 피부" ? "bg-sky-100 text-sky-850" :
                        soap.skinType === "민감성 피부" ? "bg-rose-100 text-rose-800" :
                        "bg-[#A7B89A]/20 text-[#6C7D5D]"
                      }`}>
                        {soap.skinType}
                      </span>
                      {isRecommended && (
                        <span className="text-[9px] font-black tracking-widest text-[#6C7D5D] bg-emerald-100/50 px-2.5 py-1 rounded-full uppercase animate-pulse">
                          ★ AI 진단 추천작
                        </span>
                      )}
                    </div>

                    {/* Soap Image Mock Illustrative Icon */}
                    <div className="aspect-video w-full rounded-2xl bg-white border border-[#EDE7DF] flex items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-tr from-cream/20 to-sage/5 group-hover:scale-110 transition-transform duration-500"></div>
                      
                      {/* Generates abstract beautiful shapes resembling organic soaps */}
                      <div className="w-24 h-14 bg-cream border border-cream-dark/80 rounded-md shadow-inner flex flex-col items-center justify-center relative transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                        {soap.id.includes("charcoal") ? (
                          <div className="absolute inset-0 bg-neutral-800/90 rounded-md flex flex-col items-center justify-center p-1 text-center">
                            <span className="serif-title text-[9px] text-zinc-300 font-extrabold">CHARCOAL</span>
                          </div>
                        ) : soap.id.includes("calendula") ? (
                          <div className="absolute inset-0 bg-yellow-500/10 rounded-md flex flex-col items-center justify-center border-l-4 border-amber-450 p-1 text-center">
                            <span className="serif-title text-[9px] text-amber-800 font-extrabold">CALENDULA</span>
                          </div>
                        ) : soap.id.includes("sheabutter") ? (
                          <div className="absolute inset-0 bg-[#EFECE6]/90 rounded-md flex flex-col items-center justify-center p-1 text-center">
                            <span className="serif-title text-[9px] text-stone-750 font-extrabold">SHEA BUTTER</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-1">
                            <span className="serif-title text-[8px] text-sage-dark font-extrabold uppercase leading-none">{soap.name.slice(0, 4)}</span>
                            <span className="text-[5px] text-neutral-400 mt-0.5 tracking-widest">ORGANIC SEC</span>
                          </div>
                        )}
                        <span className="absolute bottom-1 right-2 text-[5px] text-neutral-400">CP SOUP</span>
                      </div>
                    </div>

                    {/* Information detail */}
                    <div className="space-y-2">
                      <h3 className="noto-serif text-xl font-bold text-neutral-800">{soap.name}</h3>
                      <p className="text-xs text-neutral-500 leading-relaxed min-h-[50px]">{soap.description}</p>
                    </div>

                    {/* Mini Ingredients and benefits */}
                    <div className="space-y-2.5 pt-2 border-t border-cream-dark/50">
                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">식물 원료 배합</span>
                        <div className="flex flex-wrap gap-1">
                          {soap.ingredients.map((ing, i) => (
                            <span key={i} className="text-[10px] bg-white border border-[#EDE7DF] text-neutral-700 px-2 py-0.5 rounded-full">
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">특장점</span>
                        <div className="flex flex-wrap gap-1">
                          {soap.benefits.map((ben, i) => (
                            <span key={i} className="text-[10px] text-[#5C4D3E] font-medium bg-[#FAF8F5] px-2 py-0.5 rounded-full">
                              ✓ {ben}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-cream-dark/40">
                    <p className="text-[11px] text-[#8B6E54] italic font-medium">
                      &ldquo; {soap.reasons} &rdquo;
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. Skin Diagnosis Test Panel (피부 진단 테스트) */}
      <section id="diagnose-skin" className="py-24 bg-cream-light relative overflow-hidden transition-all duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(167,184,154,0.1),transparent_40%)]"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          
          <div className="text-center space-y-4 mb-12">
            <span className="bg-[#A7B89A]/15 text-[#5C4D5D] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">AI Skincare Counseling</span>
            <h2 className="serif-title text-3xl sm:text-4xl font-bold text-neutral-800">내 피부에 맞는 천연비누 찾기</h2>
            <p className="text-neutral-500 text-xs sm:text-sm max-w-xl mx-auto">
              현재 인공 향이나 유해 케미컬로 피부 장벽이 무겁지는 않으신가요?<br />
              본인의 세안 습관에 따른 설문 결과를 토대로 AI 전문 어드바이저가 오가닉 비누를 추천합니다.
            </p>
          </div>

          <div className="bg-white border border-[#E2D9C8] rounded-[36px] shadow-xl p-8 sm:p-12 min-h-[400px] flex flex-col justify-center relative">
            
            {!testStarted && !diagnosisResult && (
              <div id="diagnose-welcome-view" className="text-center space-y-6 max-w-md mx-auto py-8">
                <div className="w-20 h-20 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                  <Compass className="w-10 h-10 text-sage-dark" />
                </div>
                <div className="space-y-2">
                  <h3 className="noto-serif text-xl font-bold text-neutral-800">4가지 질문으로 도출하는 맞춤 처방</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    본 테스트는 세안 후 당김, 트러블 유무, 각질 거친 수준을 분석해 오직 환자 맞춤 1:1 자연 복원 허브 매칭 결과를 도출합니다. 약 1분 소요됩니다.
                  </p>
                </div>
                <button 
                  id="btn-start-test" 
                  onClick={() => setTestStarted(true)}
                  className="w-full bg-[#6C7D5D] hover:bg-emerald-800 text-white font-bold py-3.5 px-6 rounded-full text-sm transition-all"
                >
                  피부 타입 무료 진단 시작하기
                </button>
              </div>
            )}

            {testStarted && !diagnosisResult && (
              <div id="diagnose-question-view" className="space-y-8">
                {/* Progress Indicator */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sage-dark">질문 {currentQuestionIdx + 1} / {DIAGNOSTIC_QUESTIONS.length}</span>
                  <div className="w-32 bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-sage h-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIdx + 1) / DIAGNOSTIC_QUESTIONS.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="noto-serif text-lg sm:text-xl font-black text-neutral-800">
                    {DIAGNOSTIC_QUESTIONS[currentQuestionIdx].title}
                  </h3>
                  
                  {/* Options Stack */}
                  <div className="grid grid-cols-1 gap-3">
                    {DIAGNOSTIC_QUESTIONS[currentQuestionIdx].options.map((option, idx) => (
                      <button
                        key={idx}
                        id={`diag-option-${DIAGNOSTIC_QUESTIONS[currentQuestionIdx].key}-${idx}`}
                        onClick={() => handleDiagnosisOption(DIAGNOSTIC_QUESTIONS[currentQuestionIdx].key, option.value)}
                        className="w-full text-left bg-cream-light/40 border border-cream-dark/50 hover:bg-sage/10 hover:border-sage p-4 rounded-2xl text-xs sm:text-sm font-semibold text-neutral-700 transition-all cursor-pointer hover:translate-x-1"
                      >
                        <span className="inline-block w-6 text-sage font-black">{idx + 1}.</span> {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {currentQuestionIdx > 0 && (
                  <button 
                    id="btn-diag-back"
                    onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                    className="text-xs text-neutral-400 hover:text-neutral-600 font-bold underline"
                  >
                    이전 질문으로 돌아가기
                  </button>
                )}
              </div>
            )}

            {isDiagnosing && (
              <div id="diagnose-loading-view" className="text-center space-y-6 py-12">
                <div className="w-12 h-12 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="space-y-2">
                  <h3 className="serif-title text-lg font-black text-neutral-700 animate-pulse">피부 밸런스 데이터 분석 중...</h3>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    귀하의 세안 후 당김 및 민감도 상태를 결합 분석하고, 허브 아틀라스 영양 비누 처방전을 조제하고 있습니다. 잠시만 가만히 머물러 주세요.
                  </p>
                </div>
              </div>
            )}

            {/* ERROR HANDLER */}
            {diagnosisError && (
              <div className="text-center space-y-4 py-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <p className="text-sm font-semibold text-neutral-600">{diagnosisError}</p>
                <button 
                  id="btn-retry-diagnose" 
                  onClick={resetDiagnosis}
                  className="bg-neutral-800 text-white font-semibold py-2 px-5 rounded-full text-xs"
                >
                  다시 시작해보기
                </button>
              </div>
            )}

            {/* DIAGNOSIS RESULT CERTIFICATE VIEW */}
            {diagnosisResult && !isDiagnosing && (
              <div id="diagnose-result-view" className="space-y-8 animate-fadeIn">
                <div className="text-center border-b border-cream-dark/60 pb-6">
                  <div className="w-10 h-10 rounded-full bg-sage-light flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-sage" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#8B6E54]">SKIN DIAGNOSIS CERTIFICATE</span>
                  <h3 className="serif-title text-2xl sm:text-3xl font-black text-neutral-800 mt-1">
                    귀하의 맞춤 진단 처방서
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Analysis Summary */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="bg-[#FAF8F5] border border-[#E2D9C8] p-5 rounded-3xl space-y-3">
                      <div>
                        <span className="text-[10px] text-neutral-400 font-extrabold block">분정 피부 유형</span>
                        <span className="noto-serif text-xl font-extrabold text-[#6C7D5D]">{diagnosisResult.skinType}</span>
                      </div>
                      <div className="border-t border-cream-dark/50 pt-2.5">
                        <span className="text-[10px] p-0.5 font-bold text-neutral-400 block">진단 총평</span>
                        <p className="text-xs text-[#8B6E54] font-semibold italic">&ldquo; {diagnosisResult.summary} &rdquo;</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-black text-neutral-700 block">장벽 심층 리포트</span>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                        {diagnosisResult.analysis}
                      </p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="lg:col-span-6 space-y-4">
                    <span className="text-xs font-black text-neutral-700 block">추천 홈케어 천연비누</span>
                    <div className="space-y-3">
                      {diagnosisResult.recommendedSoaps.map((soap, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => handleRecommendClick(soap.name)}
                          className="bg-cream-light/35 border border-cream-dark/50 hover:border-sage rounded-2xl p-4 transition-all cursor-pointer hover:bg-sage/5 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-neutral-800 group-hover:text-sage">{soap.name}</span>
                            <span className="text-[10px] text-sage-dark font-medium underline">바로가기</span>
                          </div>
                          <span className="text-[9px] text-neutral-405 block font-bold pt-1 text-[#8B6E54]">효능: {soap.keyBenefits}</span>
                          <p className="text-[11px] text-neutral-500 mt-1 lines-clamp-2 leading-relaxed">{soap.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Skincare Tips Checklist */}
                <div className="bg-sage/10 rounded-2xl p-5 border border-sage/15 space-y-3">
                  <span className="text-xs font-black text-[#5C4D3E] flex items-center space-x-1">
                    <Sparkles className="w-4 h-4 text-sage" />
                    <span>귀하를 위한 데일리 마인드 세안 루틴 실천법</span>
                  </span>
                  <ul className="space-y-2.5">
                    {diagnosisResult.skincareGuide.map((guide, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs text-neutral-600">
                        <Check className="w-4 h-4 text-sage mt-0.5 shrink-0" />
                        <span>{guide}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-center pt-4">
                  <button 
                    id="btn-restart-diagnosis" 
                    onClick={resetDiagnosis}
                    className="border border-[#8B6E54] text-[#8B6E54] hover:bg-[#8B6E54] hover:text-white font-extrabold px-6 py-2.5 rounded-full text-xs transition-all cursor-pointer"
                  >
                    진터넷 피부테스트 처음부터 다시하기
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* 7. Crafting Process Timeline (제작 과정) */}
      <section id="craft-process" className="py-24 bg-white transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold tracking-widest text-sage uppercase">Slow Curing Artistry</span>
            <h2 className="serif-title text-3xl sm:text-4xl font-bold text-neutral-800">화학 없이 영그는 1000시간 정성</h2>
            <div className="w-12 h-1 bg-sage mx-auto rounded-full mt-2"></div>
            <p className="text-neutral-500 text-xs sm:text-sm">
              천연 수제비누는 뚝딱 만들어지는 인스턴트 가공품이 아닙니다.<br className="hidden sm:inline" />
              배합부터 오랜 자연 숙성을 거쳐 귀하의 품으로 가치 있게 안착하기까지의 여정입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROCESS_STEPS.map((step, idx) => (
              <div key={idx} id={`process-card-${idx}`} className="bg-cream-light/30 border border-cream-dark/50 rounded-3xl p-6 relative hover:shadow-md transition-shadow">
                <div className="absolute -top-3 left-6 bg-sage text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  {step.step}
                </div>
                <div className="pt-4 space-y-3">
                  <h3 className="noto-serif text-lg font-bold text-neutral-800 mt-1">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{step.desc}</p>
                  <p className="text-xs text-[#8B6E54] border-t border-cream-dark/50 pt-2.5 italic">
                    {step.details}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. Customer Reviews & Write Review Feed (고객 후기) */}
      <section id="reviews-board" className="py-24 bg-cream transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between border-b border-cream-dark/60 pb-8 mb-12 gap-4">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold tracking-widest text-[#8B6E54] uppercase">Customer Testimonials</span>
              <h2 className="serif-title text-3xl sm:text-4xl font-black text-neutral-800">살결의 복원을 경험한 분들의 이야기</h2>
              <p className="text-neutral-500 text-xs sm:text-sm">
                실제 피부 속당김이나 자극으로 천연 수제비누를 사용한 후 촉촉해진 이웃들의 진실된 임상 사례집입니다.
              </p>
            </div>
            <button 
              id="btn-trigger-review-form" 
              onClick={() => {
                setWriteReviewOpen(!writeReviewOpen);
                setReviewSubmitMessage("");
              }}
              className="bg-sage hover:bg-sage-dark text-white font-bold py-3 px-6 rounded-full text-xs shadow-sm flex items-center space-x-1.5 transition-all text-center cursor-pointer"
            >
              <PenSquare className="w-4 h-4" />
              <span>진솔한 사용후기 남기기</span>
            </button>
          </div>

          {/* DYNAMIC REVIEW SUBMIT FORM COLLAPSE */}
          {writeReviewOpen && (
            <div id="review-submit-overlay" className="bg-white border border-[#E2D9C8] p-6 sm:p-8 rounded-[32px] shadow-lg mb-12 max-w-3xl mx-auto animate-fadeIn">
              <div className="flex items-center justify-between border-b border-cream-dark/50 pb-4 mb-6">
                <h4 className="noto-serif text-lg font-black text-neutral-800">사용 후기 작성</h4>
                <button onClick={() => setWriteReviewOpen(false)} className="text-neutral-400 hover:text-neutral-600 font-extrabold">✕</button>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">작성자 이름</label>
                    <input 
                      type="text" 
                      placeholder="예: 김민지" 
                      required
                      value={newReviewForm.author}
                      onChange={e => setNewReviewForm(prev => ({ ...prev, author: e.target.value }))}
                      className="w-full bg-cream-light/40 border border-cream-dark/70 rounded-xl p-3 text-sm focus:outline-none focus:border-sage"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">피부 타입</label>
                    <select
                      value={newReviewForm.skinType}
                      onChange={e => setNewReviewForm(prev => ({ ...prev, skinType: e.target.value }))}
                      className="w-full bg-cream-light/40 border border-cream-dark/70 rounded-xl p-3 text-sm focus:outline-none focus:border-sage text-neutral-700 font-bold"
                    >
                      <option value="민감성 피부">민감성 피부</option>
                      <option value="건성 피부">건성 피부</option>
                      <option value="지성 피부">지성 피부</option>
                      <option value="복합성 피부">복합성 피부</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">체험한 수제비누 제품</label>
                    <select
                      value={newReviewForm.product}
                      onChange={e => setNewReviewForm(prev => ({ ...prev, product: e.target.value }))}
                      className="w-full bg-cream-light/40 border border-cream-dark/70 rounded-xl p-3 text-sm focus:outline-none focus:border-sage text-neutral-700 font-bold"
                    >
                      {SOAP_PRODUCTS.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">평점 (별점)</label>
                    <div className="flex items-center space-x-1.5 h-11">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReviewForm(prev => ({ ...prev, rating: star }))}
                          className="text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-6 h-6 ${star <= newReviewForm.rating ? "fill-amber-400" : "text-gray-200"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">사용 전 피부 상태 (한 줄 요약)</label>
                    <input 
                      type="text" 
                      placeholder="예: 각질이 하얗게 뜨고 붉어짐" 
                      value={newReviewForm.beforeText}
                      onChange={e => setNewReviewForm(prev => ({ ...prev, beforeText: e.target.value }))}
                      className="w-full bg-cream-light/40 border border-cream-dark/70 rounded-xl p-3 text-sm focus:outline-none focus:border-sage"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">사용 후 변화된 상태 (한 줄 요약)</label>
                    <input 
                      type="text" 
                      placeholder="예: 촉촉하고 가벼운 진정" 
                      value={newReviewForm.afterText}
                      onChange={e => setNewReviewForm(prev => ({ ...prev, afterText: e.target.value }))}
                      className="w-full bg-cream-light/40 border border-cream-dark/70 rounded-xl p-3 text-sm focus:outline-none focus:border-sage"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">살결 사용기 에세이 (내용)</label>
                  <textarea 
                    rows={4}
                    placeholder="인위적인 클렌저를 사용하다 수작업 수제비누로 바꾼 후 느낀 피부 개선 에세이를 적어주세요." 
                    required
                    value={newReviewForm.content}
                    onChange={e => setNewReviewForm(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full bg-cream-light/40 border border-cream-dark/70 rounded-xl p-3 text-sm focus:outline-none focus:border-sage"
                  ></textarea>
                </div>

                {reviewSubmitMessage && (
                  <p className="text-xs text-sage font-bold bg-sage/10 p-3 rounded-lg text-center">{reviewSubmitMessage}</p>
                )}

                <div className="text-right">
                  <button 
                    type="submit"
                    className="bg-[#6C7D5D] hover:bg-emerald-800 text-white font-bold py-3 px-8 rounded-full text-xs shadow-md cursor-pointer"
                  >
                    피부 복원 에세이 등록하기
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* DYNAMIC TESTIMONIAL CARDS GRID */}
          {reviewLoading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-neutral-400">네츄럴 후기들을 정갈하게 로드하고 있습니다...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map(rev => (
                <div key={rev.id} className="bg-white border border-[#EDE7DF] p-6 rounded-[28px] shadow-sm flex flex-col justify-between transition-shadow hover:shadow-md">
                  <div className="space-y-4">
                    
                    {/* Star Rating & User Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < rev.rating ? "text-amber-400 fill-amber-400" : "text-gray-100"}`} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-neutral-400 font-bold">{rev.date}</span>
                    </div>

                    {/* Author Meta */}
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-sage/15 flex items-center justify-center">
                        <span className="text-xs font-black text-sage-dark">{rev.author.slice(0, 1)}</span>
                      </div>
                      <div className="text-left font-semibold">
                        <span className="block text-xs text-neutral-700">{rev.author}님</span>
                        <span className="block text-[9px] text-[#8B6E54]">{rev.skinType} • {rev.product}</span>
                      </div>
                    </div>

                    {/* Content text */}
                    <p className="text-xs text-neutral-600 leading-relaxed min-h-[60px] whitespace-pre-line">
                      {rev.content}
                    </p>
                  </div>

                  {/* Before & After comparison capsules */}
                  <div className="bg-cream-light/40 rounded-xl p-3 mt-4 border border-cream-dark/30 grid grid-cols-2 gap-2 text-center text-[10px]">
                    <div>
                      <span className="block text-neutral-400 font-bold uppercase tracking-wider mb-0.5">사용 전</span>
                      <span className="block text-red-700 font-extrabold truncate">{rev.beforeText}</span>
                    </div>
                    <div className="border-l border-cream-dark/60 pl-2">
                      <span className="block text-neutral-400 font-bold uppercase tracking-wider mb-0.5 font-bold">사용 후</span>
                      <span className="block text-[#6C7D5D] font-extrabold truncate">✓ {rev.afterText}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 9. Eco-Lifestyle Magazine (자연 이야기 콘텐츠) */}
      <section id="natural-magazine" className="py-24 bg-white transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold tracking-widest text-[#8B6E54] uppercase">Soup De Nature Magazine</span>
            <h2 className="serif-title text-3xl sm:text-4xl font-bold text-neutral-800">자연 이야기 매거진</h2>
            <div className="w-12 h-1 bg-sage mx-auto rounded-full mt-2"></div>
            <p className="text-neutral-500 text-xs sm:text-sm">
              천연 비누에 어린 저온 숙성의 비밀, 에센셜 식물 치료 꿀팁 및 제로 웨이스트 욕실 실천까지,<br className="hidden sm:inline" />
              당사의 AI 에디터가 전하는 가치 있고 고요한 오가닉 이야기들을 펼칩니다.
            </p>
          </div>

          {articlesLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {articles.map((art, idx) => (
                <article key={idx} id={`magazine-art-${idx}`} className="bg-[#FAF8F5] border border-[#EDE7DF] p-8 rounded-[32px] flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-sage-dark">
                      <span>{art.category}</span>
                      <span className="text-neutral-400">{art.readingTime}</span>
                    </div>
                    
                    <h3 className="noto-serif text-lg font-black text-neutral-800 leading-snug hover:text-sage-dark transition-colors cursor-pointer">
                      {art.title}
                    </h3>
                    
                    <p className="text-[11px] text-[#8B6E54] font-medium italic mt-2">
                       &ldquo; {art.excerpt} &rdquo;
                    </p>

                    <p className="text-xs text-neutral-600 leading-relaxed pt-2 border-t border-cream-dark/50 pt-4 whitespace-pre-line">
                      {art.content}
                    </p>
                  </div>

                  <div className="pt-4 mt-6 border-t border-cream-dark/40 flex justify-between items-center text-[10px] text-neutral-400">
                    <span>by Soup Editor</span>
                    <span>{art.date}</span>
                  </div>
                </article>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 10. FAQ (자주 묻는 질문) */}
      <section id="faq-accordion" className="py-24 bg-cream transition-all duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center space-y-4 mb-16">
            <span className="text-xs font-bold tracking-widest text-[#8B6E54] uppercase">Common Curiosities</span>
            <h2 className="serif-title text-3xl sm:text-4xl font-bold text-neutral-800">무엇이든 물어보세요</h2>
            <div className="w-12 h-1 bg-sage mx-auto rounded-full mt-2"></div>
            <p className="text-neutral-500 text-xs sm:text-sm">
              천연 비누 수작업의 차이점, 아로마 보존 보관법부터 어린 아기 안심 사용 범위까지<br className="hidden sm:inline" />
              가장 질문 빈도가 잦았던 천연 비누의 오가닉 상식 가이드를 모았습니다.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_LIST.map((faq, idx) => {
              const isOpen = openFAQIdx === idx;
              return (
                <div 
                  key={idx} 
                  id={`faq-item-${idx}`}
                  className="bg-white border border-cream-dark/60 rounded-[24px] overflow-hidden transition-all duration-200 shadow-sm"
                >
                  <button
                    onClick={() => setOpenFAQIdx(isOpen ? null : idx)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between font-bold text-xs sm:text-sm text-neutral-800 focus:outline-none focus:bg-cream-light cursor-pointer"
                  >
                    <span className="flex items-center space-x-2">
                      <span className="text-sage">Q.</span>
                      <span>{faq.question}</span>
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-sage" /> : <ChevronDown className="w-4 h-4 text-sage" />}
                  </button>

                  <div className={`transition-all duration-300 max-h-0 overflow-hidden ${isOpen ? "max-h-[500px]" : ""}`}>
                    <p className="px-6 pb-6 text-[11px] sm:text-xs text-neutral-500 leading-relaxed bg-[#FAF8F5] border-t border-cream-dark/40 pt-4 whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 11. Contact Us Consultation registration & Map Info (문의하기) */}
      <section id="contact-us" className="py-24 bg-white transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Register Counseling Form */}
            <div className="lg:col-span-7 bg-[#FAF8F5] border border-[#E2D9C8] rounded-[36px] p-8 sm:p-12 shadow-sm space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest text-[#8B6E54] uppercase">Counsel Request</span>
                <h2 className="serif-title text-3xl font-bold text-neutral-800">1:1 맞춤 스킨 카운셀링 신청</h2>
                <p className="text-neutral-500 text-xs sm:text-sm">
                  천연 수제비누 납품, 단체 맞춤 선물 조제, 혹은 예민성 트러블에 처방 맞춤 비누가 별도로 필요하신가요?<br />
                  세부 사항을 남겨주시면, 스킨 가이드 장인이 친절히 1일 이내 직접 연락 답변을 드립니다.
                </p>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">성함</label>
                    <input 
                      type="text" 
                      placeholder="김지우" 
                      required
                      value={contactForm.name}
                      onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white border border-cream-dark/80 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-sage"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">연락처</label>
                    <input 
                      type="tel" 
                      placeholder="010-0000-0000" 
                      required
                      value={contactForm.phone}
                      onChange={e => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-white border border-cream-dark/80 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-sage"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">이메일 주소</label>
                    <input 
                      type="email" 
                      placeholder="nature@example.com" 
                      required
                      value={contactForm.email}
                      onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-white border border-cream-dark/80 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-sage"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 font-bold block mb-1">상세 문의 / 상담 내용</label>
                  <textarea 
                    rows={5}
                    placeholder="단체 맞춤 비누 수량 요망, 피부 고유 상태에 따른 추천 조율 등 문의하실 내용을 자유롭게 적어주세요." 
                    required
                    value={contactForm.content}
                    onChange={e => setContactForm(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full bg-white border border-cream-dark/80 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-sage"
                  ></textarea>
                </div>

                {/* Return Response Indicator */}
                {contactResponse.message && (
                  <div className={`p-4 rounded-xl flex items-center space-x-2 text-xs font-bold leading-normal ${
                    contactResponse.success ? "bg-sage/10 text-emerald-800 border border-sage/20" : "bg-red-50 text-red-700 border border-red-100"
                  }`}>
                    {contactResponse.success ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <span>{contactResponse.message}</span>
                  </div>
                )}

                <button 
                  id="btn-submit-counsel" 
                  type="submit"
                  disabled={contactSubmitting}
                  className="w-full bg-neutral-800 hover:bg-neutral-900 disabled:bg-neutral-400 text-white font-extrabold tracking-wider py-4 rounded-xl text-xs sm:text-sm transition-all text-center flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
                >
                  {contactSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>카उन्셀링 상담 신청 전송 중...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-white" />
                      <span>맞춤 상담 신청 전송하기</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Brand Studio Location & SNS Info */}
            <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
              <div className="space-y-4">
                <span className="text-xs font-bold tracking-widest text-sage uppercase">Information Hub</span>
                <h3 className="serif-title text-2xl font-black text-neutral-800">오가닉 스튜디오 안내</h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                  인공적인 소음에서 멀어져 허브 향기 가득한 아뜰리에 건조 숙성방을 직접 느껴보세요.<br />
                  상담 및 맞춤 비누 수령은 사전 예약제로만 조용하게 운영됩니다.
                </p>
              </div>

              {/* Text lists */}
              <div className="space-y-4 border-t border-cream-dark/50 pt-6">
                <div className="flex items-start space-x-3 text-xs">
                  <MapPin className="w-5 h-5 text-sage-dark shrink-0 mt-0.5" />
                  <div className="text-left">
                    <span className="block font-bold text-neutral-700">공방 오시는 길</span>
                    <span className="block text-neutral-500 mt-0.5">강원도 강릉시 대관령 초산허브길 124 숲 치유동 1층</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <Clock className="w-5 h-5 text-sage-dark shrink-0 mt-0.5" />
                  <div className="text-left col-span">
                    <span className="block font-bold text-neutral-700">스튜디오 운영시간</span>
                    <span className="block text-neutral-500 mt-0.5">월~금: 오전 10시 - 오후 5시 (주말/공휴일 숙성의 방 미개방)</span>
                    <span className="block text-neutral-400 text-[10px] italic">※ 숙성 검사 시간이 오전에 상시 진행됩니다.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <Phone className="w-5 h-5 text-sage-dark shrink-0 mt-0.5" />
                  <div className="text-left col-span">
                    <span className="block font-bold text-neutral-700">전화 예약 및 문의</span>
                    <span className="block text-neutral-500 mt-0.5">033-645-1008 (정성상담 1:1 대응)</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <Mail className="w-5 h-5 text-sage-dark shrink-0 mt-0.5" />
                  <div className="text-left">
                    <span className="block font-bold text-neutral-700">공식 이메일 서식</span>
                    <span className="block text-[#8B6E54] hover:underline mt-0.5">mulpureip@gmail.com</span>
                  </div>
                </div>
              </div>

              {/* Minimal graphic mockmap */}
              <div className="rounded-3xl border border-cream-dark bg-[#FAF8F5] p-5 border-dashed flex flex-col justify-between text-center min-h-[140px] items-center justify-center relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400&auto=format&fit=crop')" }}></div>
                <div className="relative z-10 flex flex-col items-center space-y-1.5 p-3">
                  <span className="bg-sage/10 text-sage-dark font-black px-2.5 py-0.5 rounded text-[9px] uppercase tracking-widest">강릉 아로마 숲속 벨트</span>
                  <p className="noto-serif text-xs font-extrabold text-neutral-700">대관령 소나무&허브단지 도보 5분</p>
                  <p className="text-[10px] text-neutral-400">맑은 건조 숙성실을 가꾸기 위해 사전 상담 신청 예약자에 한해 초대장 지도를 발송합니다.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 12. Footer with elegant copyright and details */}
      <footer id="footer-bar" className="bg-[#FAF8F5] border-t border-[#E2D9C8] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center space-x-2 text-left">
            <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center">
              <Leaf className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="serif-title font-extrabold text-sm tracking-wider text-[#5C4D3E]">SOUP DE NATURE</span>
              <span className="text-[8px] uppercase tracking-widest text-[#8B7E6F]">Pure Organic Artisan Soap</span>
            </div>
          </div>

          <p className="text-center text-[10px] text-neutral-400 max-w-sm md:text-right">
            대표자: 스킨 가이드 장인 | 주소: 강원도 강릉시 대관령 초산허브길 124<br />
            이메일: mulpureip@gmail.com | © 2026 SOUP DE NATURE. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
