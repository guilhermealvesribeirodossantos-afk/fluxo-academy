export default async function handler(req, res) {
  // Permite somente GET
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Método não permitido.",
    });
  }

  const apiKey = process.env.TITANSDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: "TITANSDB_API_KEY não configurada na Vercel.",
    });
  }

  try {
    const response = await fetch(
      "https://www.titansdb.com/api/my_guild",
      {
        method: "GET",
        headers: {
          "X-API-Key": apiKey,
          Accept: "application/json",
        },
      }
    );

    const contentType = response.headers.get("content-type") || "";

    let data;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: "O TitansDB recusou a solicitação.",
        status: response.status,
        details: data,
      });
    }

    return res.status(200).json({
      success: true,
      syncedAt: new Date().toISOString(),
      source: "TitansDB",
      data,
    });
  } catch (error) {
    console.error("Erro ao consultar TitansDB:", error);

    return res.status(500).json({
      success: false,
      error: "Não foi possível conectar ao TitansDB.",
    });
  }
}
