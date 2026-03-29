# Design System Strategy: The Orchestrator

## 1. Overview & Creative North Star
The visual identity of this design system is rooted in the **"The Orchestrator"**—a Creative North Star that balances the rigid precision of logistics with the fluid elegance of high-end editorial design. 

In a world of cluttered enterprise tools, this system moves beyond the "grid of boxes" by utilizing **intentional asymmetry and tonal depth**. We treat the planning interface not as a spreadsheet, but as a living canvas. By layering surfaces and utilizing sophisticated typography scales, we transform high-density data into a readable, premium experience that feels authoritative yet effortless. This is "Enterprise-Grade" reimagined: where clarity is achieved through breathability and subtle contrast rather than heavy lines.

---

## 2. Colors & Surface Philosophy
The palette is a curated selection of professional blues and functional status hues, anchored by a sophisticated neutral scale.

### The "No-Line" Rule
To achieve a bespoke feel, **1px solid borders are prohibited for sectioning components.** Instead of using lines to separate the sidebar from the main content or the header from the grid, boundaries must be defined through:
- **Background Color Shifts:** A `surface-container-low` (#f2f4f6) section sitting on a `surface` (#f7f9fb) background.
- **Tonal Transitions:** Using the `surface-container` tiers to distinguish global navigation from local action bars.

### Surface Hierarchy & Nesting
Think of the UI as physical layers. Use the following hierarchy for nesting:
1.  **Level 0 (Base):** `surface` (#f7f9fb) for the primary application background.
2.  **Level 1 (Sections):** `surface-container-low` (#f2f4f6) for large content areas or side panels.
3.  **Level 2 (Cards/Modules):** `surface-container-lowest` (#ffffff) to make interactive planning cards "pop" against the gray base.
4.  **Level 3 (Overlays):** `surface-bright` for floating menus or tooltips.

### The "Glass & Gradient" Rule
Standard buttons are flat; our primary actions have "soul." 
- **Main CTAs:** Apply a subtle linear gradient from `primary` (#005bbf) to `primary_container` (#1a73e8).
- **Floating Elements:** For the dark sidebar (`inverse_surface`), use a 10% opacity white overlay with a `backdrop-blur` of 20px to create a frosted glass effect, making the blue active states feel luminous.

### Status System
- **Basisrooster (Primary Stability):** Use `tertiary` (#006c49) for text on `tertiary_fixed` (#6ffbbe) backgrounds.
- **Aanvullend (Growth):** Use `tertiary_container` (#00885d) with `on_tertiary` (#ffffff).
- **Verlof (Caution):** Use a custom yellow tint mapped to a refined amber.
- **Ziek (Urgent):** Use `error` (#ba1a1a) with `on_error` (#ffffff).

---

## 3. Typography: The Editorial Edge
We use a dual-typeface system to create an authoritative hierarchy.

*   **Display & Headlines (Manrope):** Use Manrope for all `display-` and `headline-` tokens. Its geometric yet warm character provides a "Modern Executive" feel. Set `headline-lg` with a tighter letter-spacing (-0.02em) to mimic high-end magazine layouts.
*   **Data & Body (Inter):** Use Inter for all `title-`, `body-`, and `label-` tokens. Inter’s tall x-height ensures that high-density driver schedules remain legible even at `label-sm` (0.6875rem).

**Hierarchy Note:** Always pair a `headline-sm` title with a `label-md` uppercase subtitle (using `on_surface_variant`) to provide immediate context without visual weight.

---

## 4. Elevation & Depth
Depth in this system is achieved through **Tonal Layering** rather than traditional structural lines.

- **The Layering Principle:** To lift a card, do not use a stroke. Place a `surface-container-lowest` card on a `surface-container-low` background. The subtle shift from #f2f4f6 to #ffffff is enough to signal depth to the eye.
- **Ambient Shadows:** For floating modals, use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(25, 28, 30, 0.06)`. The shadow color is a tinted version of `on_surface`, creating a natural ambient light effect.
- **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., input fields), use `outline_variant` at 20% opacity. **Never use 100% opaque borders.**
- **Glassmorphism:** Navigation active states (like the sidebar "Planning" tab) should use a semi-transparent `primary` color with a `backdrop-blur` (12px) to feel integrated into the dark sidebar.

---

## 5. Components

### Planning Cells (The Grid)
- **Style:** Forbid the use of grid lines. Use `spacing-0.5` (1px) gaps between cells to reveal the background color (`surface_dim`), creating a "natural" grid.
- **Corners:** Use `rounded-sm` (0.25rem) for individual schedule blocks to maintain a high-density, professional look.

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `rounded-DEFAULT` (8px). 
- **Tertiary (Ghost):** No background or border. Use `primary` text. On hover, apply a `surface-container-high` background with 40% opacity.

### Chips (Planning States)
- Use `rounded-full` for status indicators.
- **High-Density Rule:** In the main grid, use "Icon-Only" or "Initial-Only" chips to save space, using a tooltip for full descriptions.

### Input Fields
- Use `surface-container-lowest` for the field background. 
- Use a "Ghost Border" (`outline_variant` at 20%). On focus, transition the border to `primary` (#005bbf) at 100% opacity with a subtle 2px outer glow.

### Sidebar (Dark Mode Focus)
- Background: `inverse_surface` (#2d3133).
- Active State: A glassmorphic pill using `primary` with 80% opacity and white text.

---

## 6. Do's and Don'ts

### Do:
- **Use White Space as a Divider:** Use `spacing-4` or `spacing-6` to separate logical groups rather than lines.
- **Embrace Asymmetry:** Align the "Planning" title to the far left and the "Filters" to the far right to create a wide, editorial horizon.
- **Color-Code Intelligently:** Use the status colors sparingly. If every cell is colored, nothing is important. Use `surface-variant` for "empty" or "neutral" states.

### Don't:
- **Don't use Pure Black:** Always use `on_surface` (#191c1e) for text to maintain a premium, softened contrast.
- **Don't use Standard Shadows:** Avoid the "fuzzy grey" shadow. If it looks like a default CSS shadow, it's wrong.
- **Don't Crowd the Header:** The top navigation should feel like a luxury dashboard. Give the "CapPlan" logo and user profile significant padding (`spacing-8`).
- **No 1px Borders:** Never use `#CCCCCC` or `#000000` 1px lines to separate data columns. Let the alignment and background shifts do the work.