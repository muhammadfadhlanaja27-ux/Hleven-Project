import React from 'react';
import { Link } from 'react-router-dom';
import './HotelDetail.css';

export default function HotelDetail() {
    return (
        <div className="hotel-detail-page font-body-md text-body-md antialiased">

            {/* TopNavBar */}
            <nav className="hidden md:flex flex-col bg-off-white dark:bg-surface-dim w-full sticky top-0 shadow-sm shadow-forest-green/5 border-b border-warm-beige/30 z-50 transition-transform duration-200">
                <div className="flex justify-between items-center w-full px-margin-desktop py-4 max-w-container-max mx-auto z-50">

                    {/* Brand */}
                    <div className="text-headline-md font-headline-md font-bold text-forest-green dark:text-primary-fixed-dim">
                        H'Leven
                    </div>

                    {/* Navigation Links */}
                    <ul className="flex items-center gap-6">
                        <li>
                            <Link className="text-forest-green dark:text-primary-fixed-dim font-bold border-b-2 border-forest-green pb-1 font-label-md text-label-md hover:text-forest-green dark:hover:text-primary-fixed hover:bg-warm-beige/10 transition-colors" to="/">
                                Hotels
                            </Link>
                        </li>
                        <li>
                            <Link className="text-on-surface-variant dark:text-surface-variant font-medium font-label-md text-label-md hover:text-forest-green dark:hover:text-primary-fixed hover:bg-warm-beige/10 transition-colors" to="/">
                                Resorts
                            </Link>
                        </li>
                        <li>
                            <Link className="text-on-surface-variant dark:text-surface-variant font-medium font-label-md text-label-md hover:text-forest-green dark:hover:text-primary-fixed hover:bg-warm-beige/10 transition-colors" to="/">
                                Our Story
                            </Link>
                        </li>
                        <li>
                            <Link className="text-on-surface-variant dark:text-surface-variant font-medium font-label-md text-label-md hover:text-forest-green dark:hover:text-primary-fixed hover:bg-warm-beige/10 transition-colors" to="/">
                                Promotions
                            </Link>
                        </li>
                    </ul>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="bg-forest-green text-white px-6 py-2 rounded-full font-label-md text-label-md hover:bg-primary transition-colors active:scale-[0.99] duration-200"
                        >
                            Book Now
                        </Link>
                        <Link to="/profile" className="hidden md:flex text-forest-green dark:text-primary-fixed-dim hover:bg-warm-beige/10 p-2 rounded-full transition-colors">
                            <span className="material-symbols-outlined">person</span>
                        </Link>
                    </div>

                </div>
            </nav>

            {/* Main Content Canvas */}
            <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-stack-lg pb-section-gap">

                {/* Photo Gallery (Mosaic) */}
                <section className="mb-section-gap">
                    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[312px] md:h-[420px] rounded-xl overflow-hidden">

                        {/* Hero Image */}
                        <div className="md:col-span-2 md:row-span-2 h-full w-full">
                            <img
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 cursor-pointer"
                                alt="Luxury hotel exterior"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFCOzZ2t6HGYluaZrVs8VP9M6QMHu-fZrtlvbqm_ORgFB9lr0Mc3kDx1KSPeu88OD2PA7n8YF7dfKctcsR26RkHdmEWL1-u1oOB8RIlFeumnndybJbMg7C50FU65bGMU3MaP5cf5Yn7krdrPv46qi3IpfGCn8-4xeSQz_3gd-5a4OnPus8nToVv6pISGHuDuZIBTd47XFUyLC65a46jlgU_I8z1h-u4i24HPKdGYT0NEB6n87TRr0dlQ"
                            />
                        </div>

                        {/* Small Images */}
                        <div className="hidden md:block h-full w-full">
                            <img
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 cursor-pointer"
                                alt="Hotel suite bedroom"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXysTglvOqh2SKXzIPCWxQbazC8RpnPd7u2Ucj2xOgJLxFBDHH17WBLmbMw5QnMcLACTIXknWXLTljC8FGRyTtBdvk1mxsKNDz_M1qY4FzjOedZGBSjZNnnGQbs2XyMIWBK6WoJ052fVjqEj7kc96zaWQkNLzsrK3pMt-NBpwgt0mvasTH8CsZW2AGN2k_wSg_Tn8K0GTv3DDJYTaQeR8QmEKypzvRrgZHI_KxPOODwrcWgRnmdjC7jg"
                            />
                        </div>
                        <div className="hidden md:block h-full w-full">
                            <img
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 cursor-pointer"
                                alt="Hotel bathroom"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDY105ANQRn3ljH4ZFfS6ADehIHQ6aLXhqpaLY3j_e9km5pvr6OpZERQBLwYiwKPzoL77X7qFCABHKH7ncQmge9_th9RlZ4ZJBuPjx1SaLCqDT5oMRLKKXQRv9yh8fkJ4g1Dsx6V_47DKTPE5yz3zt5ZQL42AvQWEND7ldG6d0Kq0peW528slkozJQ2fGyRORoJ2LmP3xibRG30a2IOGGTZ6UJzrV8w1cHGFoPqPeeMfIiQcA8Y4NpaIg"
                            />
                        </div>
                        <div className="hidden md:block h-full w-full">
                            <img
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 cursor-pointer"
                                alt="Fine dining restaurant"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtSl2rkwYPxGBUdrjC4w_tLXO7CpZb3SZ56YS98QzDOK63zh6WVefPDWAxLvJTEVfD4PUo265n_Y_ARE5sbNEteWiKPXSmYw92Q0KSDekAcmsHGwerfvXceZMhu6kFXGfO9dKQUGN-hlZkuCEfSLYhPyR_zjO3fmpjSLkEs93UrloJV2YxnXQHT_bBnx81eFZR_t7fdJXHvwWx9Y4i1pFqfqpkCeK6XWSLkvmhcbIhrJZakLa9UjOFVg"
                            />
                        </div>
                        <div className="hidden md:block h-full w-full relative">
                            <img
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 cursor-pointer"
                                alt="Outdoor spa area"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAux0JW_10EBTcQ8KDhWjcuMp8CXGrDU8krxkpZydqHMmCw4xc5QCD-dcJJ6TBy3vtrKKGs0_AhLRzUeZ5NTUFzHb5kbVAHpQEb9MrSkpHh3DwggH-xtTrPaa6N_VdaD-OkJ5xCGwdEfZaXLvalYi0Zj_OyY611JELpUsypgx4cTKNfeJN70_lYCCKhe_DhsEpsYfxYU14XsZYhLi2pmuLnujMdrn-dpwaTyXXTmrNaBPdjcsEh0baKsA"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
                                <span className="text-white font-label-md text-label-md flex items-center gap-2">
                                    <span className="material-symbols-outlined" data-icon="grid_view">grid_view</span>
                                    Lihat Semua Foto
                                </span>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Two Columns Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">

                    {/* Left Column: Info, Amenities */}
                    <div className="lg:col-span-2 space-y-section-gap">
                        <section>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex text-status-error">
                                    <span className="material-symbols-outlined" data-icon="star" data-weight="fill">star</span>
                                    <span className="material-symbols-outlined" data-icon="star" data-weight="fill">star</span>
                                    <span className="material-symbols-outlined" data-icon="star" data-weight="fill">star</span>
                                    <span className="material-symbols-outlined" data-icon="star" data-weight="fill">star</span>
                                    <span className="material-symbols-outlined" data-icon="star" data-weight="fill">star</span>
                                </div>
                                <span className="bg-warm-beige/30 text-forest-green px-2 py-0.5 rounded font-label-sm text-label-sm">Hotel Bintang 5</span>
                            </div>
                            <h1 className="font-headline-xl text-headline-xl text-forest-green dark:text-primary-fixed-dim mb-4">H'Leven Resort Bandung</h1>
                            <div className="flex items-center gap-2 text-on-surface-variant mb-6">
                                <span className="material-symbols-outlined text-forest-green" data-icon="location_on">location_on</span>
                                <p className="font-body-md text-body-md">Jl. Ranca Kendal Luhur No.8, Ciburial, Kec. Cimenyan, Kabupaten Bandung, Jawa Barat 40198</p>
                            </div>
                            <div className="text-tertiary space-y-4">
                                <p className="font-headline-md text-headline-md leading-relaxed">
                                    Terletak di dataran tinggi Bandung yang sejuk, H'Leven Resort menawarkan perpaduan sempurna antara kemewahan modern dan keindahan alam yang menenangkan. Dikelilingi oleh pepohonan rimbun dan pemandangan lembah yang menakjubkan, setiap sudut resort ini dirancang untuk memberikan pengalaman menginap yang tak terlupakan.
                                </p>
                                <p className="font-body-md text-body-md mt-4">
                                    Nikmati fasilitas kelas dunia, mulai dari kolam renang infinity yang menghadap langsung ke pegunungan, spa dengan perawatan tradisional yang merelaksasi, hingga pengalaman bersantap fine dining dengan bahan-bahan lokal berkualitas tinggi. H'Leven Resort adalah destinasi sempurna bagi Anda yang mencari ketenangan dan privasi dalam balutan kemewahan yang bersahaja.
                                </p>
                            </div>
                        </section>

                        {/* Amenities */}
                        <section>
                            <h2 className="font-headline-lg text-headline-lg text-forest-green mb-6">Fasilitas Utama</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-surface-container-low border border-warm-beige/30">
                                    <span className="material-symbols-outlined text-forest-green text-3xl" data-icon="wifi">wifi</span>
                                    <span className="font-label-md text-label-md text-on-surface">WiFi Gratis</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-surface-container-low border border-warm-beige/30">
                                    <span className="material-symbols-outlined text-forest-green text-3xl" data-icon="pool">pool</span>
                                    <span className="font-label-md text-label-md text-on-surface">Kolam Renang</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-surface-container-low border border-warm-beige/30">
                                    <span className="material-symbols-outlined text-forest-green text-3xl" data-icon="fitness_center">fitness_center</span>
                                    <span className="font-label-md text-label-md text-on-surface">Pusat Kebugaran</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-surface-container-low border border-warm-beige/30">
                                    <span className="material-symbols-outlined text-forest-green text-3xl" data-icon="restaurant">restaurant</span>
                                    <span className="font-label-md text-label-md text-on-surface">Restoran &amp; Bar</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-surface-container-low border border-warm-beige/30">
                                    <span className="material-symbols-outlined text-forest-green text-3xl" data-icon="spa">spa</span>
                                    <span className="font-label-md text-label-md text-on-surface">Layanan Spa</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-surface-container-low border border-warm-beige/30">
                                    <span className="material-symbols-outlined text-forest-green text-3xl" data-icon="local_parking">local_parking</span>
                                    <span className="font-label-md text-label-md text-on-surface">Parkir Gratis</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Location */}
                    <div className="lg:col-span-1 space-y-section-gap">
                        <section>
                            <h2 className="font-headline-lg text-headline-lg text-forest-green mb-6">Lokasi</h2>
                            <div className="rounded-xl overflow-hidden shadow-sm shadow-forest-green/5 border border-warm-beige/30 bg-surface-container-low">
                                <img
                                    className="w-full h-64 object-cover"
                                    alt="Map location Bandung"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHWC4ZRM20Q249VSjHYnaGbDcD9FeuMuN8knuVrnFoG3FRL8wNlN9W0qKlbc8DBVXZg8LkR956QZ3Yccze9biu4Ebvmevr5d6wurj0gzaRec_nVa84iZswtdJy52wJAgVPgofzf7cKiBpKRdfyxT8kKbIqlNJCJILACK4iHV0DT0-NXUPwCdLZ8ohA0Kdl_xQDpFgsjiMRP2KB33Ssze8-XRwt34UY0ETdgOPowfQ8S1YwmbZ89E1LMw"
                                />
                                <div className="p-4 bg-off-white">
                                    <p className="font-label-md text-label-md text-on-surface">H'Leven Resort Bandung</p>
                                    <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">Berjarak 8.5 km dari pusat kota.</p>
                                    <button className="mt-4 w-full py-2 border border-forest-green text-forest-green rounded-md font-label-md text-label-md hover:bg-warm-beige/20 transition-colors">
                                        Lihat di Peta
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                </div>

                {/* Room Types & Availability */}
                <section className="mt-section-gap">
                    <h2 className="font-headline-lg text-headline-lg text-forest-green mb-8">Pilihan Kamar</h2>
                    <div className="space-y-6">

                        {/* Room Card 1 */}
                        <div className="flex flex-col md:flex-row bg-surface-container-low rounded-xl overflow-hidden border border-warm-beige/30 shadow-sm shadow-forest-green/5">
                            <div className="md:w-1/3">
                                <img
                                    className="w-full h-full object-cover min-h-[200px]"
                                    alt="Deluxe Room with Valley View"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVmhtfOxLiFjWYP8UugYBvl2yb3jurb3m3NTtsfqlR1fm5INUxNXfkRdawFACTmFTAZmtFEp_gV57ODHzCSpRy8pkoKz1tDSQ_hw8gqMb5-um0Y3pLny2dnYRnhvA56jqQwB7HlE7-RwjeMCv6PHRUUxxbo7ECXgd9SfPEkeikF1n6ZQvU1RPI1NaEns8LQdsfC3h-MByST7FhYgdCx1hCItFW-up1tYWLnaUkJ64IhvR7eyGhhYCSlQ"
                                />
                            </div>
                            <div className="p-6 flex flex-col justify-between flex-grow">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-headline-md text-headline-md text-forest-green">Deluxe Room with Valley View</h3>
                                        <span className="bg-surface-variant text-forest-green px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]" data-icon="group">group</span> 2 Tamu
                                        </span>
                                    </div>
                                    <p className="font-body-md text-body-md text-on-surface-variant mb-4">Kamar seluas 45 meter persegi dengan balkon pribadi yang menawarkan pemandangan lembah yang menakjubkan. Dilengkapi dengan ranjang king-size dan kamar mandi marmer.</p>
                                    <div className="flex gap-4 mb-4">
                                        <div className="flex items-center gap-1 text-sm text-on-surface-variant"><span className="material-symbols-outlined text-[18px]" data-icon="check">check</span> Sarapan Termasuk</div>
                                        <div className="flex items-center gap-1 text-sm text-on-surface-variant"><span className="material-symbols-outlined text-[18px]" data-icon="check">check</span> Pembatalan Gratis</div>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mt-4 pt-4 border-t border-warm-beige/30">
                                    <div>
                                        <p className="text-sm text-on-surface-variant line-through">Rp 2.500.000 (Weekend)</p>
                                        <p className="font-headline-lg text-headline-lg text-forest-green font-bold">Rp 1.850.000 <span className="text-sm font-normal text-on-surface-variant">/malam (Weekday)</span></p>
                                        <p className="text-sm text-status-error font-medium mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]" data-icon="local_fire_department">local_fire_department</span> Hanya sisa 2 kamar!</p>
                                    </div>
                                    <Link to="/checkout" className="mt-4 md:mt-0 bg-forest-green text-white font-label-md text-label-md px-8 py-3 rounded-md hover:bg-opacity-90 transition-colors shadow-sm shadow-forest-green/20 text-center inline-block">
                                        Pilih Kamar
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Room Card 2 */}
                        <div className="flex flex-col md:flex-row bg-surface-container-low rounded-xl overflow-hidden border border-warm-beige/30 shadow-sm shadow-forest-green/5">
                            <div className="md:w-1/3">
                                <img
                                    className="w-full h-full object-cover min-h-[200px]"
                                    alt="Executive Suite with Private Pool"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxX3oI9JLQ7akkFYipGwEWqI-E3qM1ki8JFC4x65GhNUDAc0VnmehaA-fHqlFmopHK7x2ioGEVCEhOrLld6GkLxn8FEXlu1apT2Nzt9VMexrxlbTLRYIfQ3Ik71155xEIL-Q_1Hz-ebDkm1t1W7k8J6tmi8zwLdJ0drpj2c8aLTyCqNlMkVinJdHCidF9sME-FH5m7e1t_sej7Q5YMHXleHa2WyNvfquweK8c0LnyEak63MZPAgCHTnQ"
                                />
                            </div>
                            <div className="p-6 flex flex-col justify-between flex-grow">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-headline-md text-headline-md text-forest-green">Executive Suite with Private Pool</h3>
                                        <span className="bg-surface-variant text-forest-green px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]" data-icon="group">group</span> 2 Tamu
                                        </span>
                                    </div>
                                    <p className="font-body-md text-body-md text-on-surface-variant mb-4">Suite mewah seluas 80 meter persegi dengan kolam rendam pribadi, ruang tamu terpisah, dan akses eksklusif ke Club Lounge. Pilihan sempurna untuk bulan madu.</p>
                                    <div className="flex gap-4 mb-4">
                                        <div className="flex items-center gap-1 text-sm text-on-surface-variant"><span className="material-symbols-outlined text-[18px]" data-icon="check">check</span> Sarapan Termasuk</div>
                                        <div className="flex items-center gap-1 text-sm text-on-surface-variant"><span className="material-symbols-outlined text-[18px]" data-icon="check">check</span> Akses Lounge</div>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mt-4 pt-4 border-t border-warm-beige/30">
                                    <div>
                                        <p className="text-sm text-on-surface-variant line-through">Rp 4.500.000 (Weekend)</p>
                                        <p className="font-headline-lg text-headline-lg text-forest-green font-bold">Rp 3.200.000 <span className="text-sm font-normal text-on-surface-variant">/malam (Weekday)</span></p>
                                    </div>
                                    <Link to="/checkout" className="mt-4 md:mt-0 bg-forest-green text-white font-label-md text-label-md px-8 py-3 rounded-md hover:bg-opacity-90 transition-colors shadow-sm shadow-forest-green/20 text-center inline-block">
                                        Pilih Kamar
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="w-full bg-surface-container-highest dark:bg-inverse-surface border-t border-warm-beige/20 pt-section-gap pb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter w-full px-margin-desktop max-w-container-max mx-auto mb-12">

                    <div className="col-span-1 md:col-span-1">
                        <div className="text-headline-md font-headline-md font-bold text-forest-green dark:text-primary-fixed-dim mb-4">
                            H'Leven
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
                            Redefining luxury hospitality with sophisticated, trustworthy, and welcoming experiences across our premium locations.
                        </p>
                    </div>

                    <div className="col-span-1">
                        <h4 className="font-label-md text-label-md text-forest-green dark:text-primary-fixed-dim font-bold mb-4">Tautan Berguna</h4>
                        <ul className="space-y-2">
                            <li><Link className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant hover:text-forest-green transition-colors" to="/">Privacy Policy</Link></li>
                            <li><Link className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant hover:text-forest-green transition-colors" to="/">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div className="col-span-1">
                        <h4 className="font-label-md text-label-md text-forest-green dark:text-primary-fixed-dim font-bold mb-4">Bantuan</h4>
                        <ul className="space-y-2">
                            <li><Link className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant hover:text-forest-green transition-colors" to="/">Support Center</Link></li>
                            <li><Link className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant hover:text-forest-green transition-colors" to="/">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div className="col-span-1">
                        <h4 className="font-label-md text-label-md text-forest-green dark:text-primary-fixed-dim font-bold mb-4">Perusahaan</h4>
                        <ul className="space-y-2">
                            <li><Link className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant hover:text-forest-green transition-colors" to="/">Careers</Link></li>
                        </ul>
                    </div>

                </div>

                <div className="w-full px-margin-desktop max-w-container-max mx-auto border-t border-warm-beige/20 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
                        © 2024 H'Leven Hospitality Group. All rights reserved.
                    </p>
                </div>
            </footer>

        </div>
    );
}