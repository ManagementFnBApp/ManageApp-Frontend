import { apiClient } from "../configs/axios";
import type {
  UpdateUserDto,
  AssignRoleDto,
  ProfileResponseDto,
  CreateProfileDto,
} from "@/types/user.types";

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && "data" in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

export const getProfile = async (): Promise<ProfileResponseDto> => {
  const res = await apiClient.get("/profiles/detail");
  const raw = unwrap<ProfileResponseDto>(res.data);
  return raw;
};

export const createProfile = async (
  body: CreateProfileDto,
): Promise<ProfileResponseDto> => {
  const res = await apiClient.post("/profiles", body);
  const raw = unwrap<ProfileResponseDto>(res.data);
  return raw;
};

// export const updateUser = async (
//   userId: number,
//   payload: UpdateUserDto,
// ): Promise<UserResponseDto> => {
//   const res = await apiClient.patch(`/users/${userId}`, {
//     email: payload.email,
//     username: payload.username,
//     full_name: payload.full_name,
//     phone: payload.phone,
//     avatar: payload.avatar,
//     shop_id: payload.shop_id,
//     role_id: payload.role_id,
//     is_active: payload.is_active,
//   });
//   const raw = unwrap<Record<string, unknown>>(res.data);
//   return mapBackendUserToFrontend(raw);
// };

// export const assignRole = async (
//   userId: number,
//   payload: AssignRoleDto,
// ): Promise<UserResponseDto> => {
//   const res = await apiClient.patch(`/users/${userId}/role`, {
//     role_id: payload.role_id,
//   });
//   const raw = unwrap<Record<string, unknown>>(res.data);
//   return mapBackendUserToFrontend(raw);
// };
