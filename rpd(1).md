# RPD Website Portofolio dengan Admin Login

## 1. Nama Produk

**Ridho Firdaus Portfolio Website**

Website portofolio personal untuk menampilkan karya desain, video editing, campaign visual, dan project kreatif. Website memiliki dua jenis akses:

1. **Admin / Owner**  
   Bisa login, upload, edit, dan hapus konten portofolio.

2. **User / Visitor**  
   Bisa melihat portofolio tanpa login.

---

## 2. Tujuan Produk

Website ini dibuat untuk:

- Menampilkan karya portofolio secara profesional.
- Memudahkan calon klien, recruiter, atau brand melihat hasil kerja.
- Menyediakan dashboard admin agar pemilik website bisa update konten tanpa edit kode.
- Menyimpan data project, gambar, video, dan deskripsi karya secara rapi.
- Menjadi personal branding utama untuk Ridho Firdaus sebagai Graphic Designer / Video Editor / Creative Designer.

---

## 3. Target Pengguna

### A. Admin

Admin adalah pemilik website.

Admin dapat:

- Login ke dashboard.
- Upload project baru.
- Upload gambar/video.
- Mengedit informasi project.
- Menghapus project.
- Mengatur status project: draft atau publish.
- Mengatur kategori portofolio.
- Mengatur data profil pribadi.
- Mengatur kontak dan link sosial media.
- Memantau **Live Traffic / Realtime Visitors** (analytics pengunjung — admin-only).

### B. User Biasa / Visitor

User biasa adalah pengunjung website.

User dapat:

- Melihat halaman utama.
- Melihat daftar project.
- Membuka detail project.
- Melihat gambar/video portofolio.
- Melihat halaman tentang pemilik.
- Menghubungi melalui email, WhatsApp, atau form kontak.
- Tidak perlu login.

---

## 4. Role dan Hak Akses

| Role | Login | Lihat Portfolio | Upload Konten | Edit Konten | Hapus Konten | Akses Dashboard |
|---|---:|---:|---:|---:|---:|---:|
| Visitor | Tidak | Ya | Tidak | Tidak | Tidak | Tidak |
| Admin | Ya | Ya | Ya | Ya | Ya | Ya |

---

## 5. Struktur Halaman Website

### A. Public Website

#### 1. Home Page

Halaman utama untuk memperkenalkan identitas.

Isi halaman:

- Hero section.
- Nama: **Ridho Firdaus**.
- Role: Graphic Designer / Video Editor / Creative Designer.
- Short tagline.
- CTA button:
  - View Portfolio.
  - Hire Me.
- Featured projects.
- Skill highlight.
- Contact shortcut.

Contoh copy:

> Creative Designer focused on visual storytelling, social media content, campaign design, and digital brand presentation.

---

#### 2. Portfolio Page

Halaman daftar semua karya.

Fitur:

- Grid project.
- Filter kategori.
- Search project.
- Sorting terbaru.
- Thumbnail project.
- Label kategori.

Kategori contoh:

- Social Media Design.
- Campaign Visual.
- Video Editing.
- Branding.
- Product Catalog.
- Motion Graphic.
- AI Creative Production.
- Website UI Design.

---

#### 3. Portfolio Detail Page

Halaman detail setiap project.

Isi:

- Judul project.
- Thumbnail utama.
- Gallery gambar/video.
- Kategori.
- Tahun project.
- Nama brand/client.
- Role dalam project.
- Tools yang digunakan.
- Deskripsi project.
- Challenge.
- Creative process.
- Final output.
- Link external jika ada.

Struktur contoh:

```text
Project Title
Client / Brand
Category
Year
Role
Tools

Overview
Problem
Creative Direction
Final Result
Gallery
```

---

#### 4. About Page

Halaman profil.

Isi:

- Foto profil.
- Deskripsi singkat.
- Pengalaman kerja.
- Skill.
- Tools.
- Value kerja.
- CV download jika diperlukan.

Skill contoh:

- Graphic Design.
- Video Editing.
- Social Media Content.
- Digital Campaign.
- Brand Visual.
- AI Image Generation.
- UI Design.

Tools contoh:

- Adobe Photoshop.
- Adobe Premiere Pro.
- CapCut.
- Figma.
- Canva.
- Midjourney / AI Tools.

---

#### 5. Contact / Hire Me Page

Halaman kontak untuk calon klien atau recruiter.

Fitur:

- Form kontak.
- Email.
- WhatsApp.
- Instagram.
- LinkedIn.
- Download CV button.

Form field:

- Nama.
- Email.
- Perusahaan / Brand.
- Kebutuhan project.
- Budget opsional.
- Pesan.

---

### B. Admin Dashboard

#### 1. Login Page

URL contoh:

```text
/admin/login
```

Fitur:

- Email.
- Password.
- Validasi login.
- Error message jika gagal.
- Redirect ke dashboard jika berhasil.

---

#### 2. Dashboard Overview

URL:

```text
/admin/dashboard
```

Isi:

- Total project.
- Total published project.
- Total draft project.
- Project terbaru.
- Tombol tambah project.
- Shortcut ke **Live Traffic**.

---

#### 2b. Live Traffic / Realtime Visitors (admin-only)

URL:

```text
/admin/traffic
```

Isi:

- **Online now** — jumlah pengunjung aktif realtime (jendela 60 detik).
- Statistik: Today, Unique today, 7 hari, 30 hari, All time.
- Grafik views 14 hari terakhir.
- Top pages, Top referrers.
- Devices & Countries (**dihitung per pengunjung unik**, bukan per kunjungan halaman).
- Recent visits.

Catatan:

- Privat untuk admin (RLS aktif tanpa policy; hanya service-role yang menulis/membaca).
- **Tanpa menyimpan IP/data pribadi** — pakai hash pengunjung ber-salt harian (zona WIB).
- Auto-refresh tiap 7 detik (polling). Tidak melacak halaman `/admin`.
- Data bisa di-reset: `npm run db:reset-analytics -- --yes`.

---

#### 3. Manage Portfolio

URL:

```text
/admin/projects
```

Fitur:

- List semua project.
- Search project.
- Filter kategori.
- Status draft/publish.
- Tombol edit.
- Tombol delete.
- Tombol create new project.

Data yang ditampilkan:

- Thumbnail.
- Judul.
- Kategori.
- Status.
- Tanggal dibuat.
- Action.

---

#### 4. Add New Project

URL:

```text
/admin/projects/create
```

Field input:

- Project title.
- Slug otomatis.
- Client / Brand.
- Category.
- Year.
- Role.
- Tools.
- Short description.
- Full description.
- Challenge.
- Process.
- Result.
- Thumbnail upload.
- Gallery upload.
- Video URL / video upload.
- Status: draft / publish.

---

#### 5. Edit Project

URL:

```text
/admin/projects/[id]/edit
```

Fitur:

- Edit semua data project.
- Ganti thumbnail.
- Tambah/hapus gallery.
- Ubah status publish/draft.
- Save changes.

---

#### 6. Profile Settings

URL:

```text
/admin/profile
```

Admin dapat mengubah:

- Nama.
- Role.
- Bio.
- Foto profil.
- Email.
- WhatsApp.
- Instagram.
- LinkedIn.
- CV file.

---

#### 7. Logout

Admin bisa logout dan kembali ke halaman login.

---

## 6. Database Structure

### Table: users

Untuk akun admin.

```sql
users
- id
- name
- email
- password_hash
- role
- created_at
- updated_at
```

Role:

```text
admin
```

---

### Table: projects

Untuk data portofolio.

```sql
projects
- id
- title
- slug
- client_name
- category_id
- year
- role
- tools
- short_description
- full_description
- challenge
- process
- result
- thumbnail_url
- status
- created_at
- updated_at
```

Status:

```text
draft
published
```

---

### Table: project_media

Untuk gambar dan video project.

```sql
project_media
- id
- project_id
- media_type
- media_url
- alt_text
- sort_order
- created_at
```

Media type:

```text
image
video
```

---

### Table: categories

Untuk kategori portofolio.

```sql
categories
- id
- name
- slug
- created_at
```

---

### Table: profile

Untuk data profil website.

```sql
profile
- id
- name
- headline
- bio
- profile_image_url
- email
- whatsapp
- instagram_url
- linkedin_url
- cv_url
- updated_at
```

---

### Table: contact_messages

Untuk pesan dari form kontak.

```sql
contact_messages
- id
- name
- email
- company
- project_need
- budget
- message
- status
- created_at
```

Status:

```text
unread
read
replied
```

---

## 7. Tech Stack Rekomendasi

### Frontend

```text
Next.js
Tailwind CSS
Framer Motion
React Hook Form
Zod Validation
```

### Backend

```text
Next.js API Routes / Server Actions
```

### Database

Pilihan aman dan mudah:

```text
Supabase PostgreSQL
```

atau:

```text
Prisma + PostgreSQL
```

### Authentication

```text
NextAuth.js / Auth.js
```

atau jika pakai Supabase:

```text
Supabase Auth
```

### File Storage

Untuk upload gambar dan video:

```text
Supabase Storage
```

Alternatif:

```text
Cloudinary
```

Rekomendasi: **Cloudinary untuk media portfolio** karena lebih bagus untuk optimasi gambar, resize, dan delivery cepat.

---

## 8. Design Direction

### Visual Style

Website harus terlihat:

- Minimalis.
- Profesional.
- Clean.
- Editorial.
- Modern creative agency style.
- Fokus pada karya.

### Warna

Gunakan warna personal branding:

```text
Navy: #102C57
Beige: #E7DDD1
White: #FFFFFF
Soft Grey: #F5F5F5
Black: #111111
```

### Font

```text
Plus Jakarta Sans
```

### Layout

- Banyak whitespace.
- Grid portfolio rapi.
- Thumbnail besar.
- Navigasi sederhana.
- Animasi halus.
- Mobile responsive.

---

## 9. User Flow

### Flow Visitor

```text
User membuka website
↓
Melihat Home Page
↓
Klik Portfolio
↓
Melihat daftar karya
↓
Klik salah satu project
↓
Melihat detail project
↓
Klik Contact / Hire Me
↓
Mengirim pesan atau menghubungi WhatsApp
```

---

### Flow Admin

```text
Admin membuka /admin/login
↓
Login menggunakan email dan password
↓
Masuk dashboard
↓
Klik Add New Project
↓
Upload thumbnail dan gallery
↓
Isi detail project
↓
Pilih status publish
↓
Project muncul di halaman portfolio publik
```

---

## 10. Functional Requirements

### Public Website

Website harus bisa:

- Menampilkan project yang statusnya published.
- Menyembunyikan project draft.
- Menampilkan detail project berdasarkan slug.
- Menampilkan gallery image/video.
- Memfilter project berdasarkan kategori.
- Mengirim pesan melalui form kontak.
- Responsive di mobile, tablet, dan desktop.

---

### Admin Dashboard

Admin harus bisa:

- Login.
- Logout.
- Membuat project baru.
- Mengedit project.
- Menghapus project.
- Upload thumbnail.
- Upload gallery.
- Mengubah status project.
- Mengelola kategori.
- Mengubah data profil.
- Melihat pesan kontak.

---

## 11. Non-Functional Requirements

Website harus:

- Cepat diakses.
- Aman dari akses dashboard ilegal.
- SEO friendly.
- Mobile responsive.
- Gambar teroptimasi.
- Mudah di-maintain.
- Memiliki validasi form.
- Memiliki proteksi route admin.
- Memiliki loading state dan error state.

---

## 12. Security Requirements

Keamanan wajib:

- Password admin harus di-hash.
- Dashboard hanya bisa diakses setelah login.
- API upload hanya bisa diakses admin.
- Validasi file upload.
- Batasi tipe file:
  - JPG.
  - PNG.
  - WEBP.
  - MP4.
- Batasi ukuran file.
- Gunakan environment variable untuk secret key.
- Jangan simpan password asli di database.
- Gunakan middleware untuk proteksi route admin.
- Sanitasi input dari form.
- Rate limit untuk form kontak dan login.

---

## 13. SEO Requirements

Setiap halaman project harus punya:

- Meta title.
- Meta description.
- Open Graph image.
- Slug yang rapi.
- Alt text untuk gambar.
- Struktur heading yang benar.

Contoh URL:

```text
/portfolio/social-media-campaign-menliving
/portfolio/love-lola-product-catalog
/portfolio/digivise-campaign-design
```

---

## 14. MVP Scope

Versi pertama wajib memiliki:

- Home page.
- Portfolio page.
- Portfolio detail page.
- About page.
- Contact page.
- Admin login.
- Admin dashboard.
- CRUD project.
- Upload image.
- Publish/draft status.
- Responsive layout.

Belum wajib untuk MVP:

- Multi admin.
- Analytics.
- Komentar.
- Payment.
- Client portal.
- AI content generator.

---

## 15. Struktur Folder Next.js

```text
portfolio-website/
├── app/
│   ├── page.tsx
│   ├── about/
│   │   └── page.tsx
│   ├── portfolio/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   └── api/
│       ├── auth/
│       ├── projects/
│       ├── upload/
│       └── contact/
├── components/
│   ├── public/
│   ├── admin/
│   └── ui/
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── storage.ts
│   └── validation.ts
├── prisma/
│   └── schema.prisma
├── public/
└── middleware.ts
```

---

## 16. Prompt untuk Codex / AI Developer

```text
Build a modern personal portfolio website for Ridho Firdaus with public portfolio pages and a protected admin dashboard.

Tech stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Auth.js or Supabase Auth
- Cloudinary or Supabase Storage for media upload
- Zod for validation
- React Hook Form for forms

Product requirements:
1. Public users can view the portfolio without login.
2. Admin must login to access the dashboard.
3. Admin can create, edit, delete, publish, and draft portfolio projects.
4. Admin can upload project thumbnail and gallery images/videos.
5. Public portfolio page only shows published projects.
6. Each project has a detail page using a clean slug URL.
7. Admin can manage profile data such as name, bio, profile image, email, WhatsApp, Instagram, LinkedIn, and CV file.
8. Website must be responsive, clean, minimal, and professional.
9. Admin can monitor privacy-first realtime traffic analytics at `/admin/traffic` (online-now, page views, top pages/referrers, devices, countries) without storing visitor IPs/PII.

Design direction:
- Minimal editorial creative portfolio
- Font: Plus Jakarta Sans
- Colors:
  - Navy #102C57
  - Beige #E7DDD1
  - White #FFFFFF
  - Soft Grey #F5F5F5
  - Black #111111
- Large portfolio thumbnails
- Smooth animation using Framer Motion
- Clean admin dashboard layout

Public pages:
- Home
- Portfolio
- Portfolio Detail
- About
- Contact

Admin pages:
- Login
- Dashboard
- Manage Projects
- Create Project
- Edit Project
- Profile Settings
- Contact Messages

Database models:
- User
- Project
- ProjectMedia
- Category
- Profile
- ContactMessage

Security:
- Hash passwords.
- Protect all /admin routes.
- Validate all forms using Zod.
- Restrict upload file types.
- Hide draft projects from public users.
- Use environment variables for secrets.
- Add middleware route protection.

Deliverables:
- Working Next.js app
- Database schema
- Auth implementation
- Admin CRUD
- Media upload
- Public portfolio UI
- Responsive design
- Local setup instructions
```

---

## 17. Kesimpulan

Rancangan terbaik untuk kebutuhan ini adalah:

```text
Website portfolio publik + admin dashboard private
```

User biasa cukup melihat karya. Admin login untuk upload dan mengatur konten. Dengan struktur ini, pemilik website tidak perlu edit kode setiap ingin menambahkan project baru. Cukup masuk dashboard, upload gambar/video, isi detail project, lalu publish.
---

## 18. UI Style Reference

Style visual website harus mengikuti referensi yang diberikan: **modern editorial portfolio dengan layout brutalist-clean, bold typography, grid modular, dan visual hero besar**.

### A. Karakter Visual Utama

Website harus terasa:

- Premium.
- Editorial.
- Minimalis.
- Modern agency.
- Bold dan confident.
- Banyak whitespace.
- Mengutamakan karya visual sebagai pusat perhatian.
- Tidak terlalu banyak warna.
- Tidak memakai style corporate dashboard yang kaku.
- Tidak memakai style terlalu futuristik atau terlalu ramai.

Referensi visual yang harus diikuti:

```text
Black and white editorial layout
Oversized bold typography
Large hero image
Magazine-like spacing
Grid-based project section
Rounded image corner
Minimal navigation
Small uppercase labels
Strong contrast
Premium creative agency aesthetic
```

---

### B. Warna UI

Gunakan warna dasar seperti referensi:

```text
Primary Background: #F5F5F2 / Off White
Primary Text: #050505 / Almost Black
Secondary Text: #777777 / Soft Grey
Card Background: #FFFFFF
Dark Section: #000000
Border: #D9D9D9
Accent: #000000
```

Catatan:

- Warna personal branding navy dan beige boleh tetap dipakai, tetapi jangan dominan.
- UI utama harus lebih dekat ke hitam-putih editorial.
- Gunakan warna sebagai aksen kecil, bukan elemen utama.

---

### C. Typography Direction

Typography adalah elemen utama.

Gunakan font modern sans-serif yang tebal dan rapat.

Rekomendasi font:

```text
Primary Font: Plus Jakarta Sans / Neue Haas Grotesk style / Inter Tight
Heading Weight: 800-900
Body Weight: 400-500
Label Weight: 600-700
```

Gaya heading:

- Huruf besar / uppercase.
- Sangat bold.
- Ukuran besar.
- Line-height rapat.
- Cocok untuk headline seperti poster.

Contoh gaya headline:

```text
BUILT — INTENT
CREATIVE WORKS
FOR DIGITAL BRANDS
SELECTED PROJECTS
VISUAL SYSTEMS
MADE FOR IMPACT
```

---

### D. Layout Direction

Website harus menggunakan sistem layout modular seperti majalah/editorial.

Karakter layout:

- Container lebar.
- Banyak ruang kosong.
- Section tinggi dan lega.
- Grid 2 kolom dan 3 kolom.
- Kombinasi gambar besar dan teks kecil.
- Border tipis antar card.
- Rounded corner pada gambar besar.
- Elemen navigasi kecil dan minimal.
- Project card dibuat seperti editorial case study, bukan card marketplace.

---

### E. Header / Navigation

Header mengikuti referensi:

- Posisi di bagian atas.
- Logo/nama di kiri.
- Menu kecil di kanan.
- Minimal, tidak banyak tombol.
- Gunakan uppercase kecil.
- Bisa dibuat sticky tetapi tetap clean.

Struktur header:

```text
RIDHO FIRDAUS          WORK / ABOUT / CONTACT
```

atau:

```text
RIDHO
FIRDAUS                PORTFOLIO / SERVICES / CONTACT
```

---

### F. Home Page Style

Home page harus memiliki hero besar seperti referensi.

Struktur hero:

```text
Small label: Portfolio / Creative Designer
Big headline: BUILT — INTENT
Subheadline: Graphic design, video editing, and digital campaign visuals.
Large hero visual: selected portfolio image
```

Contoh headline untuk website:

```text
BUILT — INTENT
```

Alternatif headline:

```text
DESIGN — IMPACT
```

```text
VISUALS — THAT WORK
```

```text
MADE — TO CONVERT
```

Hero harus menggunakan:

- Heading sangat besar.
- Garis horizontal atau dash di antara kata.
- Satu gambar utama besar.
- Spacing lega.
- Label kecil di atas heading.

---

### G. Portfolio Grid Style

Portfolio page mengikuti style grid editorial.

Tipe layout:

1. **Featured Project Besar**
   - 1 project utama dengan gambar besar.
   - Judul project besar.
   - Deskripsi singkat.
   - Tahun dan kategori kecil.

2. **Project Grid**
   - 2 kolom untuk desktop.
   - 1 kolom untuk mobile.
   - Gambar dominan.
   - Teks minimal di bawah gambar.

3. **Mini Project Cards**
   - Untuk karya tambahan.
   - Card kecil dengan border tipis.
   - Thumbnail + kategori + tahun.

Format card:

```text
[Thumbnail besar]
PROJECT TITLE
Category / Client
Year
```

---

### H. Portfolio Detail Style

Halaman detail project harus terasa seperti case study editorial.

Struktur:

```text
PROJECT TITLE
Client / Category / Year / Role

Large cover image

Overview
Problem
Creative Direction
Execution
Final Output

Gallery
Next Project
```

Gaya visual:

- Judul besar uppercase.
- Metadata kecil.
- Gambar full-width.
- Section teks pendek dan jelas.
- Gallery memakai masonry/grid.
- Banyak whitespace.
- Tidak terlalu banyak dekorasi.

---

### I. Admin Dashboard Style

Admin dashboard tidak harus sama persis seperti public site, tetapi tetap mengikuti karakter clean minimal.

Style admin:

- Background off-white.
- Sidebar hitam atau putih.
- Table clean.
- Button hitam.
- Form field besar dan rapi.
- Upload area drag-and-drop.
- Preview image besar.
- Status draft/published jelas.

Dashboard tidak boleh terlalu ramai. Fungsi harus lebih penting daripada dekorasi.

---

### J. Component Style

Gunakan komponen berikut:

#### Button Primary

```text
Background: black
Text: white
Border-radius: full / pill
Text: uppercase kecil
```

#### Button Secondary

```text
Background: transparent
Text: black
Border: 1px solid black
Border-radius: full / pill
```

#### Project Card

```text
Large image
Rounded corner 16px-24px
Small uppercase category
Bold title
Minimal metadata
```

#### Section Label

```text
Small uppercase text
Letter spacing sedikit
Color grey / black
```

#### Divider

```text
Thin border line
Color: #D9D9D9
```

---

### K. Motion / Interaction

Animasi harus halus dan tidak berlebihan.

Gunakan:

- Fade in.
- Slide up kecil.
- Image hover scale 1.02.
- Button hover invert.
- Smooth page transition.
- Cursor tidak perlu custom untuk MVP.

Jangan gunakan:

- Animasi terlalu cepat.
- Neon effect.
- 3D berlebihan.
- Futuristic glow.
- Particle background.

---

### L. Responsive Rules

Mobile harus tetap kuat secara visual.

Aturan mobile:

- Heading tetap besar tetapi tidak overflow.
- Grid berubah menjadi 1 kolom.
- Header menu disederhanakan.
- Gambar tetap dominan.
- Padding mobile minimal 20px.
- CTA tetap mudah diklik.

---

### M. Design Keywords untuk Developer

Gunakan keyword berikut saat implementasi UI:

```text
editorial brutalist portfolio
premium creative agency website
black and white modern layout
oversized typography
minimal navigation
large visual grid
case study portfolio
magazine-style spacing
clean project showcase
high contrast design
```

---

### N. Larangan Style

Jangan gunakan:

- UI terlalu corporate.
- Warna terlalu banyak.
- Background gradient neon.
- Card terlalu ramai.
- Shadow terlalu tebal.
- Icon berlebihan.
- Dashboard SaaS style yang generik.
- Template portfolio yang terlalu biasa.

---

### O. Contoh Struktur Home Page Final

```text
HEADER
RIDHO FIRDAUS                 WORK / ABOUT / CONTACT

HERO
Creative Designer / Portfolio
BUILT — INTENT
Graphic design, video editing, and campaign visuals crafted for brands.

LARGE HERO IMAGE

INTRO SECTION
Selected works from social media campaigns, product catalogs, video edits, and AI-assisted creative production.

FEATURED WORK
Large project image + stats/metadata

PROJECT GRID
2-column editorial portfolio layout

ABOUT PREVIEW
Short profile + tools + experience

CONTACT CTA
LET'S BUILD SOMETHING VISUAL
```

---

### P. Prompt Tambahan untuk Codex

Tambahkan instruksi UI ini ke prompt development:

```text
Use the uploaded visual reference as the main UI style direction.

The website should look like a premium editorial creative portfolio with:
- black and white dominant color palette
- oversized bold uppercase typography
- magazine-style spacing
- modular grid layout
- large project images
- minimal navigation
- small uppercase labels
- strong visual hierarchy
- rounded image corners
- clean brutalist-modern composition

Avoid generic SaaS dashboard aesthetics, colorful gradients, neon, excessive shadows, or overly corporate UI.

The public website must feel like a high-end creative agency / editorial portfolio landing page. The admin dashboard should remain functional and clean, but still use the same black-white minimal design language.
```
