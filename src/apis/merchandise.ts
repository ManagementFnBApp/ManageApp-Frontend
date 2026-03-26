import { apiClient } from "@/configs/axios";

export interface CreateMerchandiseRequest {
  merchandise_name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  point_required: number;
  total_quantity: number;
  is_active?: boolean;
}

export async   function create(data: CreateMerchandiseRequest) {
  const res = await apiClient.post('/merchandises', data);
  return res.data.data;
}

export async function getAll() {
  const res = await apiClient.get('/merchandises');
  return res.data.data;
}

export async function getById(id: string) {
  const res = await apiClient.get(`/merchandises/${id}`);
  return res.data.data;
}

export async function update(id: string, data: CreateMerchandiseRequest) {
  const res = await apiClient.put(`/merchandises/${id}`, data);
  return res.data.data;
}

export async function remove(id: string) {
  const res = await apiClient.delete(`/merchandises/${id}`);
  return res.data.data;
}