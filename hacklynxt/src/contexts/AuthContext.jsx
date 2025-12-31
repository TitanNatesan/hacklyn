"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state from localStorage
    const initializeAuth = useCallback(async () => {
        setIsLoading(true);
        try {
            if (authAPI.isAuthenticated()) {
                // Get user from localStorage first for fast hydration
                const storedUser = authAPI.getUser();
                if (storedUser) {
                    setUser(storedUser);
                    setIsAuthenticated(true);
                }

                // Validate token by fetching current user
                try {
                    const freshUser = await authAPI.getMe();
                    setUser(freshUser);
                    authAPI.setUser(freshUser);
                    setIsAuthenticated(true);
                } catch (error) {
                    // Token invalid, clear auth
                    console.error("Token validation failed:", error);
                    authAPI.logout();
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Auth initialization error:", error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    const login = useCallback(async (username, password) => {
        const result = await authAPI.login(username, password);
        if (result.ok) {
            setUser(result.data.user);
            setIsAuthenticated(true);
        }
        return result;
    }, []);

    const register = useCallback(async (data) => {
        const result = await authAPI.register(data);
        if (result.ok) {
            setUser(result.data.user);
            setIsAuthenticated(true);
        }
        return result;
    }, []);

    const logout = useCallback(() => {
        authAPI.logout();
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const freshUser = await authAPI.getMe();
            setUser(freshUser);
            authAPI.setUser(freshUser);
            return freshUser;
        } catch (error) {
            console.error("Failed to refresh user:", error);
            return null;
        }
    }, []);

    const handleOAuthCallback = useCallback(async () => {
        const result = await authAPI.handleOAuthCallback();
        if (result.ok) {
            setUser(result.data.user);
            setIsAuthenticated(true);
        }
        return result;
    }, []);

    const loginSuccess = useCallback((userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        // Also update in API/localStorage just to be safe/consistent
        authAPI.setUser(userData);
    }, []);

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        handleOAuthCallback,
        loginSuccess,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default AuthContext;
