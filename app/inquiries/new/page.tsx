'use client';
import { FormEvent, useEffect, useState } from 'react';
import { api, ApiError, Equipment, Inquiry } from '../../../lib/api';
import { useRequire } from '../../../lib/auth';

export default function NewInquiry() {
  const ok = useRequire('member');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [equipmentId, setEquipmentId] = useState('');
  const [content, setContent] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [mine, setMine] = useState<Inquiry[]>([]);

  const loadMine = () => api<Inquiry[]>('/inquiries/mine').then(setMine).catch(() => {});
  useEffect(() => {
    if (!ok) return;
    api<Equipment[]>('/equipment').then(setEquipment).catch(() => {});
    loadMine();
  }, [ok]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(''); setFields({}); setDone(false);
    try {
      await api('/inquiries', { method: 'POST', body: JSON.stringify({ content, equipment_id: equipmentId ? Number(equipmentId) : undefined }) });
      setContent(''); setEquipmentId(''); setDone(true); loadMine();
    } catch (x) { setError((x as ApiError).message); setFields((x as ApiError).fields || {}); }
  }

  if (!ok) return <p className="muted">확인 중이에요…</p>;
  return (
    <>
      <h1>문의하기</h1>
      <form className="card" onSubmit={submit} noValidate>
        <label>관련 장비 (선택)</label>
        <select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)}>
          <option value="">선택 안 함</option>
          {equipment.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <label>문의 내용</label>
        <textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="고장, 사용법 등 무엇이든 적어 주세요." />
        {fields.content && <div className="err">{fields.content}</div>}
        {error && !fields.content && <div className="alert">{error}</div>}
        {done && <div className="ok">문의를 보냈어요. 관리자가 확인한 뒤 답해 드릴게요.</div>}
        <p><button className="btn">보내기</button></p>
      </form>
      <h2 style={{ fontSize: 18 }}>내가 보낸 문의</h2>
      {mine.length === 0 && <p className="muted">보낸 문의가 없어요.</p>}
      {mine.map((q) => (
        <div key={q.id} className="card">
          <div className="muted">{q.equipment?.name || '장비 미지정'}</div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{q.content}</div>
        </div>
      ))}
    </>
  );
}
