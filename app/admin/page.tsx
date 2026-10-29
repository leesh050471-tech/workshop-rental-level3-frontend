'use client';
import { useEffect, useState } from 'react';
import { api, ApiError } from '../../lib/api';
import { useRequire } from '../../lib/auth';

type Stats = { todayReservations: number; availableEquipment: number; brokenEquipment: number };

export default function Admin() {
  const ok = useRequire('admin');
  const [s, setS] = useState<Stats | null>(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api<Stats>('/stats').then(setS).catch((e: ApiError) => setError(e.message));
  useEffect(() => { if (ok) load(); }, [ok]);

  async function reseed() {
    if (!confirm('모든 데이터를 지우고 가상 데이터로 다시 채울까요?')) return;
    setBusy(true); setMsg(''); setError('');
    try { const r = await api<{ message: string }>('/admin/reseed', { method: 'POST' }); setMsg(r.message); await load(); }
    catch (e) { setError((e as ApiError).message); }
    finally { setBusy(false); }
  }

  if (!ok) return <p className="muted">확인 중이에요…</p>;
  const Box = ({ label, value }: { label: string; value?: number }) => (
    <div className="card stat"><div className="muted">{label}</div><div className="num">{value ?? '–'}</div></div>
  );
  return (
    <>
      <h1>오늘의 현황</h1>
      {error && <div className="alert">{error}</div>}
      <div className="grid3">
        <Box label="오늘 대여 수" value={s?.todayReservations} />
        <Box label="사용 가능한 장비" value={s?.availableEquipment} />
        <Box label="고장 난 장비" value={s?.brokenEquipment} />
      </div>
      <div className="card">
        <strong>가상 데이터</strong>
        <p className="muted">데이터가 이상해졌을 때 처음 상태로 되돌립니다. 장비·예약·문의가 모두 초기화돼요.</p>
        {msg && <div className="ok">{msg}</div>}
        <button className="btn ghost" onClick={reseed} disabled={busy}>{busy ? '채우는 중…' : '가상 데이터 다시 채우기'}</button>
      </div>
    </>
  );
}
