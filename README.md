# 모아공방 장비 대여 · 프론트엔드 (Level 3)

Next.js 화면입니다. 기획서는 `기획서.md`를 보세요.

## 확인용 계정 (가상 계정)
| 역할 | 이메일 | 비밀번호 |
|---|---|---|
| 관리자 | `admin@moa.test` | `admin1234` |
| 일반 회원 | `member1@moa.test` | `member1234` |
| 일반 회원 | `member2@moa.test` | `member1234` |

로그인 화면의 버튼을 누르면 입력칸이 채워집니다.
- 관리자: 현황, 장비 관리, 전체 대여, 문의·AI 정리, 가상 데이터 다시 채우기
- 회원: 장비 검색·대여·취소, 내 대여, 문의 작성

> ⏳ 백엔드가 무료 서버라 첫 접속이 1분 가까이 걸릴 수 있습니다.

## 설정값 (환경 변수)
| 이름 | 뜻 |
|---|---|
| `NEXT_PUBLIC_API_URL` | 백엔드 주소 (끝에 `/` 없이) |

## 로컬 실행
```bash
cp .env.example .env.local
npm install
npm run dev
```

## 배포 주소
- 화면(Vercel): https://workshop-rental-level3-frontend-46x.vercel.app
- 백엔드(Render): https://workshop-rental-level3-backend.onrender.com
- 백엔드 저장소: https://github.com/leesh050471-tech/workshop-rental-level3-backend
