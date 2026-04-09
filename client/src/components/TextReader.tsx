import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Pause, Square, SkipForward, SkipBack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface TextReaderProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  autoStart?: boolean;
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?;])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

export default function TextReader({ contentRef, autoStart }: TextReaderProps) {
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalSentences, setTotalSentences] = useState(0);
  const [speed, setSpeed] = useState(1);
  const sentencesRef = useRef<string[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const highlightRef = useRef<HTMLElement | null>(null);
  const isReadingRef = useRef(false);

  const clearHighlight = useCallback(() => {
    if (highlightRef.current) {
      const parent = highlightRef.current.parentNode;
      if (parent) {
        const text = document.createTextNode(highlightRef.current.textContent || "");
        parent.replaceChild(text, highlightRef.current);
        parent.normalize();
      }
      highlightRef.current = null;
    }
  }, []);

  const highlightSentence = useCallback((sentence: string) => {
    clearHighlight();
    if (!contentRef.current) return;

    const walker = document.createTreeWalker(contentRef.current, NodeFilter.SHOW_TEXT, null);
    let node: Text | null;
    const sentenceClean = sentence.replace(/\s+/g, " ").trim();
    const searchWords = sentenceClean.substring(0, 60);

    while ((node = walker.nextNode() as Text | null)) {
      const nodeText = (node.textContent || "").replace(/\s+/g, " ");
      const idx = nodeText.indexOf(searchWords);
      if (idx >= 0) {
        try {
          const range = document.createRange();
          range.setStart(node, idx);
          range.setEnd(node, Math.min(idx + sentenceClean.length, node.length));

          const mark = document.createElement("mark");
          const isDark = document.documentElement.classList.contains("dark");
          mark.className = isDark
            ? "bg-yellow-400/30 text-white rounded-sm px-0.5 transition-colors duration-200"
            : "bg-yellow-200/80 text-cedu-ink rounded-sm px-0.5 transition-colors duration-200";
          mark.setAttribute("data-reader-highlight", "true");
          range.surroundContents(mark);
          highlightRef.current = mark;

          mark.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch {
        }
        return;
      }
    }
  }, [contentRef, clearHighlight]);

  const speakSentence = useCallback((index: number) => {
    if (index >= sentencesRef.current.length) {
      setIsReading(false);
      setIsPaused(false);
      setCurrentIndex(0);
      isReadingRef.current = false;
      clearHighlight();
      return;
    }

    const sentence = sentencesRef.current[index];
    setCurrentIndex(index);
    highlightSentence(sentence);

    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = "es-MX";
    utterance.rate = speed;
    utterance.onend = () => {
      if (isReadingRef.current) {
        speakSentence(index + 1);
      }
    };
    utterance.onerror = () => {
      if (isReadingRef.current) {
        speakSentence(index + 1);
      }
    };
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [speed, highlightSentence, clearHighlight]);

  const handlePlay = useCallback(() => {
    if (!contentRef.current) return;

    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsReading(true);
      isReadingRef.current = true;
      return;
    }

    const text = contentRef.current.textContent || "";
    const sentences = splitIntoSentences(text);
    sentencesRef.current = sentences;
    setTotalSentences(sentences.length);

    setIsReading(true);
    setIsPaused(false);
    isReadingRef.current = true;
    speakSentence(currentIndex);
  }, [contentRef, isPaused, currentIndex, speakSentence]);

  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (autoStart && !autoStartedRef.current && contentRef.current) {
      autoStartedRef.current = true;
      const timer = setTimeout(() => handlePlay(), 100);
      return () => clearTimeout(timer);
    }
  }, [autoStart, handlePlay, contentRef]);

  const handlePause = useCallback(() => {
    speechSynthesis.pause();
    setIsPaused(true);
    setIsReading(false);
  }, []);

  const handleStop = useCallback(() => {
    speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
    setCurrentIndex(0);
    isReadingRef.current = false;
    clearHighlight();
  }, [clearHighlight]);

  const handleSkipForward = useCallback(() => {
    speechSynthesis.cancel();
    const next = Math.min(currentIndex + 1, sentencesRef.current.length - 1);
    if (isReading || isPaused) {
      isReadingRef.current = true;
      setIsReading(true);
      setIsPaused(false);
      speakSentence(next);
    } else {
      setCurrentIndex(next);
    }
  }, [currentIndex, isReading, isPaused, speakSentence]);

  const handleSkipBack = useCallback(() => {
    speechSynthesis.cancel();
    const prev = Math.max(currentIndex - 1, 0);
    if (isReading || isPaused) {
      isReadingRef.current = true;
      setIsReading(true);
      setIsPaused(false);
      speakSentence(prev);
    } else {
      setCurrentIndex(prev);
    }
  }, [currentIndex, isReading, isPaused, speakSentence]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    if (isReading) {
      speechSynthesis.cancel();
      isReadingRef.current = true;
      setTimeout(() => speakSentence(currentIndex), 50);
    }
  }, [isReading, currentIndex, speakSentence]);

  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
      isReadingRef.current = false;
      clearHighlight();
    };
  }, [clearHighlight]);

  const progress = totalSentences > 0 ? Math.round((currentIndex / totalSentences) * 100) : 0;

  if (!isReading && !isPaused && !autoStart) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-gray-900 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-3 max-w-lg w-[calc(100%-2rem)]" data-testid="text-reader-controls">
      <button
        onClick={handleSkipBack}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-cedu-ink-muted transition-colors"
        data-testid="button-reader-back"
      >
        <SkipBack size={16} />
      </button>

      {isReading ? (
        <button
          onClick={handlePause}
          className="w-10 h-10 rounded-full bg-cedu-blue text-white flex items-center justify-center hover:bg-cedu-blue-dark transition-colors"
          data-testid="button-reader-pause"
        >
          <Pause size={18} />
        </button>
      ) : (
        <button
          onClick={handlePlay}
          className="w-10 h-10 rounded-full bg-cedu-blue text-white flex items-center justify-center hover:bg-cedu-blue-dark transition-colors"
          data-testid="button-reader-play"
        >
          <Play size={18} className="ml-0.5" />
        </button>
      )}

      <button
        onClick={handleSkipForward}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-cedu-ink-muted transition-colors"
        data-testid="button-reader-forward"
      >
        <SkipForward size={16} />
      </button>

      <button
        onClick={handleStop}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-400 transition-colors"
        data-testid="button-reader-stop"
      >
        <Square size={16} />
      </button>

      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-cedu-blue rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] text-cedu-ink-muted tabular-nums w-8 text-right">{progress}%</span>
      </div>

      <div className="flex items-center gap-0.5">
        {[0.75, 1, 1.25, 1.5].map((s) => (
          <button
            key={s}
            onClick={() => handleSpeedChange(s)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
              speed === s
                ? "bg-cedu-blue text-white"
                : "text-cedu-ink-muted hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            data-testid={`button-reader-speed-${s}`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}

export function useTextReader() {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  const start = useCallback(() => {
    setActive(true);
    if (!contentRef.current) return;
    const text = contentRef.current.textContent || "";
    const sentences = splitIntoSentences(text);
    if (sentences.length === 0) return;

    setActive(true);
  }, []);

  const toggle = useCallback(() => {
    if (active) {
      speechSynthesis.cancel();
      setActive(false);
      const marks = contentRef.current?.querySelectorAll("[data-reader-highlight]");
      marks?.forEach(m => {
        const parent = m.parentNode;
        if (parent) {
          const text = document.createTextNode(m.textContent || "");
          parent.replaceChild(text, m);
          parent.normalize();
        }
      });
    } else {
      setActive(true);
    }
  }, [active]);

  return { contentRef, active, setActive, toggle };
}
