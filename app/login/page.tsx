'use client';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { api, ApiError, User } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const r = await api<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      login(r.token, r.user);
      router.push(r.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError((err as ApiError).message);
    } finally { setBusy(false); }
  }

  const fill = (e: string, p: string) => { setEmail(e); setPassword(p); };

  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <h1>로그인</h1>
      <form onSubmit={submit} className="card" noValidate>
        <label htmlFor="email">이메일</label>
        <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        <label htmlFor="pw">비밀번호</label>
        <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        {error && <div className="alert">{error}</div>}
        <p><button className="btn" disabled={busy}>{busy ? '확인 중…' : '로그인'}</button></p>
      </form>
      <div className="card">
        <strong>체험용 계정</strong>
        <p className="muted">누르면 입력칸이 채워져요. (가상 계정입니다)</p>
        <div className="row">
          <button type="button" className="chip" onClick={() => fill('admin@moa.test', 'admin1234')}>관리자</button>
          <button type="button" className="chip" onClick={() => fill('member1@moa.test', 'member1234')}>회원 1</button>
          <button type="button" className="chip" onClick={() => fill('member2@moa.test', 'member1234')}>회원 2</button>
        </div>
      </div>
    </div>
  );
}
