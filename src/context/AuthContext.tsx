import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiGetJson, apiPostJson, setAuthToken, clearAuthToken, getAuthToken } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface User {
    id: number;
    email: string;
    username: string;
    is_superuser?: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, redirectUrl?: string) => Promise<void>;
    logout: () => void;
    fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // On mount, check if token exists and load user
    useEffect(() => {
        const initAuth = async () => {
            if (getAuthToken()) {
                try {
                    await fetchUser();
                } catch (error) {
                    clearAuthToken();
                    setUser(null);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const fetchUser = async () => {
        try {
            const userData = await apiGetJson('/users/me', true);
            setUser(userData);
        } catch (error) {
            console.error('Failed to fetch user', error);
            throw error;
        }
    };

    const login = async (token: string, redirectUrl = '/') => {
        setAuthToken(token);
        await fetchUser();
        navigate(redirectUrl);
    };

    const logout = () => {
        clearAuthToken();
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
