import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './landing.css';

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="bg-surface text-on-surface antialiased font-body-md landing-page">
      {/* TopNavBar */}
      <header className="w-full sticky top-0 z-50 bg-off-white dark:bg-surface-dim shadow-sm shadow-forest-green/5">
        <div className="flex justify-between items-center w-full px-margin-desktop py-4 max-w-container-max mx-auto">
          {/* Brand */}
          <Link className="text-headline-md font-headline-md font-bold text-forest-green dark:text-primary-fixed-dim" to="/">
            H'Leven
          </Link>
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link className="text-on-surface-variant dark:text-surface-variant font-medium hover:text-forest-green dark:hover:text-primary-fixed hover:bg-warm-beige/10 transition-colors px-3 py-2 rounded-md" to="/">Hotels</Link>
            <Link className="text-on-surface-variant dark:text-surface-variant font-medium hover:text-forest-green dark:hover:text-primary-fixed hover:bg-warm-beige/10 transition-colors px-3 py-2 rounded-md" to="/detail">Resorts</Link>
            <Link className="text-on-surface-variant dark:text-surface-variant font-medium hover:text-forest-green dark:hover:text-primary-fixed hover:bg-warm-beige/10 transition-colors px-3 py-2 rounded-md" to="#">Our Story</Link>
            <Link className="text-on-surface-variant dark:text-surface-variant font-medium hover:text-forest-green dark:hover:text-primary-fixed hover:bg-warm-beige/10 transition-colors px-3 py-2 rounded-md" to="#">Promotions</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="bg-forest-green text-white px-6 py-2 rounded-full font-label-md text-label-md hover:bg-primary transition-colors active:scale-[0.99] duration-200"
            >
              Book Now
            </Link>
            <Link to="/profile" className="hidden md:flex text-forest-green dark:text-primary-fixed-dim hover:bg-warm-beige/10 p-2 rounded-full transition-colors">
              <span className="material-symbols-outlined">person</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full h-[600px] flex items-center justify-center bg-warm-beige overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          data-alt="A luxurious modern hotel exterior at dusk with warm glowing lights, showcasing sophisticated architecture, a serene pool area, and a welcoming, premium atmosphere suitable for a high-end booking platform hero section."
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDzvadz-wSQ_EhmF9D8iFWi9mGkts1CRGLAdeae-Xjw_pYLzbTUCbfL1qobhQM5IAQFR1WeejU8WwoEEKFOByeRaisbYY7TaFh2RrIDnitCZ17k32Ur2mD0uj-CfCqFtBjeTXBF7Y1CzrUaGJ8JgPMJhyMGAYrZQUNUpoDRDo0lLHGVlnNKfVFsRMXFZaJJkw7kr1fyth-eoNS7nyJzNy8_vOSJiw-x5OV7UAovm2zqoIuQVfbZkcyM3w')" }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 w-full max-w-container-max px-margin-desktop mx-auto flex flex-col items-center text-center">
          <h1 className="font-headline-xl text-headline-xl text-white mb-6 max-w-3xl drop-shadow-md">
            Temukan Pengalaman Menginap Terbaik Bersama H'Leven
          </h1>
          <p className="font-body-lg text-body-lg text-white/90 mb-10 max-w-2xl drop-shadow">
            Platform reservasi hotel modern yang memberikan kemudahan pencarian, perbandingan harga, dan manajemen pemesanan secara cerdas dan aman.
          </p>
          {/* Search Bar */}
          <div className="w-full max-w-4xl bg-surface p-4 rounded-2xl shadow-sm shadow-forest-green/10 flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-1/3 flex flex-col items-start bg-off-white px-4 py-2 rounded-xl border border-warm-beige/50 focus-within:border-forest-green transition-colors">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Destinasi / Hotel</label>
              <div className="flex items-center w-full mt-1">
                <span className="material-symbols-outlined text-outline mr-2 text-sm">location_on</span>
                <input className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-body-md text-on-surface placeholder-outline-variant" placeholder="Bandung" type="text" />
              </div>
            </div>
            <div className="w-full md:w-1/4 flex flex-col items-start bg-off-white px-4 py-2 rounded-xl border border-warm-beige/50 focus-within:border-forest-green transition-colors">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Check-in</label>
              <div className="flex items-center w-full mt-1">
                <span className="material-symbols-outlined text-outline mr-2 text-sm">calendar_today</span>
                <input className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-body-md text-on-surface text-sm" type="date" />
              </div>
            </div>
            <div className="w-full md:w-1/4 flex flex-col items-start bg-off-white px-4 py-2 rounded-xl border border-warm-beige/50 focus-within:border-forest-green transition-colors">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Check-out</label>
              <div className="flex items-center w-full mt-1">
                <span className="material-symbols-outlined text-outline mr-2 text-sm">calendar_month</span>
                <input className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-body-md text-on-surface text-sm" type="date" />
              </div>
            </div>
            <div className="w-full md:w-1/4 flex flex-col items-start bg-off-white px-2 py-2 rounded-xl border border-warm-beige/50 focus-within:border-forest-green transition-colors">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Tamu &amp; Kamar</label>
              <div className="flex items-center w-full mt-1">
                <span className="material-symbols-outlined text-outline mr-2 text-sm">group</span>
                <select className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-body-md text-on-surface text-sm">
                  <option>2 Dewasa, 1 Kamar</option>
                  <option>1 Dewasa, 1 Kamar</option>
                  <option>4 Dewasa, 2 Kamar</option>
                </select>
              </div>
            </div>
            <button className="w-full md:w-auto h-full bg-forest-green text-white px-8 py-4 rounded-xl font-label-md text-label-md hover:bg-primary transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">search</span>
              Cari
            </button>
          </div>
        </div>
      </section>

      {/* Main Content: Filters & Grid */}
      <main className="w-full max-w-container-max px-margin-desktop mx-auto py-section-gap flex flex-col lg:flex-row gap-gutter">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-1/4 flex flex-col gap-6">
          <div className="bg-off-white p-6 rounded-2xl shadow-sm shadow-forest-green/5 border border-warm-beige/20">
            <h3 className="font-headline-md text-headline-md text-text-main mb-6">Filter Pencarian</h3>
            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-label-md text-label-md text-on-surface-variant mb-3">Rentang Harga (per malam)</h4>
              <div className="flex gap-2 items-center">
                <input className="w-full bg-surface border border-warm-beige rounded-lg px-3 py-2 text-sm focus:border-forest-green focus:ring-1 focus:ring-forest-green" placeholder="Rp 0" type="number" />
                <span className="text-outline-variant">-</span>
                <input className="w-full bg-surface border border-warm-beige rounded-lg px-3 py-2 text-sm focus:border-forest-green focus:ring-1 focus:ring-forest-green" placeholder="Rp 5.000.000+" type="number" />
              </div>
            </div>
            {/* Star Rating */}
            <div className="mb-6">
              <h4 className="font-label-md text-label-md text-on-surface-variant mb-3">Bintang Hotel</h4>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input className="rounded border-warm-beige text-forest-green focus:ring-forest-green" type="checkbox" />
                  <div className="flex text-sage-green">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input className="rounded border-warm-beige text-forest-green focus:ring-forest-green" type="checkbox" />
                  <div className="flex text-sage-green">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input className="rounded border-warm-beige text-forest-green focus:ring-forest-green" type="checkbox" />
                  <div className="flex text-sage-green">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </div>
                </label>
              </div>
            </div>
            {/* Facilities */}
            <div>
              <h4 className="font-label-md text-label-md text-on-surface-variant mb-3">Fasilitas Populer</h4>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input className="rounded border-warm-beige text-forest-green focus:ring-forest-green" type="checkbox" />
                  <span className="font-body-md text-body-md text-on-surface group-hover:text-forest-green transition-colors">WiFi Gratis</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input className="rounded border-warm-beige text-forest-green focus:ring-forest-green" type="checkbox" />
                  <span className="font-body-md text-body-md text-on-surface group-hover:text-forest-green transition-colors">Kolam Renang</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input className="rounded border-warm-beige text-forest-green focus:ring-forest-green" type="checkbox" />
                  <span className="font-body-md text-body-md text-on-surface group-hover:text-forest-green transition-colors">Spa &amp; Wellness</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input className="rounded border-warm-beige text-forest-green focus:ring-forest-green" type="checkbox" />
                  <span className="font-body-md text-body-md text-on-surface group-hover:text-forest-green transition-colors">Restoran</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Featured Hotels Grid */}
        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-forest-green mb-2">Rekomendasi Hotel</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Properti terbaik yang dipilih khusus untuk kenyamanan Anda.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-on-surface-variant">Urutkan:</span>
              <select className="bg-transparent border-none font-label-md text-forest-green focus:ring-0 cursor-pointer">
                <option>Rekomendasi</option>
                <option>Harga Terendah</option>
                <option>Harga Tertinggi</option>
                <option>Rating Tertinggi</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Hotel Card 1 */}
            <div className="bg-off-white rounded-2xl overflow-hidden shadow-sm shadow-forest-green/5 border border-warm-beige/20 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  data-alt="A beautiful modern hotel resort with a crystal clear swimming pool, surrounded by lush greenery and comfortable lounge chairs under a sunny sky, embodying luxury and relaxation."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHuNm76IvFQZbSl7VYRktpTVvsfWnBMG9Do1DD_H6n2mfh5tRKYh3A8n77QD4L5fz_K3swo8a2OoYo9n4AzniP2ZVR7wplDpSWVt1gkxhmiTtds3KYEygb-FF2Wb_AnIvA9_XjtILGBtbPQNl5D8vknOX0p7cQGGeOgEt4IONLZQAmw0IyvEVk_vZnLQ7z2L2-YHUIYacyWDHWW7_CyW8Lr6qCptkn6A0JNgBFmd1NMwB4c850aI_8UA"
                />
                <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-sage-green text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-sm text-label-sm text-text-main">4.8</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-headline-md text-headline-md text-text-main leading-tight line-clamp-2">The Grand H'Leven Resort</h3>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant mb-4">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <span className="font-body-sm text-sm">Dago, Bandung</span>
                </div>
                <div className="flex gap-3 mb-6 text-outline">
                  <span className="material-symbols-outlined text-sm" title="WiFi">wifi</span>
                  <span className="material-symbols-outlined text-sm" title="Pool">pool</span>
                  <span className="material-symbols-outlined text-sm" title="Spa">spa</span>
                </div>
                <div className="mt-auto flex items-end justify-between pt-4 border-t border-warm-beige/30">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Mulai dari</p>
                    <p className="font-headline-md text-[20px] font-bold text-forest-green">Rp 1.250.000</p>
                    <p className="text-xs text-outline-variant">/ malam</p>
                  </div>
                  <button className="bg-surface border border-forest-green text-forest-green px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-warm-beige/30 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>

            {/* Hotel Card 2 */}
            <div className="bg-off-white rounded-2xl overflow-hidden shadow-sm shadow-forest-green/5 border border-warm-beige/20 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  data-alt="An elegant interior of a boutique hotel room featuring modern minimalist furniture, large windows with natural light, warm beige tones, and a sophisticated, calm atmosphere."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfQenZqO5APVgCCDbpV-9DYkdvsEaGhX-5bJlkcamNtVVzC63YmfJTrLDgxwfO35ix5KTZfKvziP-Oz8FY82NhTYZOW0kiuA-eChhNKQnXtngKcywgDnMxH_7RuUzwwKjyJyqnBxvyr_mU45xlwI12STunsYglyaXJF2IuSwGYh6ipjdKXdF1y0tkdGZ75GqtCKwWGe6ddNJQ0u5hdxn0n_Km4rauFF79Yy3DWvIXsoewQxuQRB-ogeg"
                />
                <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-sage-green text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-sm text-label-sm text-text-main">4.5</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-headline-md text-headline-md text-text-main leading-tight line-clamp-2">H'Leven City Boutique</h3>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant mb-4">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <span className="font-body-sm text-sm">Braga, Bandung</span>
                </div>
                <div className="flex gap-3 mb-6 text-outline">
                  <span className="material-symbols-outlined text-sm" title="WiFi">wifi</span>
                  <span className="material-symbols-outlined text-sm" title="Restaurant">restaurant</span>
                </div>
                <div className="mt-auto flex items-end justify-between pt-4 border-t border-warm-beige/30">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Mulai dari</p>
                    <p className="font-headline-md text-[20px] font-bold text-forest-green">Rp 850.000</p>
                    <p className="text-xs text-outline-variant">/ malam</p>
                  </div>
                  <button className="bg-surface border border-forest-green text-forest-green px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-warm-beige/30 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>

            {/* Hotel Card 3 */}
            <div className="bg-off-white rounded-2xl overflow-hidden shadow-sm shadow-forest-green/5 border border-warm-beige/20 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  data-alt="A pristine modern hotel suite with a large comfortable bed, premium linens, aesthetic lighting, and a relaxing vibe, perfect for a tranquil getaway."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5LUTs3NB_3d6B1A_zcGaTmG5xGO_U4CmacFK-ogA1pG6BCbiFXXKIZVTxVYVvvXg3qdKnHitNKBZMvwNP0GzvpXXRGuuKz5V5mVNoejrjHc31oAUR4tj0bscPEHPBqgazj_QhdnBgbpIRUGhuhWha45LneSKPVPvXf1Yz6Jycgby9wRdhWVzi0iHAOEnaKvKijyT-Rgt9czN5Y8M_9vbBEX9KP3L5Pp2qKIA9p0M6nhihG2be6KOabQ"
                />
                <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-sage-green text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-sm text-label-sm text-text-main">4.9</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-headline-md text-headline-md text-text-main leading-tight line-clamp-2">H'Leven Pine Retreat</h3>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant mb-4">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <span className="font-body-sm text-sm">Lembang, Bandung</span>
                </div>
                <div className="flex gap-3 mb-6 text-outline">
                  <span className="material-symbols-outlined text-sm" title="WiFi">wifi</span>
                  <span className="material-symbols-outlined text-sm" title="Pool">pool</span>
                  <span className="material-symbols-outlined text-sm" title="Nature">park</span>
                </div>
                <div className="mt-auto flex items-end justify-between pt-4 border-t border-warm-beige/30">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Mulai dari</p>
                    <p className="font-headline-md text-[20px] font-bold text-forest-green">Rp 1.500.000</p>
                    <p className="text-xs text-outline-variant">/ malam</p>
                  </div>
                  <button className="bg-surface border border-forest-green text-forest-green px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-warm-beige/30 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <button className="text-forest-green font-label-md text-label-md hover:underline decoration-2 underline-offset-4 transition-all">
              Muat Lebih Banyak Hotel
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-highest dark:bg-inverse-surface border-t border-warm-beige/20 flat no shadows">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter w-full px-margin-desktop py-section-gap max-w-container-max mx-auto">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1 flex flex-col">
            <div className="text-headline-md font-headline-md font-bold text-forest-green dark:text-primary-fixed-dim mb-4">
              H'Leven
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant mb-6">
              Platform reservasi hotel terpercaya untuk pengalaman menginap tak terlupakan.
            </p>
            <div className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant">
              © 2024 H'Leven Hospitality Group. All rights reserved.
            </div>
          </div>
          {/* Links Column 1 */}
          <div className="col-span-1 flex flex-col gap-3">
            <h4 className="font-label-md text-label-md text-forest-green dark:text-primary-fixed-dim mb-2">Company</h4>
            <a className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-forest-green dark:hover:text-on-primary-container transition-colors" href="/design-system">Design System</a>
            <a className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-forest-green dark:hover:text-on-primary-container transition-colors" href="/">Careers</a>
            <a className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-forest-green dark:hover:text-on-primary-container transition-colors" href="/">Contact Us</a>
          </div>
          {/* Links Column 2 */}
          <div className="col-span-1 flex flex-col gap-3">
            <h4 className="font-label-md text-label-md text-forest-green dark:text-primary-fixed-dim mb-2">Legal</h4>
            <a className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-forest-green dark:hover:text-on-primary-container transition-colors" href="/">Privacy Policy</a>
            <a className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-forest-green dark:hover:text-on-primary-container transition-colors" href="/">Terms of Service</a>
          </div>
          {/* Links Column 3 */}
          <div className="col-span-1 flex flex-col gap-3">
            <h4 className="font-label-md text-label-md text-forest-green dark:text-primary-fixed-dim mb-2">Help</h4>
            <a className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-forest-green dark:hover:text-on-primary-container transition-colors" href="/">Support Center</a>
            <a className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-forest-green dark:hover:text-on-primary-container transition-colors" href="/">Partner with Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}