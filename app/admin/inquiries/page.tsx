'use client';
import { useEffect, useState } from 'react';
import { api, ApiError, fmt, Inquiry } from '../../../lib/api';
import { useRequire } from '../../../lib/auth';

export default function AdminInquiries() {
  const ok = useRequire('admin');
  const [items, setItems] = useState<Inquiry[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ok) return;
    api<Inquiry[]>('/inquiries').then(setItems).catch((e: ApiError) => { setError(e.message); setItems([]); });
  }, [ok]);

  async function runAi(id: number) {
    setBusyId(id); setErrors({ ...errors, [id]: '' });
    try {
      const q = await api<Inquiry>(`/inquiries/${id}/ai`, { method: 'POST' });
      setItems((cur) => cur!.map((x) => (x.id === id ? { ...x, ai_summary: q.ai_summary, ai_category: q.ai_category, ai_reply_draft: q.ai_reply_draft } : x)));
    } catch (e) { setErrors({ ...errors, [id]: (e as ApiError).message }); }
    finally { setBusyId(null); }
  }

  if (!ok) return <p className="muted">확인 중이에요…</p>;
  return (
    <>
      <h1>문의 · AI 정리</h1>
      <p className="muted">"AI로 정리"를 누르면 요약, 분류, 답장 초안을 만들어 줘요. 초안은 꼭 확인한 뒤 사용하세요.</p>
      {error && <div className="alert">{error}</div>}
      {items === null && <p className="muted">불러오는 중이에요…</p>}
      {items?.map((q) => (
        <div key={q.id} className="card">
          <div className="muted">{q.user?.name} · {q.equipment?.name || '장비 미지정'} · {fmt(q.created_at)}</div>
          <p style={{ whiteSpace: 'pre-wrap' }}>{q.content}</p>
          {q.ai_summary ? (
            <div className="ai">
              <div><span className="badge doing">{q.ai_category}</span> <strong>요약</strong></div>
              <p>{q.ai_summary}</p>
              <strong>답장 초안</strong>
              <p style={{ whiteSpace: 'pre-wrap' }}>{q.ai_reply_draft}</p>
            </div>
          ) : null}
          {errors[q.id] && <div className="alert">{errors[q.id]}</div>}
          <button className="btn ghost" disabled={busyId === q.id} onClick={() => runAi(q.id)}>
            {busyId === q.id ? 'AI가 읽는 중…' : q.ai_summary ? '다시 정리' : 'AI로 정리'}
          </button>
        </div>
      ))}
    </>
  );
}
