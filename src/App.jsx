import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Users, Trophy, CalendarDays, Settings,
  Search, RefreshCw, Database, Wifi, WifiOff
} from "lucide-react";

const formatar = (v) => new Intl.NumberFormat("pt-BR").format(Math.round(Number(v) || 0));

const faixa = (p) =>
  p >= 2000000000 ? ["2G+", "green"] :
  p >= 501000000 ? ["501M – 2G", "yellow"] :
  p >= 251000000 ? ["251M – 500M", "orange"] :
  ["0 – 250M", "red"];

const dataSQL = (v) => {
  if (!v) return "—";
  const [a, m, d] = v.split("-");
  return `${d}/${m}/${a}`;
};

const dataHora = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo"
  }).format(d);
};

function Sidebar({ pagina, setPagina }) {
  const itens = [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["membros", "Membros", Users],
    ["ranking", "Ranking", Trophy],
    ["semanas", "Semanas", CalendarDays],
    ["administracao", "Administração", Settings],
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">FA</div>
        <div className="brand-copy"><strong>FLUXO</strong><span>ACADEMY</span></div>
      </div>
      <div className="brand-caption">Guild Investment System</div>

      <nav className="menu">
        {itens.map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setPagina(id)}
            className={`menu-item ${pagina === id ? "active" : ""}`}
          >
            <Icon size={19}/>{label}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <p>“Disciplina constrói resultados.”</p>
        <strong>FLUXO ACADEMY</strong>
        <span>MMXXVI</span>
      </div>
    </aside>
  );
}

function Cabecalho({ eyebrow, titulo, subtitulo, semana }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{titulo}</h1>
        <p className="subtitle">{subtitulo}</p>
      </div>

      {semana && (
        <div className="week-selector">
          <CalendarDays size={18}/>
          <div>
            <span>SEMANA ATUAL</span>
            <strong>{dataSQL(semana.start_date)} – {dataSQL(semana.end_date)}</strong>
          </div>
        </div>
      )}
    </header>
  );
}

function Dashboard({ dados, atualizar, atualizando }) {
  const [busca, setBusca] = useState("");
  const jogadores = dados.members || [];

  const ranking = useMemo(
    () => [...jogadores].sort((a, b) => b.weeklyProgress - a.weeklyProgress),
    [jogadores]
  );

  const filtrados = ranking.filter((j) =>
    j.fullName.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR"))
  );

  const total = dados.stats?.totalWeeklyProgress || 0;
  const media = jogadores.length ? Math.round(total / jogadores.length) : 0;
  const membros2G = jogadores.filter((j) => j.weeklyProgress >= 2000000000).length;

  return (
    <>
      <Cabecalho
        eyebrow="VISÃO GERAL"
        titulo="Dashboard"
        subtitulo={`Acompanhe o desempenho semanal da ${dados.guild?.name || "Fluxo Brasil"}.`}
        semana={dados.currentWeek}
      />

      <section className="stats">
        <article className="stat-card">
          <span>MEMBROS</span><strong>{jogadores.length}</strong><small>membros ativos</small>
        </article>
        <article className="stat-card">
          <span>PROGRESSO TOTAL</span><strong>{formatar(total)}</strong><small>progresso da semana</small>
        </article>
        <article className="stat-card">
          <span>MÉDIA POR MEMBRO</span><strong>{formatar(media)}</strong><small>média de progresso</small>
        </article>
        <article className="stat-card">
          <span>MEMBROS 2G+</span><strong>{membros2G}</strong><small>meta semanal atingida</small>
        </article>
        <article className="stat-card">
          <span>MAIOR PROGRESSO</span>
          <strong>{formatar(ranking[0]?.weeklyProgress || 0)}</strong>
          <small>{ranking[0]?.fullName || "-"}</small>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Trophy size={23}/>
            <div>
              <p className="eyebrow">DESEMPENHO</p>
              <h2>Ranking semanal</h2>
              <span>Classificação por progresso da semana atual</span>
            </div>
          </div>

          <div className="panel-actions">
            <label className="search">
              <Search size={15}/>
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar jogador"
              />
            </label>
            <button className="secondary-btn" onClick={atualizar} disabled={atualizando}>
              <RefreshCw size={15}/>{atualizando ? "Atualizando..." : "Atualizar"}
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>POS.</th><th>JOGADOR</th><th>NÍVEL</th>
                <th>INVESTIMENTO</th><th>PROGRESSO</th><th>FAIXA</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((j) => {
                const pos = ranking.findIndex((x) => x.id === j.id) + 1;
                const [texto, classe] = faixa(j.weeklyProgress);

                return (
                  <tr key={j.playerUid || j.id}>
                    <td><span className={`position position-${pos}`}>{String(pos).padStart(2, "0")}</span></td>
                    <td><strong className="player-name">{j.fullName}</strong></td>
                    <td>{j.level}</td>
                    <td className="number">{formatar(j.investment)}</td>
                    <td className="number progress-value">+{formatar(j.weeklyProgress)}</td>
                    <td><span className={`badge ${classe}`}><i/>{texto}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ranges">
        <div className="range-card red"><span/><div><strong>0 – 250M</strong><small>Faixa vermelha</small></div></div>
        <div className="range-card orange"><span/><div><strong>251M – 500M</strong><small>Faixa laranja</small></div></div>
        <div className="range-card yellow"><span/><div><strong>501M – 2G</strong><small>Faixa amarela</small></div></div>
        <div className="range-card green"><span/><div><strong>2G+</strong><small>Faixa verde</small></div></div>
      </section>

      <div className="admin-note">
        <strong>ÚLTIMA SINCRONIZAÇÃO TITANSDB:</strong> {dataHora(dados.guild?.lastSync)}
      </div>
    </>
  );
}

function Membros({ dados }) {
  const [busca, setBusca] = useState("");
  const jogadores = dados.members || [];
  const lista = jogadores.filter((j) =>
    j.fullName.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR"))
  );

  return (
    <>
      <Cabecalho
        eyebrow="GUILDA"
        titulo="Membros"
        subtitulo="Lista atual dos membros registrados no banco."
        semana={dados.currentWeek}
      />

      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Users size={23}/>
            <div>
              <p className="eyebrow">ELENCO</p>
              <h2>{jogadores.length} membros ativos</h2>
              <span>Dados sincronizados com a guilda</span>
            </div>
          </div>
          <label className="search">
            <Search size={15}/>
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar jogador"/>
          </label>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>JOGADOR</th><th>CARGO</th><th>NÍVEL</th>
                <th>INVESTIMENTO</th><th>PATRIMÔNIO</th><th>ÚLTIMO ONLINE</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((j) => (
                <tr key={j.playerUid}>
                  <td><strong className="player-name">{j.fullName}</strong></td>
                  <td>{j.guildRank || "—"}</td>
                  <td>{j.level}</td>
                  <td className="number">{formatar(j.investment)}</td>
                  <td className="number">{formatar(j.networth)}</td>
                  <td>{dataHora(j.lastOnlineAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function Ranking({ dados }) {
  const jogadores = useMemo(
    () => [...(dados.members || [])].sort((a, b) => b.investment - a.investment),
    [dados.members]
  );

  return (
    <>
      <Cabecalho
        eyebrow="CLASSIFICAÇÃO"
        titulo="Ranking"
        subtitulo="Ranking geral por investimento acumulado."
        semana={dados.currentWeek}
      />

      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Trophy size={23}/>
            <div>
              <p className="eyebrow">INVESTIMENTO TOTAL</p>
              <h2>Ranking da guilda</h2>
              <span>Classificação pelo investimento acumulado atual</span>
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>POS.</th><th>JOGADOR</th><th>NÍVEL</th>
                <th>CARGO</th><th>INVESTIMENTO</th><th>PROGRESSO SEMANAL</th>
              </tr>
            </thead>
            <tbody>
              {jogadores.map((j, i) => (
                <tr key={j.playerUid}>
                  <td><span className={`position position-${i + 1}`}>{String(i + 1).padStart(2, "0")}</span></td>
                  <td><strong className="player-name">{j.fullName}</strong></td>
                  <td>{j.level}</td>
                  <td>{j.guildRank || "—"}</td>
                  <td className="number">{formatar(j.investment)}</td>
                  <td className="number progress-value">+{formatar(j.weeklyProgress)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function Semanas({ dados }) {
  const semana = dados.currentWeek;

  return (
    <>
      <Cabecalho
        eyebrow="HISTÓRICO"
        titulo="Semanas"
        subtitulo="Controle dos ciclos semanais da guilda."
        semana={semana}
      />

      <section className="panel" style={{ padding: "28px" }}>
        <div className="panel-title">
          <CalendarDays size={23}/>
          <div>
            <p className="eyebrow">SEMANA ABERTA</p>
            <h2>
              {semana
                ? `${dataSQL(semana.start_date)} – ${dataSQL(semana.end_date)}`
                : "Nenhuma semana aberta"}
            </h2>
            <span>{semana ? `Semana #${semana.week_number} · ${semana.status}` : "—"}</span>
          </div>
        </div>

        <div className="admin-note" style={{ marginTop: "24px" }}>
          <strong>BASE SEMANAL:</strong> o investimento inicial dos membros já está salvo.
          O progresso será a diferença entre a base e os investimentos das próximas sincronizações.
        </div>
      </section>
    </>
  );
}

function Administracao({ dados, atualizar, atualizando }) {
  return (
    <>
      <Cabecalho
        eyebrow="GESTÃO DA GUILDA"
        titulo="Administração"
        subtitulo="Status da integração e do banco de dados."
        semana={dados.currentWeek}
      />

      <section className="admin-layout">
        <div className="admin-list panel">
          <div className="admin-list-head">
            <div><p className="eyebrow">MEMBROS</p><h2>Banco atual</h2></div>
            <span>{dados.members?.length || 0}</span>
          </div>

          <div className="member-list">
            {(dados.members || []).map((j) => (
              <div className="member-row" key={j.playerUid}>
                <div className="member-avatar">{j.name.slice(0, 2).toUpperCase()}</div>
                <div>
                  <strong>{j.fullName}</strong>
                  <span>Nível {j.level} · {j.guildRank || "Member"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-editor panel">
          <div className="editor-head">
            <div className="editor-icon"><Database size={21}/></div>
            <div>
              <p className="eyebrow">INTEGRAÇÃO</p>
              <h2>Supabase conectado</h2>
              <span>O site não usa mais a lista manual de jogadores.</span>
            </div>
          </div>

          <div className="calculation">
            <div><span>MEMBROS</span><strong>{dados.stats?.totalMembers || 0}</strong></div>
            <div className="calc-arrow">→</div>
            <div><span>META SEMANAL</span><strong>{formatar(dados.guild?.weeklyGoal || 0)}</strong></div>
            <div className="calc-result">
              <span>STATUS</span>
              <strong style={{ fontSize: "1rem" }}>CONECTADO</strong>
            </div>
          </div>

          <div className="preview-row">
            <div><span>ÚLTIMA SINCRONIZAÇÃO</span><span className="badge green"><i/>ONLINE</span></div>
            <p>{dataHora(dados.guild?.lastSync)}</p>
          </div>

          <div className="admin-note">
            <strong>IMPORTANTE:</strong> a edição manual foi temporariamente desativada para
            impedir conflito com os dados reais. Depois criaremos edição persistente e protegida
            para a administração.
          </div>

          <div className="editor-actions">
            <button className="secondary-btn" onClick={atualizar} disabled={atualizando}>
              <RefreshCw size={15}/>{atualizando ? "Atualizando..." : "Recarregar dados"}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default function App() {
  const [pagina, setPagina] = useState("dashboard");
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");

  const carregar = async (inicial = false) => {
    inicial ? setCarregando(true) : setAtualizando(true);
    setErro("");

    try {
      const resposta = await fetch("/api/dashboard", {
        headers: { Accept: "application/json" },
        cache: "no-store"
      });

      const json = await resposta.json();

      if (!resposta.ok || !json.success) {
        throw new Error(json.error || "Não foi possível carregar os dados.");
      }

      setDados(json);
    } catch (e) {
      setErro(e.message || "Erro de conexão.");
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  };

  useEffect(() => {
    carregar(true);
  }, []);

  let conteudo;

  if (carregando) {
    conteudo = (
      <section className="panel" style={{ padding: "32px" }}>
        <div className="panel-title">
          <RefreshCw size={23}/>
          <div>
            <p className="eyebrow">FLUXO ACADEMY</p>
            <h2>Carregando dados...</h2>
            <span>Consultando o banco da guilda.</span>
          </div>
        </div>
      </section>
    );
  } else if (erro && !dados) {
    conteudo = (
      <section className="panel" style={{ padding: "32px" }}>
        <div className="panel-title">
          <WifiOff size={23}/>
          <div>
            <p className="eyebrow">CONEXÃO</p>
            <h2>Não foi possível carregar o Dashboard</h2>
            <span>{erro}</span>
          </div>
        </div>
        <div style={{ marginTop: "22px" }}>
          <button className="primary-btn" onClick={() => carregar(true)}>
            <RefreshCw size={15}/>Tentar novamente
          </button>
        </div>
      </section>
    );
  } else {
    switch (pagina) {
      case "membros":
        conteudo = <Membros dados={dados}/>;
        break;
      case "ranking":
        conteudo = <Ranking dados={dados}/>;
        break;
      case "semanas":
        conteudo = <Semanas dados={dados}/>;
        break;
      case "administracao":
        conteudo = <Administracao dados={dados} atualizar={() => carregar(false)} atualizando={atualizando}/>;
        break;
      default:
        conteudo = <Dashboard dados={dados} atualizar={() => carregar(false)} atualizando={atualizando}/>;
    }
  }

  return (
    <div className="app">
      <Sidebar pagina={pagina} setPagina={setPagina}/>

      <main className="content">
        {erro && dados && (
          <div className="admin-note">
            <strong>ATENÇÃO:</strong> {erro}
          </div>
        )}

        {conteudo}

        <footer className="footer">
          <span><strong>FLUXO ACADEMY</strong> · Guild Investment System</span>
          <span>
            {dados ? <><Wifi size={13}/> Supabase conectado</> : "Foco · Evolução · Resultado"}
          </span>
        </footer>
      </main>
    </div>
  );
}
