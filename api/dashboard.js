// api/dashboard.js

function formatMember(member) {
  return {
    id: member.id,
    playerUid: member.player_uid,
    name: member.player_name,
    tag: member.player_tag,
    fullName: `${member.player_name}${member.player_tag || ""}`,
    level: member.level,
    guildRank: member.guild_rank,
    investment: Number(member.current_investment || 0),
    networth: Number(member.networth || 0),
    help: Number(member.help_count || 0),
    bounty: Number(member.bounty_count || 0),
    joinedAt: member.joined_at,
    lastOnlineAt: member.last_online_at,
    active: member.active,
  };
}

async function supabaseRequest(path) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL ou SUPABASE_SECRET_KEY não configurada."
    );
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/${path}`,
    {
      method: "GET",
      headers: {
        apikey: supabaseSecretKey,
        Authorization: `Bearer ${supabaseSecretKey}`,
        Accept: "application/json",
      },
    }
  );

  const text = await response.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const error = new Error(
      `Supabase respondeu HTTP ${response.status}`
    );

    error.status = response.status;
    error.details = data;

    throw error;
  }

  return data;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Método não permitido.",
    });
  }

  try {
    // ======================================================
    // MEMBROS
    // ======================================================

    const membersData = await supabaseRequest(
      "members?select=id,player_uid,player_name,player_tag,level,guild_rank,current_investment,networth,help_count,bounty_count,joined_at,last_online_at,active&active=eq.true&order=current_investment.desc"
    );

    const members = Array.isArray(membersData)
      ? membersData.map(formatMember)
      : [];

    // ======================================================
    // CONFIGURAÇÕES
    // ======================================================

    const settingsData = await supabaseRequest(
      "guild_settings?select=guild_name,weekly_goal,last_titansdb_sync&limit=1"
    );

    const settings =
      Array.isArray(settingsData) && settingsData.length > 0
        ? settingsData[0]
        : null;

    // ======================================================
    // SEMANA ATUAL
    // ======================================================

    const weeksData = await supabaseRequest(
      "weeks?select=id,week_number,start_date,end_date,status,created_at,closed_at&status=eq.open&order=start_date.desc&limit=1"
    );

    const currentWeek =
      Array.isArray(weeksData) && weeksData.length > 0
        ? weeksData[0]
        : null;

    // ======================================================
    // SNAPSHOTS DA SEMANA
    // ======================================================

    let snapshots = [];

    if (currentWeek) {
      const snapshotData = await supabaseRequest(
        `weekly_snapshots?select=member_id,level,investment,previous_investment,progress,captured_at&week_id=eq.${currentWeek.id}`
      );

      snapshots = Array.isArray(snapshotData)
        ? snapshotData
        : [];
    }

    const snapshotByMember = new Map(
      snapshots.map((snapshot) => [
        snapshot.member_id,
        snapshot,
      ])
    );

    // ======================================================
    // JUNTA MEMBRO + PROGRESSO SEMANAL
    // ======================================================

    const dashboardMembers = members.map((member) => {
      const snapshot = snapshotByMember.get(member.id);

      return {
        ...member,

        weeklyProgress: snapshot
          ? Number(snapshot.progress || 0)
          : 0,

        previousInvestment: snapshot
          ? Number(snapshot.previous_investment || 0)
          : null,

        snapshotInvestment: snapshot
          ? Number(snapshot.investment || 0)
          : null,
      };
    });

    // ======================================================
    // ESTATÍSTICAS
    // ======================================================

    const totalInvestment = dashboardMembers.reduce(
      (total, member) => total + member.investment,
      0
    );

    const totalWeeklyProgress = dashboardMembers.reduce(
      (total, member) => total + member.weeklyProgress,
      0
    );

    const weeklyGoal = Number(
      settings?.weekly_goal || 2000000000
    );

    const membersAboveGoal = dashboardMembers.filter(
      (member) => member.weeklyProgress >= weeklyGoal
    ).length;

    const membersBelowGoal =
      dashboardMembers.length - membersAboveGoal;

    // ======================================================
    // RESPOSTA PARA O FRONTEND
    // ======================================================

    res.setHeader(
      "Cache-Control",
      "s-maxage=30, stale-while-revalidate=60"
    );

    return res.status(200).json({
      success: true,

      guild: {
        name: settings?.guild_name || "Fluxo Brasil",
        weeklyGoal,
        lastSync: settings?.last_titansdb_sync || null,
      },

      currentWeek,

      stats: {
        totalMembers: dashboardMembers.length,
        totalInvestment,
        totalWeeklyProgress,
        membersAboveGoal,
        membersBelowGoal,
      },

      members: dashboardMembers,
    });
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);

    return res.status(error.status || 500).json({
      success: false,
      error: "Não foi possível carregar o dashboard.",
      details: error.details || error.message || null,
    });
  }
}
