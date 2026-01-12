# Anonymous Project - Proje Yapısı

## 📂 Önerilen SvelteKit Proje Yapısı

```
anonymous-project/
├── src/
│   ├── lib/
│   │   ├── components/          # Yeniden kullanılabilir bileşenler
│   │   │   ├── Cursor.svelte    # Manyetik cursor bileşeni
│   │   │   ├── Hero.svelte      # Hero section + Threlte 3D sahne
│   │   │   ├── Navigation.svelte # Floating glassmorphism dock
│   │   │   └── CourseCards.svelte # Bento Grid kurs kartları
│   │   ├── stores/              # Svelte stores (gelecekte kullanım için)
│   │   │   └── (boş - genişletilebilir)
│   │   └── utils/               # Yardımcı fonksiyonlar
│   │       └── (boş - genişletilebilir)
│   ├── routes/
│   │   ├── +layout.svelte       # Root layout (global styles)
│   │   ├── +page.svelte         # Ana sayfa
│   │   └── +error.svelte        # Hata sayfası (opsiyonel)
│   ├── app.css                  # Global CSS + Tailwind directives
│   ├── app.d.ts                 # TypeScript type definitions
│   └── app.html                 # HTML template
├── static/
│   ├── videos/                  # WebM video dosyaları
│   │   ├── software.webm
│   │   ├── architecture.webm
│   │   ├── engineering.webm
│   │   ├── ai.webm
│   │   ├── devops.webm
│   │   └── design.webm
│   └── favicon.png              # Site ikonu
├── package.json                 # Dependencies
├── svelte.config.js             # SvelteKit config
├── vite.config.js               # Vite config
├── tailwind.config.js           # TailwindCSS + Cyber-Industrial palette
├── postcss.config.js            # PostCSS config
├── tsconfig.json                # TypeScript config
└── README.md                    # Proje dokümantasyonu
```

## 🎨 Bileşen Açıklamaları

### 1. Hero.svelte
- **Görev:** Ana hero section ile 3D interaktif sahne
- **Özellikler:**
  - Threlte ile wireframe globe
  - Mouse parallax etkisi
  - Mix-blend-mode typography
  - Auto-rotate animasyonu

### 2. Navigation.svelte
- **Görev:** Alt kısımda floating navigation dock
- **Özellikler:**
  - Glassmorphism tasarım
  - Smooth scroll entegrasyonu
  - Icon + label kombinasyonu

### 3. Cursor.svelte
- **Görev:** Özel manyetik cursor
- **Özellikler:**
  - Hover'da genişleme
  - "Click to Build" metni
  - Smooth following animasyonu

### 4. CourseCards.svelte
- **Görev:** Bento Grid layout ile kurs kartları
- **Özellikler:**
  - Responsive grid
  - Hover'da video background
  - Scale transition efektleri

## 🔧 Konfigürasyon Dosyaları

### tailwind.config.js
Cyber-Industrial renk paleti:
- `void`: Deep Void Black (#000000)
- `electric`: Electric Blue (#00D9FF)
- `signal`: Signal White (#FFFFFF)

### vite.config.js
Vite + SvelteKit plugin yapılandırması

### svelte.config.js
SvelteKit adapter ve genel ayarlar

## 📦 Bağımlılıklar

### Core
- `@sveltejs/kit`: SvelteKit framework
- `svelte`: Svelte compiler
- `vite`: Build tool

### Styling
- `tailwindcss`: Utility-first CSS
- `autoprefixer`: CSS vendor prefixes
- `postcss`: CSS processing

### 3D & Animations
- `@threlte/core`: Three.js wrapper for Svelte
- `@threlte/extras`: Threlte extra components
- `three`: 3D graphics library
- `gsap`: Animation library
- `lenis`: Smooth scroll library

## 🚀 Geliştirme Notları

1. **Video Dosyaları:** `/static/videos/` klasörüne WebM formatında video dosyaları eklenmelidir
2. **3D Performans:** Threlte sahnesi optimize edilmiştir, yüksek performans için GPU kullanır
3. **Responsive Design:** Tüm bileşenler mobile-first yaklaşımıyla tasarlanmıştır
4. **TypeScript:** Proje TypeScript desteği ile yapılandırılmıştır

## 📝 Genişletilebilirlik

- `src/lib/stores/`: Global state management için
- `src/lib/utils/`: Yardımcı fonksiyonlar için
- `src/routes/`: Yeni sayfalar için (ör: `/about`, `/contact`)
