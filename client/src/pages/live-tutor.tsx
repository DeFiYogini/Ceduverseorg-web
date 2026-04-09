import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, Mic, MicOff, Video, VideoOff, Loader2, MessageSquare, Clock, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface LiveTutorProps {
  courseId?: string;
  courseTitle?: string;
  instructorId?: string;
  avatarId?: string;
  voiceId?: string;
}

export default function LiveTutor({ courseId, courseTitle, instructorId, avatarId, voiceId }: LiveTutorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingToken, setStreamingToken] = useState<string | null>(null);
  const [heygenSessionId, setHeygenSessionId] = useState<string | null>(null);
  const [isAvatarActive, setIsAvatarActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const effectiveCourseId = courseId || "general";
  const effectiveCourseTitle = courseTitle || "Curso de Capacitación";
  const effectiveInstructorId = instructorId || "00000000-0000-0000-0000-000000000000";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (sessionId && !timerRef.current) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionId]);

  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/liveavatar/session", {
        courseId: effectiveCourseId,
        instructorId: effectiveInstructorId,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setSessionId(data.id);
      setMessages([{
        role: "assistant",
        content: `¡Hola! Soy tu instructor para "${effectiveCourseTitle}". ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre cualquier tema del curso.`,
      }]);
    },
    onError: () => toast({ title: "Error", description: "No se pudo iniciar la sesión", variant: "destructive" }),
  });

  const chatMutation = useMutation({
    mutationFn: async (question: string) => {
      const res = await apiRequest("POST", "/api/liveavatar/chat", {
        sessionId,
        question,
        courseTitle: effectiveCourseTitle,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
      if (isAvatarActive && streamingToken && heygenSessionId) {
        sendTextToAvatar(data.answer);
      }
    },
    onError: () => toast({ title: "Error", description: "No se pudo procesar tu pregunta", variant: "destructive" }),
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) return;
      await apiRequest("POST", "/api/liveavatar/end", { sessionId });
    },
    onSuccess: () => {
      if (timerRef.current) clearInterval(timerRef.current);
      toast({ title: "Sesión finalizada", description: `Duración: ${formatTime(elapsed)}` });
      setSessionId(null);
      setMessages([]);
      setElapsed(0);
      stopAvatar();
    },
  });

  async function startAvatar() {
    try {
      setIsStreaming(true);
      const tokenRes = await apiRequest("POST", "/api/liveavatar/token", {});
      const { token } = await tokenRes.json();
      setStreamingToken(token);

      const aid = avatarId || "default";
      const vid = voiceId || "default";

      const sessionRes = await fetch("https://api.heygen.com/v1/streaming.new", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ version: "v2", avatar_id: aid, voice_id: vid }),
      });
      const sessionData = await sessionRes.json();
      const sid = sessionData.data?.session_id;
      const sdp = sessionData.data?.sdp;
      const iceServers = sessionData.data?.ice_servers2 || [];

      if (!sid || !sdp) throw new Error("No se recibió sesión de streaming");
      setHeygenSessionId(sid);

      const pc = new RTCPeerConnection({ iceServers });
      pcRef.current = pc;

      pc.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await fetch("https://api.heygen.com/v1/streaming.start", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ session_id: sid, sdp: answer }),
      });

      setIsAvatarActive(true);
    } catch (err) {
      console.error("Avatar error:", err);
      toast({ title: "Avatar no disponible", description: "Continuando en modo texto", variant: "destructive" });
    } finally {
      setIsStreaming(false);
    }
  }

  async function sendTextToAvatar(text: string) {
    if (!streamingToken || !heygenSessionId) return;
    try {
      await fetch("https://api.heygen.com/v1/streaming.task", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${streamingToken}` },
        body: JSON.stringify({ session_id: heygenSessionId, task_type: "repeat", text }),
      });
    } catch {}
  }

  async function stopAvatar() {
    if (streamingToken && heygenSessionId) {
      try {
        await fetch("https://api.heygen.com/v1/streaming.stop", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${streamingToken}` },
          body: JSON.stringify({ session_id: heygenSessionId }),
        });
      } catch {}
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setIsAvatarActive(false);
    setHeygenSessionId(null);
    setStreamingToken(null);
  }

  function handleSend() {
    if (!input.trim() || !sessionId) return;
    const question = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: question }]);
    chatMutation.mutate(question);
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#faf8f4]" data-testid="live-tutor-landing">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <button onClick={() => navigate(-1 as any)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="text-center pb-2">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#1b5adf] to-[#7c3aed] flex items-center justify-center">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="font-['DM_Serif_Display'] text-3xl text-gray-900">
                Tutor IA en Vivo
              </CardTitle>
              <p className="text-gray-500 font-['Plus_Jakarta_Sans'] mt-2">
                {effectiveCourseTitle}
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-6 pt-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 rounded-xl bg-blue-50">
                  <MessageSquare className="w-5 h-5 mx-auto mb-1 text-[#1b5adf]" />
                  <p className="font-medium text-gray-700">Chat en vivo</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50">
                  <Video className="w-5 h-5 mx-auto mb-1 text-[#7c3aed]" />
                  <p className="font-medium text-gray-700">Avatar IA</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-50">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-[#f28023]" />
                  <p className="font-medium text-gray-700">Sin límite</p>
                </div>
              </div>
              <Button
                onClick={() => startSessionMutation.mutate()}
                disabled={startSessionMutation.isPending}
                className="w-full h-14 text-lg bg-[#1b5adf] hover:bg-[#1449b8] text-white rounded-xl font-['Plus_Jakarta_Sans']"
                data-testid="button-start-session"
              >
                {startSessionMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Iniciando...</>
                ) : (
                  "Iniciar Sesión con Tutor IA"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f4] flex flex-col" data-testid="live-tutor-session">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1b5adf] to-[#7c3aed] flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-['DM_Serif_Display'] text-lg text-gray-900">Tutor IA en Vivo</h2>
            <p className="text-xs text-gray-500 font-['Plus_Jakarta_Sans']">{effectiveCourseTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-sm" data-testid="text-elapsed-time">
            <Clock className="w-3 h-3 mr-1" /> {formatTime(elapsed)}
          </Badge>
          {!isAvatarActive ? (
            <Button
              variant="outline"
              size="sm"
              onClick={startAvatar}
              disabled={isStreaming}
              className="text-[#7c3aed] border-[#7c3aed]"
              data-testid="button-start-avatar"
            >
              {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
              <span className="ml-1 hidden sm:inline">Avatar</span>
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={stopAvatar} className="text-red-500 border-red-500" data-testid="button-stop-avatar">
              <VideoOff className="w-4 h-4" />
              <span className="ml-1 hidden sm:inline">Detener</span>
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => endSessionMutation.mutate()}
            disabled={endSessionMutation.isPending}
            data-testid="button-end-session"
          >
            Finalizar
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {isAvatarActive && (
          <div className="md:w-1/2 bg-black flex items-center justify-center p-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full max-h-[400px] rounded-xl"
              data-testid="video-avatar"
            />
          </div>
        )}

        <div className={`flex-1 flex flex-col ${isAvatarActive ? "md:w-1/2" : ""}`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                data-testid={`message-${msg.role}-${i}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-['Plus_Jakarta_Sans'] ${
                    msg.role === "user"
                      ? "bg-[#1b5adf] text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Pensando...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="bg-white border-t p-4">
            <div className="flex gap-2 max-w-3xl mx-auto">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Escribe tu pregunta..."
                className="flex-1 rounded-xl border-gray-200 font-['Plus_Jakarta_Sans']"
                disabled={chatMutation.isPending}
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || chatMutation.isPending}
                className="bg-[#1b5adf] hover:bg-[#1449b8] rounded-xl px-4"
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
