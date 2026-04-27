# แผนสร้าง Game Assets ชุด Cute Pet Gacha Reward Game

## ภาพรวม
สร้างชุดรูปภาพ (image assets) สำหรับเกมมือถือแนวกาชาสัตว์เลี้ยง จำนวน 37+ รูป ตาม Prompt Pack ที่ผู้ใช้กำหนดมา

## Stage 1 — Asset Generation Batch 1: พื้นหลัง + เครื่องกาชา + โลโก้ไม้ + ปุ่มหลัก
- game-stage-bg.webp (opaque, 1080x1440)
- game-logo-wood-sign.webp (transparent, 1024x512)
- game-subtitle-wood-plank.webp (transparent, 1024x256)
- game-machine-main.webp (transparent, 1024x1024)
- game-machine-empty.webp (transparent, 1024x1024)
- game-play-button.webp (transparent, 1024x384)
- full-event-poster.webp (opaque, 1080x1440)

## Stage 2 — Asset Generation Batch 2: แคปซูล + เหรียญ + เพชร + ของขวัญ
- game-capsule-cluster.webp (transparent, 1024x1024)
- game-capsule-yellow-rare.webp (transparent, 1024x1024)
- game-capsule-blue.webp (transparent, 1024x1024)
- game-capsule-pink.webp (transparent, 1024x1024)
- game-coin-pile.webp (transparent, 1024x512)
- game-single-coin.webp (transparent, 512x512)
- game-diamond-cluster.webp (transparent, 1024x512)
- game-gift-box.webp (transparent, 1024x1024)
- game-pet-egg-patterns.webp (transparent, 1024x1024)
- game-loading-egg.webp (transparent, 512x512)

## Stage 3 — Asset Generation Batch 3: Mascots
- game-cat-mascot.webp (transparent, 1024x1024)
- game-bird-mascot.webp (transparent, 1024x1024)
- game-monkey-mascot.webp (transparent, 1024x1024)

## Stage 4 — Asset Generation Batch 4: UI + VFX + Cards + Background Props
- game-bottom-info-banner.webp (transparent, 1080x256)
- game-small-store-button.webp (transparent, 512x256)
- game-wood-frame-foreground.webp (transparent, 1080x1440)
- game-prize-glow.webp (transparent, 1024x1024)
- game-confetti.webp (transparent, 1024x1024)
- game-reward-popup.webp (transparent, 1024x1024)
- game-reward-card-common.webp (transparent, 768x1024)
- game-reward-card-rare.webp (transparent, 768x1024)
- game-ticket-coupon.webp (transparent, 1024x512)

## Stage 5 — Asset Generation Batch 5: Buildings + Landscape + Props
- game-building-shop.webp (transparent, 1024x1024)
- game-building-school.webp (transparent, 1024x1024)
- game-hills-landscape.webp (transparent, 1080x768)
- game-tree-bush-set.webp (transparent, 1024x1024)
- game-fence.webp (transparent, 1024x256)
- game-paint-palette-prop.webp (transparent, 1024x1024)

## หลักการคุม Style ร่วมกัน
ทุกรูปต้องใช้ Master Style Prompt ร่วมกัน:
"Bright playful mobile reward game illustration, cute pet mascot gashapon event, cheerful village park background, warm golden prize feeling, blue sky, green hills, wooden signboards, glossy orange and gold UI elements, colorful capsules, coins, diamonds, gift boxes, polished casual game art style, high quality 2D cartoon mixed with soft 3D shading, rounded shapes, thick clean outlines, soft shadows, vibrant but clean composition, mobile game promotional banner style, friendly, fun, trustworthy, premium casual game asset, no readable text, no existing brand logo, no watermark"

Negative Prompt ร่วม:
"low quality, blurry, pixelated, muddy colors, realistic photo, dark horror style, scary animal, messy clutter, unreadable fake text, misspelled words, watermark, copied brand logo, marketplace logo, distorted UI, deformed mascot, extra limbs, creepy face, overexposed, noisy background, flat boring design, too much detail, cropped main object"

## โครงสร้าง Output
- บันทึกทั้งหมดที่ `/mnt/agents/output/cute-pet-gacha-assets/`
- ใช้รูปแบบ webp ตามชื่อไฟล์ที่กำหนด
- รูปที่ต้องการพื้นหลังโปร่งใส ใช้ background: transparent
- รูปที่เป็นฉากเต็ม ใช้ background: opaque

## การดำเนินงาน
- สร้าง subagent `AssetGen` ที่รับ list ของ assets และสร้างรูปทีละรูปด้วย generate_image tool
- แบ่งเป็น 5 batches ส่งพร้อมกัน (parallel) เพราะไม่มี dependencies ต่อกัน
- สรุปผลลัพธ์หลังจากทุก batch เสร็จ
