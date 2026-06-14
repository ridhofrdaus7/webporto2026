# HANDOFF — Ridho Firdaus Portfolio (webporto2026)

Terakhir diperbarui: 2026-06-14

## Status Project

Portfolio editorial dengan halaman publik + dashboard admin terproteksi.
**Migrasi penuh ke Supabase (Database + Auth + Storage)**, terhubung ke instance
Supabase asli, plus fitur **Brand** & **Sub-katalog** dan polish UI hero/detail.

Status keseluruhan: **±90% — fungsional & terhubung.** Sisa pekerjaan
sebagian besar polish + verifikasi manual di browser + isi konten asli.

### Terverifikasi (dicek langsung, 2026-06-14)
- `npm run build` ✅ sukses (Next.js 16.2.9, TypeScript lolos, middleware terdaftar).
- `npm run lint` OK (ESLint flat config aktif via `eslint.config.mjs`).
- `npm audit` OK: `0 vulnerabilities` setelah override `postcss` ke `^8.5.15`.
- Supabase project `qawgkuyldndqsrdzuwca` hidup. Isi tabel saat ini:
  categories `4` · catalogs `3` · **brands `5`** · **projects `0`** ·
  project_media `0` · profile `1` · contact_messages `0`.
  > Semua dummy project sudah **dihapus** atas permintaan owner (5 → 0).
- Supabase Auth aktif: `2` user terdaftar.
- Storage: bucket `media` (public, limit 25MB) dipakai app; `portfolio-media`
  (public, 50MB) ada tapi tak terpakai.
- `.env` lengkap (6 variabel terisi).
- Owner sudah melakukan tes manual admin dari browser dan alur utama berjalan baik.


## Stack

Next.js App Router · TypeScript · Tailwind CSS 4 · Supabase
(`@supabase/supabase-js`, `@supabase/ssr`) · Zod + React Hook Form · Framer Motion.

## Fitur yang Sudah Selesai

### Brand (wired end-to-end, live + ter-seed)
- Tabel `brands` + kolom `projects.brand_id` & `catalogs.brand_id` (FK,
  `on delete set null`). `projects.client_name` dijadikan nullable (legacy fallback).
- Halaman **`/admin/brands`**: list, tambah, hapus brand (menu "Brands" di sidebar).
- Form project: input teks "Client/Brand" diganti **dropdown Brand (wajib)**, dan
  **sub-katalog otomatis tersaring** sesuai brand terpilih.
- `clientName` di seluruh tampilan kini diturunkan dari nama brand (fallback ke
  kolom lama). 5 brand sudah di-seed: Digivise, Independent Brands, Love Lola,
  Menliving, RTSR.

### Sub-katalog
- Tabel `catalogs` + `projects.catalog_id`. Satu brand bisa punya beberapa katalog
  terpisah. Terhubung: schema → seed → query → form admin → dashboard → publik + filter.

### Admin (terproteksi via middleware)
- Login/Logout pakai **Supabase Auth** (email/password).
- Dashboard `/admin/dashboard` — query `count`/`head` + select ringan.
- CRUD Project `/admin/projects` (list, create, edit, delete).
- **Form project**: upload cover + multi-upload galeri (gambar/MP4) ke `/api/upload`,
  preview, edit alt text, hapus item. Hanya **Title, Brand, Category, Thumbnail wajib**;
  field teks panjang (description/challenge/process/result/role/tools) **opsional**.
- **Validasi anti-crash**: action project pakai `useActionState` + `safeParse`,
  error tampil **inline** (pesan merah), bukan overlay crash.
- Brands `/admin/brands`, Profile `/admin/profile`, Inbox `/admin/messages`.
- Upload (`/api/upload`) → **Supabase Storage** bucket `media`, JPG/PNG/WEBP/MP4,
  **maks 20MB** (limit route; bucket live 25MB).

### Publik
- Home `/`, About `/about`, Portfolio `/portfolio` + detail `/portfolio/[slug]`, Contact `/contact`.
- **Hero home**: tanpa gambar (text-only editorial), CTA **View Works** + **Hire Me**.
- **Foto warna asli** — filter grayscale dihapus dari `.editorial-image` (berlaku global).
- **Detail project**: urutan **Gallery (semua gambar) dulu, lalu Overview**. Cover jadi
  item full-width pertama di gallery (section cover terpisah dihapus).
- **Lightbox gallery**: klik gambar → popup ukuran menyesuaikan gambar (maks 90vw/90vh),
  tutup via tombol ×/klik luar/Esc, navigasi prev-next + panah keyboard, dukung video.
- Form kontak (`/api/contact`) — validasi Zod, rate-limit, simpan ke `contact_messages`.
- Demo mode otomatis pakai `lib/sample-data.ts` saat Supabase belum dikonfigurasi.

### Infrastruktur
- Middleware `proxy.ts` me-refresh session & memproteksi `/admin/*` dan `/api/upload/*`.
- `supabase/schema.sql`: tabel (brands, catalogs, dst), RLS, bucket. Idempotent.
- `supabase/config.toml`: Supabase CLI sudah di-init.
- `scripts/seed.ts`: admin user + seed brand/kategori/katalog/profil/project contoh.

## Bug / Catatan yang Masih Ada

1. **2 bucket storage**: `media` (dipakai) & `portfolio-media` (tak terpakai) - kandidat dibersihkan.
2. **2 user di Supabase Auth** padahal idealnya 1 admin - cek akun nyasar/duplikat.
3. **Upload video terbatas** - route 20MB & bucket `media` live 25MB; video besar ditolak. Owner minta limit **tidak dinaikkan**. Untuk produksi/Vercel (body limit 4.5MB) perlu upload langsung browser ke Supabase.
4. **Hero pakai gambar default fallback dihapus** - hero kini text-only, tak butuh gambar. Field `profileImageUrl` tetap ada di profil untuk keperluan lain.
5. **Brand & catalog dummy masih ada** (Menliving, Love Lola, RTSR, dll) - hanya project yang dihapus. Bersihkan bila ingin mulai dari kosong.
6. **Cabang `/uploads/...` di `lib/validation.ts`** (`thumbnailUrl`) kini mati - kosmetik.
7. **Folder `types/` kosong** - bisa dihapus.
8. **Role admin = siapa pun yang terautentikasi** (single-owner). Belum ada role granular.

## Command Run / Build

```bash
npm install            # install dependency
npm run db:seed        # buat admin user + seed data (butuh .env terisi)
npm run dev            # dev server (http://localhost:3000)
npm run build          # production build
npm run start          # jalankan hasil build
npm run lint           # eslint
```

## File Penting

| File | Peran |
|------|-------|
| `lib/supabase/config.ts` | Env Supabase + helper konfigurasi |
| `lib/supabase/client.ts` | Browser client (login/logout) |
| `lib/supabase/server.ts` | Server client (session) + admin client (service role) |
| `lib/auth.ts` | `getCurrentUser` / `requireAdmin` |
| `lib/portfolio.ts` | Query baca (+ brand/catalog), summary admin, dashboard, `getBrands`, mapper, fallback |
| `lib/admin-actions.ts` | Server actions CRUD project (useActionState) + brand + profil; `ProjectFormState` |
| `lib/validation.ts` | Skema Zod + mapper `projectDataForDb` / `brandDataForDb` / `profileDataForDb` |
| `lib/sample-data.ts` | Data contoh (brands, categories, catalogs, projects) untuk demo mode |
| `components/admin/project-form.tsx` | Form admin: brand dropdown, cascade catalog, upload, error inline |
| `components/public/project-gallery.tsx` | Gallery + lightbox/popup (client) |
| `app/admin/brands/page.tsx` | Halaman kelola brand |
| `app/page.tsx` | Home (hero text-only + CTA) |
| `app/portfolio/[slug]/page.tsx` | Detail project (gallery → overview) |
| `proxy.ts` | Middleware auth/proteksi route |
| `app/api/contact/route.ts` | Endpoint form kontak |
| `app/api/upload/route.ts` | Endpoint upload ke Supabase Storage (maks 20MB) |
| `app/globals.css` | Util styling (`.editorial-image` - grayscale sudah dihapus) |
| `eslint.config.mjs` | ESLint flat config untuk `npm run lint` |
| `supabase/schema.sql` | DDL tabel (+ brands/catalogs) + RLS + bucket |
| `scripts/seed.ts` | Seeder admin user, brand, katalog & data |
| `.env.example` | Template variabel lingkungan |

## Langkah Berikutnya

1. **Isi konten asli**: tambah brand (jika perlu) -> buat project asli + upload media.
2. **Verifikasi tambahan bila perlu**: submit kontak, cek inbox, lightbox, dan flow publik setelah konten asli masuk.
3. (Opsional, destruktif - konfirmasi dulu) Bersihkan bucket `portfolio-media`, user Auth nyasar, dan brand/catalog dummy.
4. (Opsional) Hapus folder `types` kosong; pertimbangkan pengetatan role admin.
5. (Opsional) Deploy ke Vercel - set env var sama; untuk upload video besar pakai upload langsung browser ke Supabase (hindari body limit 4.5MB).

### Catatan setup awal (jika clone baru / DB kosong)
1. Buat project di supabase.com, jalankan `supabase/schema.sql` di SQL Editor.
2. Copy `.env.example` → `.env`, isi `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
3. `npm run db:seed` lalu `npm run dev`.


