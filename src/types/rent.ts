export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export interface UserInfo {
  id: number;
  username: string;
  name: string;
}

export interface LoginData {
  token: string;
  user: UserInfo;
}

export interface House {
  id: number;
  title: string;
  city: string;
  district: string;
  address: string;
  price: number;
  area: number;
  description: string;
  status: 'available' | 'rented';
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface HouseListData {
  list: House[];
  total: number;
}

export interface Order {
  id: number;
  houseId: number;
  renterId: number;
  ownerId: number;
  monthlyRent: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

export interface OrderListData {
  list: Order[];
  total: number;
}
