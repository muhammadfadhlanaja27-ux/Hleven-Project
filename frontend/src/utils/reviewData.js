// Shared Mock Data & LocalStorage helper for Review Management

export const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    guestId: "g-1",
    guest: {
      name: "Eleanor Vance",
      email: "eleanor.vance@example.com",
      phone: "+62 819 8765 4321",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    roomId: 1,
    room: {
      id: 1,
      name: "Deluxe King Room",
      type: "Deluxe",
      checkIn: "17 Aug 2026",
      checkOut: "19 Aug 2026",
    },
    booking: {
      code: "BK-2026-002",
      status: "Checked Out",
    },
    rating: 5,
    comment:
      "Absolutely impeccable service from start to finish. The attention to detail in the suite design and the organic amenities provided were wonderful touches. Dining at the conservatory restaurant was the highlight of our trip.",
    reviewDate: "2026-08-19",
    isRead: false,
  },
  {
    id: "rev-2",
    guestId: "g-2",
    guest: {
      name: "Marcus Vance",
      email: "marcus.v@example.com",
      phone: "+62 856 1122 3344",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    roomId: 2,
    room: {
      id: 2,
      name: "Executive Suite",
      type: "Suite",
      checkIn: "15 Aug 2026",
      checkOut: "17 Aug 2026",
    },
    booking: {
      code: "BK-2026-003",
      status: "Checked Out",
    },
    rating: 4,
    comment:
      "A very solid experience overall. The room was spacious and quiet, and the spa facilities are top-tier. My only minor critique is that the valet service took slightly longer than expected during peak morning hours.",
    reviewDate: "2026-08-17",
    isRead: true,
  },
  {
    id: "rev-3",
    guestId: "g-3",
    guest: {
      name: "Sarah Chen",
      email: "sarah.chen@example.com",
      phone: "+62 812 9900 1122",
      avatar: null,
    },
    roomId: 1,
    room: {
      id: 1,
      name: "Deluxe King Room",
      type: "Deluxe",
      checkIn: "10 Aug 2026",
      checkOut: "12 Aug 2026",
    },
    booking: {
      code: "BK-2026-007",
      status: "Checked Out",
    },
    rating: 5,
    comment:
      "The concierge team went above and beyond to secure difficult reservations for our anniversary. The dedication of the staff at H'Leven is truly what sets it apart from other luxury properties.",
    reviewDate: "2026-08-12",
    isRead: false,
  },
  {
    id: "rev-4",
    guestId: "g-4",
    guest: {
      name: "Maya Reynolds",
      email: "maya.reynolds@example.com",
      phone: "+62 878 5544 3322",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    },
    roomId: 3,
    room: {
      id: 3,
      name: "Standard Double Room",
      type: "Standard",
      checkIn: "05 Aug 2026",
      checkOut: "07 Aug 2026",
    },
    booking: {
      code: "BK-2026-008",
      status: "Checked Out",
    },
    rating: 3,
    comment:
      "Beautiful property, but we had some issues with the air conditioning in our room on the first night. The staff moved us promptly the next morning, but it was slightly disruptive to our trip.",
    reviewDate: "2026-08-07",
    isRead: true,
  },
  {
    id: "rev-5",
    guestId: "g-5",
    guest: {
      name: "Budi Santoso",
      email: "budi.santoso@example.com",
      phone: "+62 811 2233 4455",
      avatar: null,
    },
    roomId: 3,
    room: {
      id: 3,
      name: "Standard Double Room",
      type: "Standard",
      checkIn: "01 Aug 2026",
      checkOut: "03 Aug 2026",
    },
    booking: {
      code: "BK-2026-009",
      status: "Checked Out",
    },
    rating: 5,
    comment:
      "Pelayanan sangat ramah, lokasi strategis dan kamar super bersih. Sangat merekomendasikan untuk staycation keluarga!",
    reviewDate: "2026-08-03",
    isRead: false,
  },
];

export const getStoredReviews = () => {
  try {
    const dataStr = localStorage.getItem("hleven_admin_reviews");
    if (dataStr) return JSON.parse(dataStr);
  } catch (e) {
    console.error("Error loading reviews from localStorage", e);
  }
  localStorage.setItem("hleven_admin_reviews", JSON.stringify(INITIAL_REVIEWS));
  return INITIAL_REVIEWS;
};

export const saveStoredReviews = (reviews) => {
  try {
    localStorage.setItem("hleven_admin_reviews", JSON.stringify(reviews));
  } catch (e) {
    console.error("Error saving reviews to localStorage", e);
  }
};
