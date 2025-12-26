/**
 * API Service for Hacklyn Backend
 * Handles all HTTP requests to the Django REST API
 * Simplified for Devfolio-style architecture
 */

const API_BASE_URL = 'http://localhost:8000/api';
const OAUTH_BASE_URL = 'http://localhost:8000';

// Token management
const getAccessToken = (): string | null => localStorage.getItem('accessToken');
const getRefreshToken = (): string | null => localStorage.getItem('refreshToken');
const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('isAuthenticated');
};

// Generic fetch wrapper with auth
async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  // Handle 401 - try to refresh token
  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry the request with new token
      (headers as Record<string, string>)['Authorization'] = `Bearer ${getAccessToken()}`;
      return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    }
  }
  
  return response;
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const refresh = getRefreshToken();
    if (!refresh) return false;
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    
    if (response.ok) {
      const data = await response.json();
      setTokens(data.access, data.refresh || refresh);
      return true;
    }
    
    clearTokens();
    return false;
  } catch {
    clearTokens();
    return false;
  }
}

// ==================== Auth API ====================

export const authAPI = {
  async register(data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      setTokens(result.tokens.access, result.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('isAuthenticated', 'true');
    }
    
    return { ok: response.ok, data: result };
  },
  
  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      setTokens(result.tokens.access, result.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('isAuthenticated', 'true');
    }
    
    return { ok: response.ok, data: result };
  },
  
  // OAuth URLs
  getGoogleLoginUrl() {
    return `${OAUTH_BASE_URL}/accounts/google/login/`;
  },
  
  getGithubLoginUrl() {
    return `${OAUTH_BASE_URL}/accounts/github/login/`;
  },
  
  async handleOAuthCallback() {
    // After OAuth redirect, get JWT tokens
    const response = await fetch(`${API_BASE_URL}/auth/oauth/callback/`, {
      credentials: 'include',
    });
    
    if (response.ok) {
      const result = await response.json();
      setTokens(result.tokens.access, result.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('isAuthenticated', 'true');
      return { ok: true, data: result };
    }
    
    return { ok: false, data: await response.json() };
  },
  
  async logout() {
    clearTokens();
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  },
  
  async getMe() {
    const response = await fetchWithAuth('/auth/me/');
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to get user');
  },
  
  isAuthenticated() {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    const hasToken = !!getAccessToken() || !!getRefreshToken();
    return isAuth && hasToken;
  },
  
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// ==================== Profile API ====================

export const profileAPI = {
  async get() {
    const response = await fetchWithAuth('/profile/');
    if (!response.ok) throw new Error('Failed to get profile');
    return await response.json();
  },
  
  async update(data: any) {
    const response = await fetchWithAuth('/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return await response.json();
  },
  
  async getPublic(username: string) {
    const response = await fetch(`${API_BASE_URL}/profile/${username}/`);
    if (!response.ok) throw new Error('Failed to get profile');
    return await response.json();
  },
  
  // Education
  async getEducation() {
    const response = await fetchWithAuth('/profile/education/');
    if (!response.ok) throw new Error('Failed to get education');
    return await response.json();
  },
  
  async addEducation(data: any) {
    const response = await fetchWithAuth('/profile/education/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add education');
    return await response.json();
  },
  
  // Work Experience
  async getExperience() {
    const response = await fetchWithAuth('/profile/experience/');
    if (!response.ok) throw new Error('Failed to get experience');
    return await response.json();
  },
  
  async addExperience(data: any) {
    const response = await fetchWithAuth('/profile/experience/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add experience');
    return await response.json();
  },
  
  // Projects
  async getProjects() {
    const response = await fetchWithAuth('/profile/projects/');
    if (!response.ok) throw new Error('Failed to get projects');
    return await response.json();
  },
  
  async addProject(data: any) {
    const response = await fetchWithAuth('/profile/projects/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add project');
    return await response.json();
  },
};

// ==================== Events API ====================

export interface EventFilters {
  search?: string;
  mode?: 'online' | 'offline' | 'hybrid';
  city?: string;
  status?: string;
  page?: number;
}

export const eventsAPI = {
  async list(filters: EventFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
    
    const response = await fetch(`${API_BASE_URL}/events/?${params}`);
    if (!response.ok) throw new Error('Failed to get events');
    return await response.json();
  },
  
  async featured() {
    const response = await fetch(`${API_BASE_URL}/events/featured/`);
    if (!response.ok) throw new Error('Failed to get featured events');
    return await response.json();
  },
  
  async get(id: string | number) {
    const response = await fetchWithAuth(`/events/${id}/`);
    if (!response.ok) throw new Error('Failed to get event');
    return await response.json();
  },
  
  async create(data: any) {
    const response = await fetchWithAuth('/events/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create event');
    return await response.json();
  },
  
  async update(id: string | number, data: any) {
    const response = await fetchWithAuth(`/events/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update event');
    return await response.json();
  },
  
  async delete(id: string | number) {
    const response = await fetchWithAuth(`/events/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete event');
    return { message: 'Event deleted' };
  },
  
  // My organized events
  async myEvents() {
    const response = await fetchWithAuth('/events/my/');
    if (!response.ok) throw new Error('Failed to get my events');
    return await response.json();
  },
  
  // Apply to event
  async apply(eventId: string | number, data: { team_name?: string; role?: string; motivation?: string } = {}) {
    const response = await fetchWithAuth(`/events/${eventId}/apply/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to apply');
    }
    return await response.json();
  },
  
  // Get applications for an event (organizer only)
  async getApplications(eventId: string | number, status?: string) {
    const params = status ? `?status=${status}` : '';
    const response = await fetchWithAuth(`/events/${eventId}/applications/${params}`);
    if (!response.ok) throw new Error('Failed to get applications');
    return await response.json();
  },
  
  // Review application (approve/reject)
  async reviewApplication(eventId: string | number, applicationId: string | number, action: 'approve' | 'reject' | 'waitlist', reason?: string) {
    const response = await fetchWithAuth(`/events/${eventId}/applications/${applicationId}/review/`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    });
    if (!response.ok) throw new Error('Failed to review application');
    return await response.json();
  },
  
  // Bulk review applications
  async bulkReviewApplications(eventId: string | number, applicationIds: number[], action: 'approve' | 'reject' | 'waitlist', reason?: string) {
    const response = await fetchWithAuth(`/events/${eventId}/applications/bulk-review/`, {
      method: 'POST',
      body: JSON.stringify({ application_ids: applicationIds, action, reason }),
    });
    if (!response.ok) throw new Error('Failed to review applications');
    return await response.json();
  },
  
  // Prizes
  async getPrizes(eventId: string | number) {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/prizes/`);
    if (!response.ok) throw new Error('Failed to get prizes');
    return await response.json();
  },
  
  async addPrize(eventId: string | number, data: any) {
    const response = await fetchWithAuth(`/events/${eventId}/prizes/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add prize');
    return await response.json();
  },
  
  // Sponsors
  async getSponsors(eventId: string | number) {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/sponsors/`);
    if (!response.ok) throw new Error('Failed to get sponsors');
    return await response.json();
  },
  
  async addSponsor(eventId: string | number, data: any) {
    const response = await fetchWithAuth(`/events/${eventId}/sponsors/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add sponsor');
    return await response.json();
  },
};

// ==================== Applications API ====================

export const applicationsAPI = {
  async myApplications() {
    const response = await fetchWithAuth('/applications/my/');
    if (!response.ok) throw new Error('Failed to get applications');
    return await response.json();
  },
};

// ==================== Teams API ====================

export const teamsAPI = {
  async list(eventId: string | number) {
    const response = await fetchWithAuth(`/events/${eventId}/teams/`);
    if (!response.ok) throw new Error('Failed to get teams');
    return await response.json();
  },
  
  async myTeams() {
    const response = await fetchWithAuth('/teams/my/');
    if (!response.ok) throw new Error('Failed to get my teams');
    return await response.json();
  },
  
  async get(teamId: string | number) {
    const response = await fetchWithAuth(`/teams/${teamId}/`);
    if (!response.ok) throw new Error('Failed to get team');
    return await response.json();
  },
  
  async create(eventId: string | number, name: string) {
    const response = await fetchWithAuth(`/events/${eventId}/teams/`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create team');
    return await response.json();
  },
  
  // Submission
  async getSubmission(teamId: string | number) {
    const response = await fetchWithAuth(`/teams/${teamId}/submission/`);
    if (!response.ok) throw new Error('Failed to get submission');
    return await response.json();
  },
  
  async updateSubmission(teamId: string | number, data: any) {
    const response = await fetchWithAuth(`/teams/${teamId}/submission/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update submission');
    return await response.json();
  },
  
  async submit(teamId: string | number) {
    const response = await fetchWithAuth(`/teams/${teamId}/submit/`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to submit');
    return await response.json();
  },
};

// ==================== Dashboard API ====================

export const dashboardAPI = {
  async getStats() {
    const response = await fetchWithAuth('/dashboard/stats/');
    if (!response.ok) throw new Error('Failed to get stats');
    return await response.json();
  },
};

// Export all APIs
export const api = {
  auth: authAPI,
  profile: profileAPI,
  events: eventsAPI,
  applications: applicationsAPI,
  teams: teamsAPI,
  dashboard: dashboardAPI,
};

export default api;
