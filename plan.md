# Plan: เขย่าบอลลุ้นโชค - LINE Lucky Draw Campaign

## Overview
สร้างเกมแคมเปญบน LINE LIFF สำหรับร้านขายยา (Pharmacy) โดยมี concept "Reward Jar" - ผู้เล่นเขย่าโทรศัพท์แล้วเลือกลูกบอลจาก jar เพื่อลุ้นรับรางวัล

## รูปแบบการเล่น
1. **Landing** - ผู้ใช้สแกน QR → เข้าเกม
2. **Registration** - กรอกข้อมูลเบื้องต้น
3. **Shake Phone** - เขย่าโทรศัพท์เพื่อสุ่มลูกบอล
4. **Select Capsule** - แตะเลือก 1 ลูกจาก jar
5. **Reward Reveal** - เปิดเผยรางวัล (หลัก/ปลอบใจ)
6. **Add Friend Gate** - เพิ่มเพื่อน LINE OA เพื่อปลดล็อครางวัล
7. **Share Bonus** - แชร์ให้เพื่อนรับโบนัสเพิ่ม
8. **Wallet** - ดูรางวัลทั้งหมด
9. **Redeem** - ใช้รางวัลที่ร้าน

## Skill: vibecoding-webapp-swarm
สร้างเป็น React webapp ที่ deploy ได้เลย

## Stages

### Stage 1: Design & Architecture
- ออกแบบระบบทั้งหมด: game flow, data models, API structure, database schema
- สร้าง design.md กับ design system
- สร้าง tech-spec.md

### Stage 2: Frontend Development (Parallel)
- **Game Screens**: Landing, Registration, Shake-Phone, Select Capsule, Reward Reveal
- **Social Features**: Add Friend Gate, Share Bonus CTA
- **Wallet & Redeem**: Wallet view, Redeem flow, Staff redeem screen
- **Admin Dashboard**: Reward pool management, Summary dashboard, Source breakdown

### Stage 3: Backend & Integration
- Mock API layer สำหรับทุก flow
- QR tracking (utm, branch, qr_id)
- Game state management
- Reward logic (weighted random, stock management)
- Abuse prevention (1 user/campaign, duplicate checks)

### Stage 4: Polish & Deploy
- Animation & effects (shake, capsule open, confetti)
- Responsive design
- Testing
- Deploy

## Key Features (ตาม Task List)
### Phase 1: Core Campaign Loop
- QR source tracking (utm, branch, qr_id)
- Game flow: landing → start → complete → reward reveal
- Add friend gate: check friendship → unlock reward
- Reward claim: issued → claimed → wallet

### Phase 2: Share Bonus
- Share CTA after claim
- LIFF shareTargetPicker integration
- Bonus reward logic (1 bonus/session)

### Phase 3: Wallet + Redeem
- Multi-reward wallet (main + bonus)
- Redeem flow with status change
- Duplicate prevention
- Staff/admin redeem screen

### Phase 4: Admin + Analytics
- Reward pool CRUD (create/edit/delete/weight/stock/active)
- Summary dashboard (scans, add friend, share, claimed, redeemed)
- Source breakdown (branch, qr_id, utm_campaign)

### Phase 5: Hardening
- Abuse prevention (1 LINE user/campaign, 1 share bonus/session)
- Stock safety (prevent oversell under high traffic)
- Copy/config editor (title, subtitle, CTA text, teaser reward)

## Design Direction
- **Color Palette**: Pharmacy green (#2E7D5A) as primary, warm gold accents, soft pastels for capsules
- **Style**: Clean, friendly, medical-trustworthy with playful game elements
- **Typography**: Thai-friendly fonts (Kanit/Noto Sans Thai)
- **Animations**: Shake physics, capsule bounce, confetti on win, smooth transitions
