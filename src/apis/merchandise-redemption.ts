import { apiClient } from "@/configs/axios";

export interface CreateMerchandiseRedemptionDto {
    customer_id: number;
    merchandise_id: number;
    quantity?: number;
}

export interface MerchandiseHistory {
    id: number,
    customer_id: number,
    customer_name: string,
    merchandise_id: number,
    merchandise_name: string,
    shop_id: number,
    point_spent: number,
    redemption_date: Date,
}

export interface MerchandiseRedemption {
    id: number;
    customer_id: number;
    merchandise_id: number;
    quantity: number;
    created_at: string;
}

export async function createRedemption(data: CreateMerchandiseRedemptionDto) {
    const res = await apiClient.post('/merchandise-redemptions', data);
    return res.data.data;
}

export async function getRedemptions() {
    const res = await apiClient.get('/merchandise-redemptions');
    return res.data.data;
}