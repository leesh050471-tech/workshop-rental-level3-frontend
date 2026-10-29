'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, ApiError, Equipment } from '../lib/api';
import { useRequire } from '../lib/auth';

const CATS = ['3D프린터', '레이저', '재봉', '목공', '기타'];

export default function Home() {
  const ok = useRequire();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [items, setItems] = useState<Equipment[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ok) return;
    const t = setTimeout(() => {
      const p = new URLSearchParams();
      if (q.trim()) p.set('q', q.trim());
      if (category) p.set('category', category);
      api<Equipment[]>('/equipment?' + p.toString())
        .then((d) => { setItems(d); setError(''); })
        .catch((e: ApiError) => { setError(e.message); setItems([]); });
    }, 250);
    return () => clearTimeout(t);
  }, [ok, q, category]);

  if (!ok) return <p className="muted">확인 중이에요…</p>;
  return (
    <>
      <h1>장비 목록</h1>
      <div className="row" style={{ margin: '8px 0' }}>
        <input style={{ maxWidth: 260 }} placeholder="장비 이름 검색" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="chips">
        <button className={'chip' + (!category ? ' on' : '')} onClick={() => setCategory('')}>전체</button>
        {CATS.map((c) => <button key={c} className={'chip' + (category === c ? ' on' : '')} onClick={() => setCategory(c)}>{c}</button>)}
      </div>
      {error && <div className="alert">{error}</div>}
      {items === null && !error && <p className="muted">불러오는 중이에요… (첫 접속은 1분 가까이 걸릴 수 있어요)</p>}
      {items && items.length === 0 && !error && <p className="muted">조건에 맞는 장비가 없어요.</p>}
      <div className="grid">
        {items?.map((e) => (
          <Link key={e.id} href={`/equipment/${e.id}`} className="card">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <strong>{e.name}</strong>
              <span className={'badge ' + (e.status === '고장' ? 'new' : 'done')}>{e.status}</span>
            </div>
            <div className="muted">{e.category}</div>
            <div className="muted">{e.description}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
