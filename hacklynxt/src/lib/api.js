/**
 * API Service for Hacklyn Backend
 * Handles all HTTP requests to the Django REST API using Axios
 * Production-ready with proper error handling and token refresh
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const OAUTH_BASE_URL = process.env.NEXT_PUBLIC_OAUTH_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Create public axios instance
const publicClient = axios.create({
    baseURL: API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// ==================== Token Management ====================

const getAccessToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
};

const getRefreshToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
};

const setTokens = (access, refresh) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
};

const clearTokens = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
};

// Request interceptor helper
const addRequestInterceptors = (client) => {
    client.interceptors.request.use(
        (config) => {
            if (client === apiClient) {
                const token = getAccessToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            // Remove leading slash if it exists to ensure baseURL is used correctly
            if (config.url?.startsWith('/')) {
                config.url = config.url.substring(1);
            }
            return config;
        },
        (error) => Promise.reject(error)
    );
};

addRequestInterceptors(apiClient);
addRequestInterceptors(publicClient);

// Response interceptor
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                clearTokens();
                isRefreshing = false;
                window.location.href = '/auth?mode=login'; // Forced logout
                return Promise.reject(error);
            }

            try {
                const response = await publicClient.post('auth/refresh/', {
                    refresh: refreshToken,
                });

                const { access, refresh } = response.data;
                setTokens(access, refresh || refreshToken);
                processQueue(null, access);

                originalRequest.headers.Authorization = `Bearer ${access}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearTokens();
                // If it's a 500, we still want to just log out rather than crash
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// ==================== Auth API ====================

export const authAPI = {
    async register(data) {
        try {
            const response = await publicClient.post('/auth/register/', data);
            const result = response.data;

            if (result.tokens) {
                setTokens(result.tokens.access, result.tokens.refresh);
                localStorage.setItem('user', JSON.stringify(result.user));
                localStorage.setItem('isAuthenticated', 'true');
            }

            return { ok: true, data: result };
        } catch (error) {
            return {
                ok: false,
                data: error.response?.data || { error: 'Registration failed' }
            };
        }
    },

    async login(username, password) {
        try {
            const response = await publicClient.post('/auth/login/', { username, password });
            const result = response.data;

            if (result.tokens) {
                setTokens(result.tokens.access, result.tokens.refresh);
                localStorage.setItem('user', JSON.stringify(result.user));
                localStorage.setItem('isAuthenticated', 'true');
            }

            return { ok: true, data: result };
        } catch (error) {
            return {
                ok: false,
                data: error.response?.data || { error: 'Invalid credentials' }
            };
        }
    },

    getGoogleLoginUrl() {
        return `${OAUTH_BASE_URL}/accounts/google/login/`;
    },

    getGithubLoginUrl() {
        return `${OAUTH_BASE_URL}/accounts/github/login/`;
    },

    async handleOAuthCallback() {
        try {
            const response = await apiClient.get('/auth/oauth/callback/', {
                withCredentials: true,
            });
            const result = response.data;

            if (result.tokens) {
                setTokens(result.tokens.access, result.tokens.refresh);
                localStorage.setItem('user', JSON.stringify(result.user));
                localStorage.setItem('isAuthenticated', 'true');
            }

            return { ok: true, data: result };
        } catch (error) {
            return {
                ok: false,
                data: error.response?.data || { error: 'OAuth callback failed' }
            };
        }
    },

    logout() {
        clearTokens();
    },

    async getMe() {
        const response = await apiClient.get('/auth/me/');
        return response.data;
    },

    isAuthenticated() {
        if (typeof window === 'undefined') return false;
        const isAuth = localStorage.getItem('isAuthenticated') === 'true';
        const hasToken = !!getAccessToken() || !!getRefreshToken();
        return isAuth && hasToken;
    },

    getUser() {
        if (typeof window === 'undefined') return null;
        const user = localStorage.getItem('user');
        try {
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    },

    setUser(user) {
        if (typeof window === 'undefined') return;
        localStorage.setItem('user', JSON.stringify(user));
    },

    async validateToken() {
        try {
            const user = await this.getMe();
            this.setUser(user);
            return { ok: true, user };
        } catch (error) {
            this.logout();
            return { ok: false, error: 'Token validation failed' };
        }
    },

    // Email OTP methods
    async sendEmailOTP() {
        try {
            const response = await apiClient.post('/auth/email/send-otp/');
            return { ok: true, data: response.data };
        } catch (error) {
            return {
                ok: false,
                data: error.response?.data || { error: 'Failed to send OTP' }
            };
        }
    },

    async verifyEmailOTP(otp) {
        try {
            const response = await apiClient.post('/auth/email/verify-otp/', { otp });
            const result = response.data;
            if (result.user) {
                this.setUser(result.user);
            }
            return { ok: true, data: result };
        } catch (error) {
            return {
                ok: false,
                data: error.response?.data || { error: 'Failed to verify OTP' }
            };
        }
    },

    async forgotPassword(email) {
        try {
            const response = await publicClient.post('/auth/password/forgot/', { email });
            return { ok: true, data: response.data };
        } catch (error) {
            return {
                ok: false,
                data: error.response?.data || { error: 'Failed to send password reset OTP' }
            };
        }
    },

    async resetPassword(email, otp, newPassword) {
        try {
            const response = await publicClient.post('/auth/password/reset/', {
                email,
                otp,
                new_password: newPassword
            });
            return { ok: true, data: response.data };
        } catch (error) {
            return {
                ok: false,
                data: error.response?.data || { error: 'Failed to reset password' }
            };
        }
    },
};

// ==================== Profile API ====================

export const profileAPI = {
    async get() {
        const response = await apiClient.get('/profile/');
        return response.data;
    },

    async update(data) {
        // If data is FormData (for file uploads), we need to let browser set Content-Type with boundary
        const config = {};
        if (data instanceof FormData) {
            config.headers = {
                'Content-Type': 'multipart/form-data',
            };
        }
        const response = await apiClient.patch('/profile/', data, config);
        return response.data;
    },

    async complete(data) {
        const response = await apiClient.post('/profile/complete/', data);
        return response.data;
    },

    async getPublic(username) {
        const response = await publicClient.get(`/profile/${username}/`);
        return response.data;
    },

    async getEducation() {
        const response = await apiClient.get('/profile/education/');
        return response.data;
    },

    async addEducation(data) {
        const response = await apiClient.post('/profile/education/', data);
        return response.data;
    },

    async updateEducation(id, data) {
        const response = await apiClient.patch(`/profile/education/${id}/`, data);
        return response.data;
    },

    async deleteEducation(id) {
        await apiClient.delete(`/profile/education/${id}/`);
        return { success: true };
    },

    async getExperience() {
        const response = await apiClient.get('/profile/experience/');
        return response.data;
    },

    async addExperience(data) {
        const response = await apiClient.post('/profile/experience/', data);
        return response.data;
    },

    async updateExperience(id, data) {
        const response = await apiClient.patch(`/profile/experience/${id}/`, data);
        return response.data;
    },

    async deleteExperience(id) {
        await apiClient.delete(`/profile/experience/${id}/`);
        return { success: true };
    },

    async getProjects() {
        const response = await apiClient.get('/profile/projects/');
        return response.data;
    },

    async addProject(data) {
        const response = await apiClient.post('/profile/projects/', data);
        return response.data;
    },

    async updateProject(id, data) {
        const response = await apiClient.patch(`/profile/projects/${id}/`, data);
        return response.data;
    },

    async deleteProject(id) {
        await apiClient.delete(`/profile/projects/${id}/`);
        return { success: true };
    },
};

// ==================== Events API ====================

export const eventsAPI = {
    async list(filters = {}) {
        const response = await publicClient.get('/events/', { params: filters });
        return response.data;
    },

    async get(id) {
        const response = await publicClient.get(`/events/${id}/`);
        return response.data;
    },

    async getBySlug(slug) {
        const response = await publicClient.get(`/events/by-slug/${slug}/`);
        return response.data;
    },

    async create(data, isMultipart = false) {
        const config = {};
        if (isMultipart || data instanceof FormData) {
            config.headers = {
                'Content-Type': 'multipart/form-data',
            };
        }
        const response = await apiClient.post('/events/', data, config);
        return response.data;
    },

    async update(id, data) {
        const config = {};
        if (data instanceof FormData) {
            config.headers = {
                'Content-Type': 'multipart/form-data',
            };
        }
        const response = await apiClient.patch(`/events/${id}/`, data, config);
        return response.data;
    },

    async delete(id) {
        await apiClient.delete(`/events/${id}/`);
        return { success: true };
    },

    async getMyEvents() {
        const response = await apiClient.get('/events/my/');
        return response.data;
    },

    async featured() {
        const response = await publicClient.get('/events/featured/');
        return response.data;
    },

    async apply(eventId, data = {}) {
        const response = await apiClient.post(`/events/${eventId}/apply/`, data);
        return response.data;
    },

    async getApplications(eventId, filters = {}) {
        const response = await apiClient.get(`/events/${eventId}/applications/`, { params: filters });
        return response.data;
    },

    async reviewApplication(eventId, applicationId, action, reason = '') {
        const response = await apiClient.post(
            `/events/${eventId}/applications/${applicationId}/review/`,
            { action, reason }
        );
        return response.data;
    },

    // Sub-resources (Prizes, Sponsors)
    async getPrizes(eventId) {
        const response = await publicClient.get(`/events/${eventId}/prizes/`);
        return response.data;
    },

    async addPrize(eventId, data) {
        const response = await apiClient.post(`/events/${eventId}/prizes/`, data);
        return response.data;
    },

    async getSponsors(eventId) {
        const response = await publicClient.get(`/events/${eventId}/sponsors/`);
        return response.data;
    },

    async addSponsor(eventId, data) {
        const response = await apiClient.post(`/events/${eventId}/sponsors/`, data);
        return response.data;
    },
};

// ==================== Applications API ====================

export const applicationsAPI = {
    async myApplications() {
        const response = await apiClient.get('/applications/my/');
        return response.data;
    },

    async getApplication(id) {
        const response = await apiClient.get(`/applications/${id}/`);
        return response.data;
    },

    async withdraw(id) {
        const response = await apiClient.post(`/applications/${id}/withdraw/`);
        return response.data;
    },
};

// ==================== Teams API ====================

export const teamsAPI = {
    async list(eventId) {
        const response = await apiClient.get(`/events/${eventId}/teams/`);
        return response.data;
    },

    async myTeams() {
        const response = await apiClient.get('/teams/my/');
        return response.data;
    },

    async get(teamId) {
        const response = await apiClient.get(`/teams/${teamId}/`);
        return response.data;
    },

    async create(eventId, data) {
        const response = await apiClient.post(`/events/${eventId}/teams/`, data);
        return response.data;
    },

    async update(teamId, data) {
        const response = await apiClient.patch(`/teams/${teamId}/`, data);
        return response.data;
    },

    async delete(teamId) {
        await apiClient.delete(`/teams/${teamId}/`);
        return { success: true };
    },

    async invite(teamId, email) {
        const response = await apiClient.post(`/teams/${teamId}/invite/`, { email });
        return response.data;
    },

    async join(teamId, inviteCode) {
        const response = await apiClient.post(`/teams/${teamId}/join/`, { invite_code: inviteCode });
        return response.data;
    },

    async leave(teamId) {
        const response = await apiClient.post(`/teams/${teamId}/leave/`);
        return response.data;
    },

    async removeMember(teamId, userId) {
        const response = await apiClient.post(`/teams/${teamId}/remove/`, { user_id: userId });
        return response.data;
    },

    async getSubmission(teamId) {
        const response = await apiClient.get(`/teams/${teamId}/submission/`);
        return response.data;
    },

    async updateSubmission(teamId, data) {
        const response = await apiClient.patch(`/teams/${teamId}/submission/`, data);
        return response.data;
    },

    async submit(teamId) {
        const response = await apiClient.post(`/teams/${teamId}/submit/`);
        return response.data;
    },
};

// ==================== Dashboard API ====================

export const dashboardAPI = {
    async getStats() {
        const response = await apiClient.get('/dashboard/stats/');
        return response.data;
    },

    async getActivity() {
        const response = await apiClient.get('/dashboard/activity/');
        return response.data;
    },

    async getNotifications() {
        const response = await apiClient.get('/dashboard/notifications/');
        return response.data;
    },

    async markNotificationRead(id) {
        const response = await apiClient.post(`/dashboard/notifications/${id}/read/`);
        return response.data;
    },
};

// ==================== Admin API ====================

export const adminAPI = {
    async getStats() {
        try {
            const response = await apiClient.get('/admin/stats/');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || {} };
        }
    },

    async getPendingEvents() {
        try {
            const response = await apiClient.get('/admin/events/pending/');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || [] };
        }
    },

    async getRecentUsers() {
        try {
            const response = await apiClient.get('/admin/users/recent/');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || [] };
        }
    },

    async getAllUsers(params = {}) {
        const response = await apiClient.get('/admin/users/', { params });
        return response.data;
    },

    async getUser(id) {
        const response = await apiClient.get(`/admin/users/${id}/`);
        return response.data;
    },

    async approveEvent(eventId) {
        try {
            const response = await apiClient.post(`/admin/events/${eventId}/approve/`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || {} };
        }
    },

    async rejectEvent(eventId, reason) {
        try {
            const response = await apiClient.post(`/admin/events/${eventId}/reject/`, { reason });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || {} };
        }
    },

    async banUser(userId) {
        try {
            const response = await apiClient.post(`/admin/users/${userId}/ban/`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || {} };
        }
    },

    async unbanUser(userId) {
        try {
            const response = await apiClient.post(`/admin/users/${userId}/unban/`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || {} };
        }
    },

    async makeAdmin(userId) {
        const response = await apiClient.post(`/admin/users/${userId}/make-admin/`);
        return response.data;
    },

    async removeAdmin(userId) {
        const response = await apiClient.post(`/admin/users/${userId}/remove-admin/`);
        return response.data;
    },
};

// ==================== Judge API ====================

export const judgeAPI = {
    async getAssignedEvents() {
        const response = await apiClient.get('/judge/events/');
        return response.data;
    },

    async getSubmissions(eventId) {
        const response = await apiClient.get(`/judge/events/${eventId}/submissions/`);
        return response.data;
    },

    async getSubmission(submissionId) {
        const response = await apiClient.get(`/judge/submissions/${submissionId}/`);
        return response.data;
    },

    async scoreSubmission(submissionId, scores) {
        const response = await apiClient.post(`/judge/submissions/${submissionId}/score/`, scores);
        return response.data;
    },

    async addComment(submissionId, comment) {
        const response = await apiClient.post(`/judge/submissions/${submissionId}/comment/`, { comment });
        return response.data;
    },
};

// ==================== Common API ====================

export const commonAPI = {
    async autocomplete(type, query) {
        const response = await publicClient.get('/autocomplete/', {
            params: { type, q: query }
        });
        return response.data;
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
    admin: adminAPI,
    judge: judgeAPI,
    common: commonAPI,
};

export default api;
