# DESIGN.md

# CapPlan Design System Strategy
## Creative North Star: The Orchestrator

## 1. Purpose

This document defines the intended design standard for the entire CapPlan application.

It is not optional inspiration.  
It is the leading design direction for all user-facing work.

The goal is to move CapPlan away from the feel of a generic internal admin tool and toward a modern, high-quality planning product with strong visual hierarchy, deliberate composition, premium restraint, and operational clarity.

CapPlan should feel:
- designed, not assembled
- calm, not cluttered
- authoritative, not heavy
- efficient, not spreadsheet-like
- modern product software, not default enterprise CRUD

When current UI patterns conflict with this direction, they should not be preserved simply because they already exist.

---

## 2. Core Design Principles

### 2.1 Product-grade over template-grade
The application must not look like a default admin dashboard, bootstrap panel set, or lightly styled CRUD interface.

A screen is not “good enough” just because it is clear and functional.  
If it still feels generic, flat, overly technical, or visually unintentional, it does not meet the expected design standard.

### 2.2 Planning is the product
The planning experience is the heart of the application.  
It must feel like the core product surface, not like a data table with controls around it.

Planning screens should prioritize:
- scanability
- hierarchy
- speed of understanding
- clear status signaling
- strong grouping of actions and context
- confidence in daily operational use

### 2.3 Clarity through space, hierarchy, and surfaces
We do not rely on heavy borders, dense grids, or visual noise to create structure.

We create structure through:
- spacing
- tonal layering
- typography
- grouped surfaces
- contrast in emphasis
- intentional placement of actions and context

### 2.4 Premium restraint
CapPlan should feel refined and modern, not flashy.

This means:
- calm neutral backgrounds
- selective use of color
- confident typography
- restrained elevation
- deliberate accents only where they improve comprehension or action clarity

### 2.5 Screens should feel composed
A screen should feel designed as a whole.

Do not treat pages as collections of disconnected controls.  
Each important screen should have:
- a clear header zone
- a clear action zone
- clear content grouping
- obvious primary and secondary actions
- visual rhythm from top to bottom

---

## 3. Experience Standards

## 3.1 What good looks like
Good CapPlan screens have:
- a strong page title with immediate context
- clear separation between navigation, controls, content, and summary information
- one obvious primary action
- grouped filters and view controls
- content presented in distinct sections or cards where useful
- readable density without feeling cramped
- visual emphasis aligned with operational importance
- data surfaces that feel intentional, not mechanically rendered

## 3.2 What must be avoided
The following are anti-patterns and should be treated as design problems:

- generic admin-dashboard layouts
- flat screens with weak hierarchy
- table-first UI where the table dominates everything else
- control bars that feel like loose rows of form elements
- every action having equal visual weight
- excessive reliance on 1px borders for structure
- dense grey grids that resemble spreadsheets
- default-looking cards, buttons, inputs, or shadows
- “just add spacing and rounded corners” redesigns
- preserving mediocre legacy layout purely for consistency

---

## 4. Visual System

## 4.1 Color and surface philosophy

The palette should support calm operational clarity with a premium tone.

### Surface hierarchy
Use surfaces as layers, not as decoration.

- `surface` (`#f7f9fb`)  
  Primary application background

- `surface-container-low` (`#f2f4f6`)  
  Large sections, grouped screen zones, side panels, page framing

- `surface-container-lowest` (`#ffffff`)  
  Cards, modules, planning surfaces, inputs, elevated content blocks

- `surface-bright`  
  Menus, overlays, floating surfaces

### No-Line Rule
Do not use 1px borders as the default way to separate major sections.

Instead, create separation through:
- surface contrast
- spacing
- nesting
- tonal transitions

This applies especially to:
- sidebar vs main content
- header vs content
- cards within sections
- grouped controls

### Border fallback
If a border is needed for usability or accessibility:
- use `outline_variant` at low opacity
- prefer subtle outlines over visible hard lines
- never use harsh default grey borders as layout structure

## 4.2 Accent color usage
Color must be functional and intentional.

Use strong color for:
- primary actions
- key active states
- planning statuses
- focused interactive elements
- urgent exceptions

Do not use strong color everywhere.  
If everything is emphasized, nothing is emphasized.

## 4.3 Status system
Status colors should remain semantically stable across the app.

- Basisrooster  
  Stable, planned baseline  
  Use green family with high readability

- Aanvullend beschikbaar  
  Secondary positive / extra capacity  
  Use deeper or more saturated green than the baseline state

- Verlof  
  Caution / unavailable by leave  
  Use refined amber or muted yellow

- Ziek  
  Critical unavailable  
  Use error red

- Neutral / empty / not assigned  
  Use surface variants, subdued greys, or low-emphasis states

Status colors should be easy to scan at a glance and should remain readable in dense planning contexts.

---

## 5. Typography

Typography should create authority, rhythm, and clarity.

## 5.1 Typeface system
- Use **Manrope** for display and headline levels
- Use **Inter** for titles, body text, labels, UI metadata, and dense data presentation

## 5.2 Hierarchy expectations
Typography must do real structural work.

Use:
- large, confident page titles
- restrained supporting context
- clear distinction between page title, section title, label, and metadata
- compact but legible labels in high-density planning views

Avoid:
- weak title hierarchy
- oversized body text in dense interfaces
- indistinguishable section and label styles
- visually noisy all-caps overuse

## 5.3 Editorial edge
CapPlan should feel more editorial and composed than a standard enterprise app.

This means:
- intentional scale differences
- confident whitespace around headings
- occasional uppercase metadata where it improves rhythm
- stronger page openings and section starts
- not everything rendered with the same visual weight

---

## 6. Depth, elevation, and visual rhythm

Depth should come from layering, contrast, and containment, not from default card styling.

## 6.1 Layering principle
To create depth:
- place white or bright cards on soft grey surfaces
- use subtle nesting
- use restrained ambient shadows only where elevation is genuinely helpful

## 6.2 Shadows
Shadows must be soft, diffused, and minimal.

Avoid:
- harsh drop shadows
- generic CSS-looking shadows
- using shadow everywhere

Use stronger shadow only for:
- modal surfaces
- overlays
- floating menus
- elements that must visibly sit above the page

## 6.3 Rhythm
Use spacing to build rhythm and hierarchy.

Pages should breathe.  
Logical groups should be visibly grouped.  
Important content should not be crowded by utility controls.

---

## 7. Component directives

## 7.1 Page headers
Every major screen should have a clearly composed header zone.

A good page header includes:
- page title
- contextual subtitle, status, or timeframe where useful
- grouped utilities such as search, filters, or view switching
- one visually dominant primary action when relevant

Do not let the top of the page degrade into a thin strip of controls.

## 7.2 Toolbars and controls
Controls should be grouped by meaning.

Preferred structure:
- search grouped with filtering
- view mode controls grouped together
- actions grouped separately from filters
- primary CTA visually distinct from utility controls

Avoid long unstructured rows of dropdowns, toggles, pills, and buttons.

## 7.3 Cards and modules
Use cards or contained modules when they improve:
- readability
- grouping
- scanability
- perceived structure

Cards should not feel like default dashboard widgets.  
They should feel intentionally framed and proportioned.

## 7.4 Planning grid
The planning grid is a product surface, not a spreadsheet.

Rules:
- avoid harsh grid-line visuals
- use spacing, tonal contrast, and containment to define cells
- maintain fast scanability across rows and dates
- make important states legible without over-coloring everything
- ensure row identity, day structure, and totals are immediately parseable
- support density without becoming visually mechanical

Where possible:
- combine row identity, contract metadata, and planning state into clearer row composition
- ensure totals and summary information are visibly distinct from the main scheduling matrix

## 7.5 Chips and status markers
Status indicators should be compact, consistent, and quickly recognizable.

In dense planning contexts:
- prefer icon-only or minimal chips when space is limited
- provide tooltip or expanded meaning where needed
- do not let chips become decorative clutter

## 7.6 Buttons
Buttons must communicate priority clearly.

- Primary buttons should be visually dominant
- Secondary buttons should support without competing
- Ghost/tertiary buttons should be low-friction utility actions
- button styling should feel deliberate and product-grade, not default framework output

A subtle gradient may be used for primary CTAs where it improves polish without becoming flashy.

## 7.7 Inputs
Inputs should feel integrated into the system, not pasted in from a component library.

- use clean surfaces
- use subtle outlines
- make focus states crisp and premium
- preserve accessibility and clarity
- avoid heavy field chrome

## 7.8 Sidebar
The sidebar should feel calm, solid, and premium.

It is not just navigation; it anchors the application.

Use:
- dark, restrained surfaces
- clear active-state treatment
- ample spacing
- calm iconography
- a composed relationship between logo, nav items, and user identity

---

## 8. Layout strategy

## 8.1 Composition over symmetry
Do not default to rigid symmetrical layouts.

CapPlan may use asymmetry where it improves:
- visual interest
- hierarchy
- action clarity
- content flow

This should feel intentional and composed, never random.

## 8.2 Action placement
Primary actions should be easy to find and should not be buried in generic control rows.

Important actions should typically live:
- in the page header
- in the upper-right action zone
- in a clearly distinguished action group

## 8.3 Summary information
KPIs, totals, warnings, capacity metrics, and operational summaries should be treated as first-class information.

Do not hide them in footnotes or weak text treatment.  
When useful, present them as dedicated summary modules.

---

## 9. Planning-specific directives

Because planning is the core workflow, the following standards are especially important:

- the planning screen should feel premium and product-led
- the timeframe selector should feel purposeful and easy to scan
- filters and grouping controls should be clearly organized
- the schedule matrix should feel contained and intentional
- row labels should carry both identity and context
- capacity, totals, and open issues should be visible without competing with the grid
- empty states should still feel designed, not like raw table fallback
- the screen should support rapid operational decision-making

A successful planning page should feel closer to a modern B2B scheduling product than to Excel or an admin table.

---

## 10. Implementation rules for agents

When working on user-facing UI, agents must not stop at visual polish.

They must evaluate:
- whether the current layout is too generic
- whether hierarchy is too weak
- whether controls are poorly grouped
- whether the page feels like a technical admin screen instead of a designed product screen
- whether current patterns conflict with this design strategy

If the screen is functional but visually below standard, treat that as a real problem.

Agents should:
- improve layout composition where needed
- introduce stronger hierarchy where needed
- refactor grouped controls where needed
- use surface layering instead of default border structure
- recommend broader redesign work when meaningful alignment requires more than the current task scope

Do not preserve a weak screen structure merely because it is already implemented.

---

## 11. Redesign policy

A broader redesign should be recommended when:
- multiple screens materially conflict with this design system
- existing UI patterns are too generic to elevate through small improvements
- the current screen architecture limits clarity or product quality
- meaningful alignment would require component or layout system changes

In such cases, recommend explicit redesign work to the Product Owner.

This recommendation should be concrete:
- what is below standard
- why it matters
- which area should be redesigned
- expected user value
- likely effort and dependencies

---

## 12. Quality bar

The target is not “acceptable internal tooling UI.”  
The target is a polished, modern B2B planning product.

Every important screen should feel:
- intentional
- composed
- high-trust
- operationally clear
- visually calm
- distinctly above default admin UI quality

If the result still looks like a standard enterprise dashboard, the design standard has not been met.
