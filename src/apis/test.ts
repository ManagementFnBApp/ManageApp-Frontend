import { apiClient, endpoint } from "@/configs/axios"

export const testApi = () => {
    return apiClient.get('').then(response => response.data)
}

export const getAllProducts = () => {
    return apiClient.get(endpoint.products).then(response => response.data)
}

export const getProductById = (id: number) => {
    return apiClient.get(`${endpoint.products}/${id}`).then(response => response.data)
}