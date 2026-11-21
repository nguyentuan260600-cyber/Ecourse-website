import "server-only";

export const serverEnv = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? "",
  cloudflareStreamApiToken: process.env.CLOUDFLARE_STREAM_API_TOKEN ?? "",
  /** Optional: "abc123" from customer-abc123.cloudflarestream.com (auto-detected from the API otherwise). */
  cloudflareStreamCustomerCode: process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE ?? "",
  payosClientId: process.env.PAYOS_CLIENT_ID ?? "",
  payosApiKey: process.env.PAYOS_API_KEY ?? "",
  payosChecksumKey: process.env.PAYOS_CHECKSUM_KEY ?? "",
  brevoApiKey: process.env.BREVO_API_KEY ?? "",
};
