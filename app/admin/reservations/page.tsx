'use client';
import { useEffect, useState } from 'react';
import { api, ApiError, fmtRange, Reservation } from '../../../lib/api';
import { useRequire } from '../../../lib/auth';

export default function AdminReservations() {
  const ok = useRequire('admin');
  const [items, setItems] = useState<Reservation[] | null>(null);
  const [error, setError] = useState('');

  const load = () => api<Reservation[]>('/reservations').then(setItems).catch((e: ApiError) => { setError(e.message); setItems([]); });
  useEffect(() => { if (ok) load(); }, [ok]);

  async function cancel(id: number) {
    if (!confirm('이 예약을 취소할까요?')) return;
    setError('');
    try { await api(`/reservations/${id}`, { method: 'DELETE' }); await load(); }
    catch (e) { setError((e as ApiError).message); }
  }

  if (!ok) return <p className="muted">확인 중이에요…</p>;
  const now = Date.now();
  return (
    <>
      <h1>전체 대여</h1>
      {error && <div className="alert">{error}</div>}
      {items === null && <p className="muted">불러오는 중이에요…</p>}
      {items?.map((r) => {
        const active = r.status === '예약됨' && new Date(r.end_at).getTime() > now;
        return (
          <div key={r.id} className="card row" style={{ justifyContent: 'space-between' }}>
            <div>
              <strong>{r.equipment?.name}</strong> <span className="muted">· {r.user?.name}</span>
              <div className="muted">{fmtRange(r.start_at, r.end_at)}</div>
            </div>
            <div className="row">
              <span className={'badge ' + (r.status === '취소됨' ? 'new' : active ? 'doing' : 'done')}>{r.status === '취소됨' ? '취소됨' : active ? '예약됨' : '이용 완료'}</span>
              {active && <button className="btn ghost" onClick={() => cancel(r.id)}>취소</button>}
            </div>
          </div>
        );
      })}
    </>
  );
}
