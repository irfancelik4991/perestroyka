# Perestroyka - Gorev Listesi

## Onkoşullar

- [ ] Convex hesabi olustur (convex.dev) ve yeni proje ac
- [ ] Clerk hesabi olustur (clerk.com), uygulama olustur, Convex entegrasyonunu aktif et
- [ ] API anahtarlarini hazirla (CONVEX_URL, CLERK_PUBLISHABLE_KEY)

---

## Sprint 1: Proje Kurulumu + Kimlik Dogrulama (~1 hafta)

### 1.1 Proje Iskeleti
- [ ] TanStack Start projesi olustur (`npx create-tsrouter-app@latest`)
- [ ] Convex kur ve yapilandir (`npm install convex`, `npx convex dev`)
- [ ] Clerk kur (`npm install @clerk/tanstack-start`)
- [ ] Tailwind CSS kur ve yapilandir
- [ ] `.env.local` dosyasina `CONVEX_URL` ve `CLERK_PUBLISHABLE_KEY` ekle

### 1.2 Provider Kurulumu
- [ ] `__root.tsx` icinde `ConvexProvider` ve `ClerkProvider` sar
- [ ] Clerk ile Convex arasindaki baglentiyi kur (auth identity backend'e aksin)

### 1.3 Auth Route'lari + Route Guard
- [ ] `/` root route: auth durumuna gore `/chat` veya `/login`'e yonlendir
- [ ] `/login` sayfasi: Clerk `SignIn` bileseni
- [ ] Route guard: giris yapilmamis kullanicilari `/chat/*`'dan uzaklastir

### 1.4 Convex Sema (ilk tanim)
- [ ] `convex/schema.ts` dosyasinda tum tablolari tanimla: `users`, `rooms`, `messages`, `memberships`, `presence`
- [ ] `npx convex dev` ile semayi senkronize et

### 1.5 Kullanici Senkronizasyonu
- [ ] `convex/users.ts` — Clerk'ten gelen kullaniciyi Convex'e yazan `getOrCreateUser` mutation

---

## Sprint 2: Oda Yonetimi (~1 hafta)

### 2.1 Convex Backend — Odalar
- [ ] `convex/rooms.ts` — `listRooms` query (tum odalar + aktif uye sayisi)
- [ ] `convex/rooms.ts` — `createRoom` mutation (isim + aciklama, createdBy)
- [ ] `convex/rooms.ts` — `deleteRoom` mutation (sadece oda sahibi silebilir)
- [ ] `joinRoom` / `leaveRoom` mutation'lari
- [ ] `getRoomMembers` query

### 2.2 Sidebar Bileseni
- [ ] `Sidebar.tsx` — oda listesi, her odada aktif kullanici sayisi
- [ ] `RoomItem.tsx` — tekil oda ogesi (isim, uye sayisi, aktif gostergesi)
- [ ] Secili odayi vurgulama (highlight)

### 2.3 Chat Layout
- [ ] `/chat/_layout.tsx` — sol sidebar + sag icerik alani
- [ ] `/chat/index.tsx` — oda secilmediginde bos durum ekrani

### 2.4 Oda Olusturma
- [ ] `/chat/new.tsx` — isim + aciklama formu
- [ ] Form gonderiminde `createRoom` cagir, yeni odaya yonlendir

### 2.5 Oda Islemleri
- [ ] Odaya katilma / odadan ayrilma islevi
- [ ] Oda silme (sadece sahibine gorunur)

---

## Sprint 3: Mesajlasma (~1 hafta)

### 3.1 Convex Backend — Mesajlar
- [ ] `convex/messages.ts` — `listMessages` query (roomId'ye gore, `by_room` index, pagination)
- [ ] `convex/messages.ts` — `sendMessage` mutation (auth gerekli, oda uyeligi dogrulanir)
- [ ] `convex/messages.ts` — `deleteMessage` mutation (sadece mesaj sahibi silebilir)

### 3.2 Mesaj Arayuzu
- [ ] `/chat/$roomId.tsx` — oda mesaj ekrani, URL'den roomId okunur
- [ ] `MessageList.tsx` — mesajlari render et, sonsuz scroll destegi
- [ ] `MessageInput.tsx` — metin girisi + gonder butonu (ekranin altinda)

### 3.3 Gercek Zamanli Guncellemeler
- [ ] Convex `useQuery` ile reaktif mesaj listesi (WebSocket uzerinden otomatik guncelleme)
- [ ] Sayfa yenilemesi gerektirmeden mesajlarin guncellenmesi

### 3.4 Optimistic Updates
- [ ] Gonder'e tiklayinca mesaj sunucu onayindan once hemen gorunsun
- [ ] Convex optimistic update pattern'i uygula

### 3.5 Mesaj Silme
- [ ] Sadece kendi mesajlarinda silme butonu
- [ ] Silmeden once onay dialogu

---

## Sprint 4: Online/Offline Durumu + UX Cilasi (~1 hafta)

### 4.1 Convex Backend — Presence
- [ ] `updatePresence` mutation: userId + roomId icin `lastSeen` timestamp yaz
- [ ] Client tarafinda 30 saniyede bir heartbeat gonder
- [ ] Online kullanicilari getir: `lastSeen` son 60 saniye icinde olanlar

### 4.2 Online Kullanici Arayuzu
- [ ] `OnlineUsers.tsx` — sidebar'da online kullanici listesi
- [ ] Yesil nokta gostergesi (online durumu)
- [ ] Tarayici/sekme kapandiginda otomatik offline gecis

### 4.3 UX Cilasi
- [ ] Mobil uyumlu layout (kucuk ekranda sidebar kapanir)
- [ ] Yukleme iskeletleri / spinner'lar
- [ ] Bos durum ekranlari (oda yok, mesaj yok)
- [ ] Yeni mesajda otomatik asagi kaydir (scroll-to-bottom)
- [ ] Enter tusu ile mesaj gonderme

---

## Sprint 5: Bildirimler (Opsiyonel / Stretch) 

### 5.1 Okunmamis Mesaj Sayaci
- [ ] Kullanici basina oda basina son okunan mesaji takip et
- [ ] Sidebar'daki oda ogelerinde okunmamis sayac rozeti goster

### 5.2 Tarayici Bildirimleri
- [ ] Bildirim izni iste
- [ ] Kullanici baska odadayken yeni mesaj geldiginde push notification gonder
- [ ] Convex action ile dis bildirim servisi entegrasyonu

---

## Basari Kriterleri

- [ ] Kullanici kayit olabilir ve giris yapabilir
- [ ] Yeni oda olusturabilir, mevcut odalari gorebilir
- [ ] Bir odaya girip mesaj gonderebilir
- [ ] Baska sekmeden ayni odada mesajlar sayfa yenilenmeden guncellenir
- [ ] Online kullanici listesi gercek zamanli guncellenir
- [ ] Kendi mesajini silebilir
- [ ] TypeScript hatasi vermeden derlenir
- [ ] Mobil ekranda gorunum bozulmaz
