# Office IoT Control Dashboard

사무실 내 에어컨 및 IoT 장비를 웹에서 통합 제어하기 위한 대시보드 프로젝트입니다.  
현재는 **LG ThinQ 기반 에어컨 제어**를 중심으로 구현되어 있으며,  
추후 **SmartThings 및 기타 IoT 장비**까지 확장하는 것을 목표로 합니다.

---

## ✨ 주요 기능

### 현재 기능

- LG ThinQ 연동 에어컨 제어
  - 전원 ON / OFF
  - 냉방 / 난방 모드 전환
  - 온도 설정
  - 풍량 제어
- Next.js 기반 서버 사이드 API 프록시
  - 실제 API 엔드포인트 및 토큰 은닉
  - 클라이언트 직접 호출 방지

### 향후 예정

- SmartThings 연동
  - 조명
  - 콘센트
  - 센서(온도 / 습도 등)
- 사무실 내 IoT 장비 통합 제어
- 사용자 권한별 제어 (관리자 / 일반 사용자)
- 대시보드 UI 고도화
- 모바일 / 태블릿 대응

---

## 🛠 기술 스택

### Frontend

- **Next.js 15**
- **TypeScript**
- **Tailwind CSS**
- App Router 기반 구조

### Backend (Next.js API Routes)

- LG ThinQ API 연동
- 서버 사이드 토큰 관리
- API 프록시 역할

### IoT 연동

- **LG ThinQ**
- (예정) **Samsung SmartThings**

---

## 🔐 보안 설계

- LG ThinQ API 토큰은 **서버에서만 관리**
- 클라이언트는 Next.js API Route만 호출
- 실제 API URL 및 인증 정보는 외부 노출 없음
- `.env` 기반 환경 변수 관리

---

## 🚀 실행 방법

npm install
npm run dev

접속: http://localhost:3000

---

## 📌 개발 목적

사무실 내 분산된 IoT 장비를 단일 웹 인터페이스로 통합

외부 노출 없이 안전한 API 연동 구조 설계

확장 가능한 IoT 컨트롤 플랫폼 구축

---

## 📎 참고 사항

본 프로젝트는 사내/개인용 IoT 컨트롤을 목적으로 합니다.

LG ThinQ 및 SmartThings API 정책 변경에 따라 동작이 달라질 수 있습니다.
