// api/admin-session.js

async function obterUsuario(accessToken) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    const erro = new Error("Supabase não configurado no servidor.");
    erro.status = 500;
    throw erro;
  }

  const resposta = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: supabaseSecretKey,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const texto = await resposta.text();
  let dados = null;

  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = texto;
    }
  }

  if (!resposta.ok || !dados?.id) {
    const erro = new Error("Sessão inválida ou expirada.");
    erro.status = 401;
    erro.details = dados;
    throw erro;
  }

  return dados;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      success: false,
      error: "Método não permitido.",
    });
  }

  try {
    const adminUserId = process.env.ADMIN_USER_ID;

    if (!adminUserId) {
      return res.status(500).json({
        success: false,
        error: "ADMIN_USER_ID não configurado na Vercel.",
      });
    }

    const authorization = req.headers.authorization || "";
    const accessToken = authorization.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: "Sessão administrativa ausente.",
      });
    }

    const usuario = await obterUsuario(accessToken);

    if (usuario.id !== adminUserId) {
      return res.status(403).json({
        success: false,
        admin: false,
        error: "Usuário sem permissão de administrador.",
      });
    }

    return res.status(200).json({
      success: true,
      admin: true,
    });
  } catch (error) {
    console.error("Erro ao validar administrador:", error);

    return res.status(error.status || 500).json({
      success: false,
      admin: false,
      error: error.message || "Não foi possível validar a sessão.",
    });
  }
}
