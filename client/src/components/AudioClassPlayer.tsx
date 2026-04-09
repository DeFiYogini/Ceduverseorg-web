import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Pause, Volume2, VolumeX, Mic, Loader2, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { apiRequest } from "@/lib/queryClient";

interface AudioClassPlayerProps {
  courseSlug: string;
  moduleIndex: number;
  classScript?: string;
  moduleTitle?: string;
}

interface SectionMarker {
  label: string;
  position: number;
}

function extractSectionMarkers(script: string): SectionMarker[] {
  const markers: SectionMarker[] = [];
  const totalLen = script.length;
  const patterns = [
    { regex: /\[INTRO\]/g, label: "Intro" },
    { regex: /\[CONCEPTO:([^\]]*)\]/g, label: "" },
    { regex: /\[EJEMPLO\]/g, label: "Ejemplo" },
    { regex: /\[CLAVE\]/g, label: "Clave" },
    { regex: /\[INTERACCION\]/g, label: "Interacción" },
    { regex: /\[CIERRE\]/g, label: "Cierre" },
  ];

  for (const p of patterns) {
    let match;
    while ((match = p.regex.exec(script)) !== null) {
      const label = p.label || match[1] || "Sección";
      markers.push({ label, position: match.index / totalLen });
    }
  }

  markers.sort((a, b) => a.position - b.position);
  return markers;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioClassPlayer({ courseSlug, moduleIndex, classScript, moduleTitle }: AudioClassPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pollInterval, setPollInterval] = useState<number | false>(false);

  const { data: audioData, refetch } = useQuery<{
    status: string;
    audioUrl?: string;
    duration?: number;
    estimatedSeconds?: number;
    message?: string;
  }>({
    queryKey: ["/api/studio/courses", courseSlug, "modules", moduleIndex, "audio"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/studio/courses/${courseSlug}/modules/${moduleIndex}/audio`);
        return res.json();
      } catch {
        return { status: "pending" };
      }
    },
    enabled: !!courseSlug,
    refetchInterval: pollInterval,
  });

  useEffect(() => {
    if (audioData?.status === "generating") {
      setPollInterval(5000);
    } else {
      setPollInterval(false);
    }
  }, [audioData?.status]);

  const markers = useMemo(() => {
    if (!classScript) return [];
    return extractSectionMarkers(classScript);
  }, [classScript]);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration);
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const v = value[0];
    audio.volume = v;
    setVolume(v);
    setIsMuted(v === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = newSpeed;
    setSpeed(newSpeed);
  }, []);

  const handleMarkerClick = useCallback((position: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const time = position * duration;
    audio.currentTime = time;
    setCurrentTime(time);
  }, [duration]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const [isRegeneratingAudio, setIsRegeneratingAudio] = useState(false);

  const handleGenerateAudio = useCallback(async () => {
    try {
      await apiRequest("GET", `/api/studio/courses/${courseSlug}/modules/${moduleIndex}/audio`);
    } catch {}
    refetch();
  }, [courseSlug, moduleIndex, refetch]);

  const handleRegenerateAudio = useCallback(async () => {
    setIsRegeneratingAudio(true);
    try {
      const audio = audioRef.current;
      if (audio) { audio.pause(); setIsPlaying(false); }
      await apiRequest("POST", `/api/studio/courses/${courseSlug}/modules/${moduleIndex}/audio/regenerate`);
      refetch();
    } finally {
      setIsRegeneratingAudio(false);
    }
  }, [courseSlug, moduleIndex, refetch]);

  if (!audioData || audioData.status === "no_script") {
    return null;
  }

  if (audioData.status === "unavailable") {
    return null;
  }

  if (audioData.status === "generating") {
    return (
      <div data-testid="audio-player-generating" className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Preparando tu clase en audio...</p>
            <p className="text-blue-600 dark:text-blue-400 text-xs mt-0.5">Esto puede tomar unos 30 segundos</p>
          </div>
        </div>
      </div>
    );
  }

  if (audioData.status === "pending" || (audioData.status !== "ready" && !audioData.audioUrl)) {
    return (
      <div data-testid="audio-player-generate" className="bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-950/30 dark:to-violet-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Mic className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Clase en Audio</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Escucha este módulo como una clase real</p>
            </div>
          </div>
          <Button
            onClick={handleGenerateAudio}
            size="sm"
            data-testid="button-generate-audio"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
          >
            <Mic className="h-4 w-4 mr-1.5" />
            Generar Audio
          </Button>
        </div>
      </div>
    );
  }

  const speeds = [0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div data-testid="audio-player" className="bg-gradient-to-r from-blue-50/80 to-violet-50/80 dark:from-blue-950/30 dark:to-violet-950/30 border border-blue-200/60 dark:border-blue-800/60 rounded-2xl mb-4 overflow-hidden transition-all">
      <audio
        ref={audioRef}
        src={audioData.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Mic className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight">
                {moduleTitle || "Clase en Audio"}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-[11px]">Audio inmersivo</p>
            </div>
          </div>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">{speed}x</span>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={handlePlayPause}
            data-testid="button-play-pause"
            className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-sm"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>

          <div className="flex-1 flex items-center gap-2">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 tabular-nums w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 1}
              step={0.1}
              onValueChange={handleSeek}
              className="flex-1"
              data-testid="slider-seek"
            />
            <span className="text-[11px] text-gray-500 dark:text-gray-400 tabular-nums w-10">
              {formatTime(duration || audioData.duration || 0)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                data-testid={`button-speed-${s}`}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  speed === s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1"
            data-testid="button-expand-audio-options"
          >
            Más {isCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>
        </div>

        {!isCollapsed && (
          <div className="space-y-3 mt-3">
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRegenerateAudio}
                  disabled={isRegeneratingAudio}
                  title="Regenerar audio con voz mejorada"
                  data-testid="button-regenerate-audio"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isRegeneratingAudio ? "animate-spin" : ""}`} />
                  Regenerar
                </button>
                <div className="flex items-center gap-2 w-28">
                  <button onClick={toggleMute} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.05}
                    onValueChange={handleVolumeChange}
                    className="flex-1"
                    data-testid="slider-volume"
                  />
                </div>
              </div>
            </div>

            {markers.length > 0 && (
              <div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-1.5">Secciones</p>
                <div className="flex flex-wrap gap-1.5">
                  {markers.map((m, i) => (
                    <button
                      key={i}
                      onClick={() => handleMarkerClick(m.position)}
                      data-testid={`button-section-${i}`}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
