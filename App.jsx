import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  Palette,
  Grid,
  Settings,
  Bell,
  Smile,
  Brain,
  Heart,
  Activity,
  Image as ImageIcon,
  ArrowLeft,
  Eraser,
  Music,
  Share2,
  Send,
  CloudRain,
  User,
  Layout,
  Sparkles,
  Pencil,
  CheckCircle,
  Move,
  Plus,
  MousePointer2,
  X,
  Calendar,
  Play,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Check,
  Undo,
  Redo,
  Trash2,
  Download,
  PenTool,
  Highlighter,
  Mic,
} from "lucide-react";
import "./styles.css";
import { VoiceGuideButton, VoiceCommandModal, VoiceFeedbackToast } from "./VoiceUI";

// --- 1. Drawing Engine Component (Reusable) ---
const DrawingCanvas = ({ color, lineWidth, tool, onInteract, isMagicMode }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas.parentElement;

    const resizeCanvas = () => {
      if (!canvas || !container) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d");
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
      // ctx.scale(dpr, dpr); // Remove this line to avoid double scaling
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      setContext(ctx);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    if (context) {
      context.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      context.lineWidth = lineWidth;
      
      // AI Magic Mode Effect (Glow)
      if (isMagicMode && tool !== "eraser") {
        context.shadowBlur = 10;
        context.shadowColor = color;
      } else {
        context.shadowBlur = 0;
        context.shadowColor = "transparent";
      }
    }
  }, [color, lineWidth, tool, context, isMagicMode]);

  const getCoordinates = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;

    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return {
      offsetX: (clientX - rect.left) * scaleX,
      offsetY: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    if (!context) return;
    const { offsetX, offsetY } = getCoordinates(e.nativeEvent);
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    if (onInteract) onInteract();
  };

  const draw = (e) => {
    if (!isDrawing || !context) return;
    const { offsetX, offsetY } = getCoordinates(e.nativeEvent);
    context.lineTo(offsetX, offsetY);
    context.stroke();
  };

  const stopDrawing = () => {
    if (context) context.closePath();
    setIsDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full touch-none block"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

// --- Data ---
const STUDIO_DATA = {
  cognition: {
    id: "cognition",
    title: "🧠 두뇌 트레이닝",
    desc: '"그림을 그리며 기억력과 집중력을 키워보세요"',
    activities: [
      {
        id: "memory",
        title: "기억 스케치",
        desc: "방금 본 사물을 기억해서 그려보세요",
        level: 2,
        time: "5분",
        tag: "기억력",
      },
      {
        id: "pattern",
        title: "패턴 완성하기",
        desc: "비어있는 무늬를 똑같이 채워보세요",
        level: 3,
        time: "7분",
        tag: "집중력",
      },
      {
        id: "find_diff",
        title: "다른 그림 찾기",
        desc: "두 그림의 다른 점을 찾아 표시해요",
        level: 1,
        time: "5분",
        tag: "관찰력",
      },
    ],
  },
  emotion: {
    id: "emotion",
    title: "🌿 마음 치유실",
    desc: '"색채가 주는 편안함으로 마음을 다독여주세요"',
    activities: [
      {
        id: "coloring",
        title: "명화 컬러링",
        desc: "고흐의 해바라기를 내 색깔로 채워봐요",
        level: 2,
        time: "15분",
        tag: "힐링",
      },
      {
        id: "mandala",
        title: "만다라 명상",
        desc: "반복되는 무늬를 칠하며 머리를 비워요",
        level: 1,
        time: "20분",
        tag: "안정",
      },
      {
        id: "slow",
        title: "빗소리 드로잉",
        desc: "빗소리를 들으며 선을 천천히 그어봐요",
        level: 1,
        time: "10분",
        tag: "이완",
      },
    ],
  },
  reminiscence: {
    id: "reminiscence",
    title: "🌅 추억 아틀리에",
    desc: '"소중한 기억과 이야기를 그림으로 남겨보세요"',
    activities: [
      {
        id: "voice",
        title: "그때 그 시절",
        desc: "추억을 말하면 그림으로 그려드려요",
        level: 1,
        time: "자유",
        tag: "추억회상",
      },
      {
        id: "food",
        title: "엄마의 레시피",
        desc: "가장 기억에 남는 음식을 그려보세요",
        level: 2,
        time: "15분",
        tag: "기억",
      },
      {
        id: "letter",
        title: "그림 편지",
        desc: "손주에게 보낼 따뜻한 그림 편지",
        level: 1,
        time: "10분",
        tag: "소통",
      },
    ],
  },
};

/* --- Welcome Screen Component --- */
const WelcomeScreen = ({ onStartToday, onExplore }) => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#FAF7F1] p-8 animate-fadeIn">
      <div className="max-w-2xl w-full flex flex-col items-start">
        {/* Greeting Bubble */}
        <div className="bg-[#FFE5D4] px-6 py-3 rounded-full mb-8 inline-block">
          <span className="text-[#D85718] font-jua text-xl font-bold">
            성남복지관 그림약방에 오신 것을 환영합니다! 💊
          </span>
        </div>

        {/* Main Question */}
        <div className="mb-8">
          <h1 className="text-6xl font-jua text-stone-900 mb-2 leading-tight">
            김미순 님,
          </h1>
          <h1 className="text-6xl font-jua text-[#EB6A29] mb-2 leading-tight">
            오늘도 그림 수업
          </h1>
          <h1 className="text-6xl font-jua text-stone-900 leading-tight">
            함께 해볼까요?
          </h1>
        </div>

        {/* Description */}
        <p className="text-2xl font-gowun text-stone-700 mb-12 leading-relaxed">
          어르신들의 기억·감정·작품을 한 곳에서 케어하는
          <br />
          <span className="text-[#EB6A29] font-jua font-bold text-2xl">디지털 미술 약국, 그림약방</span>입니다.
        </p>

        {/* Buttons */}
        <div className="flex flex-row gap-4 w-full">
          <button
            onClick={onStartToday}
            className="btn-primary bg-[#EB6A29] border border-[#D85718] shadow-md shadow-[#FFD5B8] border border-[#D85718] shadow-md shadow-[#FFD5B8] border border-[#D85718] shadow-md shadow-[#FFD5B8] hover:bg-[#D85718] border-[#D85718] text-white text-2xl h-[72px] px-12 shadow-lg font-jua flex-1"
          >
            오늘의 수업 시작하기
          </button>
          <button
            onClick={onExplore}
            className="btn-primary bg-white hover:bg-stone-100 border-2 border-[#EB6A29] text-[#EB6A29] text-2xl h-[72px] px-12 shadow-lg font-jua flex-1"
          >
            그림약방 즐기기
          </button>
        </div>
      </div>
    </div>
  );
};

/* 💡 Coach Mark Component (Step-by-step) */
const CoachMark = ({ onDismiss }) => {
  const [step, setStep] = useState(0);

  const handleNext = (e) => {
    e.stopPropagation();
    if (step < 5) {
      setStep(step + 1);
    } else {
      onDismiss();
    }
  };

  const handleSkip = (e) => {
    e.stopPropagation();
    onDismiss();
  };

  const handleDoNotShowToday = (e) => {
    e.stopPropagation();
    const today = new Date().toDateString();
    localStorage.setItem('hideCoachMarkDate', today);
    onDismiss();
  };

  const steps = [
    {
      target: "admin",
      title: "관리자 메뉴",
      desc: "'성남복지관'을 누르면\n관리자 화면으로 이동해요!",
      style: { top: "100px", left: "40px" }
    },
    {
      target: "weekly",
      title: "금주의 수업",
      desc: "금주의 수업 화면입니다.\n이번 주 복지관 수업 일정을 확인하고 참여할 수 있습니다.",
      style: { top: "100px", right: "480px" }
    },
    {
      target: "studio",
      title: "창작실",
      desc: "창작실 메인 화면입니다.\n다양한 미술 활동을 선택할 수 있습니다.",
      style: { top: "100px", right: "360px" }
    },
    {
      target: "gallery",
      title: "나의 갤러리",
      desc: "나의 갤러리입니다.\n내가 그린 작품들을 확인할 수 있습니다.",
      style: { top: "100px", right: "240px" }
    },
    {
      target: "community",
      title: "마음 나눔",
      desc: "마음 나눔 화면입니다.\n명예의 전당 작품과 다른 어르신들의 작품을 보고\n댓글로 소통할 수 있습니다.",
      style: { top: "100px", right: "130px" }
    },
    {
      target: "ai",
      title: "AI 분석",
      desc: "AI 분석 화면입니다.\n주간 감정 변화와 활동 분석을 확인할 수 있습니다.",
      style: { top: "100px", right: "20px" }
    }
  ];

  const currentStep = steps[step];

  return (
    <div 
      onClick={handleNext}
      className="absolute inset-0 z-[200] bg-black/70 animate-fadeIn cursor-pointer rounded-[24px] overflow-hidden"
    >
      <div className="relative w-full h-full">
        {/* Skip Button */}
        <button 
          onClick={handleSkip}
          className="absolute top-8 right-8 bg-black/30 hover:bg-black/50 text-white px-6 py-3 rounded-full font-jua text-xl backdrop-blur-md transition-all border border-white/20 z-50 flex items-center gap-2"
        >
          건너뛰기 <X size={20} />
        </button>

        {/* Content */}
        <div 
          className="absolute flex flex-col items-start animate-fadeIn transition-all duration-500"
          style={currentStep.style}
        >
          {/* Tooltip Box */}
          <div className="bg-white text-stone-800 p-5 rounded-2xl shadow-2xl max-w-[320px] mt-4 relative z-10">
            <h3 className="font-jua text-2xl text-[#4C8F7E] mb-2">{currentStep.title}</h3>
            <p className="font-gowun text-xl leading-snug whitespace-pre-line text-stone-700">
              {currentStep.desc}
            </p>
            <div className="mt-3 text-right text-sm text-stone-400 font-bold">
              {step + 1} / {steps.length} ❯
            </div>
          </div>
        </div>

        {/* Bottom Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 w-full pointer-events-none">
          <p className="text-white/90 font-jua text-2xl animate-pulse drop-shadow-md">
            화면을 터치하면 다음으로 넘어갑니다
          </p>
          <div className="flex gap-3 pointer-events-auto">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-3 h-3 rounded-full transition-all ${
                  step === idx ? 'bg-[#F29A5A] scale-125' : 'bg-white/30'
                }`} 
              />
            ))}
          </div>
          
          {/* Do Not Show Today Button */}
          <button
            onClick={handleDoNotShowToday}
            className="pointer-events-auto flex items-center gap-2 text-stone-300 hover:text-white font-gowun text-lg transition-colors mt-2 bg-black/20 px-4 py-2 rounded-lg hover:bg-black/40"
          >
            <div className="w-5 h-5 rounded border border-stone-400 flex items-center justify-center">
               <Check size={16} /> 
            </div>
            오늘 하루 더 이상 보지 않기
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- Main App Component --- */
const App = () => {
  const [showWelcome, setShowWelcome] = useState(true); // 로그인 후 환영 화면 표시
  const [showCoachMark, setShowCoachMark] = useState(false); // 코치 마크 표시 여부
  const [currentScreen, setCurrentScreen] = useState("home");
  const [activeTab, setActiveTab] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState("cognition");
  const [currentActivityId, setCurrentActivityId] = useState(null);
  const [currentActivityCategory, setCurrentActivityCategory] = useState(null); // 활동 시작 시 카테고리 저장
  const [showEmotionModal, setShowEmotionModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showVoiceToast, setShowVoiceToast] = useState(false);
  const [voiceToastMessage, setVoiceToastMessage] = useState("");
  const stageRef = useRef(null);

  // 스케일 조정 함수 (창이 작아지면 비율 유지하며 축소)
  useEffect(() => {
    const updateScale = () => {
      if (!stageRef.current) return;
      const scale = Math.min(
        window.innerWidth / 1280,
        window.innerHeight / 800,
        1 // 최대 크기는 1280x800으로 제한
      );
      stageRef.current.style.transform = `scale(${scale})`;
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const navigateTo = (screen, tab) => {
    setCurrentScreen(screen);
    if (tab) setActiveTab(tab);
  };

  const navigateToCategory = (categoryKey) => {
    setSelectedCategory(categoryKey);
    navigateTo("studio_list", "studio");
  };

  // 활동 ID를 카테고리로 매핑하는 함수
  const getCategoryFromActivityId = (activityId) => {
    const activityCategoryMap = {
      "memory": "cognition",    // 기억 스케치 -> 두뇌 트레이닝
      "voice": "reminiscence",  // 그때 그 시절 -> 추억 아틀리에
      "coloring": "emotion",    // 명화 컬러링 -> 감정 힐링
      "slow": "emotion",        // 빗소리 드로잉 -> 감정 힐링
      "free": null,             // 자유 드로잉 -> 직접 시작 (studio_main으로)
    };
    return activityCategoryMap[activityId] || null;
  };

  const startActivity = (activityId, category = null) => {
    setCurrentActivityId(activityId);
    // 카테고리가 제공되지 않으면 활동 ID로 찾기
    const activityCategory = category || getCategoryFromActivityId(activityId);
    setCurrentActivityCategory(activityCategory);
    navigateTo("activity_player", "studio");
  };

  const showVoiceFeedback = (message) => {
    setVoiceToastMessage(message);
    setShowVoiceToast(true);
    setTimeout(() => setShowVoiceToast(false), 3000);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getTitle = () => {
    switch (currentScreen) {
      case "home":
        return "그림약방";
      case "weekly":
        return "금주의 수업";
      case "studio_main":
        return "창작실";
      case "studio_list":
        return STUDIO_DATA[selectedCategory].title;
      case "activity_player":
        return "활동 중";
      case "gallery":
        return "나의 갤러리";
      case "community":
        return "마음 나눔";
      case "ai":
        return "AI 분석";
      default:
        return "그림약방";
    }
  };

  const getSubTitle = () => {
    switch (currentScreen) {
      case "home":
        return "시니어를 위한 디지털 미술 테라피 플랫폼";
      case "weekly":
        return "이번 주 수업 일정을 확인하세요";
      case "studio_main":
        return "무엇을 그려볼까요?";
      case "studio_list":
        return STUDIO_DATA[selectedCategory].desc;
      case "activity_player":
        return "천천히 즐겨보세요";
      case "gallery":
        return "내가 가꾼 아름다운 작품들";
      case "community":
        return "나의 감정과 나눔 기록";
      case "ai":
        return "당신의 성장과 변화를 확인하세요";
      default:
        return "";
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return (
          <div className="h-full relative">
            <VoiceGuideButton 
              position="top-right" 
              text="홈 화면입니다. 오늘의 수업과 추천 활동을 확인할 수 있습니다."
            />
            <Screen1_Home onNav={navigateTo} onCategoryNav={navigateToCategory} onStartActivity={startActivity} />
          </div>
        );
      case "weekly":
        return (
          <div className="h-full relative">
            <VoiceGuideButton 
              position="top-right" 
              text="금주의 수업 화면입니다. 이번 주 복지관 수업 일정을 확인하고 참여할 수 있습니다."
            />
            <Screen_Weekly onNav={navigateTo} onStartActivity={startActivity} />
          </div>
        );
      case "studio_main":
        return (
          <div className="h-full relative bg-[#FAF7F1]">
            <VoiceGuideButton 
              position="top-right" 
              text="창작실 메인 화면입니다. 다양한 미술 활동을 선택할 수 있습니다."
            />
            <Screen2_StudioMain
              onNav={navigateTo}
              onCategoryNav={navigateToCategory}
              onStartActivity={startActivity}
            />
          </div>
        );
      case "studio_list":
        return (
          <Screen3_StudioList
            categoryData={STUDIO_DATA[selectedCategory]}
            onStartActivity={startActivity}
          />
        );
      case "activity_player":
        // 뒤로 가기 핸들러: 저장된 카테고리로 돌아가기
        const handleActivityBack = () => {
          if (currentActivityCategory) {
            // 카테고리가 있으면 해당 카테고리 목록으로
            setSelectedCategory(currentActivityCategory);
            navigateTo("studio_list", "studio");
          } else {
            // 카테고리가 없으면 (자유 드로잉 등) 창작실 메인으로
            navigateTo("studio_main", "studio");
          }
        };

        if (currentActivityId === "voice")
          return (
            <Activity_VoiceArt
              onBack={handleActivityBack}
            />
          );
        if (currentActivityId === "memory")
          return (
            <Activity_MemorySketch
              onBack={handleActivityBack}
            />
          );
        if (currentActivityId === "coloring")
          return (
            <Activity_HealingColoring
              onBack={handleActivityBack}
            />
          );
        if (currentActivityId === "slow")
          return (
            <Activity_SlowStudio
              onBack={handleActivityBack}
            />
          );
        if (currentActivityId === "free")
          return (
            <Activity_FreeDrawing
              onBack={handleActivityBack}
            />
          );
        return (
          <Activity_Placeholder
            onBack={handleActivityBack}
          />
        );
      case "gallery":
        return (
          <div className="h-full relative">
            <VoiceGuideButton 
              position="top-right" 
              text="나의 갤러리입니다. 내가 그린 작품들을 확인할 수 있습니다."
            />
            <Screen4_Gallery onNav={navigateTo} onToast={showToast} />
          </div>
        );
      case "community":
        return (
          <div className="h-full relative">
            <VoiceGuideButton 
              position="top-right" 
              text="마음 나눔 화면입니다. 명예의 전당 작품과 다른 어르신들의 작품을 보고 댓글로 소통할 수 있습니다."
            />
            <Screen5_Community onNav={navigateTo} />
          </div>
        );
      case "ai":
        return (
          <div className="h-full relative">
            <VoiceGuideButton 
              position="top-right" 
              text="AI 분석 화면입니다. 주간 감정 변화 그래프와 정서 안정 지수, 활동 분석을 확인할 수 있습니다."
            />
            <Screen6_AI onNav={navigateTo} />
          </div>
        );
      case "admin":
        return <Screen_Admin onNav={navigateTo} />;
      default:
        return <Screen1_Home onNav={navigateTo} />;
    }
  };

  // 코치마크 표시 여부 확인 함수
  const shouldShowCoachMark = () => {
    const hiddenDate = localStorage.getItem('hideCoachMarkDate');
    const today = new Date().toDateString();
    return hiddenDate !== today;
  };

  // 환영 화면 표시 중이면 환영 화면만 보여주기
  if (showWelcome) {
    return (
      <div id="stage-container" className="font-sans">
        <div id="stage" ref={stageRef}>
          <div className="pad-frame">
            <WelcomeScreen 
              onStartToday={() => {
                setShowWelcome(false);
                if (shouldShowCoachMark()) {
                  setShowCoachMark(true); // 오늘 하루 보지 않기 체크 안된 경우만 표시
                }
                navigateTo("weekly", "weekly");
              }}
              onExplore={() => {
                setShowWelcome(false);
                if (shouldShowCoachMark()) {
                  setShowCoachMark(true); // 오늘 하루 보지 않기 체크 안된 경우만 표시
                }
                navigateTo("home", "home");
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="stage-container" className="font-sans">
      <div id="stage" ref={stageRef}>
        <div className="pad-frame">
        {/* Top Tab Bar with User Info */}
        {activeTab !== 'admin' && (
        <div className="bg-white border-b-2 border-stone-200 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] z-50">
          {/* Tab Navigation with User Info */}
          <nav className="h-[90px] px-4 sm:px-8 flex items-center justify-between">
            {/* User Info - Left Side */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigateTo('admin', 'admin')}
                className="bg-[#FFE5D4] px-4 py-2 rounded-full hover:bg-[#FFD5B8] transition-all cursor-pointer shadow-sm flex items-center gap-2"
                title="관리자 페이지"
              >
                <span className="text-[#D85718] font-jua text-lg sm:text-xl font-bold">
                  성남복지관
                </span>
                <Settings size={18} className="text-[#F29A5A]/80" />
              </button>
              <div className="h-6 w-[2px] bg-stone-300"></div>
              <div className="flex items-center gap-3">
                <div className="bg-stone-100 p-2 rounded-full">
                  <User size={24} className="text-stone-700" />
              </div>
                <span className="text-stone-700 font-gowun text-xl sm:text-2xl font-bold">
                  김미순 님
                </span>
              </div>
            </div>
            
            {/* Tab Buttons - Right Side */}
            <div className="flex items-center gap-2 sm:gap-4">
            <TabButton
              icon={Home}
              label="홈"
              id="home"
              active={activeTab}
              onClick={() => navigateTo("home", "home")}
            />
            <TabButton
              icon={Calendar}
              label="금주의 수업"
              id="weekly"
              active={activeTab}
              onClick={() => navigateTo("weekly", "weekly")}
            />
            <TabButton
              icon={Palette}
              label="창작실"
              id="studio"
              active={activeTab}
              onClick={() => navigateTo("studio_main", "studio")}
            />
            <TabButton
              icon={Grid}
              label="나의 갤러리"
              id="gallery"
              active={activeTab}
              onClick={() => navigateTo("gallery", "gallery")}
            />
            <TabButton
              icon={Heart}
              label="마음 나눔"
              id="community"
              active={activeTab}
              onClick={() => navigateTo("community", "community")}
            />
            <TabButton
              icon={Brain}
              label="AI 분석"
              id="ai"
              active={activeTab}
              onClick={() => navigateTo("ai", "ai")}
            />
            </div>
          </nav>
        </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative bg-[#FAF7F1] flex flex-col min-h-0">
          {renderScreen()}
        </main>
          
          {/* Coach Mark - Moved inside pad-frame */}
          {showCoachMark && <CoachMark onDismiss={() => setShowCoachMark(false)} />}
        </div>
      </div>

      {/* Emotion Modal */}
      {showEmotionModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn" onClick={() => setShowEmotionModal(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl border-2 border-[#D8E8FF] relative flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowEmotionModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-400 transition"
            >
              <X size={32} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#E8F0FF] p-3 rounded-full text-[#2A6CCF]">
                <Smile size={36} />
              </div>
              <div>
                <h3 className="text-2xl font-jua text-blue-900">나의 감정 흐름</h3>
                <p className="text-lg font-gowun text-[#2560B8]">지난 일주일간의 기분 변화에요.</p>
              </div>
            </div>

            <EmotionChart />

            <button
              onClick={() => setShowEmotionModal(false)}
              className="mt-8 w-full btn-primary bg-[#2A6CCF] border-[#2560B8] shadow-[#1F4F9E] text-lg h-[56px]"
            >
              확인했어요
            </button>
          </div>
        </div>
      )}

      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] animate-fadeIn">
          <div className="bg-stone-800 text-white px-8 py-5 rounded-2xl shadow-2xl font-gowun text-2xl flex items-center gap-3">
            {toastMessage}
          </div>
        </div>
      )}

      {/* 음성 UI 추가 - 임시 주석 처리 */}
      {/* <VoiceCommandModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
      />
      <VoiceFeedbackToast
        message={voiceToastMessage}
        isVisible={showVoiceToast}
      /> */}
    </div>
  );
};

// Emotion Chart Component
const EmotionChart = () => {
  const emotionWeek = [3, 4, 2, 5, 4, 3, 4]; // mock 감정 점수(1~5)
  const days = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <div>
      <div className="bg-[#E8F0FF] rounded-2xl p-6 mb-6 flex-1">
        <div className="flex items-end gap-4 h-[200px] w-full">
          {emotionWeek.map((score, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-end flex-1 h-full group"
            >
              <div className="text-sm font-jua text-blue-400 mb-2 opacity-100 transition-opacity">
                {score}점
              </div>
              <div
                className="w-full max-w-[40px] rounded-t-2xl bg-white border-2 border-[#C5D9FF] flex items-end justify-center hover:bg-[#D8E8FF] transition-colors relative"
                style={{ height: `${20 + score * 15}%` }}
              >
                <div className="w-1/2 rounded-t-full bg-blue-300 h-3 mb-2" />
              </div>
              <span className="text-base font-gowun text-[#1F4F9E] mt-3">
                {days[idx]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-lg font-gowun text-blue-800">
          "이번 주는 전반적으로 <span className="font-bold border-b-2 border-blue-300">차분한 일주일</span>이었어요."
        </p>
        <p className="text-base font-gowun text-stone-700 mt-2">
          비 오는 날엔 따뜻한 차 한 잔 어떠세요? 🍵
        </p>
      </div>
    </div>
  );
};

const TabButton = ({ icon: Icon, label, id, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 w-20 sm:w-28 h-full transition-all ${
        active === id
          ? "text-[#265C43]"
          : "text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl"
      }`}
    >
      <div
        className={`p-2 rounded-xl ${
          active === id ? "bg-[#DBF2E3]" : "bg-transparent"
        }`}
      >
        <Icon size={32} strokeWidth={active === id ? 3 : 2} />
      </div>
      <span
        className={`text-base sm:text-lg font-jua ${
          active === id ? "font-bold" : "font-medium"
        }`}
      >
        {label}
      </span>
    </button>
  );
};

/* 📅 Screen: Weekly Schedule - 금주의 수업 */
const Screen_Weekly = ({ onNav, onStartActivity }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0: 이번 주, -1: 지난 주, 1: 다음 주

  // 수업 제목을 활동 ID로 매핑
  const getActivityIdFromTitle = (title) => {
    const titleMap = {
      "기억 회상 스케치": "memory",
      "명화 컬러링": "coloring",
      "자유 드로잉": "free",
      "빗소리 드로잉": "slow",
      "스티커 아트": null, // 아직 활동이 없을 수 있음
    };
    return titleMap[title] || null;
  };

  // 주의 시작일과 끝일 계산
  const getWeekRange = (weekOffset) => {
    const today = new Date();
    const currentDay = today.getDay(); // 0: 일요일, 1: 월요일, ...
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // 월요일을 주의 시작으로
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + (weekOffset * 7));
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4); // 월요일 + 4일 = 금요일
    
    const formatDate = (date) => {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day}`;
    };
    
    return {
      start: formatDate(monday),
      end: formatDate(friday),
      startFull: monday,
      endFull: friday,
    };
  };

  const weekRange = getWeekRange(currentWeekOffset);

  // 오늘 날짜 확인 (테스트: 11/27을 오늘로 설정)
  const isToday = (date) => {
    return date === "11/27"; // 실제로는 현재 날짜와 비교
  };

  // 주간 수업 스케줄 데이터
  const weeklySchedule = [
    {
      id: 1,
      day: "월",
      date: "11/24",
      time: "10:00",
      title: "반짝반짝 보석 십자수",
      type: "kit",
      description: "비즈를 하나하나 붙여 아름다운 꽃을 피워봐요",
      materials: ["보석 십자수 키트", "트레이", "펜"],
      videoUrl: "https://example.com/video1",
      hasOnlineContent: true,
      completed: true, // 완료됨
      completedDate: "2024.11.24",
      artworkId: 2,
    },
    {
      id: 2,
      day: "화",
      date: "11/25",
      time: "10:00",
      title: "명화 컬러링: 고흐의 밤",
      type: "digital",
      description: "고흐의 '별이 빛나는 밤'을 나만의 색으로 채워요",
      materials: ["태블릿", "터치펜"],
      videoUrl: "https://example.com/video2",
      hasOnlineContent: true,
      completed: false,
      linkedActivityId: "coloring", // 창작실 '명화 컬러링' 연계
    },
    {
      id: 3,
      day: "수",
      date: "11/26",
      time: "10:00",
      title: "클레이로 빚는 꽃 화분",
      type: "hybrid",
      description: "점토로 예쁜 화분을 만들고 앱으로 촬영해봐요",
      materials: ["클레이 점토", "조형 도구", "태블릿 카메라"],
      videoUrl: "https://example.com/video3",
      hasOnlineContent: false,
      completed: false,
      isToday: true, // 오늘의 수업
    },
    {
      id: 4,
      day: "목",
      date: "11/27",
      time: "10:00",
      title: "음악 드로잉: 선의 춤",
      type: "digital",
      description: "음악의 리듬에 맞춰 자유롭게 선을 그려보세요",
      materials: ["태블릿", "터치펜", "이어폰"],
      videoUrl: "https://example.com/video4",
      hasOnlineContent: true,
      completed: false,
      linkedActivityId: "free", // 창작실 '자유 드로잉' 연계
    },
    {
      id: 5,
      day: "금",
      date: "11/28",
      time: "10:00",
      title: "전통 한지 손거울 꾸미기",
      type: "kit",
      description: "알록달록 한지로 세상에 하나뿐인 거울을 만들어요",
      materials: ["손거울 틀", "한지", "풀", "마감제"],
      videoUrl: "https://example.com/video5",
      hasOnlineContent: false,
      completed: false,
    },
  ];

  return (
      <div className="h-full flex flex-col p-8 animate-fadeIn overflow-hidden">
      {/* Header with Week Navigation */}
        <div className="mb-6 shrink-0">
          <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
            className="p-3 rounded-full bg-white border-2 border-stone-200 hover:bg-stone-100 hover:border-[#F29A5A] transition flex items-center justify-center"
          >
            <ChevronLeft size={28} className="text-stone-700" />
          </button>
          <div className="flex-1 text-center">
              <h2 className="text-4xl font-jua text-stone-800 mb-2">
              {currentWeekOffset === 0 ? "이번 주" : currentWeekOffset === -1 ? "지난 주" : "다음 주"} 수업 일정
            </h2>
            <p className="text-lg font-gowun text-stone-700">
              {weekRange.start} ~ {weekRange.end}
            </p>
          </div>
          <button
            onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
            className="p-3 rounded-full bg-white border-2 border-stone-200 hover:bg-stone-100 hover:border-[#F29A5A] transition flex items-center justify-center"
          >
            <ChevronRight size={28} className="text-stone-700" />
          </button>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
        <div className="grid grid-cols-3 gap-4">
        {weeklySchedule.map((classItem) => (
          <div
            key={classItem.id}
            onClick={() => setSelectedClass(classItem)}
            className={`card-base border-2 p-6 hover:shadow-lg transition-all cursor-pointer group relative flex flex-col ${
              classItem.isToday
                ? 'border-blue-400 ring-2 ring-[#C5D9FF] shadow-md !bg-[#D8E8FF]'
                : classItem.completed
                ? 'border-[#B5DFC7] !bg-white'
                : 'border-stone-200 !bg-white hover:border-[#F29A5A] hover:!bg-stone-50'
            }`}
          >
            {/* 완료 체크 아이콘 */}
            {classItem.completed && (
              <div className="absolute top-4 right-4 w-10 h-10 bg-#2E8C46 rounded-full flex items-center justify-center shadow-md z-10">
                <Check size={24} className="text-white font-bold" strokeWidth={3} />
              </div>
            )}

            {/* 오늘 배지 */}
            {classItem.isToday && (
              <div className="absolute top-4 right-4 bg-[#2A6CCF] text-white px-3 py-1 rounded-full text-sm font-jua font-bold shadow-md animate-pulse z-10">
                오늘
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-12">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`px-4 py-1 rounded-full text-base font-jua font-bold ${
                    classItem.isToday
                      ? 'bg-[#D8E8FF] text-[#2560B8]'
                      : classItem.completed
                      ? 'bg-[#DBF2E3] text-[#256A39]'
                      : 'bg-[#FFE5D4] text-[#D85718]'
                  }`}>
                    {classItem.day}요일
                  </span>
                  <span className="text-stone-700 font-gowun text-base">
                    {classItem.date}
                  </span>
                </div>
                <h3 className={`text-2xl sm:text-3xl font-jua mb-3 leading-tight ${
                  classItem.completed ? 'text-stone-700' : 'text-stone-800'
                }`}>
                  {classItem.title}
                </h3>
                <p className={`text-base sm:text-lg font-gowun mb-3 ${
                  classItem.completed ? 'text-stone-700' : 'text-stone-700'
                }`}>
                  {classItem.description}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end mt-auto">
              <button className={`px-5 py-2.5 rounded-lg font-jua text-base flex items-center gap-2 shadow-sm ${
                classItem.completed
                  ? 'bg-stone-200 text-stone-700 cursor-default'
                  : classItem.isToday
                  ? 'bg-[#2A6CCF] text-white hover:bg-[#2560B8]'
                  : 'bg-[#FFE5D4] text-[#D85718] hover:bg-[#FFD5B8]'
              }`}>
                {classItem.completed ? <CheckCircle size={18} /> : <Play size={18} fill={classItem.isToday ? "currentColor" : "none"} />}
                {classItem.completed ? '학습 완료' : '학습 시작'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Class Detail Modal */}
      {selectedClass && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-fadeIn"
          onClick={() => setSelectedClass(null)}
        >
          <div
            className="bg-white rounded-3xl p-8 w-[90%] max-w-[1000px] shadow-2xl border-2 border-stone-200 relative flex flex-row gap-8"
            style={{ maxHeight: '85%', minHeight: '620px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 좌측: 정보 영역 */}
            <div className="flex-1 pr-4 flex flex-col min-h-0">
            <button
              onClick={() => setSelectedClass(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-400 transition z-10"
            >
              <X size={28} />
            </button>

            <div className="mb-6 shrink-0">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`px-4 py-2 rounded-full text-lg font-jua font-bold ${
                  selectedClass.isToday
                    ? 'bg-[#D8E8FF] text-[#2560B8]'
                    : selectedClass.completed
                    ? 'bg-[#DBF2E3] text-[#256A39]'
                    : 'bg-[#FFE5D4] text-[#D85718]'
                }`}>
                  {selectedClass.day}요일
                </span>
                <span className="text-stone-700 font-gowun text-base">
                  {selectedClass.date}
                </span>
                {selectedClass.completed && (
                  <span className="bg-#2E8C46 text-white px-4 py-2 rounded-full text-base font-jua font-bold flex items-center gap-1">
                    <Check size={18} strokeWidth={3} />
                    수업 완료
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h2 className="text-3xl font-jua text-stone-800">
                {selectedClass.title}
              </h2>
                <span className={`px-3 py-1 rounded-lg font-jua text-lg ${
                  selectedClass.type === 'kit' ? 'bg-[#E8D8F4] text-[#6B3DB0]' :
                  selectedClass.type === 'digital' ? 'bg-[#D8E8FF] text-[#1F4F9E]' :
                  'bg-[#DBF2E3] text-[#1E5A2E]'
                }`}>
                  {selectedClass.type === 'kit' ? '✂️ 만들기 키트' :
                   selectedClass.type === 'digital' ? '📱 디지털 활동' :
                   '🌱 체험 활동'}
                </span>
              </div>
              <p className="text-lg font-gowun text-stone-700 mb-4">
                {selectedClass.description}
              </p>
            </div>

            {/* Video Section */}
            <div className="flex-1 flex flex-col min-h-0">
              <h3 className="text-xl font-jua text-stone-800 mb-3 flex items-center gap-2 shrink-0">
                <Play size={24} className="text-[#EB6A29]" />
                안내 영상
              </h3>
              <div className="bg-stone-100 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden flex-1">
                {/* 전체 화면 버튼 - 우상단 */}
                <button className="absolute top-4 right-4 bg-white hover:bg-stone-100 border-2 border-stone-300 text-stone-700 px-4 py-2 rounded-xl font-jua text-sm transition-all shadow-md flex items-center gap-2 z-10">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                  </svg>
                  전체 화면
                </button>
                
                {/* 중앙 재생 버튼 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#EB6A29] border border-[#D85718] shadow-md shadow-[#FFD5B8] border border-[#D85718] shadow-md shadow-[#FFD5B8] border border-[#D85718] shadow-md shadow-[#FFD5B8] rounded-full flex items-center justify-center mx-auto shadow-lg cursor-pointer hover:bg-[#D85718] transition-all">
                    <Play size={28} className="text-white ml-1" />
                  </div>
                  <p className="text-base font-gowun text-stone-700 mt-3">
                    영상 미리보기
                  </p>
                </div>
              </div>
              </div>
            </div>

            {/* 우측: 버튼 영역 */}
            <div className="w-[280px] shrink-0 flex flex-col gap-4 min-h-0">
              <h3 className="text-2xl font-jua text-stone-800 mb-2 shrink-0">📋 준비물</h3>
              <div className="flex flex-col gap-2 mb-4 overflow-y-auto flex-1 min-h-0">
                {selectedClass.materials.map((material, idx) => (
                  <span
                    key={idx}
                    className="bg-stone-100 text-stone-700 px-4 py-3 rounded-xl font-gowun text-base"
                  >
                    • {material}
                  </span>
                ))}
              </div>

              <div className="border-t-2 border-stone-200 pt-4 mt-auto space-y-3">
                {/* 1. 연계 디지털 활동 버튼 */}
                {selectedClass.linkedActivityId && (
                        <button
                          onClick={() => {
                      onStartActivity(selectedClass.linkedActivityId);
                            setSelectedClass(null);
                          }}
                    className="w-full btn-primary bg-[#EB6A29] border border-[#D85718] shadow-md shadow-[#FFD5B8] border border-[#D85718] shadow-md shadow-[#FFD5B8] border border-[#D85718] shadow-md shadow-[#FFD5B8] hover:bg-[#D85718] border-[#D85718] text-white text-lg h-[64px] font-jua shadow-md flex items-center justify-center gap-2"
                        >
                    <Palette size={22} />
                    디지털 활동 시작
                        </button>
                )}

                {/* 2. 작품 사진 기록하기 (키트/하이브리드 활동만 노출) */}
                {(selectedClass.type === 'kit' || selectedClass.type === 'hybrid') && (
                      <button
                        onClick={() => {
                        alert("📷 카메라가 실행됩니다.\n완성한 작품을 촬영하여 갤러리에 보관하세요!");
                        onNav("gallery");
                          setSelectedClass(null);
                        }}
                    className="w-full btn-primary bg-stone-700 hover:bg-stone-800 border-stone-800 text-white text-lg h-[64px] font-jua shadow-md flex items-center justify-center gap-2"
                  >
                    <ImageIcon size={22} />
                    작품 사진 기록
                      </button>
                )}

                {/* 3. 닫기 */}
                  <button
                    onClick={() => setSelectedClass(null)}
                  className="w-full btn-primary bg-white hover:bg-stone-100 border-2 border-stone-300 text-stone-700 text-lg h-[56px] font-jua"
                  >
                    닫기
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* 1️⃣ Screen 1: Home - Split Layout for Reasoned Prescription */
const Screen1_Home = ({ onNav, onCategoryNav, onStartActivity }) => {
  // 오늘의 수업 정보 가져오기
  const getTodayClass = () => {
    // 테스트: 27일(수요일)을 오늘로 설정
    const todayDayName = "수"; 

    // 금주의 수업 스케줄 데이터 (기획된 데이터 적용)
    const weeklySchedule = [
      {
        day: "월",
        date: "11/24",
        time: "10:00",
        title: "반짝반짝 보석 십자수",
        type: "kit",
        desc: "비즈를 붙여 아름다운 꽃을 피워봐요",
      },
      {
        day: "화",
        date: "11/25",
        time: "10:00",
        title: "명화 컬러링: 고흐의 밤",
        type: "digital",
        desc: "고흐의 별이 빛나는 밤을 색칠해요",
      },
      {
        day: "수",
        date: "11/26",
        time: "10:00",
        title: "클레이로 빚는 꽃 화분",
        type: "hybrid",
        desc: "점토로 예쁜 화분을 만들고 사진을 찍어요",
      },
      {
        day: "목",
        date: "11/27",
        time: "10:00",
        title: "음악 드로잉: 선의 춤",
        type: "digital",
        desc: "음악의 리듬에 맞춰 선을 자유롭게 그려요",
      },
      {
        day: "금",
        date: "11/28",
        time: "10:00",
        title: "전통 한지 손거울 꾸미기",
        type: "kit",
        desc: "한지 공예로 고운 거울을 만들어요",
      },
    ];

    // 오늘 요일과 일치하는 수업 찾기
    const todayClass = weeklySchedule.find(classItem => classItem.day === todayDayName);
    return todayClass || weeklySchedule[0] || null;
  };

  const todayClass = getTodayClass();

  // 수업 제목을 활동 ID로 매핑 (바로가기 기능)
  const getActivityIdFromTitle = (title) => {
    if (title.includes("컬러링")) return "coloring";
    if (title.includes("음악")) return "free"; // 음악 드로잉 -> 자유 드로잉 연계
    return null;
  };

  return (
    <div className="h-full flex flex-col p-8 gap-6 animate-fadeIn overflow-hidden">
    {/* Today's Class Info */}
    {todayClass && (
        <div className="flex-none card-base bg-white border-2 border-stone-200 p-8 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex-1">
              {/* 1. 상단: 오늘의 수업 배지 & 날짜 */}
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-[#2A6CCF] text-white px-5 py-2 rounded-full font-jua text-xl font-bold shadow-sm">
                오늘의 수업 📚
              </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <Calendar size={24} />
                  <span className="font-gowun text-xl font-bold">
                    {todayClass.date.replace('/', '월 ')}일 {todayClass.day}요일
                  </span>
              </div>
            </div>

              {/* 2. 중단: 타이틀 & 활동 유형 배너 */}
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h3 className="text-[2.5rem] font-jua text-stone-800 leading-tight">
                  {todayClass.title}
            </h3>
                {todayClass.type && (
                  <div className={`px-4 py-1.5 rounded-lg font-jua text-lg ${
                    todayClass.type === 'kit' ? 'bg-[#E8D8F4] text-[#6B3DB0]' :
                    todayClass.type === 'digital' ? 'bg-[#D8E8FF] text-[#1F4F9E]' :
                    'bg-[#DBF2E3] text-[#1E5A2E]'
                  }`}>
                    {todayClass.type === 'kit' ? '✂️ 만들기 키트' :
                     todayClass.type === 'digital' ? '📱 디지털 활동' :
                     '🌱 체험 활동'}
                  </div>
                )}
              </div>

              {/* 3. 하단: 설명 */}
              <p className="text-2xl font-gowun text-stone-700 mb-2">
                {todayClass.desc}
            </p>
          </div>
          <button
            onClick={() => {
              const activityId = getActivityIdFromTitle(todayClass.title);
              if (activityId) {
                onStartActivity(activityId);
              } else {
                  // 활동이 없는 경우 (예: 키트 활동) 수업 일정 화면으로 이동
                onNav("weekly", "weekly");
              }
            }}
              className="btn-primary bg-[#2A6CCF] hover:bg-[#2560B8] border-[#2560B8] text-white px-8 py-4 rounded-2xl font-jua text-2xl shrink-0 ml-6 h-[72px] shadow-lg"
          >
            수업 바로 가기
          </button>
        </div>
      </div>
    )}

    {/* 1. Today's Art Prescription (Hero Section) */}
    <div className="flex-none flex-[1.8] card-base flex flex-row relative overflow-hidden bg-white border-2 border-yellow-400 shadow-md shrink-0 min-h-0 p-0">
      {/* Left: Prescription Main */}
      <div className="w-[50%] bg-[#FFFBEB] p-6 flex flex-col justify-center border-r-2 border-dashed border-yellow-200 relative">
        <div className="inline-block bg-yellow-400 text-white px-4 py-2 rounded-full font-jua text-[18px] mb-4 w-fit shadow-sm">
          오늘의 맞춤 처방 💊
        </div>
        <h2 className="text-[2.8rem] font-jua text-stone-900 mb-3 leading-tight">
          "비 오는 아침,
          <br />
          <span className="text-[#EB6A29]">따뜻한 에너지</span>가 필요해 보여요"
        </h2>
        <p className="text-xl font-gowun text-stone-700 mb-4 leading-relaxed">
          기분 전환을 위해
          <br />
          밝은 색을 칠해보는 건 어떨까요?
        </p>
        <button
          className="btn-primary w-full text-2xl h-[64px] shadow-[#FFD5B8] border-[#F29A5A] bg-[#EB6A29] border border-[#D85718] shadow-md shadow-[#FFD5B8] border border-[#D85718] shadow-md shadow-[#FFD5B8] border border-[#D85718] shadow-md shadow-[#FFD5B8] hover:bg-[#D85718]"
          onClick={() => onCategoryNav("emotion")}
        >
          추천 활동 시작하기
        </button>
      </div>

      {/* Right: Analytical Evidence (The "Why") */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center bg-white">
          <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl sm:text-2xl font-jua text-stone-400 flex items-center gap-2">
            <Sparkles size={24} /> AI 분석 리포트
          </h3>
          <span className="text-sm font-gowun text-stone-300 bg-stone-100 px-3 py-1.5 rounded">
            09:30 측정됨
          </span>
        </div>

        <div className="space-y-4">
          {/* Reason 1: Emotion */}
          <div className="flex items-center gap-4 bg-stone-100 p-4 rounded-2xl border border-stone-100">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm border border-stone-100">
              😐
            </div>
            <div>
              <p className="text-[20px] font-gowun text-stone-700">
                약간의 <strong>피로감</strong>이 얼굴에 보여요.
              </p>
            </div>
          </div>

          {/* Reason 2: Context */}
          <div className="flex items-center gap-4 bg-stone-100 p-4 rounded-2xl border border-stone-100">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-blue-400 shadow-sm border border-stone-100">
              <CloudRain size={28} />
            </div>
            <div>
              <p className="text-[20px] font-gowun text-stone-700">
                <strong>비 오는 오전</strong>이라 몸이 처질 수 있어요.
              </p>
            </div>
          </div>

          {/* Reason 3: Behavior */}
          <div className="flex items-center gap-4 bg-stone-100 p-4 rounded-2xl border border-stone-100">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-#2E8C46 shadow-sm border border-stone-100">
              <Activity size={28} />
            </div>
            <div>
              <p className="text-[20px] font-gowun text-stone-700">
                어제보다 <strong>반응 속도</strong>가 조금 느려졌어요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

/* 2️⃣ Screen 2: Studio Main (New Art Hub) */
const Screen2_StudioMain = ({ onNav, onCategoryNav, onStartActivity }) => {
  const creationActivities = [
    {
      id: "mini-game",
      title: "두뇌 미니게임",
      description: "기억력·집중력을 깨워주는 가벼운 두뇌 놀이 활동",
      tags: ["#순서맞추기", "#패턴찾기", "#숫자연결"],
      icon: "🧠",
      color: "bg-white border-stone-300",
      onClick: () => onCategoryNav("cognition"),
    },
    {
      id: "healing",
      title: "마음 치유실",
      description: "마음을 편하게 하고 스트레스를 낮춰주는 힐링 활동",
      tags: ["#감정컬러링", "#명상드로잉"],
      icon: "🌿",
      color: "bg-white border-stone-300",
      onClick: () => onCategoryNav("emotion"),
    },
    {
      id: "atelier",
      title: "추억 아틀리에",
      description: "계절·우리 동네·추억을 그림으로 담아보는 창작 공간",
      tags: ["#계절그림", "#우리동네"],
      icon: "🏡",
      color: "bg-white border-stone-300",
      onClick: () => onCategoryNav("reminiscence"),
    },
    {
      id: "free",
      title: "자유 드로잉",
      description: "손이 떨려도 괜찮아요. AI 그림 친구가 선을 다듬어 주고, 그림을 보며 부드럽게 코칭해줘요.",
      tags: ["#손떨림보조", "#AI그림친구", "#마음껏그리기"],
      icon: "✏️",
      color: "bg-white border-stone-300",
      onClick: () => onStartActivity("free"),
      features: {
        tremorAssist: true,
        aiBuddy: true,
      },
    },
  ];

  return (
    <div className="h-full flex flex-col p-6 sm:p-8 gap-6 animate-fadeIn overflow-y-auto sm:overflow-hidden bg-[#FAF7F1]">
      {/* 4 Major Categories - 2x2 Grid */}
      <div className="flex-1 grid grid-cols-2 gap-5 min-h-0">
        {creationActivities.map((activity) => (
          <StudioCard
            key={activity.id}
            title={activity.title}
            desc={activity.description}
            tags={activity.tags}
            icon={activity.icon}
            color={activity.color}
            onClick={activity.onClick}
          />
        ))}
      </div>
    </div>
  );
};

const StudioCard = ({ title, desc, tags, icon, color, onClick }) => (
  <button
    onClick={onClick}
    className={`${color} card-base p-8 flex flex-col text-left hover:shadow-xl hover:-translate-y-1 transition-all h-full group min-h-0 w-full`}
  >
    <div className="flex items-center gap-3 mb-3">
      <span className="text-4xl">{icon}</span>
      <h3 className="text-3xl sm:text-4xl font-jua text-stone-900">{title}</h3>
    </div>
    <p className="text-xl sm:text-2xl font-gowun text-stone-700 mb-6 leading-snug">
      {desc}
    </p>

    <div className="mt-auto flex gap-2 flex-wrap">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="bg-white/60 px-4 py-2 rounded-lg text-stone-700 font-gowun text-base"
        >
          {tag}
        </span>
      ))}
    </div>
  </button>
);

/* 3️⃣ Screen 3: Studio List (Detailed Activities) */
  const Screen3_StudioList = ({ categoryData, onStartActivity }) => {
    // memory(기억 스케치), voice(그때 그 시절), coloring(명화 컬러링), slow(빗소리 드로잉), free(자유 드로잉)
    const implementedActivities = ['memory', 'voice', 'coloring', 'slow', 'free']; 
  
    return (
  <div className="h-full flex flex-col p-6 sm:p-8 animate-fadeIn">
    <div className="mb-6 shrink-0 bg-stone-100 p-6 rounded-2xl border-2 border-stone-200 text-center">
      <h2 className="text-3xl font-jua text-stone-800 mb-2">
        {categoryData.title}
      </h2>
      <p className="text-xl text-stone-700 font-gowun">{categoryData.desc}</p>
    </div>

    <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {categoryData.activities.map((item, index) => {
          const isImplemented = implementedActivities.includes(item.id);
          
          return (
        <ActivityListItem
          key={index}
          title={item.title}
          desc={item.desc}
          level={item.level}
          time={item.time}
          tag={item.tag}
            disabled={!isImplemented}
            onClick={() => isImplemented && onStartActivity(item.id, categoryData.id)}
        />
          );
        })}
    </div>
  </div>
);
  };

const ActivityListItem = ({ title, desc, level, time, tag, onClick, disabled }) => (
  <div 
    onClick={!disabled ? onClick : undefined}
    className={`card-base p-6 flex flex-col sm:flex-row items-center justify-between transition group gap-5 sm:gap-0 border-2 ${
      disabled 
        ? "bg-stone-100 border-stone-100 opacity-60 cursor-not-allowed" 
        : "bg-white hover:border-[#4C8F7E] hover:shadow-lg cursor-pointer border-transparent"
    }`}
  >
    <div className="flex-1 min-w-0 mr-5 w-full sm:w-auto">
      <div className="flex items-center gap-3 mb-2">
        <span className={`px-3 py-1.5 rounded-lg text-base font-jua ${disabled ? "bg-stone-200 text-stone-400" : "bg-stone-100 text-stone-700"}`}>
          {tag}
        </span>
        <h3 className="text-2xl sm:text-3xl font-jua text-stone-900 truncate">{title}</h3>
      </div>
      <p className="text-lg sm:text-xl font-gowun text-stone-700 mb-3 font-bold truncate">
        {desc}
      </p>
      <div className="flex gap-5 text-lg font-gowun text-stone-700">
        <span className="flex items-center gap-2">
          난이도:{" "}
          <span className={`${disabled ? "text-stone-300" : "text-[#4C8F7E]"} text-xl`}>
            {"●".repeat(level)}
          </span>
          <span className="text-stone-300 text-xl">
            {"○".repeat(3 - level)}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <Activity size={20} /> {time} 소요
        </span>
      </div>
    </div>
    
    <button
      disabled={disabled}
      className={`w-full sm:w-[160px] h-[64px] text-2xl shrink-0 rounded-xl font-jua transition-all ${
        disabled
          ? "bg-stone-200 text-stone-400 cursor-not-allowed"
          : "btn-primary bg-[#4C8F7E] hover:bg-[#3F7F6E] text-white shadow-md hover:shadow-lg"
      }`}
    >
      {disabled ? "준비중" : "시작하기"}
    </button>
  </div>
);

/* 4️⃣ Screen 4: My Gallery (Improved "My Atelier") */
const Screen4_Gallery = ({ onNav, onToast }) => {
  const [activeTab, setActiveTab] = useState('drawer'); // 'atelier' or 'drawer'
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  
  // 가상 데이터: 내 방에 배치된 아이템들
  const [myRoomItems, setMyRoomItems] = useState([
    { id: 1, type: 'frame', x: 15, y: 20, content: '🌻', title: '해바라기', frameColor: 'border-amber-800', shared: true, selectedCount: 3 },
    { id: 2, type: 'frame', x: 45, y: 15, content: '🏡', title: '고향집', frameColor: 'border-stone-600', shared: false, selectedCount: 0 },
    { id: 3, type: 'frame', x: 75, y: 25, content: '🦋', title: '나비', frameColor: 'border-yellow-600', shared: true, selectedCount: 5 },
    { id: 4, type: 'easel', x: 65, y: 60, content: '🎨', title: '작업중', frameColor: 'border-stone-800', shared: false, selectedCount: 0 },
  ]);

  // Mock 데이터: 사용자가 그린 작품들
  const [myArtworks, setMyArtworks] = useState([
    { id: 1, title: '해바라기', date: '2024.11.20', category: '자유 드로잉', emoji: '🌻', color: 'bg-yellow-50', shared: true, selectedCount: 3 },
    { id: 2, title: '고향집', date: '2024.11.18', category: '추억 스케치', emoji: '🏡', color: 'bg-[#E8F0FF]', shared: false, selectedCount: 0 },
    { id: 3, title: '나비', date: '2024.11.15', category: '명화 컬러링', emoji: '🦋', color: 'bg-purple-50', shared: true, selectedCount: 5 },
    { id: 4, title: '가을 풍경', date: '2024.11.12', category: '자유 드로잉', emoji: '🍂', color: 'bg-[#FFF5EF]', shared: false, selectedCount: 0 },
    { id: 5, title: '평화로운 오후', date: '2024.11.10', category: '빗소리 드로잉', emoji: '☕', color: 'bg-[#E8F7ED]', shared: false, selectedCount: 0 },
    { id: 6, title: '엄마 생각', date: '2024.11.08', category: '추억 스케치', emoji: '👵', color: 'bg-pink-50', shared: true, selectedCount: 2 },
    { id: 7, title: '봄날', date: '2024.11.05', category: '명화 컬러링', emoji: '🌸', color: 'bg-pink-50', shared: false, selectedCount: 0 },
    { id: 8, title: '강아지', date: '2024.11.03', category: '자유 드로잉', emoji: '🐕', color: 'bg-amber-50', shared: false, selectedCount: 0 },
  ]);

  const handleShareArtwork = (id, isRoomItem = false) => {
    if (isRoomItem) {
      setMyRoomItems(items => 
        items.map(item => item.id === id ? { ...item, shared: !item.shared } : item)
      );
      onToast && onToast('나눔 전시관에 올렸어요! 💚');
    } else {
      setMyArtworks(artworks => 
        artworks.map(artwork => artwork.id === id ? { ...artwork, shared: !artwork.shared } : artwork)
      );
      onToast && onToast('나눔 전시관에 올렸어요! 💚');
    }
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn relative overflow-hidden w-full min-h-0">
      {/* Tab Switcher */}
      <div className="bg-white border-b-2 border-stone-200 p-5 sm:p-6 shrink-0 z-40">
        <div className="flex gap-4 max-w-4xl mx-auto">
          <button
            onClick={() => setActiveTab('drawer')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-jua text-xl sm:text-2xl transition-all ${
              activeTab === 'drawer'
                ? 'bg-stone-800 text-white shadow-lg'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Grid size={28} /> 나의 작품 서랍
          </button>
          <button
            onClick={() => setActiveTab('atelier')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-jua text-xl sm:text-2xl transition-all ${
              activeTab === 'atelier'
                ? 'bg-stone-800 text-white shadow-lg'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            🏡 나의 아틀리에
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'atelier' ? (
        <>
      {/* 2. The Room (Visual Layout - Min Height Added) */}
      <div className="flex-1 relative bg-[#FAF7F1] overflow-hidden w-full min-h-0">
        {/* Wall (Background) */}
        <div className="absolute top-0 w-full h-[65%] bg-[#FFF8E1] border-b-4 border-[#EFEBE9] shadow-inner">
           {/* Wall Pattern (Wallpaper) */}
           <div className="w-full h-full opacity-10" style={{backgroundImage: 'radial-gradient(#D7CCC8 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
           
           {/* Window */}
           <div className="absolute left-10 top-24 w-40 h-48 bg-[#D8E8FF] border-8 border-white shadow-lg rounded-lg overflow-hidden hidden sm:block">
             <div className="w-full h-full relative">
               <CloudRain className="absolute top-4 right-4 text-blue-300/50" size={40}/>
               <div className="absolute bottom-0 w-full h-1/2 bg-[#DBF2E3]/50 rounded-t-full scale-150 translate-y-4"></div>
               <div className="absolute w-full h-2 bg-white top-1/2 -translate-y-1/2"></div>
               <div className="absolute h-full w-2 bg-white left-1/2 -translate-x-1/2"></div>
             </div>
           </div>
        </div>

        {/* Floor */}
        <div className="absolute bottom-0 w-full h-[35%] bg-[#D7CCC8]">
           {/* Floor Texture */}
           <div className="w-full h-full opacity-20" style={{backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 49px, #8D6E63 50px)'}}></div>
           <div className="absolute top-0 w-full h-12 bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>
        </div>

        {/* 3. Placed Items (Art & Decor) */}
        {myRoomItems.map((item) => (
          <div 
            key={item.id}
            className="absolute transition-all duration-300 cursor-pointer group hover:-translate-y-2"
            style={{ 
              left: `${item.x}%`, 
              top: `${item.y}%`,
              zIndex: item.y > 50 ? 20 : 10 // Simple depth sorting
            }}
          >
            {item.type === 'frame' ? (
              // Wall Frame
              <div className="flex flex-col items-center">
                <div className={`relative bg-white p-3 shadow-xl rounded-lg border-8 ${
                  item.shared 
                    ? 'border-yellow-400 shadow-yellow-200/50' 
                    : item.frameColor
                }`}>
                  <div className={`w-28 h-24 md:w-36 md:h-32 flex items-center justify-center text-6xl overflow-hidden rounded-sm relative ${
                    item.shared ? 'bg-gradient-to-br from-yellow-50 to-amber-50' : 'bg-stone-100'
                  }`}>
                    {item.content}
                    <div className="absolute inset-0 bg-black/5 shadow-inner pointer-events-none"></div>
                    {/* Selected Badge */}
                    {item.shared && item.selectedCount > 0 && (
                      <div className="absolute top-2 right-2 bg-#2E8C46 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg z-10 flex items-center gap-1">
                        <CheckCircle size={12} /> {item.selectedCount}
                      </div>
                    )}
                    {/* 선택 받은 작품 전용 장식 */}
                    {item.shared && (
                      <>
                        <div className="absolute top-1 left-1 text-yellow-400 text-lg">✨</div>
                        <div className="absolute top-1 right-1 text-yellow-400 text-lg">✨</div>
                        <div className="absolute bottom-1 left-1 text-yellow-400 text-lg">✨</div>
                        <div className="absolute bottom-1 right-1 text-yellow-400 text-lg">✨</div>
                      </>
                    )}
                  </div>
                  {/* Hanging String */}
                  <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-0.5 h-12 -z-10 ${
                    item.shared ? 'bg-yellow-400' : 'bg-stone-300'
                  }`}></div>
                  <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full shadow-sm -z-10 ${
                    item.shared ? 'bg-yellow-400' : 'bg-stone-400'
                  }`}></div>
                </div>
                <div className="mt-4 flex flex-col items-center gap-2">
                  <span className="bg-white/80 px-3 py-1 rounded-full text-sm font-jua text-stone-700 shadow-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareArtwork(item.id, true);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg text-xs font-jua flex items-center gap-1 bg-[#FFE5D4] text-orange-700 hover:bg-[#FFD5B8]"
                  >
                    <Share2 size={14} />
                    {item.shared ? '나눔 취소' : '나눔 올리기'}
                  </button>
                </div>
              </div>
            ) : (
              // Easel (Floor Item)
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                <div className="w-32 h-40 bg-[#8D6E63] rounded-lg transform rotate-3 shadow-2xl flex flex-col items-center p-2 border-4 border-[#6D4C41] relative">
                    <div className="w-full h-24 bg-white mb-2 flex items-center justify-center text-4xl shadow-inner">
                        {item.content}
                    </div>
                    <div className="w-full h-2 bg-[#5D4037] rounded-full shadow-sm"></div>
                    {/* Legs */}
                    <div className="absolute -bottom-10 left-2 w-2 h-12 bg-[#6D4C41] -z-10 rotate-12"></div>
                    <div className="absolute -bottom-10 right-2 w-2 h-12 bg-[#6D4C41] -z-10 -rotate-12"></div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Decor Items (Static for prototype) */}
        <div className="absolute bottom-10 left-20 z-30 cursor-pointer hover:scale-110 transition hidden sm:block" onClick={() => onToast && onToast('고양이가 야옹~ 하고 웁니다 🐱')}>
            <div className="text-6xl drop-shadow-xl">🐈</div>
            <div className="w-16 h-4 bg-black/20 rounded-full blur-md mt-[-10px] mx-auto"></div>
        </div>
        
        <div className="absolute bottom-20 right-20 z-20 hidden sm:block">
            <div className="text-6xl drop-shadow-xl">🪴</div>
            <div className="w-12 h-4 bg-black/20 rounded-full blur-md mt-[-5px] mx-auto"></div>
        </div>

        {/* Rug */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#FFE5D4]/80 rounded-[100%] border-4 border-[#FFD5B8]/50 transform scale-y-50 z-0"></div>

      </div>

        </>
      ) : (
        /* 나의 작품 서랍 탭 */
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 bg-stone-100">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#E8F7ED] p-3 rounded-full">
                <Grid size={32} className="text-[#256A39]" />
              </div>
              <div>
                <p className="text-lg font-gowun text-stone-700">총 {myArtworks.length}개의 작품</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {myArtworks.map((artwork) => (
              <div
                key={artwork.id}
                className={`${artwork.color} ${
                  artwork.shared 
                    ? 'border-4 border-yellow-400 shadow-yellow-200/50' 
                    : 'border-2 border-stone-200'
                } rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative`}
              >
                {/* 선택 받은 작품 전용 액자 효과 */}
                {artwork.shared && (
                  <div className="absolute -inset-1 bg-gradient-to-br from-yellow-200/50 to-amber-200/50 rounded-2xl -z-10 blur-sm"></div>
                )}
                {/* Artwork Preview */}
                <div className={`rounded-xl shadow-md mb-4 aspect-[4/3] flex items-center justify-center ${
                  artwork.shared 
                    ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-4 border-yellow-300' 
                    : 'bg-white border-4 border-white'
                } relative overflow-hidden group-hover:border-[#C8E9D5] transition`}>
                  <div className="text-8xl">{artwork.emoji}</div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition" />
                  {/* Selected Badge */}
                  {artwork.shared && artwork.selectedCount > 0 && (
                    <>
                      <div className="absolute top-3 right-3 bg-#2E8C46 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg z-10 flex items-center gap-1.5">
                        <CheckCircle size={16} /> {artwork.selectedCount}
                      </div>
                      {/* 선택 받은 작품 전용 장식 */}
                      <div className="absolute top-2 left-2 text-yellow-400 text-xl">✨</div>
                      <div className="absolute top-2 right-2 text-yellow-400 text-xl">✨</div>
                      <div className="absolute bottom-2 left-2 text-yellow-400 text-xl">✨</div>
                      <div className="absolute bottom-2 right-2 text-yellow-400 text-xl">✨</div>
                    </>
                  )}
                </div>

                {/* Artwork Info */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-jua text-stone-800 truncate">
                    {artwork.title}
                  </h3>
                  <div className="flex items-center gap-2 text-base font-gowun text-stone-700">
                    <span className="bg-white px-3 py-1 rounded-lg text-sm">
                      {artwork.category}
                    </span>
                  </div>
                  <p className="text-base font-gowun text-stone-400">
                    {artwork.date}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => setSelectedArtwork(artwork)}
                    className="flex-1 bg-white hover:bg-[#E8F7ED] text-stone-700 hover:text-[#1E5A2E] px-4 py-2 rounded-lg font-jua text-base transition border border-stone-200 hover:border-[#B5DFC7]"
                  >
                    보기
                  </button>
                  <button 
                    onClick={() => handleShareArtwork(artwork.id, false)}
                    className={`flex-1 px-4 py-2 rounded-lg font-jua text-base transition border flex items-center justify-center gap-1.5 ${
                      artwork.shared
                        ? 'bg-[#DBF2E3] text-[#1E5A2E] hover:bg-[#C8E9D5] border-[#B5DFC7]'
                        : 'bg-white hover:bg-[#FFF5EF] text-stone-700 hover:text-orange-700 border-stone-200 hover:border-[#FFC89C]'
                    }`}
                  >
                    <Share2 size={16} />
                    {artwork.shared ? '나눔 취소' : '나눔 올리기'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State (if no artworks) */}
          {myArtworks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-9xl mb-6 opacity-20">🎨</div>
              <h3 className="text-3xl font-jua text-stone-400 mb-2">
                아직 작품이 없어요
              </h3>
              <p className="text-xl font-gowun text-stone-400 mb-6">
                창작실에서 그림을 그려보세요!
              </p>
              <button
                onClick={() => onNav('studio_main', 'studio')}
                className="btn-primary text-xl h-[56px] w-[240px]"
              >
                그림 그리러 가기
              </button>
            </div>
          )}
        </div>
      )}

      {/* Artwork Detail Modal */}
      {selectedArtwork && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn" onClick={() => setSelectedArtwork(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border-2 border-stone-200 relative flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedArtwork(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-400 transition"
            >
              <X size={28} />
            </button>

            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              {/* Artwork Image */}
              <div className={`${selectedArtwork.color} rounded-2xl p-8 flex items-center justify-center aspect-square min-w-[200px] ${
                selectedArtwork.shared 
                  ? 'border-4 border-yellow-400 shadow-yellow-200/50' 
                  : 'border-2 border-stone-200'
              }`}>
                <div className={`text-9xl ${selectedArtwork.shared ? 'bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4' : ''}`}>
                  {selectedArtwork.emoji}
                </div>
              </div>

              {/* Artwork Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {selectedArtwork.shared && selectedArtwork.selectedCount > 0 && (
                      <div className="bg-#2E8C46 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg flex items-center gap-1.5">
                        <CheckCircle size={16} /> {selectedArtwork.selectedCount}
                      </div>
                    )}
                    <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-lg text-sm font-jua">
                      {selectedArtwork.category}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-jua text-stone-800 mb-2">
                    {selectedArtwork.title}
                  </h2>
                  <p className="text-lg font-gowun text-stone-700 mb-4">
                    {selectedArtwork.date}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      onToast && onToast('카카오톡으로 공유했어요! 💛');
                      setSelectedArtwork(null);
                    }}
                    className="btn-primary bg-yellow-400 border-yellow-500 shadow-yellow-600 text-stone-900 w-full text-xl h-[56px] flex items-center justify-center gap-2"
                  >
                    <Share2 size={24} />
                    가족에게 보내기
                  </button>
                  <button 
                    onClick={() => handleShareArtwork(selectedArtwork.id, false)}
                    className={`w-full px-4 py-3 rounded-xl font-jua text-lg transition border flex items-center justify-center gap-2 ${
                      selectedArtwork.shared
                        ? 'bg-[#DBF2E3] text-[#1E5A2E] hover:bg-[#C8E9D5] border-[#B5DFC7]'
                        : 'bg-white hover:bg-[#FFF5EF] text-stone-700 hover:text-orange-700 border-stone-200 hover:border-[#FFC89C]'
                    }`}
                  >
                    <Share2 size={20} />
                    {selectedArtwork.shared ? '나눔 취소' : '나눔 전시관에 올리기'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Hall of Fame Data */
const HOF_DATA = {
  weeklyBest: {
    type: "best",
    label: "주간 베스트",
    description: "이번 주 가장 많은 공감을 받은 작품",
    author: "김갑수",
    center: "위례복지관",
    artworkTitle: "오늘의 풍경 스케치",
    reactions: 23,
    imageUrl: "/weekly_voted.jpg",
  },
  aiPick: {
    type: "ai",
    label: "AI 추천작",
    description: "AI가 창의성을 높게 평가한 작품",
    author: "이호순",
    center: "강남복지관",
    artworkTitle: "손녀 생각하며 그린 그림",
    reactions: 17,
    imageUrl: "/weekly_ai.jpg",
  },
};

/* Hall of Fame Card Component */
const HallOfFameCard = ({ item }) => {
  const isBest = item.type === "best";

  return (
    <div className={`hof-card ${isBest ? "hof-card--best" : "hof-card--ai"}`}>
      {/* 상단 리본 */}
      <div className="hof-card__ribbon">
        <span className="hof-card__ribbon-icon">
          {isBest ? "🏆" : "✨"}
        </span>
        <span className="hof-card__ribbon-label">{item.label}</span>
      </div>

      {/* 설명 텍스트 */}
      <div className="hof-card__description">{item.description}</div>

      {/* 썸네일 영역 (수상작 느낌) */}
      <div className="hof-card__thumb">
        <div className="hof-card__thumb-inner">
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.artworkTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="hof-card__thumb-emoji">
              {isBest ? "🎨" : "💡"}
            </span>
          )}
        </div>
      </div>

      {/* 작가 / 센터 정보 */}
      <div className="hof-card__meta">
        <div className="hof-card__author">
          <span className="hof-card__author-name">{item.author}</span>
          <span className="hof-card__author-center">({item.center})</span>
        </div>
        <div className="hof-card__artwork-title">{item.artworkTitle}</div>
      </div>

      {/* 하단 배지 영역 */}
      <div className="hof-card__badges">
        <span className="hof-badge hof-badge--primary">
          {isBest ? "센터 인기 Top 1" : "AI Creativity 상위 1%"}
        </span>
        <span className="hof-badge hof-badge--ghost">
          ❤️ 공감 {item.reactions}개
        </span>
      </div>
    </div>
  );
};

/* 5️⃣ Screen 5: Community & Donation (마음 나눔 게시판) */
const Screen5_Community = ({ onNav }) => {
  const [currentCategory, setCurrentCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [commentText, setCommentText] = useState('');


  const posts = [
    {
      id: 1,
      user: { name: '박영희', age: 72, avatar: '👵' },
      time: '방금 전',
      emotion: '행복',
      category: 'landscape',
      title: '오늘의 풍경 스케치',
      image: '🌅',
      description: '아침 해가 떠오르는 모습을 그려봤어요. 너무 예뻤어요!',
      likes: 24,
      comments: [
        { author: '김영수', text: '정말 멋지네요! 저도 도전해보고 싶어요.' },
        { author: '박미선', text: '색감이 너무 아름다워요 👍' }
      ],
      commentCount: 8,
      liked: false
    },
    {
      id: 2,
      user: { name: '김철수', age: 68, avatar: '👴' },
      time: '1시간 전',
      emotion: '설렘',
      category: 'color',
      title: '색채의 마법',
      image: '🎨',
      description: '파란색과 노란색을 섞으니 초록색이 되었어요. 신기해요!',
      likes: 18,
      comments: [
        { author: '김영수', text: '정말 멋지네요! 저도 도전해보고 싶어요.' },
        { author: '박미선', text: '색감이 너무 아름다워요 👍' }
      ],
      commentCount: 5,
      liked: false
    },
    {
      id: 3,
      user: { name: '이순희', age: 75, avatar: '👵' },
      time: '3시간 전',
      emotion: '감사',
      category: 'memory',
      title: '손녀 생각하며 그린 그림',
      image: '💝',
      description: '손녀가 좋아하는 꽃을 그려봤어요. 보여드리면 좋아할 것 같아요.',
      likes: 32,
      comments: [
        { author: '최영수', text: '할머니의 마음이 느껴져요 🥰' },
        { author: '김지영', text: '정말 따뜻한 그림이네요!' }
      ],
      commentCount: 12,
      liked: false
    },
    {
      id: 4,
      user: { name: '최만수', age: 70, avatar: '👴' },
      time: '5시간 전',
      emotion: '만족',
      category: 'free',
      title: '자유롭게 그린 그림',
      image: '🖼️',
      description: '마음 가는 대로 자유롭게 그려봤어요. 새로운 시도였지만 재미있었어요!',
      likes: 15,
      comments: [
        { author: '박영희', text: '멋진 작품이네요!' }
      ],
      commentCount: 3,
      liked: false
    },
    {
      id: 5,
      user: { name: '강옥순', age: 73, avatar: '👵' },
      time: '하루 전',
      emotion: '평온',
      category: 'landscape',
      title: '저녁 노을',
      image: '🌇',
      description: '오늘 저녁 하늘이 너무 예뻐서 그림으로 남겨봤어요.',
      likes: 28,
      comments: [
        { author: '이순희', text: '정말 아름다운 풍경이에요!' },
        { author: '김철수', text: '노을 색감이 일품이네요 🌅' }
      ],
      commentCount: 9,
      liked: false
    },
    {
      id: 6,
      user: { name: '정대호', age: 69, avatar: '👴' },
      time: '2일 전',
      emotion: '기쁨',
      category: 'color',
      title: '무지개 실험',
      image: '🌈',
      description: '여러 색을 섞어보니 무지개 같은 효과가 나왔어요!',
      likes: 21,
      comments: [
        { author: '강옥순', text: '색채 실험이 성공하셨네요!' }
      ],
      commentCount: 6,
      liked: false
    }
  ];

  const filteredPosts = currentCategory === 'all'
    ? posts
    : posts.filter(post => post.category === currentCategory);

  const handleLike = (postId) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;
    }
  };

  const handleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        // 음성 인식 시뮬레이션
        setCommentText("정말 멋진 작품이네요! 저도 따라해보고 싶어요.");
      }, 2000);
    }
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    // 댓글 추가 로직 (실제로는 서버에 전송)
    alert(`댓글이 등록되었습니다: "${commentText}"`);
    setCommentText('');
    setSelectedPost(null);
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn overflow-hidden bg-[#FAF7F1] relative">
      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-y-auto px-8 py-8 pb-10 custom-scrollbar">
        <div className="max-w-[1200px] mx-auto">
          {/* 🌟 이번 주 명예의 전당 */}
          <section className="hof-wrapper">
            <div className="hof-section">
              <div className="hof-section__header">
                <span className="hof-section__icon">🌟</span>
                <div>
                  <div className="hof-section__title">이번 주 명예의 전당</div>
                  <div className="hof-section__subtitle">
                    어르신들의 특별한 작품을 한눈에 볼 수 있는 수상작 공간입니다.
                  </div>
                </div>
              </div>
              <div className="hof-section__cards">
                <HallOfFameCard item={HOF_DATA.weeklyBest} />
                <HallOfFameCard item={HOF_DATA.aiPick} />
              </div>
            </div>
          </section>

          <div className="section-divider">
            <span>전체 작품</span>
          </div>

          {/* 카테고리 탭 */}
          <div className="flex gap-4 mb-6 overflow-x-auto shrink-0">
            {[
              { key: 'all', label: '전체' },
              { key: 'landscape', label: '풍경화' },
              { key: 'memory', label: '추억 그리기' },
              { key: 'color', label: '색채 실험' },
              { key: 'free', label: '자유 주제' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCurrentCategory(key)}
                className={`px-8 py-4 rounded-2xl font-jua text-lg whitespace-nowrap transition-all ${
                  currentCategory === key
                    ? 'bg-[#4C8F7E] text-white shadow-[0_4px_#265C43] border-2 border-[#265C43]'
                    : 'bg-white text-stone-700 border-2 border-stone-200 hover:border-[#4C8F7E] hover:bg-stone-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 기존 마음 나눔 콘텐츠 영역 */}
          <section className="space-y-4">
            {/* 게시글 그리드 - 1280px 패드에 최적화된 3열 그리드 */}
            <div className="grid grid-cols-3 gap-5">
          {filteredPosts.map(post => (
            <div key={post.id} className="card-base p-5 bg-white border-stone-200 hover:border-[#4C8F7E] hover:shadow-lg transition-all">
              {/* 사용자 정보 */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center text-2xl border-2 border-yellow-500">
                  {post.user.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-jua text-lg text-stone-800">{post.user.name} ({post.user.age}세)</div>
                  <div className="text-sm font-gowun text-stone-700">
                    {post.time} <span className="inline-block px-2 py-1 bg-[#E8F7ED] text-[#1E5A2E] rounded-lg text-xs ml-1">{post.emotion}</span>
                  </div>
                </div>
              </div>
              {/* 제목 */}
              <div className="font-jua text-xl text-stone-800 mb-3">{post.title}</div>
              {/* 이미지 */}
              <div className="w-full aspect-[4/3] rounded-2xl mb-4 flex items-center justify-center text-5xl" style={{ background: 'linear-gradient(135deg, #E5F5F0 0%, #F0F9F5 100%)' }}>
                {post.image}
              </div>
              {/* 설명 */}
              <div 
                className="text-base text-gray-600 mb-5 leading-relaxed"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minHeight: '3rem',
                  lineHeight: '1.5rem'
                }}
              >
                {post.description}
              </div>
              {/* 액션 버튼 */}
              <div className="flex gap-2 pt-3 border-t border-stone-100">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-jua text-base transition-all ${
                    post.liked
                      ? 'bg-[#E8F7ED] text-[#1E5A2E] border border-[#C8E9D5]'
                      : 'bg-stone-100 text-stone-700 border border-stone-200 hover:bg-[#E8F7ED] hover:border-[#C8E9D5]'
                  }`}
                >
                  👍 {post.likes}
                </button>
                <button 
                  onClick={() => setSelectedPost(post)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-stone-100 border border-stone-200 rounded-lg font-jua text-base hover:bg-[#E8F0FF] hover:border-[#C5D9FF] transition-all"
                >
                  💬 댓글 {post.commentCount}
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-stone-100 border border-stone-200 rounded-lg font-jua text-base hover:bg-stone-100 transition-all">
                  📤
                </button>
              </div>
              {/* 댓글 미리보기 */}
              {post.comments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                    <span style={{ color: '#FFB3C6', fontSize: '16px' }}>◇</span> 댓글 미리보기
                  </div>
                  {post.comments.map((comment, idx) => (
                    <div key={idx} className="p-3 rounded-xl mb-2 text-sm leading-relaxed" style={{ background: '#F8F8F8' }}>
                      <span className="font-bold text-gray-800">{comment.author}:</span> {comment.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
            </div>
          </section>
        </div>
      </div>

      {/* 댓글 작성 모달 */}
      {selectedPost && (
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-8 animate-fadeIn"
          onClick={() => setSelectedPost(null)}
        >
          <div 
            className="bg-white rounded-3xl p-8 w-[90%] max-w-[1000px] shadow-2xl border-2 border-[#4C8F7E] relative flex flex-row gap-8"
            style={{ maxHeight: '85%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 좌측: 게시물 정보 & 댓글 목록 */}
            <div className="flex-1 flex flex-col min-h-0">
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-400 transition z-10"
              >
                <X size={32} />
              </button>

              {/* 게시물 정보 */}
              <div className="mb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center text-3xl border-2 border-yellow-500">
                    {selectedPost.user.avatar}
                  </div>
                  <div>
                    <div className="font-jua text-xl text-stone-800">{selectedPost.user.name}님의 작품</div>
                    <div className="font-jua text-2xl text-[#4C8F7E] mt-1">{selectedPost.title}</div>
                  </div>
                </div>
              </div>

              {/* 댓글 목록 */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 min-h-0 pr-4">
                <h3 className="font-jua text-xl text-stone-700 mb-4 sticky top-0 bg-white py-2">💬 댓글 {selectedPost.comments.length}개</h3>
                {selectedPost.comments.map((comment, idx) => (
                  <div key={idx} className="bg-stone-100 p-4 rounded-2xl">
                    <div className="font-jua text-lg text-stone-800 mb-1">{comment.author}</div>
                    <div className="font-gowun text-base text-stone-700">{comment.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 우측: 댓글 작성 영역 */}
            <div className="w-[320px] shrink-0 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-jua text-stone-800 mb-3">🎤 음성으로 댓글 남기기</h3>
                
                {/* 도움말 */}
                <div className="mb-3 bg-[#E8F0FF] p-3 rounded-xl">
                  <p className="font-gowun text-sm text-[#1F4F9E] leading-relaxed">
                    💡 <strong>음성 녹음</strong>을 누르고 말씀하시면 자동으로 텍스트로 변환됩니다!
                  </p>
                </div>

                {/* 음성 녹음 버튼 */}
                <button
                  onClick={handleRecord}
                  className={`btn-primary w-full mb-3 h-[64px] text-lg ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 border-red-600 animate-pulse' 
                      : 'bg-[#4C8F7E] hover:bg-[#3F7F6E] border-[#265C43]'
                  }`}
                >
                  <span className="text-2xl mr-2">{isRecording ? '🔴' : '🎙️'}</span>
                  {isRecording ? '녹음 중...' : '음성 녹음'}
                </button>

                {/* 텍스트 입력 영역 */}
                <div className="mb-3">
                  <label className="font-jua text-base text-stone-700 mb-2 block">또는 직접 입력</label>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    className="w-full p-3 border-2 border-stone-200 rounded-2xl font-gowun text-base resize-none focus:border-[#4C8F7E] focus:outline-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* 제출 버튼 */}
              <div className="space-y-3">
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim()}
                  className={`w-full btn-primary h-[60px] text-lg ${
                    commentText.trim()
                      ? 'bg-[#4C8F7E] hover:bg-[#3F7F6E] border-[#265C43] text-white'
                      : 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  댓글 등록
                </button>
                <button
                  onClick={() => {
                    setSelectedPost(null);
                    setCommentText('');
                  }}
                  className="w-full btn-primary bg-white hover:bg-stone-100 border-2 border-stone-300 text-stone-700 h-[52px] text-base"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MiniStatCard = ({ label, value }) => (
  <div className="flex-1 min-w-[140px] bg-white/90 rounded-2xl px-5 py-3 shadow-sm border border-[#FFE5D4] flex flex-col justify-between">
    <span className="text-base sm:text-lg font-gowun text-stone-700">{label}</span>
    <span className="text-xl sm:text-2xl font-jua text-orange-800 mt-1">{value}</span>
  </div>
);

/* 🤖 Screen 6: AI Dashboard (AI 분석 대시보드) */
const Screen6_AI = ({ onNav }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // 특별한 날 이벤트 데이터 (이벤트가 있을 때만 표시)
  const specialEvent = {
    exists: true, // 이벤트가 있는지 여부
    icon: "🎂",
    title: "특별한 날",
    description: "오늘은 손자 생일이네요! 축하 카드를 그려보시는 건 어떨까요?",
  };

  const weeklyEmotions = [
    { day: "월", emotion: "행복", height: 75 },
    { day: "화", emotion: "차분", height: 65 },
    { day: "수", emotion: "설렘", height: 85 },
    { day: "목", emotion: "평온", height: 70 },
    { day: "금", emotion: "감사", height: 80 },
    { day: "토", emotion: "행복", height: 90 },
    { day: "일", emotion: "차분", height: 68 },
  ];

  const colorPreferences = [
    { label: "따뜻한 톤", percentage: 45, color: "from-pink-400 to-[#7A4EC7]" },
    { label: "차가운 톤", percentage: 30, color: "from-blue-400 to-cyan-500" },
    { label: "중성 톤", percentage: 25, color: "from-gray-400 to-slate-500" },
  ];

  const aiFeedbacks = [
    {
      icon: "✨",
      text: "정말 대단하세요! 지난주 대비 감정 안정도가 12% 향상되었어요. 꿈을 향해 꽂꽂하게 나아가고 계십니다!",
    },
    {
      icon: "🌱",
      text: "당신의 성장을 축하합니다! 47개의 활동을 꽂꽂히 완료하셨고, 특히 따뜻한 톤의 색상을 자주 사용하시는데 이는 긍정적인 감정 표현을 잘 보여줍니다.",
    },
    {
      icon: "🎯",
      text: "다음 단계 추천: 새로운 색상 조합에 도전해보세요! 파란색과 보라색을 섞어보면 더 풍부한 표현이 가능할 거예요.",
    },
  ];

  return (
    <div 
      className="w-full h-full flex flex-col animate-fadeIn overflow-hidden bg-[#FAF7F1] relative" 
      onClick={() => setShowTooltip(false)}
    >
      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar w-full">
        <div className="max-w-7xl mx-auto space-y-6 pb-10">
          {/* 특별한 날 배너 - 풀 너비, 이벤트가 있을 때만 표시 */}
          {specialEvent.exists && (
            <div className="card-base p-6 bg-white border-stone-200" style={{ background: "#F0F9F5" }}>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{specialEvent.icon}</span>
                <div className="flex-1">
                  <h2 className="text-2xl font-jua text-stone-800 mb-2">{specialEvent.title}</h2>
                  <p className="text-lg font-gowun text-stone-700">
                    {specialEvent.description}
                  </p>
                </div>
                <button
                  onClick={() => onNav("studio_main", "studio")}
                  className="btn-primary whitespace-nowrap px-8 py-3"
                >
                  <span className="text-xl font-jua">그리러 가기</span>
                </button>
              </div>
            </div>
          )}

          {/* 2열 그리드 */}
          <div className="grid grid-cols-2 gap-6">
            {/* 왼쪽 열 */}
            <div className="space-y-6 flex flex-col">
            {/* 주간 감정 변화 */}
            <div className="card-base p-6 bg-white border-stone-200">
              <h2 className="text-2xl font-jua text-stone-800 mb-4">주간 감정 변화</h2>
              <p className="text-base font-gowun text-stone-700 mb-6">이번 주 감정 상태를 한눈에 확인하세요</p>

              {/* 꺾은선 그래프 */}
              <div className="relative bg-gradient-to-br from-stone-50 to-[#FFF5EF]/30 rounded-2xl p-8 border-2 border-stone-100 shadow-inner">
                {/* 그래프 영역 */}
                <div className="relative h-64">
                  {/* Y축 가이드라인 */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[100, 75, 50, 25, 0].map((val) => (
                      <div key={val} className="flex items-center gap-3">
                        <span className="text-sm font-jua text-stone-700 w-10 text-right font-bold">{val}</span>
                        <div className="flex-1 border-t border-stone-300/50 border-dashed"></div>
                      </div>
                    ))}
                  </div>

                  {/* SVG 그래프 */}
                  <svg 
                    className="absolute left-12 top-0 right-0 bottom-0" 
                    viewBox="0 0 500 256" 
                    preserveAspectRatio="none"
                    style={{ width: 'calc(100% - 3rem)', height: '100%' }}
                  >
                    <defs>
                      {/* 선 그림자 효과 */}
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>

                    {/* 선 그리기 - 더 굵고 부드러운 곡선 */}
                    <polyline
                      points={weeklyEmotions.map((item, idx) => {
                        const svgHeight = 256;
                        const svgWidth = 500;
                        const numItems = weeklyEmotions.length;
                        // 각 요일 라벨의 중심 위치에 맞춰 계산
                        const x = ((idx + 0.5) / numItems) * svgWidth;
                        const y = svgHeight - (item.height * svgHeight / 100);
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#glow)"
                    />

                    {/* 데이터 포인트 - 더 크고 눈에 띄게 */}
                    {weeklyEmotions.map((item, idx) => {
                      const svgHeight = 256;
                      const svgWidth = 500;
                      const numItems = weeklyEmotions.length;
                      // 각 요일 라벨의 중심 위치에 맞춰 계산
                      const x = ((idx + 0.5) / numItems) * svgWidth;
                      const y = svgHeight - (item.height * svgHeight / 100);
                      return (
                        <g key={idx} className="cursor-pointer group">
                          {/* 외부 그림자 원 */}
                          <circle
                            cx={x}
                            cy={y}
                            r="8"
                            fill="#F97316"
                            opacity="0.2"
                          />
                          {/* 흰색 외곽선 원 */}
                          <circle
                            cx={x}
                            cy={y}
                            r="7"
                            fill="white"
                            stroke="#F97316"
                            strokeWidth="3"
                          />
                          {/* 내부 채워진 원 */}
                          <circle
                            cx={x}
                            cy={y}
                            r="4.5"
                            fill="#F97316"
                          />
                          {/* 상시 값 표시 */}
                          <text
                            x={x}
                            y={y - 15}
                            textAnchor="middle"
                            fill="#F97316"
                            fontSize="12"
                            fontWeight="bold"
                          >
                            {item.height}점
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* X축 라벨 - 더 명확하고 큰 디자인 */}
                <div className="flex justify-between items-start mt-8 pl-12">
                  {weeklyEmotions.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                      <div className="text-xl font-jua text-stone-700 font-bold">{item.day}</div>
                      <div className="text-sm font-gowun text-stone-700 bg-white px-3 py-1.5 rounded-full border-2 border-stone-200 shadow-sm">
                        {item.emotion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 평균 점수 표시 */}
              <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-[#FFF5EF] to-amber-50 p-5 rounded-xl border-2 border-[#FFD5B8] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-[#FFE5D4] p-2 rounded-full">
                    <span className="text-2xl">📊</span>
                  </div>
                  <span className="text-xl font-jua text-stone-800 font-bold">주간 평균</span>
                </div>
                <div className="text-3xl font-jua text-[#D85718] font-bold">
                  {Math.round(weeklyEmotions.reduce((sum, item) => sum + item.height, 0) / weeklyEmotions.length)}점
                </div>
              </div>
            </div>

            {/* 색상 선호도 */}
            <div className="card-base p-6 bg-white border-stone-200 flex-1 flex flex-col">
              <h2 className="text-2xl font-jua text-stone-800 mb-4">색상 선호도</h2>
              <div className="space-y-4">
                {colorPreferences.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-gowun text-stone-700">{item.label}</span>
                      <span className="text-lg font-jua text-stone-800">{item.percentage}%</span>
                    </div>
                    <div className="w-full h-6 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

            {/* 오른쪽 열 */}
            <div className="flex flex-col space-y-6">
              {/* 정서적 안정 지수 (ESI) */}
              <div className="card-base p-6 bg-white border-stone-200 relative">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-2xl font-jua text-stone-800">정서적 안정 지수 (ESI)</h2>
                  <button 
                    className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center hover:bg-stone-200 active:scale-90 transition-all z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTooltip(!showTooltip);
                    }}
                  >
                    ?
                  </button>
                  {showTooltip && (
                    <div className="absolute top-14 left-6 z-20 bg-stone-800 text-white p-4 rounded-xl shadow-xl max-w-sm animate-fadeIn border border-stone-700">
                      <div className="font-jua text-lg mb-1 text-yellow-300">ESI란?</div>
                      <p className="font-gowun text-base leading-relaxed">
                        어르신의 마음이 얼마나 편안하고 안정적인지 보여주는 점수예요. 점수가 높을수록 마음이 평온하다는 뜻입니다.
                      </p>
                      <div className="absolute -top-2 left-8 w-4 h-4 bg-stone-800 transform rotate-45 border-t border-l border-stone-700"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-end gap-4 mb-4">
                  <div className="text-5xl font-jua text-[#4C8F7E]">
                    8.2
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-gowun text-stone-700 mb-2">초기 6.5 → 현재 8.2</div>
                    <div className="w-full h-4 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: "82%",
                          background: "linear-gradient(90deg, #4C8F7E 0%, #265C43 100%)",
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-lg font-gowun text-stone-700">
                  <span className="text-2xl">📈</span>
                  <span>26% 개선됨</span>
                </div>
              </div>

              {/* 생체 리듬 분석 */}
            <div className="card-base p-6 bg-white border-stone-200">
              <h2 className="text-2xl font-jua text-stone-800 mb-4">생체 리듬 분석</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-base font-gowun text-stone-700">최적 활동 시간</span>
                  <span className="text-xl font-jua text-stone-800">오전 10시 - 11시 30분</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-base font-gowun text-stone-700">평균 집중 시간</span>
                  <span className="text-xl font-jua text-stone-800">25분</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-base font-gowun text-stone-700">선호 활동 유형</span>
                  <span className="text-xl font-jua text-stone-800">색칠하기 {'>'} 그리기 {'>'} 게임</span>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-[#E8F7ED] border border-[#C8E9D5]">
                <div className="text-lg font-gowun text-stone-700">
                  💡 <span className="font-semibold">팁:</span> 오전 시간대에 활동하시면 가장 좋은 결과를 얻으실 수 있어요!
                </div>
              </div>
            </div>

            {/* AI 피드백 */}
            <div className="card-base p-6 bg-white border-stone-200 flex-1 flex flex-col">
              <h2 className="text-2xl font-jua text-stone-800 mb-4">AI 피드백</h2>
              <div className="space-y-4 flex-1">
                {aiFeedbacks.map((feedback, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-stone-100 border border-stone-200">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{feedback.icon}</span>
                      <p className="flex-1 text-lg font-gowun text-stone-700 leading-relaxed">{feedback.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DonationItem = ({ title, date, org, status }) => (
  <div className="bg-stone-100 p-5 rounded-xl border border-stone-100 flex justify-between items-center">
    <div>
      <h4 className="text-xl sm:text-2xl font-jua text-stone-800">{title}</h4>
      <p className="text-base sm:text-lg font-gowun text-stone-700">
        {org} · {date}
      </p>
    </div>
    <span className="bg-[#DBF2E3] text-[#1E5A2E] px-4 py-2 rounded-lg font-jua text-base sm:text-lg">
      {status}
    </span>
  </div>
);

/* --- Activity Players (Reused & Refined) --- */
/* 🧠 1. Memory Sketch */
const Activity_MemorySketch = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(5);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectedWidth] = useState(3);
  const [activeTool, setActiveTool] = useState("brush");

  useEffect(() => {
    if (step === 1 && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (step === 1 && timeLeft === 0) {
      setStep(2);
    }
  }, [step, timeLeft]);

  return (
    <div className="h-full flex flex-col bg-stone-100 animate-fadeIn p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-3 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-stone-700 hover:text-stone-900 font-jua text-xl sm:text-2xl bg-white px-6 py-3 rounded-xl shadow-sm"
        >
          <ArrowLeft size={28} /> 나가기
        </button>
        <div className="flex gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-4 h-4 rounded-full ${
                step >= s ? "bg-[#4C8F7E]" : "bg-stone-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative min-h-0 w-full">
        {step === 1 && (
          <div className="text-center space-y-4 w-full max-w-3xl overflow-y-auto custom-scrollbar p-2">
            <h2 className="text-3xl sm:text-[2.8rem] font-jua text-stone-800">
              🌻 해바라기를 잘 기억해주세요!
            </h2>
            <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto bg-white rounded-full flex items-center justify-center border-8 border-[#4C8F7E] shadow-xl">
              <span className="text-5xl sm:text-6xl font-jua text-[#4C8F7E] animate-pulse">
                {timeLeft}
              </span>
            </div>
            <div className="card-base bg-[#FFFBEB] p-4 flex items-center justify-center h-[280px] sm:h-[320px] border-4 border-yellow-200 shadow-lg">
              <span className="text-[140px] sm:text-[160px]">🌻</span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="w-full h-full flex flex-col sm:flex-row gap-4 min-h-0">
            <div className="flex-1 card-base bg-white relative cursor-crosshair border-stone-300 shadow-md overflow-hidden order-2 sm:order-1">
              <DrawingCanvas
                color={selectedColor}
                lineWidth={selectedWidth}
                tool={activeTool}
              />
              <div className="absolute top-3 left-3 bg-stone-100/80 px-4 py-2 rounded-lg text-stone-700 font-gowun backdrop-blur-sm pointer-events-none text-lg sm:text-xl">
                ✍️ 기억을 떠올려 그려보세요
              </div>
            </div>

            <div className="w-full sm:w-[120px] card-base bg-white p-4 flex flex-row sm:flex-col gap-3 shadow-sm border border-stone-200 overflow-x-auto sm:overflow-y-auto custom-scrollbar shrink-0 order-1 sm:order-2 items-center">
              <span className="text-center font-jua text-stone-700 text-base sm:text-lg shrink-0 hidden sm:block">
                색상
              </span>
              <div className="flex flex-row sm:flex-col gap-2 shrink-0 items-center">
                {["#000000", "#FF5252", "#FFB74D", "#4CAF50", "#2196F3"].map(
                  (c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setSelectedColor(c);
                        setActiveTool("brush");
                      }}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 shadow-sm transition-transform ${
                        selectedColor === c && activeTool === "brush"
                          ? "scale-110 border-stone-800"
                          : "border-white"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  )
                )}
              </div>

              <div className="w-[1px] h-full sm:w-full sm:h-[1px] bg-stone-200 my-1 shrink-0" />

              <button
                onClick={() => setActiveTool("eraser")}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-stone-200 flex items-center justify-center hover:bg-stone-300 transition shrink-0 ${
                  activeTool === "eraser" ? "ring-4 ring-stone-400" : ""
                }`}
              >
                <Eraser size={24} className="text-stone-700" />
              </button>

              <div className="flex-1" />

              <button
                className="w-auto sm:w-full px-8 sm:px-0 py-3 rounded-xl bg-[#4C8F7E] text-white font-jua text-xl sm:text-2xl shadow-md hover:bg-[#3F7F6E] shrink-0 h-[56px] sm:h-[64px]"
                onClick={() => setStep(3)}
              >
                완료
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-2 overflow-y-auto">
            <h2 className="text-3xl sm:text-[2.8rem] font-jua text-stone-800 shrink-0">
              참 잘하셨어요! 👏👏
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-4xl h-auto sm:h-[280px] shrink-0">
              <div className="flex-1 card-base bg-[#FFFBEB] flex flex-col items-center justify-center border-yellow-200 shadow-md aspect-square sm:aspect-auto">
                <span className="text-xl sm:text-2xl font-jua text-stone-700 mb-2 bg-white px-4 py-1 rounded-full shadow-sm">
                  원본 그림
                </span>
                <span className="text-[100px] sm:text-[120px]">🌻</span>
              </div>
              <div className="flex-1 card-base bg-white flex flex-col items-center justify-center border-[#4C8F7E] shadow-md relative overflow-hidden aspect-square sm:aspect-auto">
                <span className="text-xl sm:text-2xl font-jua text-stone-700 mb-2 bg-stone-100 px-4 py-1 rounded-full shadow-sm">
                  나의 그림
                </span>
                <span className="text-lg sm:text-xl font-gowun text-stone-400">
                  (방금 그린 그림)
                </span>
                <div className="absolute inset-0 opacity-40 pointer-events-none bg-stone-100" />
              </div>
            </div>
            <button
              className="btn-primary w-[260px] text-xl sm:text-2xl h-[56px] sm:h-[64px] shrink-0"
              onClick={onBack}
            >
              갤러리에 저장하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* 🌿 2. Healing Coloring */
const Activity_HealingColoring = ({ onBack }) => {
  const [selectedColor, setSelectedColor] = useState("#FF5252");
  const [partColors, setPartColors] = useState({
    petal1: "#ffffff",
    petal2: "#ffffff",
    petal3: "#ffffff",
    petal4: "#ffffff",
    center: "#ffffff",
    bg: "#ffffff",
  });

  const handleColor = (part) => {
    setPartColors((prev) => ({ ...prev, [part]: selectedColor }));
  };

  return (
    <div className="h-full flex flex-col bg-stone-100 animate-fadeIn p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-3 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-stone-700 hover:text-stone-900 font-jua text-xl sm:text-2xl bg-white px-6 py-3 rounded-xl shadow-sm"
        >
          <ArrowLeft size={28} /> 그만하기
        </button>
        <h2 className="text-2xl sm:text-3xl font-jua text-stone-800">🌿 명화 컬러링</h2>
        <button
          className="bg-[#4C8F7E] text-white px-6 sm:px-8 py-3 rounded-full font-jua text-xl sm:text-2xl shadow-md hover:bg-[#3F7F6E] h-[56px] sm:h-[64px] flex items-center"
          onClick={onBack}
        >
          완료하기
        </button>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row gap-4 min-h-0">
        <div className="flex-[3] card-base bg-white relative flex items-center justify-center border-stone-200 shadow-md overflow-hidden">
          <svg
            viewBox="0 0 400 400"
            className="w-full h-full p-4 drop-shadow-xl"
          >
            <circle
              cx="200"
              cy="200"
              r="180"
              fill={partColors.bg}
              onClick={() => handleColor("bg")}
              stroke="#ddd"
              strokeWidth="1"
            />
            <ellipse
              cx="200"
              cy="120"
              rx="40"
              ry="70"
              fill={partColors.petal1}
              stroke="#333"
              strokeWidth="3"
              onClick={() => handleColor("petal1")}
              className="cursor-pointer hover:opacity-90"
            />
            <ellipse
              cx="280"
              cy="200"
              rx="70"
              ry="40"
              fill={partColors.petal2}
              stroke="#333"
              strokeWidth="3"
              onClick={() => handleColor("petal2")}
              className="cursor-pointer hover:opacity-90"
            />
            <ellipse
              cx="200"
              cy="280"
              rx="40"
              ry="70"
              fill={partColors.petal3}
              stroke="#333"
              strokeWidth="3"
              onClick={() => handleColor("petal3")}
              className="cursor-pointer hover:opacity-90"
            />
            <ellipse
              cx="120"
              cy="200"
              rx="70"
              ry="40"
              fill={partColors.petal4}
              stroke="#333"
              strokeWidth="3"
              onClick={() => handleColor("petal4")}
              className="cursor-pointer hover:opacity-90"
            />
            <circle
              cx="200"
              cy="200"
              r="40"
              fill={partColors.center}
              stroke="#333"
              strokeWidth="3"
              onClick={() => handleColor("center")}
              className="cursor-pointer hover:opacity-90"
            />
          </svg>
          <div className="absolute bottom-4 left-4 bg-stone-100/90 px-4 py-2 rounded-xl text-stone-700 font-gowun text-lg sm:text-xl flex items-center gap-2 shadow-sm backdrop-blur-md pointer-events-none">
            <Layout size={24} /> 칸을 누르면 색이 칠해져요!
          </div>
        </div>

        <div className="w-full sm:w-[240px] card-base bg-white p-4 flex flex-row sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto custom-scrollbar shadow-md shrink-0">
          <div className="shrink-0">
            <h3 className="text-xl sm:text-2xl font-jua text-stone-800 mb-3 flex items-center gap-2">
              <Palette size={24} /> 색상 선택
            </h3>
            <div className="grid grid-cols-6 sm:grid-cols-3 gap-2">
              {[
                "#FF5252",
                "#FFB74D",
                "#FFEB3B",
                "#8BC34A",
                "#4CAF50",
                "#2196F3",
                "#3F51B5",
                "#9C27B0",
                "#795548",
                "#607D8B",
                "#FFFFFF",
                "#000000",
              ].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`aspect-square rounded-full border-4 shadow-sm transition-transform w-12 h-12 sm:w-14 sm:h-14 ${
                    selectedColor === c
                      ? "scale-110 border-stone-800 ring-2 ring-offset-2 ring-stone-300"
                      : "border-white hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="mt-auto bg-stone-100 p-3 rounded-xl border border-stone-100 shrink-0 hidden sm:block">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-8 h-8 rounded-full border-2 border-stone-300"
                style={{ backgroundColor: selectedColor }}
              />
              <span className="font-jua text-base sm:text-lg text-stone-700">선택됨</span>
            </div>
            <p className="text-stone-400 text-sm font-gowun">
              원하는 칸을 탭하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* 🐢 3. Slow Studio */
const Activity_SlowStudio = ({ onBack }) => {
  const [feedback, setFeedback] = useState("천천히 선을 그어보세요.");
  const [isDrawingState, setIsDrawingState] = useState(false);

  const handleDrawStart = () => {
    setIsDrawingState(true);
    setFeedback("아주 좋아요. 지금 속도 그대로 유지해보세요 🌿");
  };

  return (
    <div className="h-full flex flex-col bg-stone-100 animate-fadeIn p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-3 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-stone-700 hover:text-stone-900 font-jua text-xl sm:text-2xl bg-white px-6 py-3 rounded-xl shadow-sm"
        >
          <ArrowLeft size={28} /> 나가기
        </button>
        <h2 className="text-2xl sm:text-3xl font-jua text-stone-800">🐢 빗소리 드로잉</h2>
        <div className="w-20 hidden sm:block" />
      </div>

      <div className="flex-1 flex flex-col sm:flex-row gap-4 min-h-0">
        <div className="flex-[3] card-base bg-white relative cursor-crosshair border-stone-200 shadow-md overflow-hidden min-h-[300px]">
          <DrawingCanvas
            color="#265C43"
            lineWidth={8}
            tool="brush"
            onInteract={handleDrawStart}
          />
          {!isDrawingState && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-stone-300 font-jua text-3xl sm:text-[2.8rem] pointer-events-none w-full text-center">
              천천히 선을 그어보세요
            </div>
          )}
          <div className="absolute top-4 right-4 bg-stone-100/80 px-4 py-2 rounded-full flex items-center gap-2 text-stone-700 font-gowun text-lg sm:text-xl">
            <Music size={24} className="animate-pulse" /> 빗소리 재생 중...
          </div>
        </div>

        <div className="w-full sm:w-[300px] flex flex-col gap-4 shrink-0">
          <div className="bg-[#E0F5EF] p-5 rounded-[20px] border-4 border-[#4C8F7E] flex flex-col gap-4 shadow-md flex-1 overflow-y-auto custom-scrollbar min-h-[150px]">
            <div className="flex items-center gap-3 border-b border-[#bcebe3] pb-3 shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#4C8F7E] rounded-full flex items-center justify-center text-white shadow-sm">
                <Smile size={28} strokeWidth={2} />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-jua text-[#265C43] block">
                  슬로우 코치
                </span>
                <span className="text-base sm:text-lg font-gowun text-[#265C43] opacity-80">
                  AI 분석 중...
                </span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 relative shrink-0">
              <div className="absolute -top-2 left-5 w-4 h-4 bg-white rotate-45 border-t border-l border-stone-100" />
              <p className="text-xl sm:text-2xl font-gowun text-stone-700 leading-relaxed font-bold">
                "{feedback}"
              </p>
            </div>
            <div className="mt-auto opacity-60 text-center shrink-0 pt-2">
              <Activity
                className="mx-auto text-[#265C43] mb-1 animate-pulse"
                size={28}
              />
              <span className="font-gowun text-[#265C43] text-lg sm:text-xl">
                호흡을 편안하게...
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <button
              className="btn-primary w-full text-xl sm:text-2xl h-[56px] sm:h-[64px]"
              onClick={onBack}
            >
              완료하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* 🎨 4. Free Drawing (ArtBonBon Style Enhanced with AI Curator) */
const Activity_FreeDrawing = ({ onBack, backgroundSketch, customTitle, enableCurator = true }) => {
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectedWidth, setSelectedWidth] = useState(5);
  const [activeTool, setActiveTool] = useState("brush");
  const [isMagicMode, setIsMagicMode] = useState(false);
  const [curatorMessage, setCuratorMessage] = useState("어르신, 오늘은 어떤 멋진 그림을 그려주실 건가요? 😊");
  const [showCurator, setShowCurator] = useState(true);

  // AI Feedback Logic
  useEffect(() => {
    const feedbacks = {
      "#FF5252": ["와, 열정적인 빨간색이네요! 힘이 솟는 것 같아요 🌹", "잘 익은 사과처럼 탐스러운 색깔이에요!", "화면이 환해지는 느낌이에요."],
      "#FFEB3B": ["개나리처럼 화사한 노란색이 참 고와요 🌼", "따뜻한 햇살 같은 색깔이네요.", "기분이 좋아지는 밝은 색이에요!"],
      "#4CAF50": ["싱그러운 풀내음이 나는 것 같아요 🌿", "눈이 편안해지는 초록색이네요.", "숲속에 온 것처럼 상쾌해요."],
      "#2196F3": ["시원한 파란색을 보니 마음이 뻥 뚫리네요 🌊", "가을 하늘처럼 맑은 색깔이에요.", "차분하고 깊이 있는 색이네요."],
      "#000000": ["또렷하고 힘찬 검은색이네요 ✍️", "선이 분명해서 그림이 살아나요.", "기본에 충실한 멋진 선택이에요."],
      "#9C27B0": ["우아하고 고상한 보라색이네요 🍇", "신비로운 느낌이 드는 색깔이에요."],
      "#FF9800": ["잘 익은 감처럼 먹음직스러운 색이네요 🍊", "따뜻하고 정겨운 주황색이에요."]
    };

    if (feedbacks[selectedColor]) {
      const randomFeedback = feedbacks[selectedColor][Math.floor(Math.random() * feedbacks[selectedColor].length)];
      setCuratorMessage(randomFeedback);
    }
  }, [selectedColor]);

  const handleDrawInteraction = () => {
    // 그리기 행동에 대한 랜덤 칭찬 (30% 확률로 발생)
    if (Math.random() > 0.7) {
      const actionFeedbacks = [
        "선이 참 시원시원하시네요! 👏",
        "망설임 없이 그리시는 모습이 멋져요.",
        "어쩜 이렇게 손끝이 섬세하세요?",
        "그림에서 에너지가 느껴져요! ✨",
        "정말 독창적인 작품이 나올 것 같아요."
      ];
      setCuratorMessage(actionFeedbacks[Math.floor(Math.random() * actionFeedbacks.length)]);
    }
  };

  // Tools Configuration
  const tools = [
    { id: 'brush', icon: Pencil, label: '연필', width: 3, opacity: 1 },
    { id: 'marker', icon: PenTool, label: '마커', width: 8, opacity: 1 },
    { id: 'highlighter', icon: Highlighter, label: '형광펜', width: 20, opacity: 0.5 },
    { id: 'eraser', icon: Eraser, label: '지우개', width: 20, opacity: 1 }
  ];

  // Colors (Vibrant & Pastel Mix)
  const colors = [
    "#000000", "#FF5252", "#E91E63", "#9C27B0",
    "#3F51B5", "#2196F3", "#00BCD4", "#009688",
    "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B",
    "#FFC107", "#FF9800", "#FF5722", "#795548",
    "#9E9E9E", "#607D8B", "#FFFFFF"
  ];

  return (
    <div className="h-full flex flex-col bg-[#F0F4F8] animate-fadeIn overflow-hidden">
      {/* Header Toolbar */}
      <div className="bg-white p-3 flex items-center justify-between shadow-sm shrink-0 z-10 px-6">
        <div className="flex items-center gap-4">
        <button
          onClick={onBack}
            className="flex items-center justify-center w-12 h-12 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full transition-colors"
        >
            <ArrowLeft size={24} />
        </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{customTitle ? "🌅" : "🎨"}</span>
            <h2 className="text-xl sm:text-2xl font-jua text-stone-800">{customTitle || "자유 드로잉"}</h2>
          </div>
      </div>

        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-xl">
          <button className="p-3 hover:bg-white rounded-lg text-stone-700 hover:text-stone-900 transition-all shadow-sm" title="실행 취소">
            <Undo size={22} />
          </button>
          <button className="p-3 hover:bg-white rounded-lg text-stone-700 hover:text-stone-900 transition-all shadow-sm" title="다시 실행">
            <Redo size={22} />
          </button>
          <div className="w-[1px] h-6 bg-stone-300 mx-1" />
          <button className="p-3 hover:bg-red-50 rounded-lg text-stone-700 hover:text-red-500 transition-all shadow-sm" title="모두 지우기">
            <Trash2 size={22} />
          </button>
        </div>

        <button
          onClick={onBack}
          className="bg-[#4C8F7E] hover:bg-[#3F7F6E] text-white px-6 py-2.5 rounded-full font-jua text-lg shadow-md flex items-center gap-2 transition-all"
        >
          <Download size={20} />
          저장하기
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar (Tools) */}
        <div className="w-[110px] bg-white border-r border-stone-200 flex flex-col items-center py-6 gap-4 shrink-0 shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-10 overflow-y-auto custom-scrollbar">
          {/* AI Magic Pen (Special Tool) */}
              <button
            onClick={() => setIsMagicMode(!isMagicMode)}
            className={`flex flex-col items-center justify-center w-20 h-24 rounded-2xl transition-all border-2 ${
              isMagicMode
                ? "bg-indigo-100 border-indigo-300 text-indigo-600 shadow-md scale-105"
                : "bg-white border-stone-200 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                }`}
              >
            <div className={`p-2 rounded-full mb-1 ${isMagicMode ? 'bg-white animate-pulse' : 'bg-stone-100'}`}>
              <Sparkles size={24} className={isMagicMode ? "text-indigo-500 fill-indigo-500" : "text-stone-400"} />
            </div>
            <span className="text-sm font-jua">AI 매직펜</span>
            <span className={`text-xs font-bold ${isMagicMode ? 'text-indigo-500' : 'text-stone-300'}`}>
              {isMagicMode ? 'ON' : 'OFF'}
            </span>
              </button>

          <div className="w-16 h-[1px] bg-stone-200 shrink-0" />

          {tools.map((tool) => (
              <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool.id);
                if (tool.id !== 'eraser') {
                   if (tool.id === 'highlighter') setSelectedWidth(20);
                   else if (tool.id === 'marker') setSelectedWidth(8);
                   else setSelectedWidth(3);
                }
              }}
              className={`flex flex-col items-center justify-center w-20 h-24 rounded-2xl transition-all ${
                activeTool === tool.id
                  ? "bg-[#4C8F7E] text-white shadow-md scale-105 ring-4 ring-[#4C8F7E]/20 translate-x-2"
                  : "bg-stone-100 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                }`}
              >
              <tool.icon size={32} strokeWidth={2} className="mb-2" />
              <span className="text-base font-jua">{tool.label}</span>
              </button>
          ))}
            </div>

        {/* Center Canvas Area */}
        <div className="flex-1 bg-[#F0F4F8] p-6 flex items-center justify-center relative overflow-hidden">
          <div className={`bg-white w-full h-full max-w-[900px] max-h-[650px] shadow-xl rounded-2xl overflow-hidden cursor-crosshair ring-1 ring-stone-200 transition-all duration-500 relative ${isMagicMode ? "ring-4 ring-indigo-200 shadow-indigo-100" : ""}`}>
             {backgroundSketch}
             <DrawingCanvas
                color={selectedColor}
                lineWidth={selectedWidth}
                tool={activeTool === 'eraser' ? 'eraser' : 'brush'}
                isMagicMode={isMagicMode}
                onInteract={handleDrawInteraction}
              />
              
              {/* 🤖 AI Curator (Interactive Feedback) */}
              {enableCurator && showCurator && (
                <div className="absolute bottom-6 right-6 flex items-end gap-3 animate-slideUp z-20">
                  <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl rounded-br-none shadow-lg border-2 border-[#4C8F7E]/30 max-w-[280px] mb-4">
                    <p className="font-gowun text-lg text-stone-800 leading-snug">
                      {curatorMessage}
                    </p>
                  </div>
                  <div className="relative group cursor-pointer" onClick={() => setCuratorMessage("저를 누르셨군요! 제가 그림 그리기를 도와드릴게요 ❤️")}>
                    <div className="w-20 h-20 bg-[#4C8F7E] rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-transform group-hover:scale-110">
                      <span className="text-4xl">🤖</span>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap font-jua">
                      AI 그림이
                    </div>
                  </div>
                </div>
              )}

              {isMagicMode && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-100/90 backdrop-blur text-indigo-700 px-4 py-2 rounded-full font-gowun shadow-sm pointer-events-none animate-fadeIn">
                  ✨ AI가 선을 예쁘게 다듬어줍니다
                </div>
              )}
          </div>
        </div>

        {/* Right Toolbar (Colors & Size) */}
        <div className="w-[110px] bg-white border-l border-stone-200 flex flex-col items-center py-6 gap-6 shrink-0 shadow-[-2px_0_10px_rgba(0,0,0,0.02)] z-10 overflow-y-auto custom-scrollbar">
          {/* Size Indicator */}
          <div className="flex flex-col items-center gap-2 w-full px-2">
            <span className="font-jua text-stone-700 text-base">선 굵기</span>
            <div className="bg-stone-100 p-2 rounded-2xl w-full flex flex-col items-center gap-2 border border-stone-100">
                <button
                onClick={() => setSelectedWidth(Math.min(40, selectedWidth + 3))}
                className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-stone-700 hover:bg-stone-100 text-xl font-bold"
              >+</button>
              <div className="w-14 h-14 flex items-center justify-center bg-white rounded-xl border border-stone-200 shadow-inner">
                <div 
                  className="rounded-full bg-stone-800 transition-all"
                  style={{
                    width: Math.min(40, selectedWidth), 
                    height: Math.min(40, selectedWidth),
                    backgroundColor: activeTool === 'eraser' ? '#ddd' : selectedColor,
                    opacity: activeTool === 'highlighter' ? 0.5 : 1
                  }}
                />
              </div>
              <button 
                onClick={() => setSelectedWidth(Math.max(1, selectedWidth - 3))}
                className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-stone-700 hover:bg-stone-100 text-xl font-bold"
              >-</button>
            </div>
            </div>

          <div className="w-16 h-[2px] bg-stone-100 rounded-full my-2" />

          {/* Colors */}
          <div className="flex flex-col gap-3 w-full px-2 items-center flex-1 overflow-y-auto custom-scrollbar">
             <span className="font-jua text-stone-700 text-base shrink-0">색상</span>
             <div className="grid grid-cols-2 gap-2 w-full">
               {colors.map((color) => (
                <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      if (activeTool === 'eraser') setActiveTool('brush');
                    }}
                    className={`aspect-square w-full rounded-xl shadow-sm transition-transform hover:scale-105 relative ${
                      selectedColor === color ? "scale-105 ring-2 ring-stone-400 ring-offset-2 z-10" : "ring-1 ring-black/5"
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check size={16} className={color === "#FFFFFF" ? "text-stone-400" : "text-white"} />
                      </div>
                    )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* 🎙️ 5. Voice-to-Art (Memory Canvas) */
const Activity_VoiceArt = ({ onBack }) => {
  const [step, setStep] = useState('intro'); // intro, recording, processing, result
  const [transcript, setTranscript] = useState("");
  
  const handleRecordStart = () => {
    setStep('recording');
    // Simulation: 2 seconds of "listening" then auto-fill text
    setTimeout(() => {
      setTranscript("옛날에 살던 기와집 마당에 핀 붉은 감나무");
      setTimeout(() => {
        setStep('processing');
      }, 1500);
    }, 2000);
  };

  useEffect(() => {
    if (step === 'processing') {
      // Simulation: 3 seconds of "generating"
      setTimeout(() => {
        setStep('result');
      }, 3000);
    }
  }, [step]);

  if (step === 'result') {
    // Reuse Free Drawing UI but with a background sketch
    return (
      <Activity_FreeDrawing 
        onBack={onBack} 
        customTitle="그때 그 시절"
        enableCurator={false}
        backgroundSketch={
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Placeholder for generated line art (Persimmon Tree & House) */}
            <svg viewBox="0 0 800 600" className="w-full h-full opacity-40" preserveAspectRatio="xMidYMid meet">
              {/* House */}
              <path d="M200 400 L400 250 L600 400 Z" fill="none" stroke="#5d4037" strokeWidth="3" strokeLinejoin="round" /> {/* Roof */}
              <rect x="250" y="400" width="300" height="150" fill="none" stroke="#5d4037" strokeWidth="3" /> {/* House Body */}
              <rect x="360" y="450" width="80" height="100" fill="none" stroke="#5d4037" strokeWidth="2" /> {/* Door */}
              
              {/* Tree Trunk */}
              <path d="M650 550 Q 680 400 700 300" fill="none" stroke="#4e342e" strokeWidth="12" strokeLinecap="round" />
              <path d="M700 300 Q 750 200 780 250" fill="none" stroke="#4e342e" strokeWidth="8" strokeLinecap="round" />
              
              {/* Tree Leaves */}
              <circle cx="700" cy="250" r="60" fill="none" stroke="#2e7d32" strokeWidth="2" strokeDasharray="5,5" />
              <circle cx="750" cy="200" r="50" fill="none" stroke="#2e7d32" strokeWidth="2" strokeDasharray="5,5" />
              
              {/* Persimmons */}
              <circle cx="680" cy="240" r="12" fill="#ff7043" stroke="none" opacity="0.8" />
              <circle cx="720" cy="270" r="12" fill="#ff7043" stroke="none" opacity="0.8" />
              <circle cx="750" cy="210" r="12" fill="#ff7043" stroke="none" opacity="0.8" />
              <circle cx="780" cy="240" r="12" fill="#ff7043" stroke="none" opacity="0.8" />
            </svg>
          </div>
        }
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-stone-100 animate-fadeIn p-4 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
          <button
            onClick={onBack}
          className="flex items-center gap-2 text-stone-700 hover:text-stone-900 font-jua text-xl sm:text-2xl bg-white px-6 py-3 rounded-xl shadow-sm"
          >
          <ArrowLeft size={28} /> 그만하기
          </button>
        <div className="bg-[#FFE5D4] px-6 py-2 rounded-full">
          <span className="text-[#D85718] font-jua text-xl sm:text-2xl">
            🎙️ 말하는 대로 그려지는 추억 캔버스
          </span>
        </div>
        <div className="w-20" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {step === 'intro' && (
          <div className="text-center animate-fadeIn flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl font-jua text-stone-800 mb-6">
              어떤 추억을 그리고 싶으신가요?
            </h2>
            <p className="text-xl sm:text-2xl font-gowun text-stone-700 mb-12">
              마이크 버튼을 누르고 말씀만 하세요.<br/>
              AI가 어르신의 추억을 멋진 그림으로 만들어드립니다.
            </p>
            
            <button 
              onClick={handleRecordStart}
              className="w-48 h-48 bg-[#EB6A29] border border-[#D85718] shadow-md shadow-[#FFD5B8] border border-[#D85718] shadow-md shadow-[#FFD5B8] border border-[#D85718] shadow-md shadow-[#FFD5B8] hover:bg-[#D85718] rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 group relative"
            >
              <div className="absolute inset-0 rounded-full border-4 border-[#FFC89C] animate-ping opacity-50" />
              <div className="text-white">
                {/* Mic Icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </div>
            </button>
            <p className="mt-6 text-lg font-jua text-[#EB6A29] animate-pulse">
              여기를 눌러서 말씀해주세요
            </p>
          </div>
        )}

        {step === 'recording' && (
          <div className="text-center animate-fadeIn flex flex-col items-center w-full max-w-2xl">
            <div className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center mb-8 animate-pulse shadow-lg">
              <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-4 h-4 bg-white rounded-full mx-2 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-jua text-stone-800 mb-6">
              듣고 있어요...
            </h3>
            <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-stone-100 w-full min-h-[160px] flex items-center justify-center">
              <p className="text-2xl sm:text-3xl font-gowun text-stone-700 leading-relaxed">
                "{transcript || "..."}"
              </p>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center animate-fadeIn flex flex-col items-center">
            <div className="relative w-40 h-40 mb-8">
              <div className="absolute inset-0 border-4 border-stone-200 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-[#EB6A29] rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-4xl">🎨</div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-jua text-stone-800 mb-2">
              추억을 그리는 중입니다
            </h3>
            <p className="text-xl font-gowun text-stone-700">
              조금만 기다려주세요...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* 📁 Gallery Drawer - My Artworks List */
const Screen_GalleryDrawer = ({ onBack }) => {
  // Mock 데이터: 사용자가 그린 작품들
  const myArtworks = [
    { id: 1, title: '해바라기', date: '2024.11.20', category: '자유 드로잉', emoji: '🌻', color: 'bg-yellow-50' },
    { id: 2, title: '고향집', date: '2024.11.18', category: '추억 스케치', emoji: '🏡', color: 'bg-[#E8F0FF]' },
    { id: 3, title: '나비', date: '2024.11.15', category: '명화 컬러링', emoji: '🦋', color: 'bg-purple-50' },
    { id: 4, title: '가을 풍경', date: '2024.11.12', category: '자유 드로잉', emoji: '🍂', color: 'bg-[#FFF5EF]' },
    { id: 5, title: '평화로운 오후', date: '2024.11.10', category: '빗소리 드로잉', emoji: '☕', color: 'bg-[#E8F7ED]' },
    { id: 6, title: '엄마 생각', date: '2024.11.08', category: '추억 스케치', emoji: '👵', color: 'bg-pink-50' },
    { id: 7, title: '봄날', date: '2024.11.05', category: '명화 컬러링', emoji: '🌸', color: 'bg-pink-50' },
    { id: 8, title: '강아지', date: '2024.11.03', category: '자유 드로잉', emoji: '🐕', color: 'bg-amber-50' },
  ];

  return (
    <div className="h-full flex flex-col bg-stone-100 animate-fadeIn overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b-2 border-stone-200 p-5 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-stone-700 hover:text-stone-900 font-jua text-xl sm:text-2xl px-6 py-3 rounded-xl hover:bg-stone-100 transition"
          >
            <ArrowLeft size={28} /> 나의 아틀리에로
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-[#E8F7ED] p-3 rounded-full">
              <Grid size={32} className="text-[#256A39]" />
            </div>
            <div>
              <p className="text-lg font-gowun text-stone-700">총 {myArtworks.length}개의 작품</p>
            </div>
          </div>
          <div className="w-20 hidden sm:block" />
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
        <div className="grid grid-cols-3 gap-5">
          {myArtworks.map((artwork) => (
            <div
              key={artwork.id}
              className={`${artwork.color} border-2 border-stone-200 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group`}
            >
              {/* Artwork Preview */}
              <div className="bg-white rounded-xl shadow-md mb-4 aspect-[4/3] flex items-center justify-center border-4 border-white relative overflow-hidden group-hover:border-[#C8E9D5] transition">
                <div className="text-8xl">{artwork.emoji}</div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition" />
              </div>

              {/* Artwork Info */}
              <div className="space-y-2">
                <h3 className="text-2xl font-jua text-stone-800 truncate">
                  {artwork.title}
                </h3>
                <div className="flex items-center gap-2 text-base font-gowun text-stone-700">
                  <span className="bg-white px-3 py-1 rounded-lg text-sm">
                    {artwork.category}
                  </span>
                </div>
                <p className="text-base font-gowun text-stone-400">
                  {artwork.date}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-white hover:bg-[#E8F7ED] text-stone-700 hover:text-[#1E5A2E] px-4 py-2 rounded-lg font-jua text-base transition border border-stone-200 hover:border-[#B5DFC7]">
                  보기
                </button>
                <button className="flex-1 bg-white hover:bg-[#FFF5EF] text-stone-700 hover:text-orange-700 px-4 py-2 rounded-lg font-jua text-base transition border border-stone-200 hover:border-[#FFC89C]">
                  나눔
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (if no artworks) */}
        {myArtworks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-9xl mb-6 opacity-20">🎨</div>
            <h3 className="text-3xl font-jua text-stone-400 mb-2">
              아직 작품이 없어요
            </h3>
            <p className="text-xl font-gowun text-stone-400 mb-6">
              창작실에서 그림을 그려보세요!
            </p>
            <button
              onClick={onBack}
              className="btn-primary text-xl h-[56px] w-[240px]"
            >
              그림 그리러 가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Placeholder Component ---
const Activity_Placeholder = ({ onBack }) => (
  <div className="h-full flex flex-col items-center justify-center gap-6 bg-stone-100 p-6 text-center">
    <h2 className="text-3xl sm:text-[2.8rem] font-jua text-stone-700">
      🚧 준비 중인 활동입니다
    </h2>
    <p className="text-2xl sm:text-3xl font-gowun text-stone-700">
      더 재미있는 활동을 준비하고 있어요!
    </p>
    <button className="btn-primary w-[240px] text-xl sm:text-2xl h-[56px] sm:h-[64px]" onClick={onBack}>
      돌아가기
    </button>
  </div>
);

/* 👨‍💼 Screen 7: Admin Dashboard (관리자 모드) */
const Screen_Admin = ({ onNav }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const stats = [
    { label: '주간 활동', value: '47', icon: '🎨', color: 'bg-pink-50 border-pink-200 text-pink-600' },
    { label: '평균 참여도', value: '8.1', icon: '⭐', color: 'bg-yellow-50 border-yellow-200 text-yellow-600' },
    { label: '정서 개선율', value: '12%', icon: '📈', color: 'bg-[#E8F0FF] border-[#C5D9FF] text-[#2560B8]' },
  ];

  const members = [
    { name: '박영희', age: 72, joined: '3개월 전', status: '매우 긍정적', statusColor: 'bg-[#DBF2E3] text-[#1E5A2E]', lastActive: '2시간 전', progress: 85 },
    { name: '김철수', age: 68, joined: '2개월 전', status: '긍정적', statusColor: 'bg-[#D8E8FF] text-[#1F4F9E]', lastActive: '5시간 전', progress: 72 },
    { name: '이순희', age: 75, joined: '1개월 전', status: '안정적', statusColor: 'bg-stone-100 text-stone-700', lastActive: '어제', progress: 65 },
  ];

  return (
    <div className="h-full flex flex-col bg-stone-100 animate-fadeIn text-stone-800">
      {/* Admin Header */}
      <div className="bg-[#4C8F7E] text-white p-6 flex justify-between items-center shrink-0 shadow-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNav('home', 'home')}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-jua">관리자 대시보드</h1>
        </div>
        <div className="font-gowun text-white/80">성남복지관</div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-stone-200 p-4 flex flex-col gap-2 shrink-0 hidden lg:flex">
          {['dashboard', 'members', 'contents', 'analytics', 'settings'].map((menu) => (
            <button
              key={menu}
              disabled={menu !== 'dashboard'}
              onClick={() => menu === 'dashboard' && setActiveMenu(menu)}
              className={`text-left px-4 py-3 rounded-xl font-jua text-lg transition-all flex justify-between items-center ${
                activeMenu === menu 
                  ? 'bg-[#4C8F7E] text-white shadow-md' 
                  : menu === 'dashboard'
                    ? 'text-stone-700 hover:bg-stone-100 hover:text-stone-800 cursor-pointer'
                    : 'text-stone-300 cursor-not-allowed opacity-60'
              }`}
            >
              <span>
                {menu === 'dashboard' && '📊 대시보드'}
                {menu === 'members' && '👥 회원 관리'}
                {menu === 'contents' && '📚 수업/컨텐츠'}
                {menu === 'analytics' && '📈 데이터 분석'}
                {menu === 'settings' && '⚙️ 설정'}
              </span>
              {menu !== 'dashboard' && <span className="text-xs bg-stone-100 px-2 py-0.5 rounded text-stone-400">준비중</span>}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-stone-100 p-6 lg:p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className={`p-6 rounded-3xl border-2 ${stat.color} shadow-sm flex flex-col justify-between h-40`}>
                  <div className="flex justify-between items-start">
                    <div className="text-4xl bg-white/50 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      {stat.icon}
                    </div>
                    <div className="text-right">
                      <div className="font-gowun text-lg opacity-70 mb-1">{stat.label}</div>
                      <div className="font-jua text-4xl">{stat.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Report Generation Section */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📊</span>
                <h3 className="text-xl font-jua text-stone-800">보고서 자동 생성</h3>
              </div>
              <div className="flex flex-wrap gap-4">
                <button className="flex-1 min-w-[180px] py-4 bg-pink-400 hover:bg-pink-500 text-white rounded-xl font-jua text-lg shadow-md transition-all flex items-center justify-center gap-2">
                  📄 주간 보고서
                </button>
                <button className="flex-1 min-w-[180px] py-4 bg-indigo-400 hover:bg-indigo-500 text-white rounded-xl font-jua text-lg shadow-md transition-all flex items-center justify-center gap-2">
                  📅 월간 보고서
                </button>
                <button className="flex-1 min-w-[220px] py-4 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl font-jua text-lg shadow-md transition-all flex items-center justify-center gap-2">
                  🏢 정부 지원금 신청용
                </button>
              </div>
              <p className="text-stone-700 text-sm mt-4 font-gowun pl-1">
                * 클릭 한 번으로 정서적 데이터 기반 보고서가 자동으로 생성됩니다.
              </p>
            </div>

            {/* Member Status List */}
            <div>
              <h3 className="text-2xl font-jua text-stone-800 mb-4 pl-2">참여자 현황</h3>
              <div className="grid grid-cols-3 gap-4">
                {members.map((member, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-xl font-jua text-stone-800 mb-1">{member.name}</h4>
                          <p className="text-stone-700 font-gowun text-sm">{member.age}세 • {member.joined}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-lg font-bold text-xs ${member.statusColor}`}>
                          {member.status}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3 text-sm text-stone-400 font-gowun">
                        <span>마지막 활동: {member.lastActive}</span>
                      </div>
                    </div>

                    <div>
                      <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden mb-1">
                        <div 
                          className="h-full bg-gradient-to-r from-[#4C8F7E] to-[#265C43] rounded-full"
                          style={{ width: `${member.progress}%` }}
                        />
                      </div>
                      <div className="text-right text-xs text-[#4C8F7E] font-bold">
                        진행률 {member.progress}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default App;