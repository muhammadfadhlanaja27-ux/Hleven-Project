const FACILITY_ALIASES = {
  "ac area umum": "ac area umum",
  "air conditioning": "air conditioning",
  "kolam renang": "kolam renang",
  "swimming pool": "kolam renang",
  "outdoor swimming pool": "kolam renang",
  "sweeming pool": "kolam renang",
  "swiming pool": "kolam renang",
  "swimmingpool": "kolam renang",
  "wifi": "wi-fi",
  "wi fi": "wi-fi",
  "wi-fi": "wi-fi",
  "internet": "wi-fi",
  "parkir": "parkir",
  "parking": "parkir",
  "guest parking area": "parkir",
  "restoran": "restoran",
  "restaurant": "restoran",
  "restaurant & fine dining": "restoran",
  "gym": "gym",
  "fitness center": "gym",
  "wellness gym center": "gym",
  "pusat kebugaran": "gym",
  "resepsionis 24 jam": "resepsionis 24 jam",
  "resepsionis 24h": "resepsionis 24 jam",
  "reception 24h": "resepsionis 24 jam",
  "front desk 24h": "resepsionis 24 jam",
  "24-hour front desk": "resepsionis 24 jam",
  "lift": "lift",
  "elevator": "lift",
  "laundry": "laundry",
  "laundry service": "laundry",
};

const FACILITY_LABELS = {
  "kolam renang": "Kolam Renang",
  "swimming pool": "Kolam Renang",
  "outdoor swimming pool": "Kolam Renang",
  "sweeming pool": "Kolam Renang",
  "swiming pool": "Kolam Renang",
  "swimmingpool": "Kolam Renang",
  "wifi": "Wi-Fi",
  "wi fi": "Wi-Fi",
  "wi-fi": "Wi-Fi",
  "internet": "Wi-Fi",
  "parkir": "Parkir",
  "parking": "Parkir",
  "guest parking area": "Parkir",
  "restoran": "Restoran",
  "restaurant": "Restoran",
  "restaurant & fine dining": "Restoran",
  "gym": "Gym",
  "fitness center": "Gym",
  "wellness gym center": "Gym",
  "pusat kebugaran": "Gym",
  "resepsionis 24 jam": "Resepsionis 24 Jam",
  "resepsionis 24h": "Resepsionis 24 Jam",
  "reception 24h": "Resepsionis 24 Jam",
  "front desk 24h": "Resepsionis 24 Jam",
  "24-hour front desk": "Resepsionis 24 Jam",
  "lift": "Lift",
  "elevator": "Lift",
  "laundry": "Laundry",
  "laundry service": "Laundry",
};

const normalizeFacilityName = (name = "") =>
  name.trim().toLocaleLowerCase().replace(/\s+/g, " ");

export const getFacilityKey = (facility) => {
  const name = normalizeFacilityName(
    typeof facility === "string" ? facility : facility?.name
  );
  const canonicalName = FACILITY_ALIASES[name] || name;
  return canonicalName;
};

export const getFacilityDisplayName = (facility) => {
  const originalName = typeof facility === "string" ? facility : facility?.name;
  const name = normalizeFacilityName(originalName);
  return FACILITY_LABELS[name] || originalName || "";
};

export const matchesFacilitySearch = (facility, query) => {
  const term = normalizeFacilityName(query);
  if (!term) return true;

  return [facility?.name, getFacilityDisplayName(facility)]
    .some((name) => normalizeFacilityName(name).includes(term));
};

export const deduplicateFacilities = (facilities = [], selectedIds = []) => {
  const selected = new Set(selectedIds.map(Number));
  const uniqueFacilities = new Map();

  facilities.forEach((facility) => {
    const key = getFacilityKey(facility);
    const current = uniqueFacilities.get(key);
    const canonicalName = normalizeFacilityName(getFacilityDisplayName(facility));
    const currentCanonicalName = current
      ? normalizeFacilityName(getFacilityDisplayName(current))
      : "";
    const isCanonicalEntry = normalizeFacilityName(facility?.name) === canonicalName;
    const currentIsCanonicalEntry = current
      ? normalizeFacilityName(current.name) === currentCanonicalName
      : false;
    const facilityIsSelected = selected.has(Number(facility.id));
    const currentIsSelected = current && selected.has(Number(current.id));

    if (
      !current ||
      (facilityIsSelected && !currentIsSelected) ||
      (facilityIsSelected === currentIsSelected &&
        isCanonicalEntry &&
        !currentIsCanonicalEntry)
    ) {
      uniqueFacilities.set(key, facility);
    }
  });

  return [...uniqueFacilities.values()].sort((first, second) =>
    getFacilityDisplayName(first).localeCompare(getFacilityDisplayName(second), "id")
  );
};

export const resolveFacilityIcon = (name, icon, fallback = "hotel") => {
  const value = normalizeFacilityName(name);

  if (value.includes("kolam") || value.includes("pool") || value.includes("renang")) return "pool";
  if (value.includes("wifi") || value.includes("wi-fi") || value.includes("internet")) return "wifi";
  if (value.includes("parkir") || value.includes("parking")) return "local_parking";
  if (value.includes("restoran") || value.includes("restaurant")) return "restaurant";
  if (value.includes("gym") || value.includes("fitness") || value.includes("kebugaran")) return "fitness_center";
  if (value.includes("spa") || value.includes("wellness") || value.includes("massage")) return "hot_tub";
  if (value.includes("resepsionis") || value.includes("reception") || value.includes("front desk")) return "concierge";
  if (value.includes("lift") || value.includes("elevator")) return "elevator";
  if (value.includes("laundry") || value.includes("cuci")) return "local_laundry_service";
  if (value.includes("ac") || value.includes("air conditioning")) return "ac_unit";
  if (value.includes("tv") || value.includes("television")) return "tv";
  if (value.includes("bath") || value.includes("mandi") || value.includes("shower") || value.includes("toilet")) return "bathtub";
  if (value.includes("balkon") || value.includes("balcony") || value.includes("teras")) return "balcony";
  if (value.includes("fridge") || value.includes("kulkas") || value.includes("refrigerator")) return "kitchen";
  if (value.includes("hair") || value.includes("dryer") || value.includes("pengering")) return "dry_cleaning";
  if (value.includes("desk") || value.includes("meja kerja")) return "desk";
  if (value.includes("lemari") || value.includes("wardrobe") || value.includes("closet")) return "checkroom";
  if (value.includes("water") || value.includes("air mineral") || value.includes("shower")) return "water_drop";
  if (value.includes("generator")) return "electrical_services";

  return icon && icon !== "star" && icon !== "stars" ? icon : fallback;
};
