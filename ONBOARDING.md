# Onboarding Overlay — Developer Reference

Component: `components/OnboardingOverlay.tsx`  
Triggered from: `app/map/page.tsx`

---

## How It Works

The overlay is shown **once per device** — immediately when the user lands on the map page for the first time. After dismissal (Skip or "Start exploring →"), it sets:

```
localStorage.setItem("saraya_onboarded", "1")
```

To **reset the onboarding** during testing, open DevTools → Application → Local Storage and delete the `saraya_onboarded` key.

---

## Slides

The content is driven by the `SLIDES` array at the top of the component.

| # | Key | What it shows |
|---|-----|---------------|
| 0 | Welcome | Big emoji, headline "The city has secrets.", one-sentence hook |
| 1 | How it works | 3 step cards: Walk → Check in → Collect |
| 2 | Ready | Live landmark count badge, "Start exploring →" CTA |

### Changing slide content

Edit the `SLIDES` array in `components/OnboardingOverlay.tsx`:

```ts
const SLIDES = [
  {
    eyebrow: "Welcome to Sarajevo",   // small uppercase text above headline
    headline: "The city\nhas secrets.",  // \n = line break
    body: "Centuries of...",
    visual: "🕌",                     // emoji shown large with glow
  },
  {
    eyebrow: "How it works",
    body: null,
    visual: null,
    steps: [
      { icon: "📍", label: "Walk to a landmark", sub: "GPS detects when you're close enough" },
      { icon: "🔓", label: "Check in", sub: "Tap the marker to unlock the story" },
      { icon: "🏛️", label: "Collect & read", sub: "3D models, photos, and history" },
    ],
  },
  {
    eyebrow: "You're all set",
    visual: "✦",   // shown as glow orb on slide 3
    cta: true,
  },
];
```

### Adding or removing slides

- Add an entry to `SLIDES` and add a corresponding `{slide === N && (...)}` block inside the content `div`.
- The progress dots at the bottom auto-scale to the array length.

---

## Customizing Colors / Design

All colors follow the Saraya Solutions brand (purple accent, dark purple-black backgrounds).

| Element | Current value | Where to change |
|---------|--------------|-----------------|
| Progress dot (active) | `rgba(168,85,247,0.90)` — purple-500 | `style.background` in dots loop |
| CTA button gradient | `#7c3aed → #a855f7` | `style.background` on the last-slide button |
| CTA button glow | `rgba(168,85,247,0.40)` | `style.boxShadow` on the last-slide button |
| Slide 0 emoji glow | `rgba(168,85,247,0.40)` | `style.filter` on the emoji div |
| Slide 0 headline glow | `rgba(168,85,247,0.20)` | `style.textShadow` on the `<h1>` |
| Slide 2 orb gradient | `rgba(168,85,247,0.18/0.04)` | `style.background` on the orb div |
| Eyebrow text | `text-purple-500/60` | Tailwind class |

---

## Props

```ts
interface Props {
  locationCount: number;  // shown on the last slide: "{N} landmarks await you."
  onDone: () => void;     // called when user taps Skip or "Start exploring →"
}
```

---

## Trigger Logic (map/page.tsx)

```tsx
const [showOnboarding, setShowOnboarding] = useState(false);

useEffect(() => {
  if (typeof window !== "undefined" && !localStorage.getItem("saraya_onboarded")) {
    setShowOnboarding(true);
  }
}, []);

// In JSX:
{showOnboarding && (
  <OnboardingOverlay
    locationCount={activeLocations.length}
    onDone={() => {
      localStorage.setItem("saraya_onboarded", "1");
      setShowOnboarding(false);
    }}
  />
)}
```

To **show onboarding on every load** (e.g. during redesign), simply change the condition to `setShowOnboarding(true)` unconditionally.

---

## z-index

The overlay uses `z-[80]`, which sits above:
- LandmarkDetail (`z-[60]`)
- Navbar (`z-50`)
- Map markers

If you add new layers above `z-[80]`, bump the overlay's z-index accordingly.
