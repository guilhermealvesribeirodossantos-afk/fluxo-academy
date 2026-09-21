import React, { useMemo, useState } from "react";
import {
  LayoutDashboard, Users, Trophy, CalendarDays, Settings,
  ChevronRight, Search, Save, RotateCcw, UserRound, WalletCards
} from "lucide-react";

const dadosIniciais = [
  ["Blackfire",93,1455929760600,22500000000],["Oxumaré Shh",83,1553897374500,57500000000],
  ["dgr",85,1550143210600,40300000000],["HOTFIRE",93,804389760600,19900000000],
  ["Gody",80,628979760600,20000000000],["Vendedora",82,472588561213,32950000000],
  ["Souza",68,311342947520,5601500000],["Pozo80",81,255819760600,7800000000],
  ["Yuber",77,203203760600,11750000000],["Maxx Snow",86,967789760600,22800000000],
  ["BlackRose",85,643789760600,4800000000],["Ottered",79,326027374500,11530000000],
  ["Bruno",78,305019760600,27700000000],["Ebenézer",77,216123010600,35856000000],
  ["Clebimho",70,207041758140,16790000000],["Nyx",72,169884252900,9082000000],
  ["Lud",75,143475760600,1800000000],["DrSchuvaz",69,122964790600,9910000000],
  ["TUTU DKS",70,81354260600,4410686100],["Quel",71,74391760600,5098000000],
].map(([nome,nivel,investimento,progresso],id)=>({
  id:id+1,nome,nivel,investimento,progresso,
  investimentoAnterior:Math.max(0,investimento-progresso)
}));

const formatar = v => new Intl.NumberFormat("pt-BR").format(Math.round(Number(v)||0));
const limparNumero = v => Number(String(v).replace(/\D/g,"")) || 0;
const faixa = p => p>=2000000000?["2G+","green"]:p>=501000000?["501M – 2G","yellow"]:p>=251000000?["251M – 500M","orange"]:["0 – 250M","red"];

function Sidebar({pagina,setPagina}) {
  const itens=[
    ["dashboard","Dashboard",LayoutDashboard],
    ["membros","Membros",Users],
    ["ranking","Ranking",Trophy],
    ["semanas","Semanas",CalendarDays],
    ["administracao","Administração",Settings],
  ];
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark">FA</div><div className="brand-copy"><strong>FLUXO</strong><span>ACADEMY</span></div></div>
    <div className="brand-caption">Guild Investment System</div>
    <nav className="menu">
      {itens.map(([id,label,Icon])=><button key={id} onClick={()=>setPagina(id)} className={`menu-item ${pagina===id?"active":""}`}><Icon size={19}/>{label}</button>)}
    </nav>
    <div className="sidebar-bottom"><p>“Disciplina constrói resultados.”</p><strong>FLUXO ACADEMY</strong><span>MMXXVI</span></div>
  </aside>
}

function Dashboard({jogadores}) {
  const [busca,setBusca]=useState("");
  const ranking=useMemo(()=>[...jogadores].sort((a,b)=>b.progresso-a.progresso),[jogadores]);
  const filtrados=ranking.filter(j=>j.nome.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR")));
  const total=jogadores.reduce((s,j)=>s+j.progresso,0);
  const media=jogadores.length?Math.round(total/jogadores.length):0;
  const membros2G=jogadores.filter(j=>j.progresso>=2000000000).length;

  return <>
    <header className="topbar">
      <div><p className="eyebrow">VISÃO GERAL</p><h1>Dashboard</h1><p className="subtitle">Acompanhe o desempenho semanal da guilda.</p></div>
      <div className="week-selector"><CalendarDays size={18}/><div><span>SEMANA ATUAL</span><strong>20/09/2026</strong></div></div>
    </header>

    <section className="stats">
      <article className="stat-card"><span>MEMBROS</span><strong>{jogadores.length}</strong><small>jogadores registrados</small></article>
      <article className="stat-card"><span>PROGRESSO TOTAL</span><strong>{formatar(total)}</strong><small>progresso da semana</small></article>
      <article className="stat-card"><span>MÉDIA POR MEMBRO</span><strong>{formatar(media)}</strong><small>média de progresso</small></article>
      <article className="stat-card"><span>MEMBROS 2G+</span><strong>{membros2G}</strong><small>na faixa 2G+</small></article>
      <article className="stat-card"><span>MAIOR PROGRESSO</span><strong>{formatar(ranking[0]?.progresso||0)}</strong><small>{ranking[0]?.nome||"-"}</small></article>
    </section>

    <section className="panel">
      <div className="panel-header">
        <div className="panel-title"><Trophy size={23}/><div><p className="eyebrow">DESEMPENHO</p><h2>Ranking semanal</h2><span>Classificação por progresso da semana atual</span></div></div>
        <div className="panel-actions"><label className="search"><Search size={15}/><input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar jogador"/></label><button className="view-all">Ver todos <ChevronRight size={15}/></button></div>
      </div>
      <div className="table-wrapper"><table><thead><tr><th>POS.</th><th>JOGADOR</th><th>NÍVEL</th><th>INVESTIMENTO</th><th>PROGRESSO</th><th>FAIXA</th></tr></thead>
        <tbody>{filtrados.map(j=>{const pos=ranking.findIndex(x=>x.id===j.id)+1;const [texto,classe]=faixa(j.progresso);return <tr key={j.id}>
          <td><span className={`position position-${pos}`}>{String(pos).padStart(2,"0")}</span></td><td><strong className="player-name">{j.nome}</strong></td><td>{j.nivel}</td>
          <td className="number">{formatar(j.investimento)}</td><td className="number progress-value">+{formatar(j.progresso)}</td><td><span className={`badge ${classe}`}><i/>{texto}</span></td>
        </tr>})}</tbody>
      </table></div>
    </section>

    <section className="ranges">
      <div className="range-card red"><span/><div><strong>0 – 250M</strong><small>Faixa vermelha</small></div></div>
      <div className="range-card orange"><span/><div><strong>251M – 500M</strong><small>Faixa laranja</small></div></div>
      <div className="range-card yellow"><span/><div><strong>501M – 2G</strong><small>Faixa amarela</small></div></div>
      <div className="range-card green"><span/><div><strong>2G+</strong><small>Faixa verde</small></div></div>
    </section>
  </>;
}

function Administracao({jogadores,setJogadores}) {
  const [busca,setBusca]=useState("");
  const [selecionado,setSelecionado]=useState(jogadores[0]?.id||null);
  const atual=jogadores.find(j=>j.id===selecionado)||jogadores[0];
  const [form,setForm]=useState(atual?{nome:atual.nome,nivel:String(atual.nivel),investimento:String(atual.investimento)}:{nome:"",nivel:"",investimento:""});
  const [mensagem,setMensagem]=useState("");

  const selecionar=j=>{
    setSelecionado(j.id);
    setForm({nome:j.nome,nivel:String(j.nivel),investimento:String(j.investimento)});
    setMensagem("");
  };
  const anterior=atual?.investimentoAnterior||0;
  const novoInvest=limparNumero(form.investimento);
  const novoProgresso=Math.max(0,novoInvest-anterior);
  const [textoFaixa,classeFaixa]=faixa(novoProgresso);
  const lista=jogadores.filter(j=>j.nome.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR")));

  const cancelar=()=>atual&&setForm({nome:atual.nome,nivel:String(atual.nivel),investimento:String(atual.investimento)});
  const salvar=()=>{
    if(!atual||!form.nome.trim()) return;
    const nivel=Math.max(1,limparNumero(form.nivel));
    setJogadores(prev=>prev.map(j=>j.id===atual.id?{...j,nome:form.nome.trim(),nivel,investimento:novoInvest,progresso:novoProgresso}:j));
    setMensagem("Alteração salva nesta sessão.");
  };

  return <>
    <header className="topbar">
      <div><p className="eyebrow">GESTÃO DA GUILDA</p><h1>Administração</h1><p className="subtitle">Atualize nível e investimento dos membros com cálculo automático do progresso.</p></div>
      <div className="week-selector"><CalendarDays size={18}/><div><span>SEMANA EM EDIÇÃO</span><strong>20/09/2026</strong></div></div>
    </header>

    <section className="admin-layout">
      <div className="admin-list panel">
        <div className="admin-list-head"><div><p className="eyebrow">MEMBROS</p><h2>Selecionar jogador</h2></div><span>{jogadores.length}</span></div>
        <label className="search admin-search"><Search size={15}/><input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar jogador"/></label>
        <div className="member-list">
          {lista.map(j=><button key={j.id} onClick={()=>selecionar(j)} className={`member-row ${j.id===atual?.id?"selected":""}`}>
            <div className="member-avatar">{j.nome.slice(0,2).toUpperCase()}</div>
            <div><strong>{j.nome}</strong><span>Nível {j.nivel}</span></div>
            <ChevronRight size={15}/>
          </button>)}
        </div>
      </div>

      <div className="admin-editor panel">
        <div className="editor-head"><div className="editor-icon"><Settings size={21}/></div><div><p className="eyebrow">EDIÇÃO</p><h2>{atual?.nome||"Jogador"}</h2><span>Os dados serão usados no ranking da semana atual.</span></div></div>

        <div className="form-grid">
          <label className="field field-wide"><span><UserRound size={14}/>Nome do jogador</span><input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})}/></label>
          <label className="field"><span>Nível</span><input inputMode="numeric" value={form.nivel} onChange={e=>setForm({...form,nivel:e.target.value.replace(/\D/g,"")})}/></label>
          <label className="field"><span><WalletCards size={14}/>Investimento atual</span><input inputMode="numeric" value={form.investimento} onChange={e=>setForm({...form,investimento:e.target.value.replace(/\D/g,"")})}/><small>{formatar(novoInvest)}</small></label>
        </div>

        <div className="calculation">
          <div><span>INVESTIMENTO ANTERIOR</span><strong>{formatar(anterior)}</strong></div>
          <div className="calc-arrow">→</div>
          <div><span>NOVO INVESTIMENTO</span><strong>{formatar(novoInvest)}</strong></div>
          <div className="calc-result"><span>PROGRESSO CALCULADO</span><strong>+{formatar(novoProgresso)}</strong></div>
        </div>

        <div className="preview-row">
          <div><span>FAIXA AUTOMÁTICA</span><span className={`badge ${classeFaixa}`}><i/>{textoFaixa}</span></div>
          <p>O progresso é calculado pela diferença entre o investimento atual e o valor registrado na semana anterior.</p>
        </div>

        {mensagem&&<div className="save-message">{mensagem}</div>}

        <div className="editor-actions">
          <button className="secondary-btn" onClick={cancelar}><RotateCcw size={15}/>Cancelar alterações</button>
          <button className="primary-btn" onClick={salvar}><Save size={15}/>Salvar alteração</button>
        </div>
      </div>
    </section>

    <div className="admin-note"><strong>IMPORTANTE:</strong> nesta etapa, as alterações permanecem somente enquanto a página estiver aberta. Na etapa do Supabase, o salvamento será permanente e separado por semana.</div>
  </>;
}

export default function App(){
  const [pagina,setPagina]=useState("dashboard");
  const [jogadores,setJogadores]=useState(dadosIniciais);
  return <div className="app">
    <Sidebar pagina={pagina} setPagina={setPagina}/>
    <main className="content">
      {pagina==="administracao"?<Administracao jogadores={jogadores} setJogadores={setJogadores}/>:<Dashboard jogadores={jogadores}/>}
      <footer className="footer"><span><strong>FLUXO ACADEMY</strong> · Guild Investment System</span><span>Foco · Evolução · Resultado</span></footer>
    </main>
  </div>;
}
