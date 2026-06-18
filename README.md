# import { useState, useCallback, useRef } from "react";

// ─── MOCK DATA (Prototype — replace with Shopify API in production) ───────────

const PARISI_PRODUCTS = {
  tapware: [
    {
      id: "p001", sku: "PAR-ZIO-BM-CH", name: "Zio Basin Mixer",
      collection: "Zio", finish: "Chrome", price: 485,
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
      description: "Sleek single-lever basin mixer with ceramic disc cartridge.",
      category: "tapware", aiTag: "basin_mixer"
    },
    {
      id: "p002", sku: "PAR-ZIO-BM-MB", name: "Zio Basin Mixer",
      collection: "Zio", finish: "Matte Black", price: 545,
      image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80",
      description: "Sleek single-lever basin mixer with ceramic disc cartridge.",
      category: "tapware", aiTag: "basin_mixer"
    },
    {
      id: "p003", sku: "PAR-CEL-BM-BN", name: "Celia Basin Mixer",
      collection: "Celia", finish: "Brushed Nickel", price: 625,
      image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=80",
      description: "Refined curved basin mixer with premium ceramic cartridge.",
      category: "tapware", aiTag: "basin_mixer"
    },
    {
      id: "p004", sku: "PAR-EDG-BM-GM", name: "Edge Basin Mixer",
      collection: "Edge", finish: "Gunmetal", price: 695,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
      description: "Angular architectural mixer for a bold statement.",
      category: "tapware", aiTag: "basin_mixer"
    },
    {
      id: "p005", sku: "PAR-CEL-SH-CH", name: "Celia Shower Mixer",
      collection: "Celia", finish: "Chrome", price: 785,
      image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80",
      description: "Thermostatic shower mixer with diverter.",
      category: "tapware", aiTag: "shower_mixer"
    },
    {
      id: "p006", sku: "PAR-EDG-SH-MB", name: "Edge Shower Mixer",
      collection: "Edge", finish: "Matte Black", price: 895,
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
      description: "Precision thermostatic mixer with volume control.",
      category: "tapware", aiTag: "shower_mixer"
    },
  ],
  shower_systems: [
    {
      id: "p007", sku: "PAR-ZIO-OH-CH", name: "Zio Overhead Shower 300mm",
      collection: "Zio", finish: "Chrome", price: 385,
      image: "https://images.unsplash.com/photo-1620626011761-996317702519?w=400&q=80",
      description: "300mm square overhead shower with self-cleaning nozzles.",
      category: "shower_systems", aiTag: "overhead_shower"
    },
    {
      id: "p008", sku: "PAR-CEL-SS-MB", name: "Celia Shower System",
      collection: "Celia", finish: "Matte Black", price: 1850,
      image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80",
      description: "Complete shower column with overhead, handshower and body jets.",
      category: "shower_systems", aiTag: "shower_system"
    },
    {
      id: "p009", sku: "PAR-EDG-OH-BN", name: "Edge Overhead Shower 400mm",
      collection: "Edge", finish: "Brushed Nickel", price: 695,
      image: "https://images.unsplash.com/photo-1620626011761-996317702519?w=400&q=80",
      description: "400mm round rainfall overhead with 3-function handshower.",
      category: "shower_systems", aiTag: "overhead_shower"
    },
  ],
  toilets: [
    {
      id: "p010", sku: "PAR-ARC-WF-WH", name: "Arco Wall-Faced Suite",
      collection: "Arco", finish: "White", price: 1250,
      image: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=400&q=80",
      description: "Rimless wall-faced toilet suite with soft-close seat.",
      category: "toilets", aiTag: "toilet"
    },
    {
      id: "p011", sku: "PAR-VEL-WH-WH", name: "Vela Wall-Hung Pan",
      collection: "Vela", finish: "White", price: 1680,
      image: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=400&q=80",
      description: "Rimless wall-hung pan with concealed cistern. WELS 4-star.",
      category: "toilets", aiTag: "toilet"
    },
  ],
  basins: [
    {
      id: "p012", sku: "PAR-ARC-AC-WH", name: "Arco Above Counter Basin 550",
      collection: "Arco", finish: "White", price: 485,
      image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80",
      description: "550mm above counter basin in gloss white vitreous china.",
      category: "basins", aiTag: "basin"
    },
    {
      id: "p013", sku: "PAR-VEL-UC-WH", name: "Vela Under Counter Basin 500",
      collection: "Vela", finish: "White", price: 395,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
      description: "500mm undermount basin for seamless benchtop integration.",
      category: "basins", aiTag: "basin"
    },
  ],
  accessories: [
    {
      id: "p014", sku: "PAR-ZIO-TR-CH", name: "Zio Single Towel Rail 600mm",
      collection: "Zio", finish: "Chrome", price: 185,
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
      description: "600mm single towel rail with concealed fixing.",
      category: "accessories", aiTag: "towel_rail"
    },
    {
      id: "p015", sku: "PAR-ZIO-TR-MB", name: "Zio Single Towel Rail 600mm",
      collection: "Zio", finish: "Matte Black", price: 215,
      image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80",
      description: "600mm single towel rail with concealed fixing.",
      category: "accessories", aiTag: "towel_rail"
    },
    {
      id: "p016", sku: "PAR-CEL-TPH-CH", name: "Celia Toilet Paper Holder",
      collection: "Celia", finish: "Chrome", price: 125,
      image: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=400&q=80",
      description: "Concealed fixing toilet paper holder with cover.",
      category: "accessories", aiTag: "tp_holder"
    },
    {
      id: "p017", sku: "PAR-EDG-HK-MB", name: "Edge Robe Hook",
      collection: "Edge", finish: "Matte Black", price: 95,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
      description: "Double robe hook with concealed fixing plate.",
      category: "accessories", aiTag: "robe_hook"
    },
  ],
  mirrors: [
    {
      id: "p018", sku: "PAR-LUM-MC-900", name: "Lumi LED Mirror Cabinet 900",
      collection: "Lumi", finish: "White/Chrome", price: 1850,
      image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80",
      description: "900mm mirror cabinet with LED lighting, shaving point & demister.",
      category: "mirrors", aiTag: "mirror_cabinet"
    },
    {
      id: "p019", sku: "PAR-LUM-M-800", name: "Lumi Frameless Mirror 800",
      collection: "Lumi", finish: "Frameless", price: 485,
      image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80",
      description: "800×700mm frameless mirror with polished edge.",
      category: "mirrors", aiTag: "mirror"
    },
  ]
};

const FINISHES = [
  { id: "chrome", name: "Chrome", hex: "#C0C0C0" },
  { id: "matte_black", name: "Matte Black", hex: "#1a1a1a" },
  { id: "brushed_nickel", name: "Brushed Nickel", hex: "#8B8680" },
  { id: "gunmetal", name: "Gunmetal", hex: "#3D3D3D" },
  { id: "brushed_gold", name: "Brushed Gold", hex: "#C9A96E" },
  { id: "white", name: "White", hex: "#F8F8F8" },
];

const CATEGORIES = [
  { id: "tapware", label: "Tapware", icon: "💧" },
  { id: "shower_systems", label: "Shower Systems", icon: "🚿" },
  { id: "toilets", label: "Toilets", icon: "🪣" },
  { id: "basins", label: "Basins", icon: "⬜" },
  { id: "accessories", label: "Accessories", icon: "🔩" },
  { id: "mirrors", label: "Mirrors & Cabinets", icon: "🪞" },
];

// ─── STYLES ──────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', sans-serif;
    background: #FAFAF8;
    color: #1C1C1A;
    -webkit-font-smoothing: antialiased;
  }

  :root {
    --gold: #B8965A;
    --gold-light: #D4B483;
    --gold-pale: #F5EDD9;
    --black: #1C1C1A;
    --grey-100: #F5F5F3;
    --grey-200: #E8E8E4;
    --grey-400: #9B9B95;
    --white: #FFFFFF;
    --radius: 2px;
    --shadow: 0 4px 32px rgba(0,0,0,0.06);
    --shadow-hover: 0 8px 48px rgba(0,0,0,0.12);
  }

  .parisi-app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* HEADER */
  .header {
    background: var(--white);
    border-bottom: 1px solid var(--grey-200);
    padding: 0 48px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-wordmark {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 400;
    letter-spacing: 0.15em;
    color: var(--black);
    text-transform: uppercase;
  }

  .logo-divider {
    width: 1px;
    height: 24px;
    background: var(--gold);
    opacity: 0.5;
  }

  .logo-subtitle {
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--gold);
    text-transform: uppercase;
    font-weight: 400;
  }

  .header-nav {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .nav-link {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--grey-400);
    text-decoration: none;
    transition: color 0.2s;
    cursor: pointer;
  }

  .nav-link:hover { color: var(--black); }

  /* HERO */
  .hero {
    background: var(--white);
    padding: 96px 48px 80px;
    text-align: center;
    border-bottom: 1px solid var(--grey-200);
    position: relative;
    overflow: hidden;
  }

  .hero::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--gold), var(--gold-light), var(--gold), transparent);
  }

  .hero-eyebrow {
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 24px;
    font-weight: 400;
  }

  .hero-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(40px, 6vw, 72px);
    font-weight: 300;
    line-height: 1.1;
    color: var(--black);
    margin-bottom: 24px;
    letter-spacing: -0.01em;
  }

  .hero-title em {
    font-style: italic;
    color: var(--gold);
  }

  .hero-subtitle {
    font-size: 15px;
    line-height: 1.7;
    color: var(--grey-400);
    max-width: 520px;
    margin: 0 auto 48px;
    font-weight: 300;
  }

  /* STEPS INDICATOR */
  .steps-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0;
    padding: 32px 48px;
    background: var(--white);
    border-bottom: 1px solid var(--grey-200);
  }

  .step {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .step-number {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 500;
    border: 1px solid var(--grey-200);
    color: var(--grey-400);
    transition: all 0.3s;
  }

  .step.active .step-number {
    background: var(--gold);
    border-color: var(--gold);
    color: white;
  }

  .step.completed .step-number {
    background: var(--black);
    border-color: var(--black);
    color: white;
  }

  .step-label {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--grey-400);
    font-weight: 400;
  }

  .step.active .step-label { color: var(--black); }
  .step.completed .step-label { color: var(--black); }

  .step-connector {
    width: 48px;
    height: 1px;
    background: var(--grey-200);
    margin: 0 4px;
  }

  /* MAIN CONTENT */
  .main-content {
    flex: 1;
    padding: 48px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  /* UPLOAD SECTION */
  .upload-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 48px;
  }

  .upload-zone {
    border: 1.5px dashed var(--grey-200);
    border-radius: var(--radius);
    padding: 80px 48px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    width: 100%;
    max-width: 720px;
    background: var(--white);
    position: relative;
  }

  .upload-zone:hover, .upload-zone.drag-over {
    border-color: var(--gold);
    background: var(--gold-pale);
  }

  .upload-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 24px;
    background: var(--grey-100);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }

  .upload-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
    font-weight: 400;
    margin-bottom: 12px;
    color: var(--black);
  }

  .upload-subtitle {
    font-size: 13px;
    color: var(--grey-400);
    line-height: 1.6;
    margin-bottom: 28px;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 32px;
    background: var(--black);
    color: var(--white);
    border: none;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Inter', sans-serif;
    font-weight: 400;
  }

  .btn-primary:hover {
    background: var(--gold);
    transform: translateY(-1px);
    box-shadow: var(--shadow-hover);
  }

  .btn-primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 13px 28px;
    background: transparent;
    color: var(--black);
    border: 1px solid var(--grey-200);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Inter', sans-serif;
    font-weight: 400;
  }

  .btn-secondary:hover {
    border-color: var(--black);
  }

  .btn-gold {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 32px;
    background: var(--gold);
    color: var(--white);
    border: none;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Inter', sans-serif;
    font-weight: 400;
  }

  .btn-gold:hover {
    background: #9A7840;
    transform: translateY(-1px);
    box-shadow: var(--shadow-hover);
  }

  /* IMAGE PREVIEW */
  .image-preview {
    width: 100%;
    max-width: 720px;
    position: relative;
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow);
  }

  .image-preview img {
    width: 100%;
    height: 420px;
    object-fit: cover;
    display: block;
  }

  .image-preview-overlay {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
    padding: 24px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .image-preview-label {
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.7);
  }

  /* ANALYSIS SECTION */
  .analysis-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .analysis-card {
    background: var(--white);
    padding: 32px;
    box-shadow: var(--shadow);
  }

  .card-eyebrow {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 16px;
  }

  .card-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 400;
    color: var(--black);
    margin-bottom: 24px;
  }

  .detected-items {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 24px;
  }

  .detected-tag {
    padding: 6px 14px;
    background: var(--grey-100);
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--black);
    border-radius: 100px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .detected-tag.confirmed {
    background: #EFF7EE;
    color: #2D6A4F;
  }

  /* PRODUCT SELECTOR */
  .selector-section {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--grey-200);
  }

  .section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 300;
    color: var(--black);
  }

  .finish-selector {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .finish-label {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--grey-400);
    margin-right: 8px;
  }

  .finish-swatch {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
    position: relative;
  }

  .finish-swatch:hover { transform: scale(1.15); }
  .finish-swatch.active {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px rgba(184,150,90,0.2);
  }

  .category-tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--grey-200);
    margin-bottom: 32px;
    overflow-x: auto;
  }

  .category-tab {
    padding: 14px 24px;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    color: var(--grey-400);
    transition: all 0.2s;
    white-space: nowrap;
    background: none;
    border-top: none;
    border-left: none;
    border-right: none;
    font-family: 'Inter', sans-serif;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .category-tab:hover { color: var(--black); }
  .category-tab.active {
    color: var(--black);
    border-bottom-color: var(--gold);
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 24px;
    margin-bottom: 48px;
  }

  .product-card {
    background: var(--white);
    box-shadow: var(--shadow);
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid transparent;
    position: relative;
    overflow: hidden;
  }

  .product-card:hover {
    box-shadow: var(--shadow-hover);
    transform: translateY(-2px);
  }

  .product-card.selected {
    border-color: var(--gold);
  }

  .product-card-image {
    width: 100%;
    height: 180px;
    object-fit: cover;
    display: block;
    background: var(--grey-100);
  }

  .product-card-body {
    padding: 16px;
  }

  .product-collection {
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 4px;
  }

  .product-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--black);
    margin-bottom: 4px;
  }

  .product-finish {
    font-size: 12px;
    color: var(--grey-400);
    margin-bottom: 12px;
  }

  .product-sku {
    font-size: 10px;
    color: var(--grey-400);
    letter-spacing: 0.08em;
  }

  .product-price {
    font-size: 16px;
    font-weight: 500;
    color: var(--black);
  }

  .product-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-top: 1px solid var(--grey-100);
  }

  .selected-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: var(--gold);
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }

  /* BEFORE/AFTER */
  .before-after-section {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .comparison-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 48px;
  }

  .comparison-panel {
    position: relative;
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow);
  }

  .comparison-panel img {
    width: 100%;
    height: 500px;
    object-fit: cover;
    display: block;
  }

  .comparison-label {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 6px 16px;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    backdrop-filter: blur(8px);
  }

  .comparison-label.after {
    background: var(--gold);
  }

  /* PRODUCT LIST */
  .product-list-table {
    width: 100%;
    border-collapse: collapse;
  }

  .product-list-table th {
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--grey-400);
    text-align: left;
    padding: 12px 16px;
    border-bottom: 1px solid var(--grey-200);
    font-weight: 400;
  }

  .product-list-table td {
    padding: 16px;
    border-bottom: 1px solid var(--grey-100);
    font-size: 13px;
    color: var(--black);
    vertical-align: middle;
  }

  .product-list-table tr:last-child td { border-bottom: none; }

  .product-thumb {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: var(--radius);
    background: var(--grey-100);
  }

  .total-row {
    background: var(--grey-100);
  }

  .total-label {
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 500;
  }

  .total-amount {
    font-size: 22px;
    font-family: 'Cormorant Garamond', serif;
    font-weight: 400;
    color: var(--black);
  }

  /* ACTION BAR */
  .action-bar {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 32px 0;
    border-top: 1px solid var(--grey-200);
    flex-wrap: wrap;
  }

  /* LOADING */
  .loading-overlay {
    position: fixed;
    inset: 0;
    background: rgba(250,250,248,0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(8px);
  }

  .loading-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 300;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--black);
    margin-bottom: 40px;
  }

  .loading-progress {
    width: 200px;
    height: 1px;
    background: var(--grey-200);
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
  }

  .loading-progress-bar {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    animation: loading-sweep 1.8s ease-in-out infinite;
  }

  @keyframes loading-sweep {
    to { left: 200%; }
  }

  .loading-step {
    font-size: 12px;
    color: var(--grey-400);
    letter-spacing: 0.1em;
    text-align: center;
    min-height: 20px;
  }

  /* MODAL */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 500;
    padding: 24px;
  }

  .modal {
    background: var(--white);
    width: 100%;
    max-width: 520px;
    padding: 48px;
    position: relative;
    box-shadow: 0 24px 80px rgba(0,0,0,0.2);
  }

  .modal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--grey-400);
    font-size: 20px;
    line-height: 1;
    padding: 4px 8px;
  }

  .modal-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 400;
    margin-bottom: 8px;
  }

  .modal-subtitle {
    font-size: 13px;
    color: var(--grey-400);
    margin-bottom: 32px;
    line-height: 1.6;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-label {
    display: block;
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--grey-400);
    margin-bottom: 8px;
    font-weight: 400;
  }

  .form-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--grey-200);
    background: var(--white);
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    color: var(--black);
    outline: none;
    transition: border-color 0.2s;
    border-radius: var(--radius);
  }

  .form-input:focus { border-color: var(--gold); }

  /* FOOTER */
  .footer {
    background: var(--black);
    color: rgba(255,255,255,0.5);
    padding: 40px 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: gap;
    margin-top: 80px;
  }

  .footer-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: white;
  }

  .footer-text {
    font-size: 11px;
    letter-spacing: 0.08em;
    color: rgba(255,255,255,0.35);
  }

  .divider {
    height: 1px;
    background: var(--grey-200);
    margin: 48px 0;
  }

  .gold-line {
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    margin: 0 auto 40px;
    width: 80px;
  }

  /* TOAST */
  .toast {
    position: fixed;
    bottom: 32px;
    right: 32px;
    background: var(--black);
    color: white;
    padding: 16px 24px;
    font-size: 13px;
    box-shadow: var(--shadow-hover);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from { transform: translateX(100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  /* INFO CHIPS */
  .info-chips {
    display: flex;
    gap: 32px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .info-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: var(--grey-400);
  }

  .info-chip-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--gold-pale);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .header { padding: 0 20px; }
    .header-nav { display: none; }
    .hero { padding: 60px 20px; }
    .main-content { padding: 24px 20px; }
    .analysis-grid { grid-template-columns: 1fr; gap: 24px; }
    .comparison-container { grid-template-columns: 1fr; }
    .comparison-panel img { height: 300px; }
    .steps-bar { padding: 20px; overflow-x: auto; }
    .step-connector { width: 24px; }
    .section-header { flex-direction: column; align-items: flex-start; gap: 16px; }
    .action-bar { flex-direction: column; }
    .btn-primary, .btn-gold, .btn-secondary { width: 100%; justify-content: center; }
    .footer { flex-direction: column; gap: 16px; text-align: center; padding: 32px 20px; }
  }
`;

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ParisiAIDesigner() {
  const [step, setStep] = useState(1); // 1: upload, 2: analyse, 3: select, 4: result
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [detectedElements, setDetectedElements] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("tapware");
  const [selectedFinish, setSelectedFinish] = useState("chrome");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const showToastMessage = (msg) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3500);
  };

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setUploadedImage(file);
      setUploadedImageUrl(url);
    }
  }, []);

  const simulateAnalysis = async () => {
    setIsLoading(true);
    const steps = [
      "Uploading your bathroom image…",
      "AI is scanning your bathroom…",
      "Identifying fixtures and fittings…",
      "Detecting finishes and materials…",
      "Mapping to Parisi catalogue…",
      "Analysis complete"
    ];
    for (let msg of steps) {
      setLoadingMessage(msg);
      await new Promise(r => setTimeout(r, 700));
    }
    setDetectedElements({
      basin: true, toilet: true, shower: true, bath: false,
      mirror: true, handles: true, tapware: true,
      accessories: ["towel_rail", "toilet_paper_holder"],
      detectedStyle: "contemporary",
      detectedFinish: "chrome",
      roomSize: "medium"
    });
    setIsLoading(false);
    setStep(2);
  };

  const simulateGeneration = async () => {
    setIsLoading(true);
    const steps = [
      "Preparing your Parisi design brief…",
      "Building 3D room model from your photo…",
      "Placing selected Parisi products…",
      "Applying finishes and materials…",
      "Rendering photorealistic scene…",
      "Generating final image…",
      "Your Parisi bathroom is ready"
    ];
    for (let msg of steps) {
      setLoadingMessage(msg);
      await new Promise(r => setTimeout(r, 800));
    }
    setGeneratedImageUrl(
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=90"
    );
    setIsLoading(false);
    setStep(4);
  };

  const toggleProduct = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const filteredProducts = Object.values(PARISI_PRODUCTS).flat().filter(p => {
    const matchCat = p.category === selectedCategory;
    const matchFinish = selectedFinish === "all" ||
      p.finish.toLowerCase().replace(" ", "_") === selectedFinish;
    return matchCat;
  });

  const LOADING_STEPS_CONFIG = [
    { step: 1, label: "Upload Photo" },
    { step: 2, label: "AI Analysis" },
    { step: 3, label: "Select Products" },
    { step: 4, label: "Your Design" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="parisi-app">

        {/* LOADING OVERLAY */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-logo">PARISI</div>
            <div className="loading-progress">
              <div className="loading-progress-bar" />
            </div>
            <div className="loading-step">{loadingMessage}</div>
          </div>
        )}

        {/* TOAST */}
        {showToast && (
          <div className="toast">
            <span>✓</span> {showToast}
          </div>
        )}

        {/* QUOTE MODAL */}
        {showQuoteModal && (
          <div className="modal-overlay" onClick={() => setShowQuoteModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowQuoteModal(false)}>×</button>
              {!quoteSubmitted ? (
                <>
                  <div className="card-eyebrow">Parisi Design Service</div>
                  <div className="modal-title">Request a Quote</div>
                  <div className="modal-subtitle">
                    A Parisi consultant will review your design and provide a personalised quote within one business day.
                  </div>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" placeholder="Your full name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" type="email" placeholder="your@email.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" placeholder="+61 4xx xxx xxx" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postcode</label>
                    <input className="form-input" placeholder="2000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes (optional)</label>
                    <input className="form-input" placeholder="Any specific requirements or questions…" />
                  </div>
                  <button className="btn-gold" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                    onClick={() => { setQuoteSubmitted(true); }}>
                    Submit Quote Request →
                  </button>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 24 }}>✦</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, marginBottom: 12 }}>Thank you</div>
                  <div style={{ fontSize: 14, color: "#9B9B95", lineHeight: 1.7, marginBottom: 32 }}>
                    Your quote request has been received.<br />
                    A Parisi consultant will contact you within one business day.
                  </div>
                  <div style={{ fontSize: 12, color: "#B8965A", letterSpacing: "0.1em", marginBottom: 24 }}>
                    QUOTE REFERENCE: PAR-2026-{Math.floor(Math.random() * 90000 + 10000)}
                  </div>
                  <button className="btn-secondary" onClick={() => { setShowQuoteModal(false); setQuoteSubmitted(false); }}>
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HEADER */}
        <header className="header">
          <div className="header-logo">
            <span className="logo-wordmark">Parisi</span>
            <div className="logo-divider" />
            <span className="logo-subtitle">AI Designer</span>
          </div>
          <nav className="header-nav">
            <span className="nav-link">Our Story</span>
            <span className="nav-link">Collections</span>
            <span className="nav-link">Showrooms</span>
            <span className="nav-link" style={{ color: "#B8965A" }}>Find a Stockist</span>
          </nav>
        </header>

        {/* HERO (only on step 1) */}
        {step === 1 && (
          <div className="hero">
            <div className="hero-eyebrow">AI-Powered Bathroom Design</div>
            <h1 className="hero-title">
              Visualise Your<br /><em>Dream Bathroom</em>
            </h1>
            <p className="hero-subtitle">
              Upload a photo of your bathroom and watch it transform with Parisi's finest fixtures — rendered in photorealistic detail, exclusively using products from our curated catalogue.
            </p>
            <div className="info-chips">
              {[
                { icon: "🔍", text: "AI room analysis" },
                { icon: "✦", text: "Parisi products only" },
                { icon: "🎨", text: "Multiple finishes" },
                { icon: "📄", text: "Instant quote" },
              ].map(c => (
                <div key={c.text} className="info-chip">
                  <div className="info-chip-icon">{c.icon}</div>
                  <span>{c.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEPS BAR */}
        <div className="steps-bar">
          {LOADING_STEPS_CONFIG.map((s, i) => (
            <div key={s.step} style={{ display: "flex", alignItems: "center" }}>
              <div className={`step ${step === s.step ? "active" : step > s.step ? "completed" : ""}`}>
                <div className="step-number">
                  {step > s.step ? "✓" : s.step}
                </div>
                <span className="step-label">{s.label}</span>
              </div>
              {i < LOADING_STEPS_CONFIG.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>

        {/* MAIN CONTENT */}
        <main className="main-content">

          {/* STEP 1: UPLOAD */}
          {step === 1 && (
            <div className="upload-section">
              <div
                className={`upload-zone ${isDragOver ? "drag-over" : ""}`}
                onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => !uploadedImageUrl && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileDrop}
                />
                {!uploadedImageUrl ? (
                  <>
                    <div className="upload-icon">📷</div>
                    <div className="upload-title">Upload your bathroom photo</div>
                    <p className="upload-subtitle">
                      Drag and drop a photo here, or click to browse.<br />
                      For best results, use a well-lit, wide-angle photo.
                    </p>
                    <button className="btn-primary" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                      Choose Photo
                    </button>
                  </>
                ) : (
                  <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
                    <img src={uploadedImageUrl} alt="Your bathroom" style={{ width: "100%", maxHeight: 360, objectFit: "cover", display: "block" }} />
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
                      <button className="btn-secondary" style={{ background: "white" }} onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                        Change Photo
                      </button>
                      <button className="btn-primary" onClick={e => { e.stopPropagation(); simulateAnalysis(); }}>
                        Analyse My Bathroom →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {!uploadedImageUrl && (
                <>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "#9B9B95", marginBottom: 20 }}>— or try a demo bathroom —</div>
                    <button className="btn-secondary" onClick={() => {
                      setUploadedImageUrl("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=90");
                      simulateAnalysis();
                    }}>
                      Use Demo Photo
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 2: ANALYSIS RESULTS */}
          {step === 2 && detectedElements && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <div className="card-eyebrow">Analysis Complete</div>
                <h2 className="hero-title" style={{ fontSize: 36 }}>
                  We found <em>{Object.values(detectedElements).filter(v => v === true).length} elements</em> in your bathroom
                </h2>
                <div className="gold-line" />
              </div>

              <div className="analysis-grid">
                {/* ORIGINAL PHOTO */}
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <span className="card-eyebrow">Your bathroom</span>
                  </div>
                  <div style={{ borderRadius: 2, overflow: "hidden", boxShadow: "0 4px 32px rgba(0,0,0,0.06)" }}>
                    <img
                      src={uploadedImageUrl || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=90"}
                      alt="Your bathroom"
                      style={{ width: "100%", height: 380, objectFit: "cover", display: "block" }}
                    />
                  </div>
                </div>

                {/* DETECTED ELEMENTS */}
                <div className="analysis-card">
                  <div className="card-eyebrow">AI Detected</div>
                  <div className="card-title">Elements in your bathroom</div>
                  <div className="detected-items">
                    {[
                      { key: "basin", label: "Basin" },
                      { key: "tapware", label: "Tapware" },
                      { key: "shower", label: "Shower" },
                      { key: "toilet", label: "Toilet" },
                      { key: "mirror", label: "Mirror" },
                      { key: "handles", label: "Accessories" },
                      { key: "bath", label: "Bath" },
                    ].map(el => (
                      <div key={el.key} className={`detected-tag ${detectedElements[el.key] ? "confirmed" : ""}`}>
                        {detectedElements[el.key] ? "✓" : "○"} {el.label}
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: "20px 0", borderTop: "1px solid #E8E8E4" }}>
                    <div className="card-eyebrow" style={{ marginBottom: 12 }}>Detected Style</div>
                    <div style={{ fontSize: 18, fontFamily: "'Cormorant Garamond', serif", marginBottom: 20 }}>
                      Contemporary · Chrome Finishes
                    </div>

                    <div className="card-eyebrow" style={{ marginBottom: 12 }}>Recommended Parisi Collections</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {["Zio", "Celia", "Edge", "Vela"].map(c => (
                        <span key={c} style={{
                          padding: "6px 14px",
                          border: "1px solid #B8965A",
                          color: "#B8965A",
                          fontSize: 11,
                          letterSpacing: "0.1em"
                        }}>{c}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: 24 }}>
                    <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setStep(3)}>
                      Select Parisi Products →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PRODUCT SELECTION */}
          {step === 3 && (
            <div className="selector-section">
              <div className="section-header">
                <div>
                  <div className="card-eyebrow">Step 3 of 4</div>
                  <div className="section-title">Choose Your Parisi Products</div>
                </div>
                <div className="finish-selector">
                  <span className="finish-label">Finish:</span>
                  {FINISHES.map(f => (
                    <div
                      key={f.id}
                      className={`finish-swatch ${selectedFinish === f.id ? "active" : ""}`}
                      style={{ background: f.hex, border: f.hex === "#F8F8F8" ? "1.5px solid #E8E8E4" : undefined }}
                      title={f.name}
                      onClick={() => setSelectedFinish(f.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="category-tabs">
                {CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    className={`category-tab ${selectedCategory === c.id ? "active" : ""}`}
                    onClick={() => setSelectedCategory(c.id)}
                  >
                    {c.icon} {c.label}
                    {selectedProducts.filter(p => p.category === c.id).length > 0 && (
                      <span style={{
                        background: "#B8965A", color: "white",
                        width: 18, height: 18, borderRadius: "50%",
                        fontSize: 10, display: "inline-flex", alignItems: "center", justifyContent: "center"
                      }}>
                        {selectedProducts.filter(p => p.category === c.id).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="products-grid">
                {(PARISI_PRODUCTS[selectedCategory] || []).map(product => {
                  const isSelected = selectedProducts.find(p => p.id === product.id);
                  return (
                    <div
                      key={product.id}
                      className={`product-card ${isSelected ? "selected" : ""}`}
                      onClick={() => toggleProduct(product)}
                    >
                      {isSelected && <div className="selected-badge">✓</div>}
                      <img src={product.image} alt={product.name} className="product-card-image" />
                      <div className="product-card-body">
                        <div className="product-collection">{product.collection}</div>
                        <div className="product-name">{product.name}</div>
                        <div className="product-finish">{product.finish}</div>
                        <div className="product-sku">{product.sku}</div>
                      </div>
                      <div className="product-card-footer">
                        <div className="product-price">${product.price.toLocaleString()}</div>
                        <button
                          className={isSelected ? "btn-secondary" : "btn-primary"}
                          style={{ padding: "8px 16px", fontSize: 10 }}
                          onClick={e => { e.stopPropagation(); toggleProduct(product); }}
                        >
                          {isSelected ? "Remove" : "+ Add"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SELECTION SUMMARY */}
              {selectedProducts.length > 0 && (
                <div style={{ background: "#FAFAF8", border: "1px solid #E8E8E4", padding: 24, marginBottom: 32 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <div className="card-eyebrow">Your Selection</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20 }}>
                        {selectedProducts.length} product{selectedProducts.length !== 1 ? "s" : ""} selected
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: "#9B9B95", letterSpacing: "0.1em", marginBottom: 4 }}>TOTAL EST.</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28 }}>
                        ${totalPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {selectedProducts.map(p => (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "white", padding: "6px 12px", border: "1px solid #E8E8E4", fontSize: 12 }}>
                        <span>{p.name} — {p.finish}</span>
                        <button onClick={() => toggleProduct(p)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B9B95", fontSize: 14 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="action-bar">
                <button className="btn-secondary" onClick={() => setStep(2)}>← Back</button>
                <button
                  className="btn-primary"
                  disabled={selectedProducts.length === 0}
                  onClick={simulateGeneration}
                >
                  Generate My Parisi Bathroom →
                </button>
                {selectedProducts.length === 0 && (
                  <span style={{ fontSize: 12, color: "#9B9B95" }}>Select at least one product to continue</span>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: RESULTS */}
          {step === 4 && (
            <div className="before-after-section">
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <div className="card-eyebrow">Your Parisi Design</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, marginBottom: 12 }}>
                  Your bathroom, <em style={{ color: "#B8965A" }}>transformed</em>
                </h2>
                <div className="gold-line" />
              </div>

              {/* BEFORE / AFTER */}
              <div className="comparison-container">
                <div className="comparison-panel">
                  <div className="comparison-label">Before</div>
                  <img
                    src={uploadedImageUrl || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=90"}
                    alt="Before"
                  />
                </div>
                <div className="comparison-panel">
                  <div className="comparison-label after">After — Parisi</div>
                  <img
                    src={generatedImageUrl || "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=90"}
                    alt="After with Parisi products"
                  />
                </div>
              </div>

              {/* PRODUCT LIST */}
              <div style={{ background: "white", boxShadow: "0 4px 32px rgba(0,0,0,0.06)", marginBottom: 48 }}>
                <div style={{ padding: "28px 32px", borderBottom: "1px solid #E8E8E4" }}>
                  <div className="card-eyebrow">Products Used in This Design</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22 }}>
                    Parisi Product Specification
                  </div>
                </div>
                <table className="product-list-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Collection</th>
                      <th>Finish</th>
                      <th>Qty</th>
                      <th style={{ textAlign: "right" }}>Unit Price</th>
                      <th style={{ textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.map(p => (
                      <tr key={p.id}>
                        <td><img src={p.image} alt={p.name} className="product-thumb" /></td>
                        <td><strong>{p.name}</strong><br /><span style={{ fontSize: 11, color: "#9B9B95" }}>{p.description}</span></td>
                        <td style={{ fontFamily: "monospace", fontSize: 12 }}>{p.sku}</td>
                        <td>{p.collection}</td>
                        <td>
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{
                              width: 12, height: 12, borderRadius: "50%",
                              background: FINISHES.find(f => f.name === p.finish)?.hex || "#ccc",
                              border: "1px solid rgba(0,0,0,0.1)", display: "inline-block"
                            }} />
                            {p.finish}
                          </span>
                        </td>
                        <td>{p.quantity}</td>
                        <td style={{ textAlign: "right" }}>${p.price.toLocaleString()}</td>
                        <td style={{ textAlign: "right", fontWeight: 500 }}>${(p.price * p.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td colSpan={6} style={{ padding: "20px 16px" }}>
                        <span className="total-label">Estimated Total (inc. GST)</span>
                      </td>
                      <td colSpan={2} style={{ textAlign: "right", padding: "20px 16px" }}>
                        <span className="total-amount">
                          ${(totalPrice * 1.1).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ padding: "16px 32px", borderTop: "1px solid #E8E8E4", fontSize: 11, color: "#9B9B95" }}>
                  * Prices are estimates only. GST included. Contact a Parisi showroom for official pricing and availability.
                  All products are exclusively from the Parisi Bathware catalogue. No third-party products are included.
                </div>
              </div>

              {/* ACTION BAR */}
              <div className="action-bar">
                <button className="btn-gold" onClick={() => setShowQuoteModal(true)}>
                  ✦ Request a Quote
                </button>
                <button className="btn-primary" onClick={() => showToastMessage("PDF exported — check your downloads")}>
                  Export PDF →
                </button>
                <button className="btn-secondary" onClick={() => showToastMessage("Design link copied to clipboard")}>
                  Share Design
                </button>
                <button className="btn-secondary" onClick={() => {
                  setStep(3);
                  setGeneratedImageUrl(null);
                }}>
                  ← Edit Products
                </button>
                <button className="btn-secondary" onClick={() => {
                  setStep(1);
                  setUploadedImage(null);
                  setUploadedImageUrl(null);
                  setSelectedProducts([]);
                  setGeneratedImageUrl(null);
                  setDetectedElements(null);
                }}>
                  Start New Design
                </button>
              </div>

              {/* FIND A SHOWROOM */}
              <div style={{
                background: "#1C1C1A", color: "white", padding: "48px 48px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginTop: 48, gap: 24, flexWrap: "wrap"
              }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "#B8965A", marginBottom: 12 }}>
                    Experience in Person
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, marginBottom: 8 }}>
                    Visit a Parisi Ambiente Showroom
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                    See and touch every product in your design at one of our showrooms in Sydney, Melbourne or Brisbane.
                  </div>
                </div>
                <button className="btn-gold">Find a Showroom →</button>
              </div>
            </div>
          )}

        </main>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-logo">Parisi</div>
          <div className="footer-text">
            Parisi AI Designer — Prototype v1.0 · All products from the official Parisi Bathware catalogue<br />
            © 2026 Parisi Bathware Australia · parisi.com.au
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em" }}>
            AI · Design · Luxury
          </div>
        </footer>

      </div>
    </>
  );
}
