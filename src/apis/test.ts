import { apiClient, endpoint } from "@/configs/axios"

export const testApi = () => {
    return apiClient.get('').then(response => response.data)
}

export const getAllCategories = () => {
    return apiClient.get(endpoint.category).then(response => response.data)
}

export const getAllProducts = () => {
    return apiClient.get(endpoint.product).then(response => response.data)
}