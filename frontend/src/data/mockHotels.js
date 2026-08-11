export const mockHotels = [
  {
    id: 1,
    name: "Grand Asia Hotel Bandung",
    city: "Bandung",
    address: "Jl. Merdeka No. 45, Citarum, Bandung",
    description: "Grand Asia Hotel Bandung menawarkan penginapan elegan dengan pemandangan kota Bandung yang indah. Dilengkapi dengan fasilitas modern, kolam renang infinity, dan restoran berstandar internasional.",
    thumbnail: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    starting_price: 450000,
    rating: 4.8,
    facilities: ["WiFi Gratis", "Kolam Renang", "Restoran", "Parkir Gratis", "AC", "Spa"],
    rooms: [
      { id: 101, name: "Deluxe King Room", price: 450000, capacity: "2 Tamu", bed: "1 King Bed" },
      { id: 102, name: "Executive Suite", price: 750000, capacity: "2 Tamu", bed: "1 Super King Bed" },
      { id: 103, name: "Family Room", price: 1100000, capacity: "4 Tamu", bed: "2 Queen Bed" }
    ]
  },
  {
    id: 2,
    name: "Skyline Luxury Hotel",
    city: "Jakarta",
    address: "Jl. MH Thamrin No. 12, Jakarta Pusat",
    description: "Hotel mewah berbintang 5 di pusat bisnis Jakarta. Cocok untuk perjalanan bisnis maupun liburan keluarga dengan fasilitas mewah abad ini.",
    thumbnail: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    starting_price: 750000,
    rating: 4.9,
    facilities: ["WiFi Gratis", "Gym & Fitness Center", "Restoran", "Bar", "Pusat Bisnis"],
    rooms: [
      { id: 201, name: "Superior Room", price: 750000, capacity: "2 Tamu", bed: "1 Double Bed" },
      { id: 202, name: "Presidential Suite", price: 2500000, capacity: "2 Tamu", bed: "1 King Bed + Lounge" }
    ]
  },
  {
    id: 3,
    name: "Vila Istana Bunga",
    city: "Bandung",
    address: "Jl. Kolonel Masturi Km 9, Parongpong, Bandung",
    description: "Suasana sejuk pegunungan khas Lembang Bandung. Pilihan ideal untuk istirahat dan berkumpul bersama keluarga di akhir pekan.",
    thumbnail: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80",
    starting_price: 350000,
    rating: 4.5,
    facilities: ["Taman", "Area BBQ", "WiFi Gratis", "Dapur Bersama", "Parkir Luas"],
    rooms: [
      { id: 301, name: "Standard Villa Room", price: 350000, capacity: "2 Tamu", bed: "1 Queen Bed" },
      { id: 302, name: "2-Bedroom Cottage", price: 850000, capacity: "4 Tamu", bed: "2 Queen Bed" }
    ]
  },
  {
    id: 4,
    name: "Sunset Beach Resort",
    city: "Bali",
    address: "Jl. Pantai Kuta No. 88, Badung, Bali",
    description: "Resort tepi pantai indah dengan akses langsung ke pasir pantai. Nikmati pemandangan matahari terbenam yang memukau dari kamar Anda.",
    thumbnail: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
    starting_price: 900000,
    rating: 4.7,
    facilities: ["Akses Pantai", "Kolam Renang Outdoor", "Spa", "Restoran Seaview", "Bar"],
    rooms: [
      { id: 401, name: "Ocean View Room", price: 900000, capacity: "2 Tamu", bed: "1 King Bed" },
      { id: 402, name: "Beachfront Villa", price: 1800000, capacity: "2 Tamu", bed: "1 King Bed + Private Pool" }
    ]
  }
];