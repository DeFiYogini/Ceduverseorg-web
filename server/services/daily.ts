const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = "https://api.daily.co/v1";

export class DailyService {
  private get headers() {
    return {
      Authorization: `Bearer ${DAILY_API_KEY || ""}`,
      "Content-Type": "application/json",
    };
  }

  get isConfigured(): boolean {
    return !!DAILY_API_KEY;
  }

  private async safeFetch(url: string, options?: RequestInit) {
    const res = await fetch(url, { ...options, headers: { ...this.headers, ...options?.headers } });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || data?.info || `Daily.co API error (${res.status})`);
    }
    return data;
  }

  async createRoom(options: {
    name?: string;
    expiresInSeconds?: number;
    maxParticipants?: number;
    isPrivate?: boolean;
  } = {}): Promise<{ name: string; url: string; id: string }> {
    const roomName = options.name || `ceduverse-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const data = await this.safeFetch(`${DAILY_API_URL}/rooms`, {
      method: "POST",
      body: JSON.stringify({
        name: roomName,
        privacy: options.isPrivate ? "private" : "public",
        properties: {
          exp: Math.floor(Date.now() / 1000) + (options.expiresInSeconds || 86400),
          max_participants: options.maxParticipants || 25,
          enable_chat: true,
          enable_screenshare: true,
          enable_recording: false,
          start_audio_off: false,
          start_video_off: false,
          lang: "es",
        },
      }),
    });

    return { name: data.name, url: data.url, id: data.id };
  }

  async createMeetingToken(options: {
    roomName: string;
    userName: string;
    isOwner?: boolean;
    expiresInSeconds?: number;
  }): Promise<string> {
    const data = await this.safeFetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: "POST",
      body: JSON.stringify({
        properties: {
          room_name: options.roomName,
          user_name: options.userName,
          is_owner: options.isOwner || false,
          exp: Math.floor(Date.now() / 1000) + (options.expiresInSeconds || 86400),
        },
      }),
    });
    return data.token;
  }

  async deleteRoom(roomName: string): Promise<void> {
    await this.safeFetch(`${DAILY_API_URL}/rooms/${roomName}`, { method: "DELETE" });
  }

  async getMeetingData(roomName: string) {
    return this.safeFetch(`${DAILY_API_URL}/meetings?room=${roomName}`);
  }
}

export const dailyService = new DailyService();
