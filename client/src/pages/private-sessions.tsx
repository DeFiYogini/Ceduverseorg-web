import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar, Clock, Users, DollarSign, Video,
  Star, ArrowLeft, Loader2, MapPin, BookOpen,
  CheckCircle, XCircle, Play
} from "lucide-react";
import { useLocation } from "wouter";

function SessionCard({ session, isInstructor, onJoin, onCancel, onEnd }: any) {
  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-[#1b5adf]",
    in_progress: "bg-green-100 text-[#00b87a]",
    completed: "bg-gray-100 text-gray-600",
    cancelled: "bg-red-100 text-red-600",
  };
  const statusLabels: Record<string, string> = {
    scheduled: "Programada",
    in_progress: "En curso",
    completed: "Completada",
    cancelled: "Cancelada",
    pending: "Pendiente",
  };

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow" data-testid={`card-session-${session.id}`}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-['DM_Serif_Display'] text-lg text-gray-900">{session.title || "Sesión Privada"}</h3>
            {session.instructorName && (
              <p className="text-sm text-gray-500 font-['Plus_Jakarta_Sans']">con {session.instructorName}</p>
            )}
          </div>
          <Badge className={statusColors[session.sessionStatus] || "bg-gray-100 text-gray-600"}>
            {statusLabels[session.sessionStatus] || session.sessionStatus}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-600 font-['Plus_Jakarta_Sans']">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#1b5adf]" />
            {session.scheduledDate}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#7c3aed]" />
            {session.startTime} - {session.endTime}
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00b87a]" />
            {session.enrolledCount !== undefined ? `${session.enrolledCount}/${session.maxStudents}` : `Máx. ${session.maxStudents}`}
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#f28023]" />
            ${Number(session.priceMxn).toLocaleString()} MXN
          </div>
        </div>

        {session.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{session.description}</p>
        )}

        <div className="flex gap-2">
          {session.sessionStatus === "scheduled" && (
            <>
              <Button
                onClick={() => onJoin(session.id)}
                className="flex-1 bg-[#1b5adf] hover:bg-[#1449b8] text-white rounded-xl"
                data-testid={`button-join-session-${session.id}`}
              >
                <Play className="w-4 h-4 mr-1" /> Unirse
              </Button>
              {isInstructor && (
                <Button
                  variant="outline"
                  onClick={() => onCancel(session.id)}
                  className="text-red-500 border-red-300 rounded-xl"
                  data-testid={`button-cancel-session-${session.id}`}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              )}
            </>
          )}
          {session.sessionStatus === "in_progress" && isInstructor && (
            <Button
              onClick={() => onEnd(session.id)}
              variant="destructive"
              className="flex-1 rounded-xl"
              data-testid={`button-end-session-${session.id}`}
            >
              Finalizar Sesión
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SessionRoom({ sessionId, onLeave }: { sessionId: string; onLeave: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [roomData, setRoomData] = useState<{ roomUrl: string; token: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function joinRoom() {
      try {
        const res = await apiRequest("GET", `/api/private-sessions/${sessionId}/join`);
        const data = await res.json();
        setRoomData(data);
      } catch (err: any) {
        setError(err.message || "No se pudo unir a la sesión");
      } finally {
        setLoading(false);
      }
    }
    joinRoom();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#faf8f4]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#1b5adf] mx-auto mb-4" />
          <p className="font-['Plus_Jakarta_Sans'] text-gray-600">Conectando a la sala...</p>
        </div>
      </div>
    );
  }

  if (error || !roomData) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#faf8f4]">
        <Card className="max-w-md w-full border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-['DM_Serif_Display'] text-xl mb-2">Error al conectar</h3>
            <p className="text-gray-500 font-['Plus_Jakarta_Sans'] mb-4">{error}</p>
            <Button onClick={onLeave} className="bg-[#1b5adf] hover:bg-[#1449b8] rounded-xl" data-testid="button-leave-room">
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dailyUrl = `${roomData.roomUrl}?t=${roomData.token}`;

  return (
    <div className="h-screen flex flex-col bg-black" data-testid="session-room">
      <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Video className="w-4 h-4 text-[#00b87a]" />
          <span className="text-sm font-['Plus_Jakarta_Sans']">Sesión en vivo — {roomData.role === "instructor" ? "Instructor" : "Estudiante"}</span>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={onLeave}
          data-testid="button-leave-session"
        >
          Salir
        </Button>
      </div>
      <iframe
        ref={iframeRef}
        src={dailyUrl}
        allow="camera; microphone; fullscreen; display-capture"
        className="flex-1 w-full border-0"
        data-testid="iframe-daily-room"
      />
    </div>
  );
}

export default function PrivateSessionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("available");

  const { data: userAcct } = useQuery<{ userRole: string; isInstructor: boolean }>({
    queryKey: ["/api/account"],
    enabled: !!user,
  });

  const isInstructor = userAcct?.isInstructor === true || userAcct?.userRole === "socio_instructor";

  const { data: mySessions = [], isLoading: loadingMy } = useQuery<any[]>({
    queryKey: ["/api/private-sessions"],
    enabled: !!user,
  });

  const { data: availableSessions = [], isLoading: loadingAvail } = useQuery<any[]>({
    queryKey: ["/api/private-sessions/available"],
    enabled: !!user,
  });

  const bookMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await apiRequest("POST", `/api/private-sessions/${sessionId}/book`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "¡Inscrito!", description: "Te has inscrito exitosamente a la sesión" });
      queryClient.invalidateQueries({ queryKey: ["/api/private-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/private-sessions/available"] });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const cancelMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await apiRequest("POST", `/api/private-sessions/${sessionId}/cancel`);
    },
    onSuccess: () => {
      toast({ title: "Sesión cancelada" });
      queryClient.invalidateQueries({ queryKey: ["/api/private-sessions"] });
    },
    onError: () => toast({ title: "Error al cancelar", variant: "destructive" }),
  });

  const endMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await apiRequest("POST", `/api/private-sessions/${sessionId}/end`);
    },
    onSuccess: () => {
      toast({ title: "Sesión finalizada" });
      queryClient.invalidateQueries({ queryKey: ["/api/private-sessions"] });
    },
    onError: () => toast({ title: "Error al finalizar", variant: "destructive" }),
  });

  if (activeRoom) {
    return <SessionRoom sessionId={activeRoom} onLeave={() => setActiveRoom(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#faf8f4]" data-testid="private-sessions-page">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-['Plus_Jakarta_Sans']" data-testid="button-back-dashboard">
          <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-['DM_Serif_Display'] text-3xl text-gray-900">Sesiones Privadas</h1>
            <p className="text-gray-500 font-['Plus_Jakarta_Sans'] mt-1">Clases en vivo con instructores certificados</p>
          </div>
          {isInstructor && (
            <Button
              onClick={() => navigate("/instructor")}
              className="bg-[#1b5adf] hover:bg-[#1449b8] text-white rounded-xl"
              data-testid="button-manage-sessions"
            >
              <BookOpen className="w-4 h-4 mr-2" /> Gestionar Sesiones
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white border">
            <TabsTrigger value="available" className="data-[state=active]:bg-[#1b5adf] data-[state=active]:text-white" data-testid="tab-available">
              Disponibles
            </TabsTrigger>
            <TabsTrigger value="my-sessions" className="data-[state=active]:bg-[#1b5adf] data-[state=active]:text-white" data-testid="tab-my-sessions">
              Mis Sesiones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            {loadingAvail ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#1b5adf]" />
              </div>
            ) : availableSessions.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-['DM_Serif_Display'] text-xl text-gray-700 mb-2">No hay sesiones disponibles</h3>
                  <p className="text-gray-500 font-['Plus_Jakarta_Sans']">Próximamente habrá nuevas sesiones programadas</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableSessions.map((s: any) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    isInstructor={false}
                    onJoin={(id: string) => bookMutation.mutate(id)}
                    onCancel={() => {}}
                    onEnd={() => {}}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-sessions">
            {loadingMy ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#1b5adf]" />
              </div>
            ) : mySessions.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-['DM_Serif_Display'] text-xl text-gray-700 mb-2">Sin sesiones aún</h3>
                  <p className="text-gray-500 font-['Plus_Jakarta_Sans']">Inscríbete a una sesión disponible para comenzar</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mySessions.map((s: any) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    isInstructor={isInstructor}
                    onJoin={(id: string) => setActiveRoom(id)}
                    onCancel={(id: string) => cancelMutation.mutate(id)}
                    onEnd={(id: string) => endMutation.mutate(id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
