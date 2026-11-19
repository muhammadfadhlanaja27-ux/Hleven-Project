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

  if (value.includes("minibar")) return "kitchen";
  if (value.includes("bar") || value.includes("lounge")) return "local_bar";
  if (value.includes("kafe") || value.includes("cafe")) return "local_cafe";
  if (value.includes("bisnis")) return "business_center";
  if (value.includes("serbaguna")) return "meeting_room";
  if (value.includes("kursi roda") || value.includes("difabel")) return "accessible";
  if (value.includes("bebas rokok") || value.includes("non-smoking")) return "smoke_free";
  if (value.includes("merokok") || value.includes("smoking")) return "smoking_rooms";
  if (value.includes("atm")) return "local_atm";
  if (value.includes("minimarket")) return "local_convenience_store";
  if (value.includes("sauna") || value.includes("jacuzzi")) return "hot_tub";
  if (value.includes("tenis meja")) return "sports_tennis";
  if (value.includes("billiard") || value.includes("biliar")) return "sports_bar";
  if (value.includes("bbq") || value.includes("barbecue")) return "outdoor_grill";
  if (value.includes("rooftop")) return "deck";
  if (value.includes("pengisian daya")) return "ev_station";
  if (value.includes("sepeda")) return "pedal_bike";
  if (value.includes("setrika")) return "iron";
  if (value.includes("p3k") || value.includes("pertolongan")) return "medical_services";
  if (value.includes("detektor asap")) return "detector_smoke";
  if (value.includes("pemadam")) return "fire_extinguisher";
  if (value.includes("penitipan")) return "luggage";
  if (value.includes("musholla") || value.includes("musala")) return "mosque";
  if (value.includes("pemandangan kota") || value.includes("city view")) return "location_city";
  if (value.includes("pemandangan laut") || value.includes("sea view")) return "waves";
  if (value.includes("pemandangan gunung") || value.includes("mountain view")) return "landscape";
  if (value.includes("pemandangan taman") || value.includes("garden view")) return "park";
  if (value.includes("teras")) return "deck";
  if (value.includes("mesin kopi")) return "coffee_maker";
  if (value.includes("teh") || value.includes("kopi")) return "emoji_food_beverage";
  if (value.includes("dapur")) return "kitchen";
  if (value.includes("microwave")) return "microwave";
  if (value.includes("peralatan makan")) return "restaurant";
  if (value.includes("jubah")) return "dry_cleaning";
  if (value.includes("sandal")) return "checkroom";
  if (value.includes("cermin")) return "crop_portrait";
  if (value.includes("lampu")) return "light";
  if (value.includes("colokan listrik")) return "power";
  if (value.includes("usb")) return "usb";
  if (value.includes("kipas") || value.includes("exhaust")) return "mode_fan";
  if (value.includes("water heater") || value.includes("pemanas air")) return "thermostat";
  if (value.includes("rain shower") || value.includes("shower air")) return "shower";
  if (value.includes("wastafel")) return "wash";
  if (value.includes("tisu toilet")) return "receipt_long";
  if (value.includes("toilet")) return "wc";
  if (value.includes("handuk")) return "dry_cleaning";
  if (value.includes("sampo") || value.includes("sabun") || value.includes("kondisioner")) return "soap";
  if (value.includes("sikat gigi")) return "cleaning_services";

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
  if (value.includes("bath") || value.includes("mandi")) return "bathtub";
  if (value.includes("shower")) return "shower";
  if (value.includes("toilet")) return "wc";
  if (value.includes("balkon") || value.includes("balcony") || value.includes("teras")) return "balcony";
  if (value.includes("fridge") || value.includes("kulkas") || value.includes("refrigerator")) return "kitchen";
  if (value.includes("hair") || value.includes("dryer") || value.includes("pengering")) return "dry_cleaning";
  if (value.includes("desk") || value.includes("meja kerja")) return "desk";
  if (value.includes("lemari") || value.includes("wardrobe") || value.includes("closet")) return "checkroom";
  if (value.includes("water") || value.includes("air mineral")) return "water_drop";
  if (value.includes("generator")) return "electrical_services";

  return icon && icon !== "star" && icon !== "stars" ? icon : fallback;
};
