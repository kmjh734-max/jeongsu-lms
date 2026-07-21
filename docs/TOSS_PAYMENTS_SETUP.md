# 토스페이먼츠 크레딧 충전 (테스트 → 라이브)

## 1. Supabase SQL

SQL Editor에서 `supabase/migrations/095_credit_payments_toss.sql` 실행.

## 2. 환경변수

로컬 `.env.local` / Vercel Project Settings:

```env
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
TOSS_ENV=test
```

- `NEXT_PUBLIC_TOSS_CLIENT_KEY`만 브라우저에 노출됩니다.
- `TOSS_SECRET_KEY`는 Route Handler 서버에서만 사용합니다.
- 라이브 전환: 콘솔의 live 키로 교체 + `TOSS_ENV=live` + `NEXT_PUBLIC_APP_URL`을 프로덕션 도메인으로.

## 3. 웹훅 (권장)

토스 개발자센터 웹훅 URL:

`https://<도메인>/api/payments/toss/webhook`

이벤트: 결제 상태 변경. 서버는 payload만 믿지 않고 Toss API로 재조회 후 적립/취소를 멱등 처리합니다.

## 4. 화면

- 학원 admin: `/admin/credits` → 크레딧 충전 → `/admin/credits/charge`
- 성공/실패: `/admin/credits/payment/success|fail`
- 슈퍼관리자: `/super-admin/credits` — 결제내역·상품 ON/OFF·취소

## 5. 테스트 카드

토스 문서의 테스트 카드 번호로 승인·실패 시나리오를 확인하세요.
