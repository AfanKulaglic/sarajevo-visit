export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  reward: string;
  description: string; // short subtitle shown on map card
  story: string;       // full historical narrative shown in collection detail
  emoji: string;
  icon?: string;       // Custom artwork image (webp/png) — shown in collection, cards and map
  modelGlb?: string;   // Preferred: Draco-compressed GLB (single file, embedded textures)
  modelUrl?: string;   // Sketchfab embed URL fallback
  modelObj?: string;   // Legacy OBJ path (kept as fallback)
  modelMtl?: string;   // Legacy MTL path (kept as fallback)
  videoUrl?: string;   // YouTube embed or direct video URL
  images?: string[];   // Array of image URLs shown in the photo gallery
}

export const locations: Location[] = [
  {
    id: "1",
    name: "Sebilj",
    lat: 43.8597,
    lng: 18.4289,
    reward: "sebilj",
    description: "The iconic Ottoman fountain at the heart of Baščaršija",
    story:
      "The Sebilj is the beating heart of Sarajevo. This ornate Ottoman wooden fountain, crowned with a domed roof and surrounded by pigeons, has stood in the center of Baščaršija since 1891 — itself a faithful replica of the original built in 1753 by Mehmed-Beg Myftić. Local legend holds that whoever drinks from its waters will always return to Sarajevo. A symbol of Ottoman heritage and the city's enduring spirit, the Sebilj remains the most photographed landmark in Bosnia.",
    emoji: "⛲",
    icon: "/models/icons/sebilj.webp",
    modelGlb: "/models/glb/sebilj.glb",
    modelUrl: "",
    modelObj: "/models/sebilj+3d+model/tripo_convert_4af3f75b-f20c-49dd-a63e-a39b5d9fd165.obj",
    modelMtl: "/models/sebilj+3d+model/tripo_convert_4af3f75b-f20c-49dd-a63e-a39b5d9fd165.mtl",
  },
  {
    id: "2",
    name: "Vijećnica",
    lat: 43.8592,
    lng: 18.4342,
    reward: "vijecnica",
    description: "The magnificent Austro-Hungarian City Hall",
    story:
      "Built in 1896 under Austro-Hungarian administration, Vijećnica (the City Hall) was designed by Czech architect Karel Pařík in a striking pseudo-Moorish style. Its colorful facade and grand interior made it one of the most beautiful buildings in the Balkans. On the night of August 25–26, 1992, Serbian forces deliberately shelled and burned the building during the siege of Sarajevo, destroying over 1.5 million irreplaceable books, manuscripts, and historical documents. After two decades of painstaking restoration, Vijećnica reopened on June 9, 2014 — a triumph of resilience and cultural memory.",
    emoji: "🏛️",
    icon: "/models/icons/vijecnica.webp",
    modelGlb: "/models/glb/vijecnica.glb",
    modelUrl: "",
    modelObj: "/models/Vije%C4%87nica/historic+building+3d+model.obj",
    modelMtl: "/models/Vije%C4%87nica/historic+building+3d+model.mtl",
  },
  {
    id: "6",
    name: "Sahat Kula",
    lat: 43.8597,
    lng: 18.4292,
    reward: "sahat_kula",
    description: "A 17th-century clock tower that still runs on Ottoman lunar time",
    story:
      "The Sahat Kula — Clock Tower — stands 25 metres tall near the Gazi Husrev-beg Mosque, built in the early 17th century as part of the grand Ottoman complex that defined Baščaršija. What makes it unlike any other clock in the world is how it tells time: not by the sun, but by the moon. It runs on Alaturka time, a system where each new day begins at sunset, so the clock must be manually reset every evening as the length of night shifts with the seasons. For centuries, a dedicated timekeeper — the sahatćija — climbed the tower each dusk to perform this ritual. Today, the Sahat Kula is one of the last functioning lunar-time clocks on earth, a living relic of an Ottoman world that measured hours differently.",
    emoji: "🕰️",
    icon: "/models/icons/sahat%20kula.webp",
    modelGlb: "/models/glb/clock-tower.glb",
    modelUrl: "",
    modelObj: "/models/clock%20tower%203d%20model/clock+tower+3d+model.obj",
    modelMtl: "/models/clock%20tower%203d%20model/clock+tower+3d+model.mtl",
  },
  {
    id: "7",
    name: "Vječna Vatra",
    lat: 43.8584,
    lng: 18.4104,
    reward: "vjec_na_vatra",
    description: "The Eternal Flame — Sarajevo's unbroken tribute to the fallen",
    story:
      "On April 6, 1946 — one year to the day after Sarajevo was liberated from Nazi occupation — a flame was lit on what is now Ferhadija Street and has not gone out since. The Vječna Vatra, the Eternal Flame, burns in memory of the soldiers and civilians who died during World War II. It survived the four-year siege of Sarajevo from 1992 to 1995, one of the longest sieges of a capital city in the history of modern warfare. When the gas supply was cut during the siege and the flame began to die, citizens gathered in the streets to protect it. The flame was relit by hand and kept burning through the war. It is not merely a monument — it is a covenant between the city and its dead, renewed every moment it burns.",
    emoji: "🔥",
    icon: "/models/icons/vijecna%20vatra.webp",
    modelGlb: "/models/glb/eternal-flame.glb",
    modelUrl: "",
    modelObj: "/models/eternal+flame+torus+3d+model/tripo_convert_091b4a0e-0d85-4275-9f83-3a08883d05a0.obj",
    modelMtl: "/models/eternal+flame+torus+3d+model/tripo_convert_091b4a0e-0d85-4275-9f83-3a08883d05a0.mtl",
  },
  {
    id: "8",
    name: "Monument to the Murdered Children of Sarajevo",
    lat: 43.8610,
    lng: 18.3977,
    reward: "monument_children",
    description: "A solemn witness to the 1,601 children killed during the siege",
    story:
      "Between April 1992 and February 1996, Sarajevo endured the longest siege of any capital city in the history of modern warfare. Among the 13,952 documented victims were 1,601 children — some as young as infants — killed by sniper fire and mortar shells while playing, sleeping, or walking to school. The Monument to the Murdered Children of Sarajevo stands as a perpetual witness to that truth. Inaugurated to honor each child by name, it refuses the comfort of abstraction. These were not statistics — they were children with names, families, and futures. The monument does not let the world forget that among all the losses of the Sarajevo siege, the most irreplaceable were its youngest victims, whose voices were silenced before they had truly begun.",
    emoji: "🕊️",
    icon: "/models/icons/spomenik%20poginuloj%20djeci%20sarajeva.webp",
    modelGlb: "/models/glb/monument-children.glb",
    modelObj: "/models/Monument%20to%20the%20Murdered%20Children/fountain+sculpture+3d+model.obj",
    modelMtl: "/models/Monument%20to%20the%20Murdered%20Children/fountain+sculpture+3d+model.mtl",
  },
  {
    id: "9",
    name: "Multicultural Man",
    lat: 43.8582,
    lng: 18.4138,
    reward: "multicultural_man",
    description: "A bronze symbol of Sarajevo's identity as a meeting point of worlds",
    story:
      "Standing at the heart of Sarajevo, the Multicultural Man sculpture embodies the city's most enduring truth: that it has never belonged to only one people, one faith, or one culture. Sarajevo is one of the rare cities in the world where a mosque, a Catholic cathedral, an Orthodox church, and a synagogue stand within minutes of each other — not as monuments to tolerance, but as living places of worship that have coexisted for centuries. The figure of the Multicultural Man is an artistic statement that this coexistence is not incidental to Sarajevo's identity — it is its identity. In a city that survived a siege and chose to remain open, the sculpture stands as a reminder that what makes Sarajevo extraordinary is precisely what it has always been: a place where difference is not a problem to be solved, but the very texture of everyday life.",
    emoji: "🌍",
    icon: "/models/icons/multikulturalni%20covjek.webp",
    modelGlb: "/models/glb/multicultural-man.glb",
    modelObj: "/models/Multicultural%20Man/metal+statue+3d+model.obj",
    modelMtl: "/models/Multicultural%20Man/metal+statue+3d+model.mtl",
  },
];
