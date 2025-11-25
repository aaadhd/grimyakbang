import React, { useState, useRef, useEffect } from "react";
import { Volume2, Mic, CheckCircle, X } from "lucide-react";

// 전역 TTS 관리 (하나만 재생되도록)
let currentUtterance = null;
let currentInterval = null;

// 모든 버튼 인스턴스의 상태 업데이트 함수들
const buttonInstances = new Set();

const notifyAllButtons = (isPlaying) => {
  buttonInstances.forEach(updateFn => {
    if (updateFn && typeof updateFn === 'function') {
      updateFn(isPlaying);
    }
  });
};

// 음성 중지 함수 (외부에서 호출 가능)
export const stopVoiceGuide = () => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = null;
  }
  currentUtterance = null;
  notifyAllButtons(false);
};

// ============================================
// 1. 음성 안내 버튼 컴포넌트
// ============================================
export const VoiceGuideButton = ({ position = "top-right", text = "화면 안내를 시작합니다." }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const updateStateRef = useRef(null);

  // 버튼 인스턴스 등록
  useEffect(() => {
    updateStateRef.current = setIsPlaying;
    buttonInstances.add(setIsPlaying);
    
    return () => {
      buttonInstances.delete(setIsPlaying);
      updateStateRef.current = null;
    };
  }, []);

  // speaking 상태 주기적 확인
  useEffect(() => {
    if (!isPlaying) return;

    const checkInterval = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setIsPlaying(false);
        notifyAllButtons(false);
        if (currentInterval) {
          clearInterval(currentInterval);
          currentInterval = null;
        }
        currentUtterance = null;
      }
    }, 100);

    return () => {
      clearInterval(checkInterval);
    };
  }, [isPlaying]);

  const handleClick = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("이 브라우저는 음성 안내를 지원하지 않습니다.");
      return;
    }

    // 기존 재생 중이면 중단
    if (isPlaying || window.speechSynthesis.speaking) {
      stopVoiceGuide();
      return;
    }

    startPlayback();
  };

  const startPlayback = () => {
    // 기존 재생 취소
    stopVoiceGuide();

    // 즉시 상태 변경
    setIsPlaying(true);
    notifyAllButtons(true);

    // 약간의 지연 후 재생
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsPlaying(true);
        notifyAllButtons(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        notifyAllButtons(false);
        if (currentInterval) {
          clearInterval(currentInterval);
          currentInterval = null;
        }
        currentUtterance = null;
      };

      utterance.onerror = (error) => {
        console.error("TTS Error:", error);
        setIsPlaying(false);
        notifyAllButtons(false);
        if (currentInterval) {
          clearInterval(currentInterval);
          currentInterval = null;
        }
        currentUtterance = null;
      };

      currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);

      // Chrome TTS 버그 방지
      currentInterval = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.resume();
        } else {
          if (currentInterval) {
            clearInterval(currentInterval);
            currentInterval = null;
          }
        }
      }, 500);
    }, 100);
  };

  const positionClasses = {
    "top-right": "absolute top-4 right-4",
    "top-left": "absolute top-4 left-4",
    "bottom-right": "absolute bottom-4 right-4",
    "bottom-left": "absolute bottom-4 left-4",
  };

  return (
    <button
      onClick={handleClick}
      style={{ 
        fontSize: '18px',
        width: '120px',
        height: '56px'
      }}
      className={`${positionClasses[position]} z-50 flex items-center justify-center gap-2 px-3 py-3 bg-white border-2 border-stone-200 rounded-xl shadow-lg hover:shadow-xl transition-all font-jua ${
        isPlaying ? "bg-[#4C8F7E] text-white border-[#4C8F7E]" : "text-stone-700"
      }`}
    >
      {isPlaying ? (
        <>
          <span className="whitespace-nowrap">재생 중</span>
          <div className="flex gap-1 flex-shrink-0">
            <div className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
            <div className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
            <div className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
          </div>
        </>
      ) : (
        <>
          <Volume2
            size={24}
            className="flex-shrink-0"
          />
          <span className="whitespace-nowrap">음성 안내</span>
        </>
      )}
    </button>
  );
};

// ============================================
// 2. 음성 명령 모달 컴포넌트
// ============================================
export const VoiceCommandModal = ({ isOpen, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");

  const exampleCommands = [
    { text: "저장해 줘", icon: "💾" },
    { text: "뒤로 가줘", icon: "⬅️" },
    { text: "색깔 바꿔 줘", icon: "🎨" },
    { text: "지워 줘", icon: "🗑️" },
  ];

  const handleStartListening = () => {
    setIsListening(true);
    setRecognizedText("");
    
    // 2초 후 예시 텍스트 표시 (실제 STT 시뮬레이션)
    setTimeout(() => {
      setRecognizedText("저장해 줘");
      setIsListening(false);
    }, 2000);
  };

  const handleClose = () => {
    setIsListening(false);
    setRecognizedText("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#E8F7ED] p-3 rounded-full">
              <Mic size={32} className="text-[#4C8F7E]" />
            </div>
            <h2 className="text-3xl font-jua text-stone-800">음성 명령</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-stone-400 hover:text-stone-700 text-3xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Listening State */}
        {!isListening && !recognizedText && (
          <div className="text-center py-8">
            <button
              onClick={handleStartListening}
              className="w-32 h-32 bg-[#4C8F7E] hover:bg-[#3d7265] rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg transition-all hover:scale-105"
            >
              <Mic size={64} className="text-white" />
            </button>
            <p className="text-2xl font-jua text-stone-700 mb-4">
              버튼을 눌러 말씀해 주세요
            </p>
            <p className="text-lg font-gowun text-stone-400">
              예: "저장해 줘", "뒤로 가줘"
            </p>
          </div>
        )}

        {/* Listening Animation */}
        {isListening && (
          <div className="text-center py-8 animate-fadeIn">
            <div className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
            <p className="text-2xl font-jua text-stone-800">
              듣고 있어요...
            </p>
          </div>
        )}

        {/* Recognized Text */}
        {recognizedText && (
          <div className="text-center py-8 animate-fadeIn">
            <div className="bg-[#E8F7ED] p-6 rounded-2xl mb-6">
              <p className="text-3xl font-jua text-[#4C8F7E]">
                "{recognizedText}"
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-[#4C8F7E] font-jua text-xl">
              <CheckCircle size={24} />
              <span>명령을 실행했습니다</span>
            </div>
          </div>
        )}

        {/* Example Commands */}
        {!isListening && !recognizedText && (
          <div className="mt-8 pt-6 border-t-2 border-stone-100">
            <h3 className="text-xl font-jua text-stone-700 mb-4">
              사용 가능한 명령어
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {exampleCommands.map((cmd, idx) => (
                <div
                  key={idx}
                  className="bg-stone-100 p-4 rounded-xl border border-stone-200 flex items-center gap-3"
                >
                  <span className="text-3xl">{cmd.icon}</span>
                  <span className="font-gowun text-lg text-stone-700">
                    {cmd.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// 3. 음성 피드백 토스트 컴포넌트
// ============================================
export const VoiceFeedbackToast = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-fadeIn">
      <div className="bg-[#4C8F7E] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-jua text-xl">
        <Volume2 size={24} className="animate-pulse" />
        <span>{message}</span>
        <CheckCircle size={24} />
      </div>
    </div>
  );
};
