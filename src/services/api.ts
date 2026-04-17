const BASE_URL = '/api/v1';

export const getAuthToken = () => {
    return localStorage.getItem('fulitong_token');
};

export const setAuthToken = (token: string) => {
    localStorage.setItem('fulitong_token', token);
};

export const clearAuthToken = () => {
    localStorage.removeItem('fulitong_token');
};

interface RequestOptions extends RequestInit {
    requireAuth?: boolean;
}

/**
 * Universal fetch wrapper that automatically injects Authorization headers
 */
export async function apiFetch(endpoint: string, options: RequestOptions = {}) {
    const { requireAuth = true, headers, ...customConfig } = options;

    const token = getAuthToken();
    const authHeaders: HeadersInit = {};

    if (requireAuth && token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...customConfig,
        headers: {
            ...authHeaders,
            ...headers,
        },
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        if (!response.ok) {
            // Priority: Attempt to parse JSON error detail from backend
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errData = await response.json();
                errorMessage = errData.detail || errData.message || errorMessage;
            } catch (e) {
                // Not JSON or no detail
            }

            if (response.status === 401 && requireAuth) {
                clearAuthToken();
                // We throw a specific message so the page can handle it
                throw new Error("SESSION_EXPIRED: 您尚未登录或会话已过期，请重新登录。");
            }
            
            throw new Error(errorMessage);
        }
        return response;
    } catch (error: any) {
        console.error(`API Error on ${endpoint}:`, error);
        
        // If it's already an Error with our specific messages, re-throw it
        if (error instanceof Error && (error.message.includes("SESSION_EXPIRED") || error.message.includes("HTTP error"))) {
            throw error;
        }

        if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('NetworkError'))) {
            throw new Error(`网络连接失败: 请核对手机与电脑是否在同一 WiFi，且电脑端防火墙已允许 8001 端口。`);
        } else if (error.name === 'AbortError') {
            throw new Error(`请求超时: AI 分析耗时较长，请检查网络质量或稍后在记录中查看。`);
        }
        
        throw error;
    }
}

/**
 * Helper for JSON POST requests
 */
export async function apiPostJson(endpoint: string, body: any, requireAuth = true) {
    const response = await apiFetch(endpoint, {
        method: 'POST',
        requireAuth,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    return response.json();
}

/**
 * Helper for JSON PUT requests
 */
export async function apiPutJson(endpoint: string, body: any, requireAuth = true) {
    const response = await apiFetch(endpoint, {
        method: 'PUT',
        requireAuth,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    return response.json();
}

/**
 * Helper for JSON GET requests
 */
export async function apiGetJson(endpoint: string, requireAuth = true) {
    const response = await apiFetch(endpoint, {
        method: 'GET',
        requireAuth,
    });
    return response.json();
}
/**
 * Helper for JSON DELETE requests
 */
export async function apiDelete(endpoint: string, requireAuth = true) {
    const response = await apiFetch(endpoint, {
        method: 'DELETE',
        requireAuth,
    });
    return response.json();
}

/**
 * Chat with AI Assistant
 */
export async function chatWithAI(message: string, history?: {role: string, content: string}[]) {
    return apiPostJson('/chat/', { message, history }, true);
}
