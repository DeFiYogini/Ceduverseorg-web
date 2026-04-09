const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_BASE_URL = "https://api.heygen.com";

export class LiveAvatarService {
  get isConfigured(): boolean {
    return !!HEYGEN_API_KEY;
  }

  private async safeFetch(url: string, token?: string, options?: RequestInit) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : { "X-Api-Key": HEYGEN_API_KEY || "" }),
    };
    const res = await fetch(url, { ...options, headers: { ...headers, ...options?.headers } });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message || data?.message || `HeyGen Streaming API error (${res.status})`);
    }
    return data;
  }

  async getSessionToken(): Promise<string> {
    const data = await this.safeFetch(`${HEYGEN_BASE_URL}/v1/streaming.create_token`, undefined, {
      method: "POST",
      body: JSON.stringify({}),
    });
    return data.data?.token || data.token;
  }

  async createSession(avatarId: string, voiceId: string, token: string) {
    return this.safeFetch(`${HEYGEN_BASE_URL}/v1/streaming.new`, token, {
      method: "POST",
      body: JSON.stringify({
        version: "v2",
        avatar_id: avatarId,
        voice_id: voiceId,
      }),
    });
  }

  async startSession(sessionId: string, token: string) {
    return this.safeFetch(`${HEYGEN_BASE_URL}/v1/streaming.start`, token, {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId }),
    });
  }

  async sendTextToAvatar(sessionId: string, text: string, token: string) {
    return this.safeFetch(`${HEYGEN_BASE_URL}/v1/streaming.task`, token, {
      method: "POST",
      body: JSON.stringify({
        session_id: sessionId,
        task_type: "repeat",
        text,
      }),
    });
  }

  async interruptAvatar(sessionId: string, token: string) {
    return this.safeFetch(`${HEYGEN_BASE_URL}/v1/streaming.interrupt`, token, {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId }),
    });
  }

  async stopSession(sessionId: string, token: string) {
    return this.safeFetch(`${HEYGEN_BASE_URL}/v1/streaming.stop`, token, {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId }),
    });
  }
}

export const liveAvatarService = new LiveAvatarService();
