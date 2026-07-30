import { get, post } from './client';
import type { House, HouseListData, LoginData, Order, OrderListData, UserInfo } from '../types/rent';

interface HouseQuery {
  city?: string;
  status?: 'available' | 'rented';
}

function toQueryString(query: HouseQuery): string {
  const params = new URLSearchParams();
  if (query.city) {
    params.set('city', query.city);
  }
  if (query.status) {
    params.set('status', query.status);
  }
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export function login(username: string, password: string): Promise<LoginData> {
  return post<LoginData, { username: string; password: string }>('/auth/login', { username, password });
}

export function checkLogin(): Promise<{ user: UserInfo }> {
  return get<{ user: UserInfo }>('/auth/check');
}

export function listHouses(query: HouseQuery = {}): Promise<HouseListData> {
  return get<HouseListData>(`/houses${toQueryString(query)}`);
}

export function rentHouse(houseId: number, startDate: string, endDate: string): Promise<Order> {
  return post<Order, { startDate: string; endDate: string }>(`/houses/${houseId}/rent`, {
    startDate,
    endDate
  });
}

export function listOrders(role: 'owner' | 'renter' | '' = ''): Promise<OrderListData> {
  const suffix = role ? `?role=${role}` : '';
  return get<OrderListData>(`/orders${suffix}`);
}

export type { House };
