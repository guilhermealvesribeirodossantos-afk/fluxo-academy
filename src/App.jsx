import React, { useMemo, useState } from "react";
import { LayoutDashboard, Users, Trophy, CalendarDays, Settings, ChevronRight, Search } from "lucide-react";

const jogadores = [
  ["Blackfire",93,1455929760600,22500000000],
  ["Oxumaré Shh",83,1553897374500,57500000000],
  ["dgr",85,1550143210600,40300000000],
  ["HOTFIRE",93,804389760600,19900000000],
  ["Gody",80,628979760600,20000000000],
  ["Vendedora",82,472588561213,32950000000],
  ["Souza",68,311342947520,5601500000],
  ["Pozo80",81,255819760600,7800000000],
  ["Yuber",77,203203760600,11750000000],
  ["Maxx Snow",86,967789760600,22800000000],
  ["BlackRose",85,643789760600,4800000000],
  ["Ottered",79,326027374500,11530000000],
  ["Bruno",78,305019760600,27700000000],
  ["Ebenézer",77,216123010600,35856000000],
  ["Clebimho",70,207041758140,16790000000],
  ["Nyx",72,169884252900,9082000000],
  ["Lud",75,143475760600,1800000000],
  ["DrSchuvaz",69,122964790600,9910000000],
  ["TUTU DKS",70,81354260600,4410686100],
  ["Quel",71,74391760600,5098000000],
].map(([nome,nivel,investimento,progresso])=>({nome,nivel,investimento,progresso}));

const formatar = v => new Intl.NumberFormat("pt-BR").format(v);
const faixa = p => p>=2000000000?["2G+","green"]:p>=501000000?["501M – 2G","yellow"]:p>=251000000?["251M – 500M","orange"]:["0 – 250M","red"];

export default function App() {
  const [busca,setBusca] = useState("");
  const ranking = useMemo(()=>[...jogadores].sort((a,b)=>b.progresso-a.progresso),[]);
  const filtrados = ranking.filter(j=>j.nome.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR")));
  const total = jogadores.reduce((s,j)=>s+j.progresso,0);
  const media = Math.round(total/jogadores.length);
  const membros2G = jogadores.filter(j=>j.progresso>=2000000000).length;

  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">FA</div><div className="brand-copy"><strong>FLUXO</strong><span>ACADEMY</span></div></div>
      <div className="brand-caption">Guild Investment System</div>
      <nav className="menu">
        <button className="menu-item active"><LayoutDashboard size={19}/>Dashboard</button>
        <button className="menu-item"><Users size={19}/>Membros</button>
        <button className="menu-item"><Trophy size={19}/>Ranking</button>
        <button className="menu-item"><CalendarDays size={19}/>Semanas</button>
        <button className="menu-item"><Settings size={19}/>Administração</button>
      </nav>
      <div className="sidebar-bottom"><p>“Disciplina constrói resultados.”</p><strong>FLUXO ACADEMY</strong><span>MMXXVI</span></div>
    </aside>

    <main className="content">
      <header className="topbar">
        <div><p className="eyebrow">VISÃO GERAL</p><h1>Dashboard</h1><p className="subtitle">Acompanhe o desempenho semanal da guilda.</p></div>
        <div className="week-selector"><CalendarDays size={18}/><div><span>SEMANA ATUAL</span><strong>20/09/2026</strong></div></div>
      </header>

      <section className="stats">
        <article className="stat-card"><span>MEMBROS</span><strong>{jogadores.length}</strong><small>jogadores registrados</small></article>
        <article className="stat-card"><span>PROGRESSO TOTAL</span><strong>{formatar(total)}</strong><small>progresso da semana</small></article>
        <article className="stat-card"><span>MÉDIA POR MEMBRO</span><strong>{formatar(media)}</strong><small>média de progresso</small></article>
        <article className="stat-card"><span>MEMBROS 2G+</span><strong>{membros2G}</strong><small>na faixa 2G+</small></article>
        <article className="stat-card"><span>MAIOR PROGRESSO</span><strong>{formatar(ranking[0].progresso)}</strong><small>{ranking[0].nome}</small></article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div className="panel-title"><Trophy size={23}/><div><p className="eyebrow">DESEMPENHO</p><h2>Ranking semanal</h2><span>Classificação por progresso da semana atual</span></div></div>
          <div className="panel-actions">
            <label className="search"><Search size={15}/><input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar jogador"/></label>
            <button className="view-all">Ver todos <ChevronRight size={15}/></button>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>POS.</th><th>JOGADOR</th><th>NÍVEL</th><th>INVESTIMENTO</th><th>PROGRESSO</th><th>FAIXA</th></tr></thead>
            <tbody>{filtrados.map(j=>{
              const pos=ranking.findIndex(x=>x.nome===j.nome)+1;
              const [texto,classe]=faixa(j.progresso);
              return <tr key={j.nome}>
                <td><span className={`position position-${pos}`}>{String(pos).padStart(2,"0")}</span></td>
                <td><strong className="player-name">{j.nome}</strong></td>
                <td>{j.nivel}</td>
                <td className="number">{formatar(j.investimento)}</td>
                <td className="number progress-value">+{formatar(j.progresso)}</td>
                <td><span className={`badge ${classe}`}><i/>{texto}</span></td>
              </tr>
            })}</tbody>
          </table>
        </div>
      </section>

      <section className="ranges">
        <div className="range-card red"><span/><div><strong>0 – 250M</strong><small>Faixa vermelha</small></div></div>
        <div className="range-card orange"><span/><div><strong>251M – 500M</strong><small>Faixa laranja</small></div></div>
        <div className="range-card yellow"><span/><div><strong>501M – 2G</strong><small>Faixa amarela</small></div></div>
        <div className="range-card green"><span/><div><strong>2G+</strong><small>Faixa verde</small></div></div>
      </section>

      <footer className="footer"><span><strong>FLUXO ACADEMY</strong> · Guild Investment System</span><span>Foco · Evolução · Resultado</span></footer>
    </main>
  </div>;
}
