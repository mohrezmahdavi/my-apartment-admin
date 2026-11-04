export interface AdminUser {
  id: number;
  first_name: string | null;
  last_name: string | null;
  mobile: string;
  email: string | null;
  created_at?: string | null;
  roles?: Role[];
  permissions?: string[];
}

export interface Role {
  id: number;
  name: string;
  label: string | null;
  users_count?: number;
  permissions_count?: number;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  label: string | null;
  group: string | null;
}

export interface UserList {
  users: AdminUser[];
  pagination: { last_page: number };
}

export interface PermissionCatalog {
  permissions: Permission[];
  groups: Record<string, string>;
}

export interface DashboardStats {
  users_count: number;
}

export interface WalletSnapshot {
  wallet: { id: number; balance: number; available_balance: number } | null;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: number;
  type: number;
  amount: number;
  balance_after: number;
  description: string | null;
  created_at: string | null;
}

export const DEPOSIT = 1;

export interface DriverOption {
  key: string;
  label: string;
}

export interface BillProvider {
  bill_type: string;
  label: string;
  current: {
    driver: string;
    is_active: boolean;
    fee_enabled: boolean;
    fee_type: string;
    fee_value: number;
    min_fee_amount: number;
  } | null;
  available_drivers: DriverOption[];
}

export interface FinnotechStatus {
  client_id?: string;
  has_access_token?: boolean;
  has_refresh_token?: boolean;
  has_secret?: boolean;
  has_nid?: boolean;
  expires_label?: string | null;
}

export interface BillProviders {
  rows: BillProvider[];
  finnotech: FinnotechStatus;
}

export interface GatewaySettings {
  drivers: DriverOption[];
  current: { driver: string; is_active: boolean } | null;
}

export interface AuthSettings {
  auth_method: string;
}
