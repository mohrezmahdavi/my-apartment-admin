const account = "/account-service/v1";
const acl = "/acl-service/v1";
const wallet = "/wallet-service/v1";
const bills = "/bill-service/v1";
const payments = "/payment-service/v1";
const settings = "/setting-service/v1";
const support = "/support-service/v1";

export const apiPaths = {
  login: `${account}/login`,
  otpSend: `${account}/otp/send`,
  otpVerify: `${account}/otp/verify`,
  logout: `${account}/logout`,
  me: `${account}/me`,
  dashboard: `${account}/dashboard`,
  users: (query = "") => (query ? `${account}/users?${query}` : `${account}/users`),
  user: (id: string | number) => `${account}/users/${id}`,
  roles: `${acl}/roles`,
  role: (id: string | number) => `${acl}/roles/${id}`,
  permissions: `${acl}/permissions`,
  userRoles: (id: string | number) => `${acl}/users/${id}/roles`,
  userWallet: (id: string | number) => `${wallet}/users/${id}/wallet`,
  adjustWallet: (id: string | number) => `${wallet}/users/${id}/wallet/adjust`,
  billProviders: `${bills}/providers`,
  billProvider: (billType: string) => `${bills}/providers/${billType}`,
  billCache: `${bills}/providers/refresh-cache`,
  finnotechToken: `${bills}/finnotech-token`,
  gateway: `${payments}/gateway`,
  gatewayCache: `${payments}/gateway/refresh-cache`,
  paymentFee: `${payments}/fee`,
  paymentFeeAdjust: `${payments}/fee/adjust`,
  settings: `${settings}/settings`,
  tickets: (query = "") => (query ? `${support}/tickets?${query}` : `${support}/tickets`),
  ticket: (id: string | number) => `${support}/tickets/${id}`,
  ticketMessages: (id: string | number) => `${support}/tickets/${id}/messages`,
  ticketClose: (id: string | number) => `${support}/tickets/${id}/close`,
  ticketReopen: (id: string | number) => `${support}/tickets/${id}/reopen`,
};
