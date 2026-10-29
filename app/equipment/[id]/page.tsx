'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { api, ApiError, Equipment, fmtRange } from '../../../lib/api';
import { useAuth, useRequire } from '../../../lib/auth';

const today = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);

export default function EquipmentDetail() {
  const ok = useRequire();
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [e, setE] = useState<Equipment | null>(null);
  const [form, setForm] = useState({ date: today(), start_hour: '10', hours: '2' });
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState('');

  const load = () => api<Equipment>(`/equipment/${id}`).then(setE).catch((x: ApiError) => setLoadError(x.message));
  useEffect(() => { if (ok) load(); }, [ok, id]);

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    setBusy(true); setError(''); setFields({});
    try {
      await api('/reservations', {
        method: 'POST',
        body: JSON.stringify({ equipment_id: Number(id), date: form.date, start_hour: Number(form.start_hour), hours: Number(form.hours) }),
      });
      router.push('/my');
    } catch (x) {
      const a = x as ApiError;
      setError(a.message); setFields(a.fields || {});
      load();
    } finally { setBusy(false); }
  }

  if (!ok) return <p className="muted">확인 중이에요…</p>;
  if (loadError) return <><Link href="/">← 목록으로</Link><div className="alert">{loadError}</div></>;
  if (!e) return <p className="muted">불러오는 중이에요…</p>;

  const set = (k: string) => (ev: { target: { value: string } }) => setForm({ ...form, [k]: ev.target.value });
  const hoursOpts = Array.from({ length: 12 }, (_, i) => 9 + i);

  return (
    <>
      <Link href="/">← 목록으로</Link>
      <div className="card" style={{ marginTop: 12 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1>{e.name}</h1>
          <span className={'badge ' + (e.status === '고장' ? 'new' : 'done')}>{e.status}</span>
        </div>
        <div className="muted">{e.category}</div>
        <p>{e.description}</p>
      </div>

      <div className="card">
        <strong>이미 예약된 시간</strong>
        {e.booked && e.booked.length > 0 ? (
          <ul>{e.booked.map((b) => <li key={b.id}>{fmtRange(b.start_at, b.end_at)}</li>)}</ul>
        ) : <p className="muted">아직 예약이 없어요.</p>}
      </div>

      {user?.role === 'member' ? (
        <form className="card" onSubmit={submit} noValidate>
          <strong>대여 신청</strong>
          <p className="muted">09시~21시, 오늘부터 7일 안, 1~4시간, 한 사람당 동시에 2건까지 가능해요.</p>
          <label>날짜</label>
          <input value={form.date} onChange={set('date')} placeholder="2026-10-30" />
          {fields.date && <div className="err">{fields.date}</div>}
          <label>시작 시간</label>
          <select value={form.start_hour} onChange={set('start_hour')}>
            {hoursOpts.map((h) => <option key={h} value={h}>{h}시</option>)}
          </select>
          {fields.start_hour && <div className="err">{fields.start_hour}</div>}
          <label>이용 시간</label>
          <select value={form.hours} onChange={set('hours')}>
            {[1, 2, 3, 4].map((h) => <option key={h} value={h}>{h}시간</option>)}
          </select>
          {fields.hours && <div className="err">{fields.hours}</div>}
          {error && Object.keys(fields).length === 0 && <div className="alert">{error}</div>}
          <p><button className="btn" disabled={busy}>{busy ? '신청 중…' : '대여 신청'}</button></p>
        </form>
      ) : (
        <p className="muted">관리자 계정은 대여 신청을 하지 않아요. 회원 계정으로 로그인해 보세요.</p>
      )}
    </>
  );
}
