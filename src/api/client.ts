import type { ApiResponse } from '../types/rent';

export const API_BASE_URL = 'http://localhost:8080/api';
const TOKEN_KEY = 'rent_token';

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? '';
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });

  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new Error('服务端返回格式错误');
  }

  if (!response.ok || payload.code !== 0) {
    throw new Error(payload.msg || '请求失败');
  }

  return payload.data;
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

export function post<T, B extends object>(path: string, body: B): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}
