export interface AcademyPost {
  ID: number;
  post_title: string;
  post_status: string;
  post_date: string;
  post_author: string;
  post_excerpt: string;
  guid: string;
  [key: string]: any;
}

export interface AcademyCurriculumItem {
  type: "section" | "unit" | "quiz";
  title: string;
  ID?: number;
  unit_type?: string;
  duration?: string;
  index: number;
  [key: string]: any;
}

export interface AcademyCurriculum {
  course_id: number;
  title: string;
  total_items: number;
  curriculum: AcademyCurriculumItem[];
}

export interface AcademyStats {
  site: string;
  timestamp: string;
  courses: { total: number; published: number; draft: number };
  units: { total: number };
  quizzes: { total: number };
  products: { total: number };
  error?: string;
}

export interface AcademyPostsResult {
  posts: AcademyPost[];
  total: number;
  pages: number;
  current_page: number;
}

class AcademyClient {
  private siteUrl: string;
  private jwtToken: string;
  private mcpEndpoint: string;
  private requestId: number = 0;

  constructor() {
    this.siteUrl =
      process.env.ACADEMY_SITE_URL || "https://ceducap.academy";
    this.jwtToken = process.env.ACADEMY_SECRET || "";
    this.mcpEndpoint = `${this.siteUrl.replace(/\/$/, "")}/wp-content/mcp_endpoint.php`;
  }

  isConfigured(): boolean {
    return this.jwtToken.length > 0;
  }

  isTokenExpired(): boolean {
    if (!this.jwtToken) return true;
    try {
      const parts = this.jwtToken.split(".");
      if (parts.length !== 3) return true;
      const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(Buffer.from(b64, "base64").toString());
      if (!payload.exp) return false;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  private async callMcp(method: string, params: any = {}) {
    this.requestId++;

    const payload = {
      jsonrpc: "2.0",
      id: this.requestId,
      method,
      params,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response: Response;
    try {
      response = await fetch(this.mcpEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.jwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === "AbortError") {
        throw new Error("Academy request timed out (15s)");
      }
      throw err;
    }
    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized — verify ACADEMY_SECRET");
      }
      throw new Error(`HTTP error from Academy: ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(`MCP Error: ${JSON.stringify(result.error)}`);
    }

    return result;
  }

  private parseResult(response: any) {
    if (response.result && response.result.length > 0) {
      const textData = response.result[0].text || "{}";
      try {
        return JSON.parse(textData);
      } catch {
        return null;
      }
    }
    return null;
  }

  async getAllCourses(
    options: {
      perPage?: number;
      page?: number;
      status?: string;
      search?: string;
      order?: "ASC" | "DESC";
      categorySlug?: string;
    } = {},
  ): Promise<AcademyPostsResult> {
    const {
      page = 1,
      status = "publish",
      search,
      order = "DESC",
      categorySlug,
    } = options;

    const perPage = Math.min(Math.max(1, options.perPage ?? 10), 100);

    const response = await this.callMcp("tools/call", {
      name: "get_posts",
      arguments: {
        post_type: "course",
        per_page: perPage,
        page,
        status,
        orderby: "date",
        order,
        ...(search ? { search } : {}),
        ...(categorySlug ? { category_name: categorySlug } : {}),
      },
    });

    const data = this.parseResult(response);

    if (!data) {
      return { posts: [], total: 0, pages: 0, current_page: page };
    }

    return {
      posts: (data.posts ?? []) as AcademyPost[],
      total: data.total ?? 0,
      pages: data.pages ?? 0,
      current_page: data.current_page ?? page,
    };
  }

  async getCourseDetails(
    courseId: number,
  ): Promise<AcademyPost | null> {
    const response = await this.callMcp("tools/call", {
      name: "get_post",
      arguments: {
        post_id: courseId,
        include_meta: true,
      },
    });
    return this.parseResult(response);
  }

  async getCourseCurriculum(
    courseId: number,
  ): Promise<AcademyCurriculum | null> {
    const response = await this.callMcp("tools/call", {
      name: "get_course",
      arguments: {
        course_id: courseId,
      },
    });
    return this.parseResult(response);
  }

  async searchCourses(
    searchTerm: string,
    limit: number = 50,
  ): Promise<AcademyPost[]> {
    const response = await this.callMcp("tools/call", {
      name: "get_posts",
      arguments: {
        post_type: "course",
        search: searchTerm,
        per_page: limit,
        status: "publish",
      },
    });
    const data = this.parseResult(response);
    return data?.posts || [];
  }

  async getAllProducts(perPage: number = 100): Promise<AcademyPost[]> {
    const response = await this.callMcp("tools/call", {
      name: "get_posts",
      arguments: {
        post_type: "product",
        per_page: perPage,
        status: "publish",
      },
    });
    const data = this.parseResult(response);
    return data?.posts || [];
  }

  async getSiteStatistics(): Promise<AcademyStats> {
    const stats: AcademyStats = {
      site: this.siteUrl,
      timestamp: new Date().toISOString(),
      courses: { total: 0, published: 0, draft: 0 },
      units: { total: 0 },
      quizzes: { total: 0 },
      products: { total: 0 },
    };

    try {
      const courses = await this.getAllCourses({
        perPage: 100,
        status: "any",
      });
      stats.courses.total = courses.total;
      stats.courses.published = courses.posts.filter(
        (c) => c.post_status === "publish",
      ).length;
      stats.courses.draft = stats.courses.total - stats.courses.published;
    } catch (e: any) {
      stats.error = e.message;
    }

    return stats;
  }
}

export const academyClient = new AcademyClient();
