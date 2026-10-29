'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';

export default function Nav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  return (
    <header className="top">
      <div className="in">
        <Link href={user?.role === 'admin' ? '/admin' : '/'}><strong>🛠️ 모아공방 장비 대여</strong></Link>
        <nav className="row">
          {user?.role === 'member' && (
            <>
              <Link href="/">장비</Link>
              <Link href="/my">내 대여</Link>
              <Link href="/inquiries/new">문의</Link>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Link href="/admin">현황</Link>
              <Link href="/admin/equipment">장비 관리</Link>
              <Link href="/admin/reservations">전체 대여</Link>
              <Link href="/admin/inquiries">문의·AI</Link>
            </>
          )}
          {user ? (
            <>
              <span className="muted">{user.name} ({user.role === 'admin' ? '관리자' : '회원'})</span>
              <button className="btn ghost" onClick={() => { logout(); router.push('/login'); }}>로그아웃</button>
            </>
          ) : (
            <Link href="/login" className="btn">로그인</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
