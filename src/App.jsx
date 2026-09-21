import React from "react";

import {
  LayoutDashboard,
  Users,
  Trophy,
  CalendarDays,
  Settings,
  TrendingUp,
} from "lucide-react";

const jogadores = [
  {
    nome: "Blackfire",
    nivel: 93,
    investimento: "1,456T",
    progresso: "22,5G",
    faixa: "green",
  },
  {
    nome: "Oxumaré Shh",
    nivel: 83,
    investimento: "1,554T",
    progresso: "57,5G",
    faixa: "green",
  },
  {
    nome: "dgr",
    nivel: 85,
    investimento: "1,550T",
    progresso: "40,3G",
    faixa: "green",
  },
  {
    nome: "HOTFIRE",
    nivel: 93,
    investimento: "804,390G",
    progresso: "19,9G",
    faixa: "green",
  },
  {
    nome: "Gody",
    nivel: 80,
    investimento: "628,980G",
    progresso: "20G",
    faixa: "green",
  },
  {
    nome: "Vendedora",
    nivel: 82,
    investimento: "472,589G",
    progresso: "32,95G",
    faixa: "green",
  },
];

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">FA</div>

          <div>
            <strong>FLUXO</strong>
            <span>ACADEMY</span>
          </div>
        </div>

        <nav className="menu">
          <button className="menu-item active">
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button className="menu-item">
            <Users size={19} />
            Membros
          </button>

          <button className="menu-item">
            <Trophy size={19} />
            Ranking
          </button>

          <button className="menu-item">
            <CalendarDays size={19} />
            Semanas
          </button>

          <button className="menu-item">
            <Settings size={19} />
            Administração
          </button>
        </nav>

        <div className="sidebar-footer">
          <span>FLUXO ACADEMY</span>
          <small>Guild Investment System</small>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">VISÃO GERAL</p>
            <h1>Dashboard</h1>
            <p className="subtitle">
              Acompanhe o desempenho semanal da guilda.
            </p>
          </div>

          <div className="week-selector">
            <span>SEMANA</span>
            <strong>20/09/2026</strong>
          </div>
        </header>

        <section className="stats">
          <article className="stat-card">
            <span>Membros</span>
            <strong>18</strong>
            <small>jogadores registrados</small>
          </article>

          <article className="stat-card">
            <span>Progresso da guilda</span>
            <strong>242,8G</strong>
            <small className="positive">
              <TrendingUp size={14} />
              semana atual
            </small>
          </article>

          <article className="stat-card">
            <span>Média por membro</span>
            <strong>13,49G</strong>
            <small>progresso semanal</small>
          </article>

          <article className="stat-card">
            <span>Membros 2G+</span>
            <strong>14</strong>
            <small className="positive">faixa verde</small>
          </article>

          <article className="stat-card highlight">
            <span>Maior progresso</span>
            <strong>57,5G</strong>
            <small>Oxumaré Shh</small>
          </article>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">DESEMPENHO</p>
              <h2>Ranking semanal</h2>
            </div>

            <button className="view-all">Ver todos</button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>POS.</th>
                  <th>JOGADOR</th>
                  <th>NÍVEL</th>
                  <th>INVESTIMENTO</th>
                  <th>PROGRESSO</th>
                  <th>FAIXA</th>
                </tr>
              </thead>

              <tbody>
                {jogadores.map((jogador, index) => (
                  <tr key={jogador.nome}>
                    <td>
                      <span className={`position position-${index + 1}`}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </td>

                    <td>
                      <strong className="player-name">{jogador.nome}</strong>
                    </td>

                    <td>{jogador.nivel}</td>

                    <td>{jogador.investimento}</td>

                    <td>
                      <strong className="progress-value">
                        +{jogador.progresso}
                      </strong>
                    </td>

                    <td>
                      <span className={`badge ${jogador.faixa}`}>
                        <i />
                        2G+
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="ranges">
          <div className="range-card red">
            <span />
            <div>
              <strong>0 – 250M</strong>
              <small>Faixa vermelha</small>
            </div>
          </div>

          <div className="range-card orange">
            <span />
            <div>
              <strong>251M – 500M</strong>
              <small>Faixa laranja</small>
            </div>
          </div>

          <div className="range-card yellow">
            <span />
            <div>
              <strong>501M – 2G</strong>
              <small>Faixa amarela</small>
            </div>
          </div>

          <div className="range-card green">
            <span />
            <div>
              <strong>2G+</strong>
              <small>Faixa verde</small>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
