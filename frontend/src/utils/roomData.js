// Shared Mock Data & LocalStorage helper for Room Facilities and Rooms

export const INITIAL_ROOM_FACILITIES = [
  { id: 1, name: "Air Conditioning", description: "Air conditioning available in the room.", status: "active", icon: "ac_unit" },
  { id: 2, name: "Television", description: "Smart TV (65\") with streaming services.", status: "active", icon: "tv" },
  { id: 3, name: "Mini Refrigerator", description: "Mini refrigerator available in selected rooms.", status: "active", icon: "kitchen" },
  { id: 4, name: "Private Bathroom", description: "Private bathroom with luxury organic amenities.", status: "active", icon: "bathtub" },
  { id: 5, name: "Balcony", description: "Private balcony with city/garden view.", status: "inactive", icon: "balcony" },
  { id: 6, name: "Wi-Fi Access", description: "High-speed Wi-Fi in room.", status: "active", icon: "wifi" },
  { id: 7, name: "Room Service", description: "24/7 Room service access.", status: "active", icon: "room_service" },
];

export const INITIAL_ROOMS = [
  {
    id: 1,
    name: "Deluxe King Room",
    type: "Deluxe",
    description: "Kamar luas dengan tempat tidur ukuran King, pemandangan kota yang memukau, serta pencahayaan alami yang lembut.",
    weekday_price: 500000,
    weekend_price: 650000,
    capacity: 2,
    stock: 10,
    occupied: 3,
    facilityIds: [1, 2, 4, 6],
    status: "Available",
    photos: [
      {
        id: "p1",
        url: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
        name: "Deluxe_King_Main.jpg",
      },
      {
        id: "p2",
        url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
        name: "Deluxe_Bathroom.jpg",
      },
    ],
  },
  {
    id: 2,
    name: "Executive Suite",
    type: "Suite",
    description: "Suite mewah dengan ruang tamu terpisah, fasilitas espresso machine, bathtub privat, dan pelayanan concierge eksklusif.",
    weekday_price: 1200000,
    weekend_price: 1500000,
    capacity: 4,
    stock: 5,
    occupied: 5,
    facilityIds: [1, 2, 3, 4, 6, 7],
    status: "Occupied",
    photos: [
      {
        id: "p3",
        url: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
        name: "Executive_Suite_Living.jpg",
      },
    ],
  },
  {
    id: 3,
    name: "Standard Double Room",
    type: "Standard",
    description: "Kamar standar yang nyaman dan hangat, cocok untuk perjalanan bisnis maupun liburan singkat.",
    weekday_price: 350000,
    weekend_price: 450000,
    capacity: 2,
    stock: 12,
    occupied: 4,
    facilityIds: [1, 2, 4, 6],
    status: "Available",
    photos: [
      {
        id: "p4",
        url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
        name: "Standard_Double.jpg",
      },
    ],
  },
  {
    id: 4,
    name: "Penthouse Presidential Suite",
    type: "Suite",
    description: "Penthouse paling bergengsi di lantai teratas dengan kolam pribadi, jacuzzi, dan pemandangan panorama 360 derajat.",
    weekday_price: 3500000,
    weekend_price: 4200000,
    capacity: 6,
    stock: 2,
    occupied: 2,
    facilityIds: [1, 2, 3, 4, 5, 6, 7],
    status: "Unavailable",
    photos: [
      {
        id: "p5",
        url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
        name: "Penthouse_Master.jpg",
      },
    ],
  },
];

// Helper functions for localStorage sync
export const getStoredRooms = () => {
  try {
    const dataStr = localStorage.getItem("hleven_admin_rooms");
    if (dataStr) return JSON.parse(dataStr);
  } catch (e) {
    console.error("Error loading rooms from localStorage", e);
  }
  localStorage.setItem("hleven_admin_rooms", JSON.stringify(INITIAL_ROOMS));
  return INITIAL_ROOMS;
};

export const saveStoredRooms = (rooms) => {
  try {
    localStorage.setItem("hleven_admin_rooms", JSON.stringify(rooms));
  } catch (e) {
    console.error("Error saving rooms to localStorage", e);
  }
};

export const getStoredRoomFacilities = () => {
  try {
    const dataStr = localStorage.getItem("hleven_admin_room_facilities");
    if (dataStr) return JSON.parse(dataStr);
  } catch (e) {
    console.error("Error loading room facilities from localStorage", e);
  }
  localStorage.setItem("hleven_admin_room_facilities", JSON.stringify(INITIAL_ROOM_FACILITIES));
  return INITIAL_ROOM_FACILITIES;
};
