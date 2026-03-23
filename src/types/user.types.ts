// ========== Profile ==========
export interface ProfileResponseDto {
  profile_id: string;
  user_id: number;
  full_name: string;
  avatar?: string | null;
  phone?: string | null;
}

export interface CreateProfileDto {
  full_name?: string;
  avatar?: string;
  phone?: string;
}

// ========== User ==========
export interface UserResponseDto {
  user_id: number;
  shop_id?: number | null;
  owner_manager_id?: number | null;
  role_id?: number | null;
  email: string;
  username: string;
  is_active: boolean;
  last_login?: Date | null;
  role: string | null;
  created_at: Date;
  updated_at: Date;
  profile?: ProfileResponseDto | null;
}

// ========== Create ==========
export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
}

// ========== Update ==========
export interface UpdateUserDto {
  email?: string;
  username?: string;
  full_name?: string;
  phone?: string;
  avatar?: string;
  shop_id?: number;
  role_id?: number;
  is_active?: boolean;
}

// ========== Change Password ==========
export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

// ========== Assign Role ==========
export interface AssignRoleDto {
  role_id: number;
}

// ========== Create Managed User (by SHOPOWNER) ==========
export interface CreateManagedUserDto {
  email: string;
  username: string;
  password: string;
  role_code: "SHOPOWNER" | "STAFF";
}
