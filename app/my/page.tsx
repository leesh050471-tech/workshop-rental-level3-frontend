'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, ApiError, fmtRange, Reservation } from '../../lib/api';
import { useRequire } from '../../lib/auth';

export default function My() {
  const ok = useRequire('member');
  const [items, setItems] = useState<Reservation[] | null>(null);
  const [error, setError] = useState('');

  const load = () => api<Reservation[]>('/reservations/mine').then(setItems).catch((e: ApiError) => { setError(e.message); setItems([]); });
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
      <h1>내 대여</h1>
      {error && <div className="alert">{error}</div>}
      {items === null && <p className="muted">불러오는 중이에요…</p>}
      {items && items.length === 0 && <p className="muted">대여 내역이 없어요. <Link href="/">장비 보러 가기</Link></p>}
      {items?.map((r) => {
        const ended = new Date(r.end_at).getTime() <= now;
        const label = r.status === '취소됨' ? '취소됨' : ended ? '이용 완료' : '예약됨';
        return (
          <div key={r.id} className="card">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <strong>{r.equipment?.name}</strong>
              <span className={'badge ' + (label === '예약됨' ? 'doing' : label === '이용 완료' ? 'done' : 'new')}>{label}</span>
            </div>
            <div className="muted">{fmtRange(r.start_at, r.end_at)}</div>
            {label === '예약됨' && <p><button className="btn ghost" onClick={() => cancel(r.id)}>예약 취소</button></p>}
          </div>
        );
      })}
    </>
  );
}
