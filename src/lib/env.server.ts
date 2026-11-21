import "server-only";

export const serverEnv = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  bunnyLibraryId: process.env.BUNNY_STREAM_LIBRARY_ID ?? "",
  bunnyApiKey: process.env.BUNNY_STREAM_API_KEY ?? "",
  bunnyTokenKey: process.env.BUNNY_STREAM_TOKEN_KEY ?? "",
  payosClientId: process.env.PAYOS_CLIENT_ID ?? "",
  payosApiKey: process.env.PAYOS_API_KEY ?? "",
  payosChecksumKey: process.env.PAYOS_CHECKSUM_KEY ?? "",
  brevoApiKey: process.env.BREVO_API_KEY ?? "",
};
