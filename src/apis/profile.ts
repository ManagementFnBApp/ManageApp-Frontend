// Tạo profile mới cho user hiện tại (body có thể rỗng)
export async function createProfile(profile: Partial<Profile> = {}) {
    const res = await apiClient.post('/profiles', profile);
    const data = res.data?.data;
    return Profile.parse(data);
}
import { apiClient } from '@/configs/axios';
import * as z from 'zod';

const Profile = z.object({
    user_id: z.union([z.string(), z.number(), z.null()]).optional(),
    profile_id: z.union([z.string(), z.number(), z.null()]).optional(),
    full_name: z.string().nullish(), // allows null or undefined
    avatar: z.string().nullish(), // Add avatar as alias
    phone: z.string().nullish(),
})

export type Profile = z.infer<typeof Profile>;

export async function getProfile() {
    const res = await apiClient.get('/profiles/detail');
    const data = res.data?.data; 
    return Profile.parse(data);
}

export async function updateProfile(id: string, profile: Partial<Profile>) {
    const res = await apiClient.put(`/profiles/${id}`, profile);
    return Profile.parse(res.data);
}