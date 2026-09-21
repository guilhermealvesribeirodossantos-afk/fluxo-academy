// api/sync-guild.js

const TITANSDB_URL = "https://www.titansdb.com/api/my_guild";

function separarNomeETag(nomeCompleto = "") {
  const match = nomeCompleto.match(/^(.*?)(#\d+)$/);

  if (!match) {
    return {
      nome: nomeCompleto.trim(),
      tag: null,
    };
  }

  return {
    nome: match[1].trim(),
    tag: match[2],
  };
}

function converterDataTitansDB(data) {
  if (!data) return null;

  // TitansDB envia: YYYY-MM-DD HH:mm:ss
  // Tratamos como UTC para armazenar no Supabase.
  const normalizada = data.replace(" ", "T") + "Z";

  const date = new Date(normalizada);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

async function supabaseRequest(path, options = {}) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL ou SUPABASE_SECRET_KEY não configurada na Vercel."
    );
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: supabaseSecretKey,
      Authorization: `Bearer ${supabaseSecretKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const texto = await response.text();

  let data = null;

  if (texto) {
    try {
      data = JSON.parse(texto);
    } catch {
      data = texto;
    }
  }

  if (!response.ok) {
    const erro = new Error(`Erro Supabase: HTTP ${response.status}`);
    erro.status = response.status;
    erro.details = data;
    throw erro;
  }

  return data;
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Método não permitido.",
    });
  }

  const titansApiKey = process.env.TITANSDB_API_KEY;

  if (!titansApiKey) {
    return res.status(500).json({
      success: false,
      error: "TITANSDB_API_KEY não configurada na Vercel.",
    });
  }

  try {
    // ========================================================
    // 1. CONSULTAR TITANSDB
    // ========================================================

    const titansResponse = await fetch(TITANSDB_URL, {
      method: "GET",
      headers: {
        "X-API-Key": titansApiKey,
        Accept: "application/json",
      },
    });

    const contentType =
      titansResponse.headers.get("content-type") || "";

    let titansData;

    if (contentType.includes("application/json")) {
      titansData = await titansResponse.json();
    } else {
      titansData = await titansResponse.text();
    }

    if (!titansResponse.ok) {
      return res.status(titansResponse.status).json({
        success: false,
        source: "TitansDB",
        error: "O TitansDB recusou a sincronização.",
        status: titansResponse.status,
        details: titansData,
      });
    }

    const guild = titansData?.guild;

    if (!guild) {
      return res.status(502).json({
        success: false,
        error: "O TitansDB não retornou os dados da guilda.",
        received: titansData,
      });
    }

    if (!Array.isArray(guild.members)) {
      return res.status(502).json({
        success: false,
        error: "O TitansDB não retornou a lista de membros.",
      });
    }

    // ========================================================
    // 2. TRANSFORMAR MEMBROS PARA NOSSO BANCO
    // ========================================================

    const membros = guild.members.map((member) => {
      const { nome, tag } = separarNomeETag(member.name);

      return {
        player_uid: member.id,
        player_name: nome,
        player_tag: tag,

        level: Number(member.level || 0),

        guild_rank: member.guild?.rank || null,

        current_investment: Number(
          member.stats?.investments || 0
        ),

        networth: Number(
          member.stats?.networth || 0
        ),

        help_count: Number(
          member.stats?.help || 0
        ),

        bounty_count: Number(
          member.stats?.bounty || 0
        ),

        joined_at: converterDataTitansDB(
          member.guild?.joined
        ),

        last_online_at: converterDataTitansDB(
          member.last_online
        ),

        active: !member.banned,
      };
    });

    // ========================================================
    // 3. SALVAR / ATUALIZAR MEMBROS NO SUPABASE
    // ========================================================

    const membrosSalvos = await supabaseRequest(
      "members?on_conflict=player_uid",
      {
        method: "POST",

        headers: {
          Prefer: "resolution=merge-duplicates,return=representation",
        },

        body: JSON.stringify(membros),
      }
    );

    // ========================================================
    // 4. MARCAR MEMBROS QUE SAÍRAM DA GUILDA COMO INATIVOS
    // ========================================================

    const uidsAtuais = new Set(
      membros.map((membro) => membro.player_uid)
    );

    const membrosBanco = await supabaseRequest(
      "members?select=id,player_uid,active",
      {
        method: "GET",
      }
    );

    const membrosParaDesativar = Array.isArray(membrosBanco)
      ? membrosBanco.filter(
          (membro) =>
            membro.active &&
            membro.player_uid &&
            !uidsAtuais.has(membro.player_uid)
        )
      : [];

    for (const membro of membrosParaDesativar) {
      await supabaseRequest(
        `members?id=eq.${encodeURIComponent(membro.id)}`,
        {
          method: "PATCH",
          headers: {
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            active: false,
          }),
        }
      );
    }

    // ========================================================
    // 5. ATUALIZAR CONFIGURAÇÕES DA GUILDA
    // ========================================================

    const agora = new Date().toISOString();

    await supabaseRequest(
      "guild_settings?id=not.is.null",
      {
        method: "PATCH",

        headers: {
          Prefer: "return=minimal",
        },

        body: JSON.stringify({
          guild_name: guild.name || "Fluxo Brasil",
          last_titansdb_sync: agora,
        }),
      }
    );

    // ========================================================
    // 6. REGISTRAR HISTÓRICO DA SINCRONIZAÇÃO
    // ========================================================

    await supabaseRequest("sync_history", {
      method: "POST",

      headers: {
        Prefer: "return=minimal",
      },

      body: JSON.stringify({
        source: "TitansDB",
        status: "success",
        members_received: membros.length,
        message: `${guild.name} sincronizada com sucesso.`,
      }),
    });

    // ========================================================
    // 7. RESPOSTA
    // ========================================================

    return res.status(200).json({
      success: true,

      message: "Guilda sincronizada com sucesso.",

      syncedAt: agora,

      guild: {
        id: guild.id,
        name: guild.name,
        level: guild.level,
        population: guild.population,
        capacity: guild.capacity,
        rank: guild.rank,
        networth: guild.networth,
      },

      members: {
        received: membros.length,
        saved: Array.isArray(membrosSalvos)
          ? membrosSalvos.length
          : membros.length,

        deactivated: membrosParaDesativar.length,
      },

      preview: membros.map((membro) => ({
        name: `${membro.player_name}${
          membro.player_tag || ""
        }`,

        level: membro.level,
        rank: membro.guild_rank,
        investment: membro.current_investment,
      })),
    });
  } catch (error) {
    console.error("Erro na sincronização:", error);

    // Tenta registrar a falha sem impedir a resposta principal.
    try {
      await supabaseRequest("sync_history", {
        method: "POST",

        headers: {
          Prefer: "return=minimal",
        },

        body: JSON.stringify({
          source: "TitansDB",
          status: "error",
          members_received: 0,
          message:
            error?.details
              ? JSON.stringify(error.details)
              : error?.message || "Erro desconhecido.",
        }),
      });
    } catch (historyError) {
      console.error(
        "Não foi possível registrar o erro no histórico:",
        historyError
      );
    }

    return res.status(500).json({
      success: false,
      error: "Falha ao sincronizar a guilda.",
      details: error?.details || error?.message || null,
    });
  }
}
