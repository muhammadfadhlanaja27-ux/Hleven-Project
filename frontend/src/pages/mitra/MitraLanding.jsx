import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

const MitraLanding = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [stats, setStats] = useState({ total_mitra: 0, total_mitra_diterima: 0, total_tamu: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/public-stats");
        setStats(response.data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };
    fetchStats();
  }, []);

  const handleDaftarClick = (e) => {
    e.preventDefault();
    if (token) {
      navigate("/mitra/daftar");
    } else {
      navigate("/login", { state: { from: "/mitra/daftar" } });
    }
  };

  const benefits = [
    {
      icon: "public",
      title: "Broad Customer Reach",
      desc: "Access millions of potential guests worldwide looking for premium stay experiences.",
    },
    {
      icon: "manage_accounts",
      title: "Easy Management",
      desc: "An intuitive dashboard to quickly manage availability, content, and promotions.",
    },
    {
      icon: "tune",
      title: "Room & Price Control",
      desc: "Full flexibility to allocate rooms and set dynamic pricing strategies.",
    },
    {
      icon: "book_online",
      title: "Reservation Management",
      desc: "Real-time booking system that automatically reduces overbooking risks.",
    },
    {
      icon: "payments",
      title: "Integrated Payments",
      desc: "Secure payment processing and seamless, transparent fund payouts.",
    },
    {
      icon: "support_agent",
      title: "Platform Support",
      desc: "A dedicated support team ready to help optimize your profile and operations.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Register & Fill Form",
      desc: "Complete hotel details, location, owner info, legal documents, and bank details.",
      icon: "edit_document",
    },
    {
      num: "02",
      title: "Verification Process",
      desc: "The H'Leven team will review your submitted details and document validity.",
      icon: "fact_check",
    },
    {
      num: "03",
      title: "Hotel Active & Accept Guests",
      desc: "Once approved, your hotel goes live immediately to receive reservations.",
      icon: "celebration",
    },
  ];

  const faqs = [
    {
      q: "Is there a fee to register as an H'Leven Partner?",
      a: "Partner registration is FREE. H'Leven applies a commission per successful reservation transaction.",
    },
    {
      q: "How long does the verification process take?",
      a: "The verification process takes 3-7 business days after all required documents are received.",
    },
    {
      q: "What documents are required?",
      a: "Owner ID/Passport, hotel legal documents (SIUP, TDUP, NIB), and other supporting documents.",
    },
    {
      q: "Can I manage more than one hotel?",
      a: "Of course. Once your account is approved, you can add other hotel properties through the dashboard.",
    },
    {
      q: "How do I receive payments?",
      a: "Guest payments will be forwarded to your registered bank account according to the payout schedule.",
    },
  ];

  const [openFaq, setOpenFaq] = React.useState(null);

  return (
    <div className="bg-[#fcf9f4] text-[#1c1c19] font-body-md antialiased min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full min-h-[75vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Luxury Hotel Resort"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.classList.add("bg-gradient-to-br", "from-[#50604d]", "to-[#615b54]");
            }}
          />
          <div className="absolute inset-0 bg-black/55" />
        </div>
        <div className="relative z-10 text-center px-5 md:px-16 max-w-4xl mx-auto py-20">
          <h1 className="font-headline-lg text-3xl md:text-5xl font-bold text-white mb-5 drop-shadow-lg leading-tight">
            Make Your Hotel Part of H'Leven
          </h1>
          <p className="font-body-lg text-base md:text-lg text-[#f3f0eb] mb-9 max-w-2xl mx-auto drop-shadow leading-relaxed">
            Expand your hotel's reach, manage reservations easily, and grow your hotel business with H'Leven's premium reservation platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleDaftarClick}
              className="w-full sm:w-auto bg-[#50604d] hover:bg-[#3b4b39] text-white px-8 py-3.5 rounded-xl font-label-sm text-sm font-bold tracking-wider transition-colors shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                Register Now
              </span>
            </button>
            <a
              href="#cara-kerja"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-3.5 rounded-xl font-label-sm text-sm font-bold tracking-wider transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">play_circle</span>
                Learn How It Works
              </span>
            </a>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-6 max-w-xl mx-auto text-white">
            <div className="flex flex-col items-center gap-1">
              <span className="font-headline-lg text-2xl md:text-3xl font-bold">{stats.total_mitra.toLocaleString('en-US')}</span>
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-white/75">Total Applicants</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-headline-lg text-2xl md:text-3xl font-bold">{stats.total_mitra_diterima.toLocaleString('en-US')}</span>
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-white/75">Partners Accepted</span>
            </div>
          </div>
        </div>
      </section>

      {/* Keuntungan Section */}
      <section className="py-16 md:py-24 bg-[#fcf9f4] px-5 md:px-16" id="keuntungan">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-headline-lg text-2xl md:text-4xl font-bold text-[#1c1c19] mb-4">
              Why Partner with H'Leven?
            </h2>
            <p className="font-body-md text-base text-[#444842] max-w-2xl mx-auto">
              Boost your property business performance with the best platform and support from our professional team.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="group bg-white p-7 rounded-2xl border border-[#c4c8bf]/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(80,96,77,0.1)] transition-all hover:-translate-y-1 duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-[#d5e8cf]/50 flex items-center justify-center mb-5 group-hover:bg-[#50604d] transition-colors">
                  <span className="material-symbols-outlined text-[28px] text-[#50604d] group-hover:text-white transition-colors icon-fill">
                    {b.icon}
                  </span>
                </div>
                <h3 className="font-title-md text-lg font-bold text-[#1c1c19] mb-2">{b.title}</h3>
                <p className="font-body-md text-sm text-[#444842] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section className="py-16 md:py-24 bg-[#f0ede9] px-5 md:px-16" id="cara-kerja">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-14">
<h2 className="font-headline-lg text-2xl md:text-4xl font-bold text-[#1c1c19] mb-4">
                Easy & Fast Process
              </h2>
            <p className="font-body-md text-base text-[#444842] max-w-2xl mx-auto">
              Only 3 simple steps to join thousands of our partner hotels.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-20 left-[18%] right-[18%] h-0.5 bg-[#c4c8bf] z-0" />
            {steps.map((s, i) => (
              <div key={i} className="relative z-10 text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-white border-2 border-[#c4c8bf]/80 flex items-center justify-center shadow-sm">
                    <span className="font-headline-lg text-xl font-bold text-[#50604d]">{s.num}</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-full bg-[#50604d] flex items-center justify-center shadow-md border-4 border-[#f0ede9]">
                    <span className="material-symbols-outlined text-[22px] text-white icon-fill">{s.icon}</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-[#c4c8bf]/60 shadow-sm">
                  <h3 className="font-title-md text-lg font-bold text-[#1c1c19] mb-2">{s.title}</h3>
                  <p className="font-body-md text-sm text-[#444842] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-[#fcf9f4] px-5 md:px-16" id="faq">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#eae1d8]/50 text-[#615b54] text-[11px] font-bold uppercase tracking-widest rounded-full mb-4">
              <span className="material-symbols-outlined text-[14px]">help</span>
              FAQ
            </span>
            <h2 className="font-headline-lg text-2xl md:text-4xl font-bold text-[#1c1c19] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="font-body-md text-base text-[#444842]">
              Find answers to common questions about the H'Leven hotel partnership program.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#c4c8bf]/60 overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-[#faf3ea]/40 transition-colors"
                >
                  <span className="font-label-md text-sm font-bold text-[#1c1c19]">{f.q}</span>
                  <span
                    className={`material-symbols-outlined text-[#50604d] shrink-0 transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 pt-0 border-t border-[#c4c8bf]/40">
                    <p className="font-body-md text-sm text-[#444842] leading-relaxed pt-4">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 px-5 md:px-16 bg-gradient-to-br from-[#50604d] via-[#4c6549] to-[#615b54]">
        <div className="max-w-4xl mx-auto text-center">
          <span className="material-symbols-outlined text-[56px] text-[#baccb4] mb-5 icon-fill">apartment</span>
            <h2 className="font-headline-lg text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Ready to Take Your Hotel to the Next Level?
          </h2>
          <p className="font-body-lg text-base md:text-lg text-[#f3f0eb]/90 mb-9 max-w-2xl mx-auto leading-relaxed">
            Join thousands of partner hotels that have experienced increased occupancy and revenue with H'Leven.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleDaftarClick}
              className="w-full sm:w-auto bg-white text-[#50604d] hover:bg-[#f3f0eb] px-10 py-4 rounded-xl font-label-sm text-sm font-bold tracking-wider transition-colors shadow-xl active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">flag</span>
                Become a Partner Now
              </span>
            </button>
            <Link
              to="/hotels"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl font-label-sm text-sm font-bold tracking-wider transition-colors"
            >
              View Our Partner Hotels
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MitraLanding;
