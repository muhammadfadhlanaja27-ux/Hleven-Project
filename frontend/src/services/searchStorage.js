const STORAGE_KEY = 'hleven_search_params';

export const fmtDateStr = (dateObj) => {
  if (!dateObj || isNaN(dateObj.getTime())) return '';
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const parseDateStr = (str) => {
  if (!str) return null;
  const d = new Date(str.includes('T') ? str : `${str}T00:00:00`);
  return !isNaN(d.getTime()) ? d : null;
};

export const getSearchState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

export const saveSearchState = (state) => {
  try {
    const current = getSearchState() || {};
    const updated = {
      ...current,
      ...state,
      checkIn: state.checkIn ? (state.checkIn instanceof Date ? fmtDateStr(state.checkIn) : state.checkIn) : current.checkIn,
      checkOut: state.checkOut ? (state.checkOut instanceof Date ? fmtDateStr(state.checkOut) : state.checkOut) : current.checkOut,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return state;
  }
};

export const getInitialSearchValues = (searchParams) => {
  const stored = getSearchState() || {};
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);

  const rawCheckIn = searchParams?.get('check_in') || searchParams?.get('check_in_date') || searchParams?.get('checkIn') || stored.checkIn;
  const rawCheckOut = searchParams?.get('check_out') || searchParams?.get('check_out_date') || searchParams?.get('checkOut') || stored.checkOut;

  const checkInDate = parseDateStr(rawCheckIn) || today;
  const checkOutDate = parseDateStr(rawCheckOut) || tomorrow;

  const adults = Number(searchParams?.get('adults')) || Number(stored.adults) || 2;
  const children = Number(searchParams?.get('children')) || Number(stored.children) || 0;
  const rooms = Number(searchParams?.get('rooms')) || Number(stored.rooms) || 1;
  const searchTerm = searchParams?.get('search') || searchParams?.get('location') || stored.search || '';

  return {
    checkInDate,
    checkOutDate,
    checkInStr: fmtDateStr(checkInDate),
    checkOutStr: fmtDateStr(checkOutDate),
    adults,
    children,
    rooms,
    searchTerm,
  };
};
