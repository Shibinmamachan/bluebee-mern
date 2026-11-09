export const COMPANY = {
  name: "Blue Bee", tagline: "Events that hum with perfection",
  phone: "+91 85920 19430", email: "shibinm305@gmail.com", address: "Your street, Your city, Kerala",
  wa: import.meta.env.VITE_WA || "918592019430",
};
export const WA_LINK = `https://wa.me/${COMPANY.wa}?text=${encodeURIComponent("Hi Blue Bee, I'd like to enquire about an event.")}`;

export const SERVICES = [
  { slug: "wedding-decor", name: "Wedding Decor", image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1000", short: "Mandaps, stages and florals designed around your story.",
    long: "From traditional mandaps to modern minimalist stages, our design team shapes every corner of your venue with flowers, fabric, lighting and props.",
    points: ["Theme & mood-board design", "Mandap, stage and entrance decor", "Floral and lighting installations", "On-site setup and teardown"] },
  { slug: "wedding-management", name: "Wedding Management", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1000", short: "Every ritual, vendor and guest handled end to end.",
    long: "We run your wedding like clockwork — schedules, vendors, guest hospitality and the thousand small things — so your family can simply enjoy it.",
    points: ["Pre-wedding to reception planning", "Vendor coordination & budgeting", "Guest travel, stay and hospitality", "Day-of command team"] },
  { slug: "conference-management", name: "Conference Management", image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1000", short: "Seminars and summits delivered with precision.",
    long: "Registration, speakers, AV, branding and logistics for conferences of every size, managed by one accountable team.",
    points: ["Venue sourcing & layout", "Registration and badge systems", "Speaker and agenda management", "AV, streaming and branding"] },
  { slug: "award-ceremony", name: "Award Ceremonies", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1000", short: "Glamorous nights with stage-ready production.",
    long: "Scripted, rehearsed and beautifully lit award nights — from red carpet to the final trophy.",
    points: ["Concept, script and run-of-show", "Stage, LED and lighting design", "Anchors, performers and trophies", "Red carpet and guest flow"] },
  { slug: "mice", name: "MICE", image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000", short: "Meetings, incentives, conferences and exhibitions.",
    long: "Corporate travel and events that motivate teams and clients, combined into one smooth programme.",
    points: ["Incentive trips and offsites", "Corporate meetings", "Team-building experiences", "Travel and stay logistics"] },
  { slug: "product-launch", name: "Product Launch", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000", short: "Reveal your brand with a bang.",
    long: "Launch events built to get attention — immersive reveals, media coverage and content you can reuse.",
    points: ["Launch concept and staging", "Media and influencer management", "Demo zones and experiences", "Photo/video coverage"] },
  { slug: "hybrid-virtual-event", name: "Hybrid & Virtual Events", image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1000", short: "Reach audiences in the room and online.",
    long: "Studio-quality streaming, interactive platforms and on-site production for events that go beyond one location.",
    points: ["Live streaming & multi-camera", "Interactive audience tools", "Hybrid stage design", "Recording and editing"] },
  { slug: "exhibition-trade-fair", name: "Exhibitions & Trade Fairs", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000", short: "Stalls and pavilions that pull crowds.",
    long: "Booth design, fabrication and on-ground management that help your brand stand out on the show floor.",
    points: ["Stall design and build", "Branding and signage", "Lead-capture setup", "Logistics and manpower"] },
  { slug: "artist-management", name: "Artist Management", image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1000", short: "Singers, DJs, anchors and performers on call.",
    long: "Book the right talent for your event — with contracts, riders and technical needs fully handled.",
    points: ["Artist shortlisting", "Contracts and riders", "Travel and green-room care", "Sound check coordination"] },
  { slug: "stage-event", name: "Stage Events", image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1000", short: "Concerts, cultural shows and festivals.",
    long: "Professional stage, sound and lighting for shows large and small.",
    points: ["Stage and truss", "Line-array sound", "Intelligent lighting", "Technical crew"] },
  { slug: "catering", name: "Catering", image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000", short: "Fresh multi-cuisine menus for any crowd.",
    long: "Hygienic, flavourful catering for weddings, parties and corporate gatherings, from 50 to 5,000 guests.",
    points: ["Veg / non-veg multi-cuisine", "Live counters", "Custom menus", "Trained service staff"] },
  { slug: "farm-party", name: "Farm Parties", image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1000", short: "Open-air celebrations in green, private venues.",
    long: "Birthdays, reunions and pre-wedding functions set against farmland, with decor, music and food arranged for you.",
    points: ["Venue sourcing", "Lighting and decor", "DJ and music", "Food and bar"] },
];

export const GALLERY = [
  { t: "Royal Mandap", c: "Weddings", img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1000" },
  { t: "Awards Night", c: "Corporate", img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1000" },
  { t: "Lakeside Reception", c: "Weddings", img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1000" },
  { t: "Tech Summit", c: "Corporate", img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1000" },
  { t: "Farm Birthday", c: "Parties", img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1000" },
  { t: "Live Concert", c: "Stage", img: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1000" },
  { t: "Product Reveal", c: "Corporate", img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000" },
  { t: "Haldi Decor", c: "Weddings", img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1000" },
  { t: "Gala Dinner", c: "Parties", img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000" },
  { t: "Garden Wedding Setup", c: "Weddings", img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1000" },
  { t: "Conference Experience", c: "Corporate", img: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000" },
  { t: "Festival Lights", c: "Stage", img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000" },
  { t: "Elegant Table Styling", c: "Parties", img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000" },
  { t: "Live Music Celebration", c: "Stage", img: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1000" },
  { t: "Wedding Floral Details", c: "Weddings", img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1000" },
]

// Add your own licensed event videos to client/public/videos using these filenames.
// The video gallery will automatically play them when the files are present.
export const VIDEOS = [
  { title: "Wedding Highlights", category: "Weddings", src: "/videos/wedding-highlights.mp4", poster: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1000" },
  { title: "Corporate Event Highlights", category: "Corporate", src: "/videos/corporate-highlights.mp4", poster: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1000" },
  { title: "Stage & Concert Moments", category: "Stage", src: "/videos/stage-highlights.mp4", poster: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1000" },
];

export const TESTIMONIALS = [
  { n: "Client name", r: "Wedding", q: "Replace this with a real review from one of your happy clients." },
  { n: "Client name", r: "Corporate event", q: "Replace this with a real review from one of your happy clients." },
  { n: "Client name", r: "Farm party", q: "Replace this with a real review from one of your happy clients." },
];

export const WHY = [
  { title: "Single point of contact", text: "One planner owns your event from first call to final bow." },
  { title: "Live availability", text: "See open dates instantly and book online." },
  { title: "Fast replies", text: "Chat with us on WhatsApp any time." },
];

export const STEPS = [
  { t: "Pick a date", p: "Open the live calendar and choose a green day." },
  { t: "We confirm by email", p: "Every request is reviewed by our team, usually within a day." },
  { t: "We plan together", p: "A planner is assigned and walks you through design, vendors and budget." },
  { t: "You enjoy the day", p: "Our crew runs the event while you stay with your guests." },
];

// Built-in images. The admin panel can replace any of these (see "Site images").
export const DEFAULT_IMAGES = {
  "hero.image": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1800",
  "band.image": "https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=1600",
  "cta.image": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600",
  "about.image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1400",
  "why.0": "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800",
  "why.1": "https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800",
  "why.2": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
  ...Object.fromEntries(SERVICES.map((s) => [`service.${s.slug}`, s.image])),
};
