# เขย่าแคปซูลสุขภาพสำหรับร้านขายยา

เว็บแคมเปญสำหรับร้านขายยาไทยที่เชื่อม frontend กับ API server จริง

- Production: ใช้ Neon/Postgres ผ่าน `DATABASE_URL`
- Local/Test fallback: ใช้ SQLite ผ่าน `DATABASE_PATH`

- ลูกค้าลงทะเบียนด้วยชื่อ เบอร์มือถือ และความสนใจ/เหตุผลที่เข้ามาใช้งาน
- ระบบออกคูปองจาก reward pool จริงพร้อม stock และ weighted random ฝั่ง server
- ป้องกันรับรางวัลหลักซ้ำด้วย unique constraint ต่อ customer/type
- ปลดล็อกคูปองผ่าน LINE LIFF เมื่อกำหนด `VITE_LIFF_ID`
- แชร์โบนัสผ่าน `liff.shareTargetPicker()`
- Wallet และ Staff redeem อ่าน/เขียนสถานะผ่าน API
- Admin dashboard อ่าน summary จากฐานข้อมูลจริง

## Run

```bash
npm install
copy .env.example .env
npm run dev
```

เปิด `http://127.0.0.1:3000/`

`npm run dev` จะรัน:

- API/static server: `http://127.0.0.1:8787`
- Vite frontend: `http://127.0.0.1:3000`
- Vite proxy `/api` ไปที่ backend

## Production

```bash
npm run build
npm run start
```

Production server เสิร์ฟทั้ง `/api/*` และไฟล์ static ใน `dist/`

## Environment

ดูตัวอย่างใน `.env.example`

ค่าที่ต้องตั้งสำหรับ LINE จริง:

- `VITE_LIFF_ID`: LIFF ID จาก LINE Developers Console
- `VITE_LINE_OA_ID`: LINE OA ID เช่น `@yourpharmacy`
- `LINE_OA_ID`: ใช้แสดงใน backend response
- `REQUIRE_LINE_AUTH=true`: บังคับให้ลงทะเบียนผ่าน LINE access token
- `DATABASE_URL`: Neon/Postgres connection string สำหรับ production
- `STAFF_REDEEM_PIN`: ถ้าต้องการให้พนักงานใส่ PIN ก่อน redeem
- `ADMIN_KEY`: ถ้าต้องการป้องกันหน้า admin summary API

## Verification

```bash
npm run lint
npm test
npm run build
npm run e2e
```

`npm test` เปิด API server จริงกับ SQLite ชั่วคราวและทดสอบ registration, draw, duplicate prevention, friendship, redeem, admin summary.
