import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface TimelineEvent {
  id: string;
  eventType: string;
  title: string;
  description?: string;
  metadata: {
    documentId?: string;
    documentName?: string;
    documentHash?: string;
    sharedWith?: string[];
    consentId?: string;
    consentType?: string;
    familyMemberName?: string;
    ipAddress?: string;
    userAgent?: string;
    location?: {
      country?: string;
      city?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
  };
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'general' | 'security' | 'medical' | 'sharing' | 'profile';
  isPublic: boolean;
  tags: string[];
  timestamp: string;
}

export interface TimelineResponse {
  events: Record<string, TimelineEvent[]>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  summary: {
    totalEvents: number;
    eventTypes: string[];
    categories: string[];
    dateRange: {
      start: string | null;
      end: string | null;
    };
  };
}

export interface TimelineStats {
  period: string;
  startDate: string;
  endDate: string;
  summary: {
    totalEvents: number;
    eventTypes: string[];
    categories: string[];
    severities: string[];
    avgEventsPerDay: number;
  };
  eventTypeBreakdown: Array<{
    _id: string;
    count: number;
  }>;
  categoryBreakdown: Array<{
    _id: string;
    count: number;
  }>;
}

export interface TimelineSearchResponse {
  query: string;
  events: TimelineEvent[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

class TimelineService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  async getTimeline(userId: string, params?: {
    eventType?: string;
    category?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<TimelineResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/timeline/${userId}`, {
        headers: this.getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Get timeline error:', error);
      throw new Error('Failed to get timeline');
    }
  }

  async getTimelineStats(userId: string, period?: '7d' | '30d' | '90d'): Promise<TimelineStats> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/timeline/${userId}/stats`, {
        headers: this.getAuthHeaders(),
        params: { period }
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Get timeline stats error:', error);
      throw new Error('Failed to get timeline statistics');
    }
  }

  async searchTimeline(userId: string, query: string, params?: {
    limit?: number;
    offset?: number;
  }): Promise<TimelineSearchResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/timeline/${userId}/search`, {
        headers: this.getAuthHeaders(),
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Search timeline error:', error);
      throw new Error('Failed to search timeline');
    }
  }

  async createEvent(eventData: {
    eventType: string;
    title: string;
    description?: string;
    metadata?: any;
    severity?: 'info' | 'warning' | 'error' | 'critical';
    category?: 'general' | 'security' | 'medical' | 'sharing' | 'profile';
  }): Promise<{ message: string; event: TimelineEvent }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/timeline/events`, eventData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Create timeline event error:', error);
      throw new Error('Failed to create timeline event');
    }
  }

  async getRecentEvents(userId: string, limit: number = 10): Promise<TimelineEvent[]> {
    try {
      const response = await this.getTimeline(userId, { limit });
      // Flatten the grouped events into a single array
      const events: TimelineEvent[] = [];
      Object.values(response.events).forEach(dayEvents => {
        events.push(...dayEvents);
      });
      return events.slice(0, limit);
    } catch (error: unknown) {
      console.error('Get recent events error:', error);
      throw new Error('Failed to get recent events');
    }
  }

  async getEventsByCategory(userId: string, category: string, limit: number = 20): Promise<TimelineEvent[]> {
    try {
      const response = await this.getTimeline(userId, { category, limit });
      const events: TimelineEvent[] = [];
      Object.values(response.events).forEach(dayEvents => {
        events.push(...dayEvents);
      });
      return events;
    } catch (error: unknown) {
      console.error('Get events by category error:', error);
      throw new Error('Failed to get events by category');
    }
  }

  async getSecurityEvents(userId: string, limit: number = 20): Promise<TimelineEvent[]> {
    return this.getEventsByCategory(userId, 'security', limit);
  }

  async getMedicalEvents(userId: string, limit: number = 20): Promise<TimelineEvent[]> {
    return this.getEventsByCategory(userId, 'medical', limit);
  }

  async getSharingEvents(userId: string, limit: number = 20): Promise<TimelineEvent[]> {
    return this.getEventsByCategory(userId, 'sharing', limit);
  }
}

export const timelineService = new TimelineService();
