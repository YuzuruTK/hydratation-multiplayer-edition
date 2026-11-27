import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowUpRight,
  CupSoda,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Droplets,
  GlassWater,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Settings2,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  UserRound,
  Waves,
  X,
} from 'lucide-react';
import WaterGlass from './components/WaterGlass';
import { loadState, saveState } from './lib/storage';
import type { ContainerKind, PersistedState, User, WaterContainer, WaterLog } from './types';

type MainScreen = 'home' | 'ranking';
type RankingPeriod = 'day' | 'week' | 'month';
type ModalType = 'container' | 'goal' | null;

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
});

const numberFormatter = new Intl.NumberFormat('pt-BR');

function isSameDay(left: string | Date, right: Date): boolean {
  return new Date(left).toDateString() === right.toDateString();
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
}

function formatMl(amount: number): string {
  return numberFormatter.format(Math.round(amount)) + ' ml';
}

function ContainerIcon({ kind }: { kind: ContainerKind }) {
  if (kind === 'bottle') return <CupSoda size={21} strokeWidth={1.8} />;
  if (kind === 'cup') return <Waves size={21} strokeWidth={1.8} />;
  return <GlassWater size={21} strokeWidth={1.8} />;
}

function BrandMark() {
  return (
    <div className="brand-lockup">
      <div className="brand-mark"><Droplets size={22} fill="currentColor" /></div>
      <div><strong>hydratation</strong><span>um gole de cada vez</span></div>
    </div>
  );
}

interface RankingEntry {
  id: string;
  name: string;
  day: number;
  week: number;
  month: number;
  isYou?: boolean;
}

function App() {
  const [state, setState] = useState<PersistedState>(loadState);
  const [screen, setScreen] = useState<MainScreen>('home');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authWeight, setAuthWeight] = useState('70');
  const [authError, setAuthError] = useState('');
  const [modal, setModal] = useState<ModalType>(null);
  const [editingContainer, setEditingContainer] = useState<WaterContainer | null>(null);
  const [containerName, setContainerName] = useState('');
  const [containerAmount, setContainerAmount] = useState('350');
  const [containerKind, setContainerKind] = useState<ContainerKind>('glass');
  const [goalInput, setGoalInput] = useState('2450');
  const [rankingPeriod, setRankingPeriod] = useState<RankingPeriod>('day');
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const today = new Date();
  const todayLogs = useMemo(
    () => state.logs.filter((log) => isSameDay(log.consumedAt, today)).sort(
      (a, b) => new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime(),
    ),
    [state.logs, today.toDateString()],
  );
  const totalToday = todayLogs.reduce((total, log) => total + log.amountMl, 0);
  const goal = state.goalMl;
  const progress = goal > 0 ? (totalToday / goal) * 100 : 0;
  const remaining = Math.max(goal - totalToday, 0);
  const greetingName = state.user?.name.split(' ')[0] ?? 'por aí';

  function updateState(updater: (current: PersistedState) => PersistedState) {
    setState((current) => updater(current));
  }

  function enterDemo() {
    const demoUser: User = {
      id: 'demo-user',
      name: 'Você',
      email: 'demo@hydratation.app',
      weightKg: 70,
      heightCm: 170,
    };
    updateState((current) => ({
      ...current,
      user: demoUser,
      goalMl: current.goalMl || 2450,
    }));
  }

  function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError('');
    if (!authEmail.includes('@') || authPassword.trim().length < 4) {
      setAuthError('Informe um e-mail válido e uma senha com pelo menos 4 caracteres.');
      return;
    }

    const name = authMode === 'register' ? authName.trim() : (authName.trim() || 'Você');
    if (authMode === 'register' && !name) {
      setAuthError('Como podemos chamar você?');
      return;
    }

    const weight = Math.max(30, Math.min(250, Number(authWeight) || 70));
    const newUser: User = {
      id: 'local-' + Date.now(),
      name: name || 'Você',
      email: authEmail.trim().toLowerCase(),
      weightKg: weight,
      heightCm: 170,
    };

    updateState((current) => ({
      ...current,
      user: newUser,
      goalMl: authMode === 'register' ? Math.round(weight * 35) : current.goalMl,
    }));
  }

  function logout() {
    updateState((current) => ({ ...current, user: null }));
    setScreen('home');
  }

  function addWater(container: WaterContainer) {
    const newLog: WaterLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(16).slice(2),
      containerId: container.id,
      containerName: container.name,
      amountMl: container.amountMl,
      consumedAt: new Date().toISOString(),
    };
    updateState((current) => ({ ...current, logs: [...current.logs, newLog] }));
  }

  function deleteLog(logId: string) {
    updateState((current) => ({
      ...current,
      logs: current.logs.filter((log) => log.id !== logId),
    }));
  }

  function openNewContainer() {
    setEditingContainer(null);
    setContainerName('');
    setContainerAmount('350');
    setContainerKind('glass');
    setModal('container');
  }

  function openEditContainer(container: WaterContainer) {
    setEditingContainer(container);
    setContainerName(container.name);
    setContainerAmount(String(container.amountMl));
    setContainerKind(container.kind);
    setModal('container');
  }

  function saveContainer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = containerName.trim();
    const amount = Math.round(Number(containerAmount));
    if (!name || !Number.isFinite(amount) || amount < 1 || amount > 5000) return;

    if (editingContainer) {
      updateState((current) => ({
        ...current,
        containers: current.containers.map((container) => (
          container.id === editingContainer.id
            ? { ...container, name, amountMl: amount, kind: containerKind }
            : container
        )),
      }));
    } else {
      const newContainer: WaterContainer = {
        id: 'container-' + Date.now(),
        name,
        amountMl: amount,
        kind: containerKind,
      };
      updateState((current) => ({ ...current, containers: [...current.containers, newContainer] }));
    }
    setModal(null);
  }

  function removeContainer(containerId: string) {
    updateState((current) => ({
      ...current,
      containers: current.containers.filter((container) => container.id !== containerId),
    }));
  }

  function openGoalModal() {
    setGoalInput(String(state.goalMl));
    setModal('goal');
  }

  function saveGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Math.round(Number(goalInput));
    if (!Number.isFinite(amount) || amount < 300 || amount > 6000) return;
    updateState((current) => ({ ...current, goalMl: amount }));
    setModal(null);
  }

  function refreshRanking() {
    setRefreshing(true);
    setLastRefresh(new Date());
    window.setTimeout(() => setRefreshing(false), 650);
  }

  const rankingRows: RankingEntry[] = [
    { id: 'ana', name: 'Ana Clara', day: 2150, week: 12800, month: 48500 },
    { id: 'lucas', name: 'Lucas Martins', day: 1900, week: 11600, month: 43800 },
    { id: 'marina', name: 'Marina Costa', day: 1650, week: 10900, month: 41200 },
    { id: 'you', name: state.user?.name ?? 'Você', day: totalToday, week: totalToday * 4.2, month: totalToday * 17, isYou: true },
    { id: 'pedro', name: 'Pedro Henrique', day: 950, week: 8200, month: 36800 },
    { id: 'bia', name: 'Beatriz Lima', day: 800, week: 7600, month: 33100 },
  ];
  const sortedRanking = [...rankingRows].sort((a, b) => {
    const amountA = rankingPeriod === 'day' ? a.day : rankingPeriod === 'week' ? a.week : a.month;
    const amountB = rankingPeriod === 'day' ? b.day : rankingPeriod === 'week' ? b.week : b.month;
    return amountB - amountA;
  });

  if (!state.user) {
    return (
      <div className="auth-page">
        <div className="auth-decoration decoration-one" />
        <div className="auth-decoration decoration-two" />
        <div className="auth-panel">
          <div className="auth-brand"><BrandMark /></div>
          <div className="auth-illustration">
            <div className="auth-sun" />
            <div className="auth-glass">
              <div className="auth-glass-water" />
              <span className="auth-glass-shine" />
            </div>
            <div className="auth-drop drop-a">✦</div>
            <div className="auth-drop drop-b">·</div>
          </div>
          <div className="auth-copy">
            <span className="eyebrow">SEU MOMENTO DE PAUSA</span>
            <h1>Pequenos goles.<br /><span>Grandes cuidados.</span></h1>
            <p>Uma ajudinha leve para lembrar de cuidar de você ao longo do dia.</p>
          </div>
          <form className="auth-form" onSubmit={handleAuth}>
            {authMode === 'register' && (
              <label className="field-label">
                Seu nome
                <input value={authName} onChange={(event) => setAuthName(event.target.value)} placeholder="Como podemos chamar você?" autoComplete="name" />
              </label>
            )}
            <label className="field-label">
              E-mail
              <input type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="voce@email.com" autoComplete="email" />
            </label>
            <label className="field-label">
              Senha
              <input type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="Sua senha" autoComplete={authMode === 'register' ? 'new-password' : 'current-password'} />
            </label>
            {authMode === 'register' && (
              <label className="field-label">
                Peso aproximado (kg)
                <input type="number" min="30" max="250" value={authWeight} onChange={(event) => setAuthWeight(event.target.value)} />
                <span className="field-hint">Usaremos apenas para sugerir uma meta inicial.</span>
              </label>
            )}
            {authError && <p className="form-error">{authError}</p>}
            <button className="button button-primary auth-submit" type="submit">
              {authMode === 'register' ? 'Criar minha conta' : 'Entrar'} <ChevronRight size={18} />
            </button>
          </form>
          <div className="auth-switch">
            {authMode === 'login' ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}
            <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}>
              {authMode === 'login' ? 'Criar conta' : 'Fazer login'}
            </button>
          </div>
          <button type="button" className="demo-link" onClick={enterDemo}>Entrar na demonstração <ArrowUpRight size={15} /></button>
          <p className="prototype-note">Protótipo: autenticação e dados ainda são locais neste navegador.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <BrandMark />
        <div className="sidebar-label">MENU</div>
        <nav className="side-nav" aria-label="Navegação principal">
          <button type="button" className={screen === 'home' ? 'nav-item active' : 'nav-item'} onClick={() => setScreen('home')}>
            <GlassWater size={19} /> <span>Minha hidratação</span>
          </button>
          <button type="button" className={screen === 'ranking' ? 'nav-item active' : 'nav-item'} onClick={() => setScreen('ranking')}>
            <Trophy size={19} /> <span>Ranking</span><span className="nav-pill">Ao vivo</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="side-tip">
            <div className="tip-icon"><Sparkles size={17} /></div>
            <strong>Um lembrete gentil</strong>
            <p>Não precisa ser perfeito. Cada gole já conta.</p>
          </div>
          <button type="button" className="nav-item logout-button" onClick={logout}><LogOut size={18} /><span>Sair da conta</span></button>
          <span className="sidebar-version">HYDRATATION · DEMO</span>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-date"><CalendarDays size={17} /><span>{dateFormatter.format(today)}</span></div>
          <div className="topbar-user">
            <div className="avatar">{getInitials(state.user.name)}</div>
            <div className="topbar-user-copy"><strong>{state.user.name}</strong><span>Seu espaço</span></div>
            <button type="button" className="icon-button topbar-logout" aria-label="Sair" onClick={logout}><LogOut size={17} /></button>
          </div>
        </header>

        <main className="main-content">
          {screen === 'home' ? (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">{dateFormatter.format(today).toUpperCase()}</span>
                  <h1>{getGreeting()}, {greetingName} <span className="heading-wave">✦</span></h1>
                  <p>Que tal mais um gole para deixar o dia mais leve?</p>
                </div>
                <button type="button" className="button button-soft" onClick={openGoalModal}><Settings2 size={17} /> Ajustar meta</button>
              </div>

              <section className="hero-grid">
                <div className="hydration-card">
                  <div className="hydration-card-copy">
                    <span className="card-kicker"><span className="kicker-dot" /> SEU PROGRESSO DE HOJE</span>
                    <h2>Você está indo<br /><span>muito bem!</span></h2>
                    <div className="consumed-amount">{formatMl(totalToday)}</div>
                    <div className="goal-caption">de {formatMl(goal)} da sua meta diária</div>
                    <div className="progress-track"><div className="progress-fill" style={{ width: Math.min(progress, 100) + '%' }} /></div>
                    <div className="progress-foot"><strong>{Math.round(progress)}% concluído</strong><span>{remaining > 0 ? formatMl(remaining) + ' restantes' : 'Meta alcançada!'}</span></div>
                    {totalToday >= goal && <div className="goal-reached"><Check size={15} /> Você chegou à sua meta de hoje!</div>}
                  </div>
                  <div className="hydration-visual">
                    <div className="visual-orbit orbit-one" />
                    <div className="visual-orbit orbit-two" />
                    <div className="visual-sparkle sparkle-a">✦</div>
                    <div className="visual-sparkle sparkle-b">✧</div>
                    <WaterGlass progress={progress} consumedMl={totalToday} goalMl={goal} />
                    <div className="glass-label"><Waves size={14} /> cada gole conta</div>
                  </div>
                </div>

                <div className="goal-side-card">
                  <div className="goal-side-top"><div className="goal-icon"><Target size={20} /></div><span>Meta diária</span></div>
                  <strong>{formatMl(goal)}</strong>
                  <p>Uma meta para acompanhar seu ritmo, sem pressão.</p>
                  <div className="goal-side-divider" />
                  <div className="goal-mini-row"><span>Consumo de hoje</span><b>{formatMl(totalToday)}</b></div>
                  <div className="goal-mini-row"><span>Falta completar</span><b className="remaining-value">{formatMl(remaining)}</b></div>
                  <button type="button" className="text-link" onClick={openGoalModal}>Personalizar minha meta <ChevronRight size={15} /></button>
                </div>
              </section>

              <section className="content-section">
                <div className="section-heading">
                  <div><span className="eyebrow">SEM COMPLICAÇÃO</span><h2>Hora de beber água</h2><p>Escolha o recipiente que você usou.</p></div>
                  <span className="section-side-note"><Droplets size={16} /> Registro rápido</span>
                </div>
                <div className="container-grid">
                  {state.containers.map((container) => (
                    <div className="container-card" key={container.id}>
                      <button type="button" className="container-add" onClick={() => addWater(container)} aria-label={'Adicionar ' + formatMl(container.amountMl) + ' com ' + container.name}>
                        <div className={'container-illustration ' + container.kind}><ContainerIcon kind={container.kind} /></div>
                        <strong>{container.name}</strong>
                        <span>{formatMl(container.amountMl)}</span>
                        <span className="add-hint"><Plus size={15} /> Adicionar</span>
                      </button>
                      <div className="container-actions">
                        <button type="button" aria-label={'Editar ' + container.name} onClick={() => openEditContainer(container)}><Pencil size={13} /></button>
                        <button type="button" aria-label={'Excluir ' + container.name} onClick={() => removeContainer(container.id)}><Trash2 size={13} /></button>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="container-card add-container-card" onClick={openNewContainer}>
                    <span className="add-container-icon"><Plus size={22} /></span><strong>Novo recipiente</strong><span>Personalize do seu jeito</span>
                  </button>
                </div>
              </section>

              <section className="content-section activity-section">
                <div className="section-heading activity-heading">
                  <div><span className="eyebrow">SEU DIA EM PEQUENOS GOLES</span><h2>Atividade de hoje</h2></div>
                  <span className="activity-count">{todayLogs.length} {todayLogs.length === 1 ? 'registro' : 'registros'}</span>
                </div>
                {todayLogs.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><GlassWater size={24} /></div>
                    <div><strong>Seu primeiro gole está esperando!</strong><p>Quando você registrar água, ela vai aparecer aqui.</p></div>
                  </div>
                ) : (
                  <div className="activity-list">
                    {todayLogs.map((log) => (
                      <div className="activity-row" key={log.id}>
                        <div className="activity-icon"><Droplets size={18} /></div>
                        <div className="activity-copy"><strong>{log.containerName}</strong><span><Clock3 size={13} /> {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(log.consumedAt))}</span></div>
                        <strong className="activity-amount">+{formatMl(log.amountMl)}</strong>
                        <button type="button" className="activity-delete" aria-label="Remover registro" onClick={() => deleteLog(log.id)}><Trash2 size={15} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            <section className="ranking-page">
              <div className="page-heading">
                <div><span className="eyebrow">UM GOLE DE CADA VEZ, JUNTOS</span><h1>Ranking <span className="heading-wave">✦</span></h1><p>Uma competição saudável para incentivar bons hábitos.</p></div>
                <button type="button" className="button button-soft" onClick={refreshRanking}><RefreshCw size={16} className={refreshing ? 'spin' : ''} /> Atualizar</button>
              </div>
              <div className="ranking-toolbar">
                <div className="period-tabs" role="tablist" aria-label="Período do ranking">
                  <button type="button" role="tab" aria-selected={rankingPeriod === 'day'} className={rankingPeriod === 'day' ? 'period-tab active' : 'period-tab'} onClick={() => setRankingPeriod('day')}>Hoje</button>
                  <button type="button" role="tab" aria-selected={rankingPeriod === 'week'} className={rankingPeriod === 'week' ? 'period-tab active' : 'period-tab'} onClick={() => setRankingPeriod('week')}>Esta semana</button>
                  <button type="button" role="tab" aria-selected={rankingPeriod === 'month'} className={rankingPeriod === 'month' ? 'period-tab active' : 'period-tab'} onClick={() => setRankingPeriod('month')}>Este mês</button>
                </div>
                <span className="ranking-period-note"><CalendarDays size={14} /> {rankingPeriod === 'day' ? shortDateFormatter.format(today) : rankingPeriod === 'week' ? 'Segunda a domingo' : 'Mês atual'}</span>
              </div>

              <div className="podium">
                {[sortedRanking[1], sortedRanking[0], sortedRanking[2]].map((entry, index) => {
                  const place = index === 1 ? 1 : index === 0 ? 2 : 3;
                  const amount = rankingPeriod === 'day' ? entry.day : rankingPeriod === 'week' ? entry.week : entry.month;
                  return (
                    <div className={'podium-item podium-place-' + place} key={entry.id}>
                      <div className="podium-avatar-wrap"><div className={'podium-avatar avatar-place-' + place}>{getInitials(entry.name)}</div><span className="podium-medal">{place === 1 ? '♛' : place === 2 ? '②' : '③'}</span></div>
                      <strong className="podium-name">{entry.name}{entry.isYou ? ' (você)' : ''}</strong>
                      <span className="podium-amount">{formatMl(amount)}</span>
                      <div className="podium-step"><span>{place}</span></div>
                    </div>
                  );
                })}
              </div>

              <div className="ranking-table-card">
                <div className="ranking-table-heading"><div><h2>Classificação geral</h2><p>Somatório de água registrada por cada pessoa.</p></div><span className="people-count"><UserRound size={15} /> {sortedRanking.length} pessoas</span></div>
                <div className="ranking-table">
                  {sortedRanking.map((entry, index) => {
                    const amount = rankingPeriod === 'day' ? entry.day : rankingPeriod === 'week' ? entry.week : entry.month;
                    return (
                      <div className={entry.isYou ? 'ranking-row is-you' : 'ranking-row'} key={entry.id}>
                        <span className={'rank-position ' + (index < 3 ? 'top-rank' : '')}>{String(index + 1).padStart(2, '0')}</span>
                        <div className="rank-avatar">{getInitials(entry.name)}</div>
                        <div className="rank-user"><strong>{entry.name}</strong>{entry.isYou && <span>Essa é sua posição</span>}</div>
                        <strong className="rank-volume">{formatMl(amount)}</strong>
                        {entry.isYou ? <span className="you-badge">VOCÊ</span> : <span className="rank-trend"><ArrowUpRight size={14} /></span>}
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="ranking-footnote"><Sparkles size={14} /> Ranking demonstrativo nesta versão. Os valores serão compartilhados entre usuários quando o backend estiver conectado.</p>
              {lastRefresh && <span className="refresh-label">Atualizado às {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(lastRefresh)}</span>}
            </section>
          )}
        </main>
        <footer className="app-footer"><span>Feito com cuidado <span className="footer-heart">♥</span></span><span>HYDRATATION · PROTÓTIPO</span></footer>
      </div>

      {modal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-heading">
              <div><span className="eyebrow">{modal === 'goal' ? 'SEU RITMO, SUAS REGRAS' : 'PERSONALIZE SEU DIA'}</span><h2 id="modal-title">{modal === 'goal' ? 'Ajustar meta diária' : editingContainer ? 'Editar recipiente' : 'Novo recipiente'}</h2></div>
              <button type="button" className="icon-button" aria-label="Fechar" onClick={() => setModal(null)}><X size={19} /></button>
            </div>
            {modal === 'goal' ? (
              <form className="modal-form" onSubmit={saveGoal}>
                <label className="field-label">Sua meta diária (ml)<input type="number" min="300" max="6000" step="50" value={goalInput} onChange={(event) => setGoalInput(event.target.value)} autoFocus /></label>
                <div className="modal-tip"><Target size={18} /><p>Uma estimativa inicial simples é 35 ml por kg de peso. Você pode ajustar esse valor como preferir; ele não substitui orientação profissional.</p></div>
                <div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setModal(null)}>Cancelar</button><button type="submit" className="button button-primary"><Check size={16} /> Salvar meta</button></div>
              </form>
            ) : (
              <form className="modal-form" onSubmit={saveContainer}>
                <label className="field-label">Nome do recipiente<input value={containerName} onChange={(event) => setContainerName(event.target.value)} placeholder="Ex.: Minha garrafa" autoFocus maxLength={32} required /></label>
                <label className="field-label">Capacidade (ml)<input type="number" min="1" max="5000" value={containerAmount} onChange={(event) => setContainerAmount(event.target.value)} required /></label>
                <div className="field-label">Tipo de recipiente
                  <div className="kind-options">
                    <button type="button" className={containerKind === 'glass' ? 'kind-option selected' : 'kind-option'} onClick={() => setContainerKind('glass')}><GlassWater size={20} /> Copo</button>
                    <button type="button" className={containerKind === 'bottle' ? 'kind-option selected' : 'kind-option'} onClick={() => setContainerKind('bottle')}><CupSoda size={20} /> Garrafa</button>
                    <button type="button" className={containerKind === 'cup' ? 'kind-option selected' : 'kind-option'} onClick={() => setContainerKind('cup')}><Waves size={20} /> Outro</button>
                  </div>
                </div>
                <p className="field-hint">Alterar ou excluir um recipiente não modifica os registros anteriores.</p>
                <div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setModal(null)}>Cancelar</button><button type="submit" className="button button-primary"><Check size={16} /> Salvar recipiente</button></div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
