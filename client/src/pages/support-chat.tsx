import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useParams, Link, useLocation, useSearch } from "wouter";
import { useForceLightMode } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft,
  Send,
  MessageCircle,
  Plus,
  Clock,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import type { SupportThread, SupportMessage } from "@shared/schema";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days}d`;
}

function ThreadListView() {
  useForceLightMode();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const courseId = params.get("courseId");
  const courseName = params.get("courseName");

  const [showNew, setShowNew] = useState(!!courseId);
  const [subject, setSubject] = useState(
    courseName ? `Información sobre: ${courseName}` : ""
  );
  const [message, setMessage] = useState(
    courseName
      ? `Hola, me interesa obtener más información sobre el curso "${courseName}". ¿Podrían orientarme sobre las opciones de inscripción, certificación y costos?`
      : ""
  );

  const { data: threads, isLoading } = useQuery<SupportThread[]>({
    queryKey: ["/api/support/threads"],
  });

  const createThread = useMutation({
    mutationFn: async (data: { subject: string; message: string; academyCourseId?: number }) => {
      const res = await apiRequest("POST", "/api/support/threads", data);
      return res.json();
    },
    onSuccess: (thread: SupportThread) => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/threads"] });
      navigate(`/mensajes/${thread.id}`);
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-cedu-cream flex items-center justify-center">
        <Card className="max-w-sm mx-4">
          <CardContent className="py-8 text-center">
            <MessageCircle size={40} className="mx-auto text-cedu-blue mb-4" />
            <h2 className="font-serif text-lg text-cedu-ink mb-2">Inicia sesión</h2>
            <p className="text-sm text-cedu-ink-muted mb-4">Para contactar a un gestor académico necesitas una cuenta.</p>
            <Link href="/auth">
              <Button className="bg-cedu-blue text-white" data-testid="button-login-chat">
                Iniciar sesión
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cedu-cream" data-testid="page-support-threads">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/[0.06] h-14 flex items-center px-4 gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="text-cedu-ink-muted" data-testid="button-back">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-cedu-ink">Mis mensajes</p>
          <p className="text-[11px] text-cedu-ink-muted">Gestor Académico</p>
        </div>
        <Button
          size="sm"
          className="bg-cedu-blue text-white gap-1.5 h-8 text-xs"
          onClick={() => setShowNew(true)}
          data-testid="button-new-thread"
        >
          <Plus size={14} /> Nueva consulta
        </Button>
      </nav>

      <div className="pt-14 max-w-2xl mx-auto px-4 py-6">
        {showNew && (
          <Card className="border-cedu-blue/20 mb-6">
            <CardContent className="py-5">
              <h3 className="font-serif text-base text-cedu-ink mb-4 flex items-center gap-2">
                <MessageCircle size={18} className="text-cedu-blue" />
                Nueva consulta
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-cedu-ink-muted block mb-1">Asunto</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Ej: Información sobre curso de seguridad industrial"
                    className="w-full px-3 py-2 rounded-lg border border-black/[0.08] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cedu-blue/30 text-cedu-ink"
                    data-testid="input-thread-subject"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-cedu-ink-muted block mb-1">Mensaje</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Escribe tu mensaje aquí..."
                    className="w-full px-3 py-2 rounded-lg border border-black/[0.08] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cedu-blue/30 resize-none text-cedu-ink"
                    data-testid="input-thread-message"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setShowNew(false); setSubject(""); setMessage(""); }}
                    data-testid="button-cancel-thread"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    className="bg-cedu-blue text-white gap-1.5"
                    disabled={!subject.trim() || !message.trim() || createThread.isPending}
                    onClick={() => createThread.mutate({
                      subject: subject.trim(),
                      message: message.trim(),
                      academyCourseId: courseId ? parseInt(courseId) : undefined,
                    })}
                    data-testid="button-send-thread"
                  >
                    <Send size={14} /> {createThread.isPending ? "Enviando..." : "Enviar"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : !threads || threads.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle size={48} className="mx-auto text-cedu-ink-muted/30 mb-4" />
            <h3 className="font-serif text-lg text-cedu-ink mb-2">Sin mensajes aún</h3>
            <p className="text-sm text-cedu-ink-muted mb-4">
              Envía una consulta y un gestor académico te responderá pronto.
            </p>
            {!showNew && (
              <Button
                className="bg-cedu-blue text-white gap-1.5"
                onClick={() => setShowNew(true)}
                data-testid="button-start-first-thread"
              >
                <Plus size={14} /> Escribir primera consulta
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {threads.map(thread => (
              <Link key={thread.id} href={`/mensajes/${thread.id}`}>
                <Card
                  className="border-black/[0.06] cursor-pointer hover:border-cedu-blue/20 transition-colors"
                  data-testid={`thread-${thread.id}`}
                >
                  <CardContent className="py-3.5 px-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-cedu-ink truncate">{thread.subject}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] ${thread.status === "open"
                              ? "bg-cedu-green/10 text-cedu-green border-0"
                              : "bg-gray-100 text-gray-500 border-0"
                            }`}
                          >
                            {thread.status === "open" ? "Abierto" : "Cerrado"}
                          </Badge>
                          <span className="text-[11px] text-cedu-ink-muted flex items-center gap-1">
                            <Clock size={10} /> {timeAgo(String(thread.updatedAt || thread.createdAt))}
                          </span>
                        </div>
                      </div>
                      <ArrowLeft size={16} className="text-cedu-ink-muted rotate-180 flex-shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ThreadDetailView() {
  useForceLightMode();
  const { user } = useAuth();
  const params = useParams<{ threadId: string }>();
  const threadId = params.threadId!;
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data, isLoading } = useQuery<{ thread: SupportThread; messages: SupportMessage[] }>({
    queryKey: ["/api/support/threads", threadId],
    refetchInterval: 10000,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/support/threads/${threadId}/messages`, { content });
      return res.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/support/threads", threadId] });
      queryClient.invalidateQueries({ queryKey: ["/api/support/threads"] });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data?.messages]);

  const handleSend = () => {
    const trimmed = newMessage.trim();
    if (!trimmed || sendMessage.isPending) return;
    sendMessage.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cedu-cream">
        <div className="h-14 bg-white border-b border-black/[0.06]" />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-24 rounded-xl mb-3" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  const thread = data?.thread;
  const messages = data?.messages || [];

  return (
    <div className="min-h-screen bg-cedu-cream flex flex-col" data-testid="page-support-thread-detail">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/[0.06] h-14 flex items-center px-4 gap-3">
        <Link href="/mensajes">
          <Button variant="ghost" size="sm" className="text-cedu-ink-muted" data-testid="button-back-threads">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-cedu-ink truncate">{thread?.subject || "Conversación"}</p>
          <p className="text-[11px] text-cedu-ink-muted">Gestor Académico</p>
        </div>
        {thread?.status === "open" && (
          <Badge variant="secondary" className="text-[10px] bg-cedu-green/10 text-cedu-green border-0">
            Abierto
          </Badge>
        )}
      </nav>

      <div className="pt-14 pb-20 flex-1 overflow-hidden flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl mx-auto w-full">
          <div className="bg-cedu-blue/5 rounded-xl p-4 mb-4 text-center">
            <GraduationCap size={24} className="mx-auto text-cedu-blue mb-2" />
            <p className="text-xs text-cedu-ink-muted leading-relaxed">
              Un gestor académico revisará tu mensaje y te responderá a la brevedad.
              <br />El horario de atención es de lunes a viernes, 9:00 a 18:00 hrs (CST).
            </p>
          </div>

          <div className="space-y-3">
            {messages.map(msg => {
              const isUser = msg.senderRole === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  data-testid={`message-${msg.id}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      isUser
                        ? "bg-cedu-blue text-white rounded-br-md"
                        : "bg-white border border-black/[0.06] text-cedu-ink rounded-bl-md"
                    }`}
                  >
                    {!isUser && (
                      <p className="text-[10px] font-semibold text-cedu-blue mb-1">Gestor Académico</p>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isUser ? "text-white/60" : "text-cedu-ink-muted"}`}>
                      {new Date(msg.createdAt).toLocaleString("es-MX", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {thread?.status === "open" && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/[0.06] px-4 py-3">
            <div className="max-w-2xl mx-auto flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-3 py-2 rounded-xl border border-black/[0.08] text-sm bg-cedu-cream/50 focus:outline-none focus:ring-2 focus:ring-cedu-blue/30 resize-none text-cedu-ink"
                style={{ maxHeight: "100px" }}
                data-testid="input-message"
              />
              <Button
                size="sm"
                className="bg-cedu-blue text-white h-9 w-9 p-0 rounded-xl"
                disabled={!newMessage.trim() || sendMessage.isPending}
                onClick={handleSend}
                data-testid="button-send-message"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        )}

        {thread?.status === "closed" && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-black/[0.06] px-4 py-3">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-xs text-cedu-ink-muted flex items-center justify-center gap-1">
                <CheckCircle2 size={12} /> Esta conversación ha sido cerrada
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { ThreadListView, ThreadDetailView };
