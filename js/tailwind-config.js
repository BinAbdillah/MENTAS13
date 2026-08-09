// Konfigurasi Tailwind: font sans (isi) + display (judul, siap pakai bila diperlukan)
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Plus Jakarta Sans"', 'sans-serif']
      }
    }
  }
};