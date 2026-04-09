const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_BASE_URL = "https://api.heygen.com";

export class HeyGenService {
  private get headers() {
    return {
      "X-Api-Key": HEYGEN_API_KEY || "",
      "Content-Type": "application/json",
    };
  }

  get isConfigured(): boolean {
    return !!HEYGEN_API_KEY;
  }

  private async safeFetch(url: string, options?: RequestInit) {
    const method = options?.method || "GET";
    console.log(`[HeyGen] ${method} ${url}`, options?.body ? `Body: ${options.body}` : "");
    const res = await fetch(url, { ...options, headers: { ...this.headers, ...options?.headers } });
    const data = await res.json();
    console.log(`[HeyGen] Response ${res.status} from ${method} ${url}:`, JSON.stringify(data));
    if (!res.ok) {
      const msg = data?.error?.message || data?.message || `HeyGen API error (${res.status})`;
      throw new Error(msg);
    }
    return data;
  }

  async listAvatars() {
    return this.safeFetch(`${HEYGEN_BASE_URL}/v2/avatars`);
  }

  async listVoices() {
    return this.safeFetch(`${HEYGEN_BASE_URL}/v2/voices`);
  }

  async generateAvatarVideo(
    avatarId: string,
    voiceId: string,
    scriptText: string,
    title: string = "Ceduverse Module",
    preferences?: {
      avatarStyle?: "normal" | "circle" | "closeUp";
      backgroundType?: "color" | "image";
      backgroundColor?: string;
      backgroundImageUrl?: string;
      voiceSpeed?: number;
      orientation?: "landscape" | "portrait" | "square";
    }
  ) {
    const styleMap: Record<string, string> = { normal: "normal", circle: "circle", closeUp: "closeUp" };
    const avatarStyle = styleMap[preferences?.avatarStyle || "normal"] || "normal";
    const speed = Math.min(2.0, Math.max(0.5, preferences?.voiceSpeed ?? 1.0));

    let background: { type: string; value?: string; url?: string } = { type: "color", value: preferences?.backgroundColor || "#1b5adf" };
    if (preferences?.backgroundType === "image" && preferences?.backgroundImageUrl) {
      background = { type: "image", url: preferences.backgroundImageUrl };
    }

    let dimension = { width: 1920, height: 1080 };
    if (preferences?.orientation === "portrait") dimension = { width: 1080, height: 1920 };
    else if (preferences?.orientation === "square") dimension = { width: 1080, height: 1080 };

    return this.safeFetch(`${HEYGEN_BASE_URL}/v2/video/generate`, {
      method: "POST",
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: avatarId,
              avatar_style: avatarStyle,
            },
            voice: {
              type: "text",
              input_text: scriptText,
              voice_id: voiceId,
              speed,
            },
            background,
          },
        ],
        dimension,
        title,
      }),
    });
  }

  async getVideoStatus(videoId: string) {
    return this.safeFetch(`${HEYGEN_BASE_URL}/v1/video_status.get?video_id=${videoId}`);
  }

  async registerWebhook(callbackUrl: string) {
    return this.safeFetch(`${HEYGEN_BASE_URL}/v1/webhook/endpoint.add`, {
      method: "POST",
      body: JSON.stringify({
        url: callbackUrl,
        events: ["avatar_video.success", "avatar_video.fail"],
      }),
    });
  }

  async createDigitalTwin(
    trainingVideoUrl: string,
    consentVideoUrl: string,
    avatarName: string
  ): Promise<{ avatar_id: string; request_id: string }> {
    const data = await this.safeFetch(`${HEYGEN_BASE_URL}/v2/avatars`, {
      method: "POST",
      body: JSON.stringify({
        training_footage_url: trainingVideoUrl,
        video_consent_url: consentVideoUrl,
        avatar_name: avatarName,
      }),
    });
    return {
      avatar_id: data.data?.avatar_id || data.avatar_id || "",
      request_id: data.data?.request_id || data.request_id || "",
    };
  }

  async checkDigitalTwinStatus(avatarId: string): Promise<{
    status: string;
    avatar_id: string;
    error?: string;
  }> {
    const data = await this.safeFetch(`${HEYGEN_BASE_URL}/v2/avatars/${avatarId}`);
    return {
      status: data.data?.status || data.status || "unknown",
      avatar_id: avatarId,
      error: data.data?.error || data.error,
    };
  }

  async cloneVoice(
    audioUrl: string,
    voiceName: string
  ): Promise<{ voice_id: string }> {
    const data = await this.safeFetch(`${HEYGEN_BASE_URL}/v2/voices/clone`, {
      method: "POST",
      body: JSON.stringify({
        audio_url: audioUrl,
        voice_name: voiceName,
      }),
    });
    return { voice_id: data.data?.voice_id || data.voice_id || "" };
  }

  async deleteDigitalTwin(avatarId: string): Promise<void> {
    await this.safeFetch(`${HEYGEN_BASE_URL}/v2/avatars/${avatarId}`, {
      method: "DELETE",
    });
  }
}

export const heygenService = new HeyGenService();
