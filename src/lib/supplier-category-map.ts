export const CATEGORY_MAP: { keywords: string[]; category: string }[] = [
  { keywords: ["cake", "birthday cake", "wedding cake"], category: "Cakes" },
  { keywords: ["catering", "meals", "food", "chicken", "beef", "meat", "cooking"], category: "Catering" },
  { keywords: ["tent", "marquee"], category: "Tent & Marquee Hire" },
  { keywords: ["chair", "table", "linen"], category: "Chairs & Table Hire" },
  { keywords: ["photo", "photography", "photographer"], category: "Photography" },
  { keywords: ["video", "videographer", "drone"], category: "Videography" },
  { keywords: ["dj", "music", "sound", "speaker", "pa system"], category: "DJs & MCs" },
  { keywords: ["décor", "decor", "balloon", "flowers", "floral", "centrepiece"], category: "Décor" },
  { keywords: ["transport", "shuttle", "bus"], category: "Transport & Shuttle" },
  { keywords: ["livestock", "sheep", "cow", "goat", "slaughter", "abaxheli"], category: "Livestock" },
  { keywords: ["venue", "hall", "space"], category: "Venue & Hall Hire" },
  { keywords: ["mc", "host", "emcee"], category: "DJs & MCs" },
  { keywords: ["makeup", "hair", "beauty"], category: "Hairstylists & Makeup" },
  { keywords: ["traditional", "attire", "clothing", "dress"], category: "Traditional Clothing" },
  { keywords: ["security"], category: "Security" },
  { keywords: ["generator", "power"], category: "Generator Hire" },
  { keywords: ["grave", "burial", "funeral"], category: "Funeral Services" },
  { keywords: ["printing", "invitation", "stationery"], category: "Printing & Invitations" },
];

export function mapItemToCategory(itemName: string): string {
  const lower = itemName.toLowerCase();
  for (const entry of CATEGORY_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.category;
    }
  }
  return itemName;
}
