export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return res.status(500).json({
      success: false,
      error: "Variáveis do Supabase não configuradas.",
      urlConfigured: Boolean(supabaseUrl),
      keyConfigured: Boolean(supabaseSecretKey),
    });
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/members?select=id,player_name&limit=1`,
      {
        headers: {
          apikey: supabaseSecretKey,
          Authorization: `Bearer ${supabaseSecretKey}`,
          Accept: "application/json",
        },
      }
    );

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        status: response.status,
        error: "Supabase respondeu com erro.",
        details: data,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vercel conectada ao Supabase com sucesso.",
      membersTable: "OK",
      result: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Falha de conexão com o Supabase.",
      details: error.message,
    });
  }
}
