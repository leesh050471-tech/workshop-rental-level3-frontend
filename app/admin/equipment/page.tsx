'use client';
import { FormEvent, useEffect, useState } from 'react';
import { api, ApiError, Equipment } from '../../../lib/api';
import { useRequire } from '../../../lib/auth';

const CATS = ['3D프린터', '레이저', '재봉', '목공', '기타'];

export default function AdminEquipment() {
  const ok = useRequire('admin');
  const [items, setItems] = useState<Equipment[]>([]);
  const [form, setForm] = useState({ name: '', category: '3D프린터', description: '' });
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const load = () => api<Equipment[]>('/equipment').then(setItems).catch((e: ApiError) => setError(e.message));
  useEffect(() => { if (ok) load(); }, [ok]);

  async function add(e: FormEvent) {
    e.preventDefault();
    setError(''); setFields({});
    try { await api('/equipment', { method: 'POST', body: JSON.stringify(form) }); setForm({ ...form, name: '', description: '' }); load(); }
    catch (x) { setError((x as ApiError).message); setFields((x as ApiError).fields || {}); }
  }
  async function toggle(e: Equipment) {
    setError('');
    try { await api(`/equipment/${e.id}`, { method: 'PATCH', body: JSON.stringify({ status: e.status === '고장' ? '사용가능' : '고장' }) }); load(); }
    catch (x) { setError((x as ApiError).message); }
  }

  if (!ok) return <p className="muted">확인 중이에요…</p>;
  return (
    <>
      <h1>장비 관리</h1>
      <form className="card" onSubmit={add} noValidate>
        <strong>장비 등록</strong>
        <label>이름</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        {fields.name && <div className="err">{fields.name}</div>}
        <label>종류</label>
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
        <label>설명</label>
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        {error && <div className="alert">{error}</div>}
        <p><button className="btn">등록</button></p>
      </form>
      {items.map((e) => (
        <div key={e.id} className="card row" style={{ justifyContent: 'space-between' }}>
          <div><strong>{e.name}</strong> <span className="muted">{e.category}</span><div className="muted">{e.description}</div></div>
          <div className="row">
            <span className={'badge ' + (e.status === '고장' ? 'new' : 'done')}>{e.status}</span>
            <button className="btn ghost" onClick={() => toggle(e)}>{e.status === '고장' ? '사용가능으로' : '고장으로'}</button>
          </div>
        </div>
      ))}
    </>
  );
}
