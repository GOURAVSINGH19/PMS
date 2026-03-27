# Antigravity UI Documentation
## Complete Design System & Component Specifications

**Document Version:** 1.0  
**Date:** March 27, 2026  
**Status:** Design Specification  
**Audience:** Developers, Designers, Product Managers

---

## Table of Contents
1. [Overview](#1-overview)
2. [Design System](#2-design-system)
3. [Component Library](#3-component-library)
4. [Page Specifications](#4-page-specifications)
5. [Interactions & Animations](#5-interactions--animations)
6. [Accessibility & Responsiveness](#6-accessibility--responsiveness)
7. [Implementation Guide](#7-implementation-guide)
8. [Color Palette & Typography](#8-color-palette--typography)

---

## 1. Overview

### Purpose
Antigravity is a premium, modern UI component system designed for the PMS platform. It provides a consistent, scalable design language across all user interfaces while maintaining visual hierarchy, accessibility, and responsive behavior.

### Design Philosophy
- **Minimal & Meaningful** — Every element serves a purpose
- **Performance-First** — Optimized animations and rendering
- **Accessible by Default** — WCAG 2.1 AA compliance minimum
- **Responsive & Flexible** — Works across all device sizes
- **Developer-Friendly** — Clear specifications, reusable components

### Key Principles
```
Clarity    → Clear information hierarchy and visual structure
Consistency → Predictable patterns across all interfaces
Feedback   → Immediate user feedback for all interactions
Efficiency → Minimal clicks to complete tasks
Delight    → Thoughtful micro-interactions without being distracting
```

---

## 2. Design System

### 2.1 Color Palette

#### Primary Colors
```
Primary Brand Blue
├── Hex: #0066CC
├── RGB: 0, 102, 204
├── HSL: 210°, 100%, 40%
├── Usage: Primary actions, links, highlighted states
└── Accessibility: 7.5:1 contrast ratio on white

Secondary Accent
├── Hex: #00B4D8
├── RGB: 0, 180, 216
├── HSL: 187°, 100%, 42%
├── Usage: Secondary actions, hover states, highlights
└── Accessibility: 5.2:1 contrast ratio on white
```

#### Semantic Colors
```
Success (Green)
├── Hex: #10B981
├── Usage: Approval, completion, confirmed states

Warning (Amber)
├── Hex: #F59E0B
├── Usage: Caution, pending, attention needed

Error (Red)
├── Hex: #EF4444
├── Usage: Errors, rejections, deletion confirmations

Info (Sky Blue)
├── Hex: #0EA5E9
├── Usage: Information, tips, neutral alerts
```

#### Neutral Colors
```
Backgrounds
├── White: #FFFFFF (Primary background)
├── Light Gray: #F9FAFB (Secondary background)
├── Lighter Gray: #F3F4F6 (Tertiary background)
└── Grid Lines: #E5E7EB

Text
├── Primary Text: #111827 (Dark gray for main content)
├── Secondary Text: #6B7280 (Medium gray for supporting text)
├── Tertiary Text: #9CA3AF (Light gray for labels)
└── Disabled Text: #D1D5DB

Borders
├── Strong Border: #D1D5DB (Form inputs, cards)
├── Light Border: #E5E7EB (Dividers, subtle separators)
└── Hover Border: #9CA3AF (Interactive elements)
```

#### Color Usage Guidelines
```
Button States:
├── Default: Primary Blue (#0066CC)
├── Hover: Darker Shade (#0052A3)
├── Active/Pressed: Darkest Shade (#003D7A)
├── Disabled: Light Gray (#D1D5DB) with Tertiary Text
└── Loading: Primary Blue with opacity animation

Form States:
├── Default: Border #D1D5DB, Text #111827
├── Focus: Border #0066CC (3px), Box Shadow: rgba(0,102,204,0.1)
├── Valid: Border #10B981, Icon: Success Green
├── Invalid: Border #EF4444, Text: Error Red
└── Disabled: Background #F9FAFB, Border #E5E7EB

Card States:
├── Rest: White background, Light Border
├── Hover: Light Gray background, Strong Border
├── Selected: Light Blue background (#EFF6FF), Primary Border
└── Active: Primary Blue background, White text
```

### 2.2 Typography

#### Font Families
```
Display Font (Headlines)
├── Font: "Inter Display" or Fallback "San Francisco"
├── Weight: 700 (Bold), 600 (Semi-Bold)
├── Usage: Page titles, major sections, hero text
├── Characteristics: Modern, clean, confident

Body Font (Content)
├── Font: "Inter" or Fallback "Segoe UI"
├── Weight: 400 (Regular), 500 (Medium), 600 (Semi-Bold)
├── Usage: Body text, labels, UI elements
├── Characteristics: Legible, neutral, professional

Mono Font (Code)
├── Font: "Fira Code" or Fallback "Courier New"
├── Weight: 400 (Regular), 600 (Semi-Bold)
├── Usage: Code snippets, technical values, IDs
├── Characteristics: Monospaced, clear distinction
```

#### Type Scale
```
Heading 1 (H1)
├── Size: 32px (desktop), 24px (mobile)
├── Line Height: 1.2 (40px / 29px)
├── Weight: 700 Bold
├── Letter Spacing: -0.5px
├── Usage: Page titles, major sections
├── Margin: 0 top, 24px bottom

Heading 2 (H2)
├── Size: 24px (desktop), 20px (mobile)
├── Line Height: 1.3 (32px / 26px)
├── Weight: 600 Semi-Bold
├── Letter Spacing: -0.25px
├── Usage: Section headers, card titles
├── Margin: 0 top, 16px bottom

Heading 3 (H3)
├── Size: 20px (desktop), 18px (mobile)
├── Line Height: 1.4 (28px / 25px)
├── Weight: 600 Semi-Bold
├── Usage: Sub-sections, widget titles
├── Margin: 0 top, 12px bottom

Body (Regular)
├── Size: 16px (desktop), 14px (mobile)
├── Line Height: 1.5 (24px / 21px)
├── Weight: 400 Regular
├── Usage: Paragraphs, descriptions, content
├── Margin: 0 top, 12px bottom

Body Small (Caption)
├── Size: 14px (desktop), 12px (mobile)
├── Line Height: 1.5 (21px / 18px)
├── Weight: 400 Regular
├── Usage: Labels, metadata, secondary information
├── Color: Secondary Text (#6B7280)

Label
├── Size: 12px
├── Line Height: 1.33 (16px)
├── Weight: 500 Medium
├── Text Transform: Uppercase
├── Letter Spacing: +0.5px
├── Usage: Form labels, tags, badges
├── Color: Secondary Text (#6B7280)
```

#### Line Height & Spacing
```
Reading Optimal Line Height: 1.5 - 1.6
Code Line Height: 1.5 - 1.6
Heading Line Height: 1.1 - 1.3

Paragraph Spacing
├── Between paragraphs: 16px (1 rem)
├── Between headings and content: 8px (0.5 rem)
├── List item spacing: 8px (0.5 rem)
└── Code block spacing: 16px (1 rem)
```

### 2.3 Spacing System

#### 8px Grid System
```
Base Unit: 8px

Scale:
├── 4px   (0.5x) → Micro adjustments, badge padding
├── 8px   (1x)   → Minimum spacing, small padding
├── 12px  (1.5x) → Label spacing, small gutters
├── 16px  (2x)   → Standard padding, vertical spacing
├── 24px  (3x)   → Medium sections, large gutters
├── 32px  (4x)   → Large sections, major spacing
├── 48px  (6x)   → Page sections, major breaks
├── 64px  (8x)   → Hero sections, page margins
└── 80px  (10x)  → Maximum spacing

Usage:
├── Component Padding:   12px (vertical) x 16px (horizontal)
├── Card Padding:        20px (all sides)
├── Section Margins:     32px top / 32px bottom
├── Page Margins:        24px (desktop), 16px (mobile)
└── Gutters:             16px (desktop), 12px (mobile)
```

#### Padding Guidelines
```
Buttons
├── Small:    8px (vertical) x 12px (horizontal)
├── Medium:   12px (vertical) x 16px (horizontal)
├── Large:    16px (vertical) x 24px (horizontal)
└── Icon-Only: 8px (all sides)

Form Inputs
├── Padding:     12px (vertical) x 12px (horizontal)
├── Border Radius: 6px
├── Height:      40px (standard)
└── Min Height:  40px

Cards
├── Padding:       20px
├── Gap:           16px (between elements)
├── Border Radius: 8px
└── Box Shadow:    0px 1px 3px rgba(0,0,0,0.1)

Modals
├── Padding:       24px
├── Header Space:  20px bottom
├── Footer Space:  20px top
└── Border Radius: 12px
```

### 2.4 Elevation & Shadows

#### Shadow Levels
```
Elevation 1 (Subtle)
└── Box Shadow: 0px 1px 2px rgba(0,0,0,0.05), 0px 1px 3px rgba(0,0,0,0.1)
    Usage: Cards, dropdowns, hover states

Elevation 2 (Raised)
└── Box Shadow: 0px 4px 6px rgba(0,0,0,0.07), 0px 2px 4px rgba(0,0,0,0.05)
    Usage: Floating buttons, overlays

Elevation 3 (Floating)
└── Box Shadow: 0px 10px 20px rgba(0,0,0,0.15), 0px 5px 10px rgba(0,0,0,0.1)
    Usage: Modals, popovers, tooltips

Elevation 4 (Modal)
└── Box Shadow: 0px 20px 40px rgba(0,0,0,0.2), 0px 10px 20px rgba(0,0,0,0.15)
    Usage: Full-screen modals, drawers
```

#### Border Radius
```
Small (Subtle): 4px
├── Use: Small components, minor accents

Medium (Standard): 6px
├── Use: Buttons, inputs, tags, badges

Large (Prominent): 8px
├── Use: Cards, containers, alert boxes

Extra Large (Soft): 12px
├── Use: Modals, rounded images, large containers

Pill Shape: 9999px
├── Use: Badges, pills, fully rounded elements
```

---

## 3. Component Library

### 3.1 Button Component

#### Variants
```
Primary Button (Call-to-Action)
├── Background: #0066CC
├── Text: White
├── Padding: 12px 16px
├── Usage: Main actions (submit, create, save)

Secondary Button
├── Background: Transparent
├── Border: 2px #0066CC
├── Text: #0066CC
├── Usage: Alternative actions

Tertiary Button
├── Background: #F3F4F6
├── Text: #111827
├── Border: 1px #E5E7EB
├── Usage: Less important actions (cancel, skip)

Danger Button
├── Background: #EF4444
├── Text: White
├── Usage: Destructive actions (delete, reject)

Ghost Button
├── Background: Transparent
├── Text: #0066CC
├── Border: None
├── Hover: Light Blue background
├── Usage: Subtle actions, links

Disabled State (All Variants)
├── Opacity: 50%
├── Cursor: not-allowed
├── Pointer Events: none
```

#### Size Scale
```
Small
├── Height: 32px
├── Padding: 8px 12px
├── Font: 12px, 500 weight

Medium (Default)
├── Height: 40px
├── Padding: 12px 16px
├── Font: 14px, 500 weight

Large
├── Height: 48px
├── Padding: 16px 24px
├── Font: 16px, 500 weight
```

#### States
```
Rest
├── Background: Primary Blue
├── Text Color: White
├── Shadow: None
├── Cursor: pointer

Hover
├── Background: Darker Blue (#0052A3)
├── Transform: Slight lift (translateY -2px)
├── Shadow: Elevation 2

Active/Pressed
├── Background: Darkest Blue (#003D7A)
├── Transform: translateY 0px (press down effect)
├── Shadow: Inset shadow

Focus
├── Outline: 2px solid Primary Blue
├── Outline Offset: 2px
├── Shadow: Elevation 2 + Focus outline

Loading
├── Cursor: wait
├── Content: Spinner icon (see animation examples)
├── Opacity: 0.7
```

### 3.2 Form Input Component

#### Text Input
```
Structure
├── Label (if needed)
├── Input Field
│   ├── Padding: 12px
│   ├── Height: 40px
│   ├── Border: 1px #D1D5DB
│   ├── Border Radius: 6px
│   └── Font: 14px, regular
├── Helper Text (optional)
└── Error Message (optional)

States:
├── Default
│   ├── Border: 1px #D1D5DB
│   ├── Background: White
│   ├── Text Color: #111827
│
├── Focus
│   ├── Border: 2px #0066CC
│   ├── Shadow: 0 0 0 3px rgba(0,102,204,0.1)
│   ├── Outline: None
│
├── Filled
│   ├── Border: 1px #9CA3AF
│   ├── Text Color: #111827
│
├── Error
│   ├── Border: 2px #EF4444
│   ├── Text Color: #EF4444 (error message)
│   ├── Icon: Red exclamation mark (right side)
│
├── Valid
│   ├── Border: 2px #10B981
│   ├── Icon: Green checkmark (right side)
│
├── Disabled
│   ├── Background: #F9FAFB
│   ├── Border: 1px #E5E7EB
│   ├── Text Color: #9CA3AF
│   ├── Cursor: not-allowed
```

#### Textarea
```
Specifications
├── Min Height: 100px
├── Max Height: Scrollable at 300px
├── Padding: 12px
├── Border: Same as text input
├── Line Height: 1.5
├── Resize: Vertical only
├── Font: 14px, Monospace for code
├── Tab Behavior: 2 spaces per tab

States: Same as Text Input plus:
├── Resize Indicator: Position: bottom-right
├── Scroll Behavior: Smooth
```

#### Select Dropdown
```
Closed State
├── Height: 40px
├── Padding: 12px
├── Border: 1px #D1D5DB
├── Border Radius: 6px
├── Display: Flex, space-between
├── Icon: Chevron down (right aligned)

Open State
├── Border: 2px #0066CC
├── Menu Items:
│   ├── Padding: 12px 12px
│   ├── Height: 40px per item
│   ├── Hover: Light Blue background
│   ├── Selected: Primary Blue background + checkmark
│   └── Separator: 1px #E5E7EB
├── Max Menu Height: 320px (scrollable)
├── Box Shadow: Elevation 3
├── Position: Absolute, below input
├── Z-index: 1000

Option Item
├── Default: #111827 text on transparent
├── Hover: Light Blue background (#EFF6FF)
├── Selected: Blue background with white text
├── Disabled: Grayed out, cursor: not-allowed
```

#### Checkbox & Radio
```
Checkbox
├── Size: 18x18px
├── Border: 2px #D1D5DB
├── Border Radius: 4px
├── Checked Background: #0066CC
├── Check Icon: White, centered
├── Hover: Border becomes #0066CC
├── Focus: 2px outline offset 2px
├── Label Spacing: 8px left

Radio Button
├── Size: 18x18px
├── Border: 2px #D1D5DB
├── Border Radius: 50% (circle)
├── Checked: Filled circle (#0066CC) with white dot (6px)
├── Hover: Border becomes #0066CC
├── Focus: Same as checkbox
├── Label Spacing: 8px left
├── Group Spacing: 16px between items

Focus State (Both)
├── Outline: 2px solid #0066CC
├── Outline Offset: 2px
```

### 3.3 Card Component

#### Card Container
```
Basic Card
├── Background: White
├── Border: 1px #E5E7EB
├── Border Radius: 8px
├── Padding: 20px
├── Box Shadow: Elevation 1
├── Width: Flexible (fill container)
├── Min Height: None (content-driven)

Card Sections:
├── Header
│   ├── Padding: 20px 20px 12px 20px
│   ├── Border Bottom: 1px #E5E7EB
│   ├── Display: Flex (space-between if title + action)
│   └── Title: H3 style
│
├── Body
│   ├── Padding: 16px
│   ├── Content: Variable height
│   └── Line Height: 1.5
│
└── Footer
    ├── Padding: 12px 20px 20px 20px
    ├── Border Top: 1px #E5E7EB
    ├── Display: Flex (end-aligned)
    └── Gap: 12px between buttons

Hover State
├── Border: 1px #D1D5DB
├── Box Shadow: Elevation 2
├── Transition: 200ms ease
├── Cursor: pointer (if clickable)

Active State
├── Border: 2px #0066CC
├── Background: #EFF6FF (light blue tint)
└── Box Shadow: Elevation 2
```

### 3.4 Modal/Dialog Component

#### Modal Structure
```
Backdrop
├── Background: rgba(0, 0, 0, 0.5)
├── Position: Fixed, full viewport
├── Z-index: 999
├── Transition: Fade in 200ms

Modal Container
├── Background: White
├── Border Radius: 12px
├── Width: 90vw (max 500px desktop, 100vw mobile)
├── Max Height: 90vh
├── Position: Fixed, centered
├── Z-index: 1000
├── Box Shadow: Elevation 4
├── Overflow: Hidden (children scroll)

Modal Header
├── Padding: 24px
├── Border Bottom: 1px #E5E7EB
├── Display: Flex (space-between)
├── Title: H2 style
├── Close Button: X icon top-right

Modal Body
├── Padding: 24px
├── Overflow: Auto (scroll if needed)
├── Max Height: Calculated (90vh - header - footer)

Modal Footer
├── Padding: 24px
├── Border Top: 1px #E5E7EB
├── Display: Flex (end-aligned)
├── Gap: 12px between buttons
├── Background: #F9FAFB (subtle contrast)
```

#### States
```
Entering
├── Backdrop: Fade in 200ms
├── Modal: Scale from 0.8 to 1, fade in
├── Animation: ease-out

Exiting
├── Modal: Scale from 1 to 0.8, fade out
├── Backdrop: Fade out
├── Animation: 150ms ease-in

Scrollable Content
├── Body scroll: Smooth
├── Header/Footer: Sticky (don't scroll)
├── Virtual scrolling: For large lists

Focus Management
├── Initial focus: First focusable element or close button
├── Trap: Tab key cycles within modal
├── Escape key: Closes modal (if allowed)
```

### 3.5 Table Component

#### Table Structure
```
Container
├── Background: White
├── Border: 1px #E5E7EB
├── Border Radius: 8px
├── Overflow: Auto
├── Box Shadow: Elevation 1

Header Row
├── Background: #F9FAFB
├── Border Bottom: 2px #E5E7EB
├── Padding: 12px 16px
├── Font: 500 weight, #495057
├── Text Transform: Uppercase
├── Letter Spacing: 0.5px
├── Sticky: top 0
├── Z-index: 10

Body Rows
├── Height: 48px
├── Padding: 12px 16px
├── Border Bottom: 1px #E5E7EB
├── Text: Regular weight, #111827
├── Transition: 150ms background

Row States:
├── Hover: Background #F9FAFB
├── Selected: Background #EFF6FF, left border 3px #0066CC
├── Active: Background #DEE2E6

Cells
├── Vertical Align: Middle
├── Horizontal Align: Left (unless numeric)
├── Padding: 12px 16px
├── White Space: Nowrap (truncate long text)
├── Text Overflow: Ellipsis
```

#### Interactive Features
```
Sorting
├── Header Cell: Cursor pointer on hover
├── Icon: Up/Down chevron (right side)
├── Active Column: Primary Blue text + icon
├── Inactive: Grayed icon visible on hover

Selection
├── Checkbox Column: Width 48px
├── Master Checkbox: Selects all visible rows
├── Row Checkbox: Individual row selection
├── Selected Color: Light Blue background

Expandable Rows
├── Expand Icon: Chevron (left side)
├── Expanded Content: Full width, nested padding
├── Animation: 200ms height transition
├── Font: Smaller, secondary text color
```

---

## 4. Page Specifications

### 4.1 Dashboard Page

#### Layout Structure
```
Grid: 12 columns, 1200px max width

Header (Full Width)
├── Height: 64px
├── Content: Title, breadcrumbs, actions
├── Sticky: Yes
├── Z-index: 100

Sidebar (2 columns, left)
├── Width: 250px
├── Sticky: Yes
├── Navigation: Tree structure
├── Collapsible: Mobile only

Main Content (10 columns, right)
├── Padding: 24px
├── Grid: 12 sub-columns
├── Cards/Widgets: Various sizes (3, 4, 6, 12 columns)
├── Gap: 24px

Footer (Full Width)
├── Margin Top: 48px
├── Content: Links, copyright, version
├── Sticky: Bottom
```

#### Dashboard Cards
```
Stat Card
├── Title: Medium text
├── Value: Large number (H2 size)
├── Trend: Percentage with arrow (green/red)
├── Sparkline: Optional small chart
├── Size: 3 columns (responsive: 6 mobile)

Activity Card
├── Title: "Recent Activity"
├── Items: List format
├── Max Items: 5 with "View All" link
├── Item Format: Avatar + name + action + time

Progress Card
├── Title: Goal/Task name
├── Progress Bar: Visual indicator
├── Percentage: Text value
├── Details: Completion date, owner
├── Action: Edit, View Details
```

### 4.2 Form Pages

#### Form Container
```
Width: 500px (max), 100% (mobile)
Margin: Auto centered
Padding: 24px
Background: White
Border Radius: 8px
Box Shadow: Elevation 1

Section Spacing: 24px
Field Spacing: 16px within groups

Form Sections:
├── Header: Title + description
├── Fields: Grouped by category
├── Actions: Submit + Cancel buttons (bottom)
└── Helper Text: Below problematic fields
```

#### Multi-Step Forms
```
Progress Indicator
├── Display: Numbered steps + labels
├── Width: Full width, centered
├── Active Step: Primary Blue + number
├── Completed: Green checkmark + number
├── Current Step: Blue background
├── Position: Top of form

Step Content
├── Title: Step name (H2)
├── Description: Context/purpose
├── Fields: All fields for this step
├── Navigation: "Back" + "Next" buttons
├── Validation: Step-by-step (not all-at-once)

Step Transitions
├── Animation: Fade + slide (200ms)
├── Direction: Next = slide left in
└── Direction: Back = slide right in
```

---

## 5. Interactions & Animations

### 5.1 Micro-interactions

#### Button Click Feedback
```
Timeline:
├── 0ms: Button pressed
│   ├── Scale: 0.98
│   ├── Shadow: Inset shadow
│   ├── Duration: 50ms
│
├── 50ms: Release ripple (if Material-style)
│   ├── Ripple Origin: Click point
│   ├── Duration: 600ms
│   ├── Opacity: Fade from 0.5 to 0
│
└── Action complete: Visual feedback
    ├── Success: Green checkmark
    ├── Loading: Spinner
    └── Error: Red X or shake animation
```

#### Form Focus States
```
Input Focus
├── Duration: 200ms
├── Scale: Subtle (1.0 to 1.02)
├── Border: Thin to thick (1px to 2px)
└── Shadow: None to light blue glow

Label Animation (Floating Label)
├── Initial: Static above input
├── On Focus: Scale 0.9, translateY -24px
├── On Blur (Empty): Return to initial
├── Duration: 150ms ease-in-out
```

#### Loading States
```
Spinner Animation
├── SVG Circle: 2px stroke, 24px diameter
├── Rotation: 360deg per 1 second
├── Timing: Linear, infinite
├── Color: Primary Blue, animated opacity pulse

Progress Bar
├── Height: 4px
├── Width: Increases from 0 to 90% randomly
├── Color: Primary Blue with gradient
├── Animation: Smooth easing, no jumps
├── Complete: Fast fill to 100% + fade out

Skeleton Loader
├── Placeholder shape: Light gray (#E5E7EB)
├── Animation: Shimmer from left to right
├── Duration: 2 seconds infinite
├── Colors: Gray → Lighter Gray → Gray
```

### 5.2 Page Transitions

#### Fade Transition
```
Duration: 200ms
Easing: ease-in-out
├── Page Out: Opacity 1 → 0
├── Page In: Opacity 0 → 1
└── Overlap: Slight (100ms)
```

#### Slide Transition
```
Duration: 300ms
Easing: ease-in-out
Direction:
├── Next: New page slides in from right
├── Back: Previous page slides in from left

Transform:
├── Out: TranslateX -100%
├── In: TranslateX 0
└── Additional: Scale 0.95 on exit (subtle depth)
```

#### Stagger Animation
```
List Items:
├── Base Delay: 0ms
├── Item Delay: +50ms per item
├── Max: 500ms total difference
├── Duration: 300ms fade + translate
└── Effect: Cascading entrance

Example Timeline:
├── Item 1: 0ms delay, 50ms duration
├── Item 2: 50ms delay, 50ms duration
├── Item 3: 100ms delay, 50ms duration
```

---

## 6. Accessibility & Responsiveness

### 6.1 Accessibility Standards

#### WCAG 2.1 AA Compliance
```
Color Contrast
├── Normal Text: 4.5:1 minimum
├── Large Text: 3:1 minimum
├── UI Components: 3:1 minimum
└── Verification: Contrast checker tool

Keyboard Navigation
├── Tab Order: Logical, top-to-bottom, left-to-right
├── Focus Visible: 2px outline, 2px offset
├── Focus Management: Logical page flow
└── Modals: Focus trap, Escape key to close

Screen Reader Support
├── Semantic HTML: <button>, <label>, <form>
├── ARIA Labels: aria-label for icon buttons
├── Descriptions: aria-describedby for info
├── Roles: Define custom component roles
└── Live Regions: aria-live for dynamic content

Motion & Animation
├── Prefers Reduced Motion: Respect user setting
├── Vestibular Triggers: Avoid spinning/flashing
├── Duration: Max 3 seconds for essential animations
└── Disable Complex: Keep animations simple
```

#### Form Accessibility
```
Labels
├── Always present: <label> for each input
├── Association: for="input-id" attribute
├── Positioning: Above or left of input
├── Font Weight: 500

Error Messages
├── Inline: Below the field
├── Color: Red + icon (not color alone)
├── aria-describedby: Link to error message
├── Role: alert (announce immediately)

Instructions
├── Placement: Above form
├── Format: List or paragraph
├── Clarity: Plain language, no jargon
└── Optional Fields: Clearly marked "(Optional)"
```

### 6.2 Responsive Breakpoints

#### Breakpoint System
```
Mobile: 320px - 640px
├── Single column layouts
├── Full-width cards
├── Stacked navigation
├── Touch-friendly targets (48px min)

Tablet: 641px - 1024px
├── Two-column layouts possible
├── Adjusted spacing
├── Sidebar collapses to hamburger
├── Larger touch targets

Desktop: 1025px - 1440px
├── Three+ column layouts
├── Full sidebar
├── Standard spacing
├── Optimized for mouse/keyboard

Large Desktop: 1441px+
├── Max width container (1200px)
├── Additional whitespace
├── Multi-column dashboards
└── Hover states fully utilized
```

#### Responsive Design Rules
```
Typography
├── H1: 32px (desktop) → 24px (tablet) → 20px (mobile)
├── Body: 16px (desktop) → 14px (mobile)
├── Line Height: Consistent 1.5

Spacing
├── Margins/Padding: 24px (desktop) → 16px (mobile)
├── Gap: 24px (desktop) → 12px (mobile)
├── Gutters: 16px (desktop) → 12px (mobile)

Images
├── Max Width: 100% of container
├── Height: Auto (maintain aspect ratio)
├── Srcset: Multiple resolutions
└── Picture element: Different crops/sizes

Flexbox/Grid
├── Desktop: Multi-column
├── Tablet: Two-column or adapted
├── Mobile: Single-column stack
└── No horizontal scroll
```

#### Touch Optimization (Mobile)
```
Touch Targets
├── Minimum: 44x44px (Apple), 48x48px (Google)
├── Spacing: 8px minimum between targets
├── Buttons: Full-width on mobile
├── Icons: Larger on mobile (24px → 32px)

Interactions
├── Tap: No delay, immediate feedback
├── Long Press: Show context menu (500ms)
├── Swipe: Gesture support for lists
├── Double Tap: Zoom + form fill prevention

Input & Keyboard
├── Autocorrect: Off for email, names
├── Autocomplete: On for known fields
├── Keyboard Type: Contextual (number, email, tel)
├── Mobile Keyboard: Dismissible on scroll
```

---

## 7. Implementation Guide

### 7.1 CSS Architecture

#### Structure
```
├── 1-reset/
│   └── normalize.css (reset browser defaults)
│
├── 2-variables/
│   ├── colors.css (color palette)
│   ├── typography.css (font scales)
│   ├── spacing.css (8px grid)
│   ├── shadows.css (elevation system)
│   └── transitions.css (animation timing)
│
├── 3-base/
│   ├── html.css (global styles)
│   ├── body.css (page setup)
│   └── typography.css (heading + text styles)
│
├── 4-layout/
│   ├── container.css (max-width pattern)
│   ├── flex.css (flex utility classes)
│   ├── grid.css (grid layout)
│   └── sidebar.css (sidebar layout)
│
├── 5-components/
│   ├── button.css
│   ├── input.css
│   ├── card.css
│   ├── modal.css
│   ├── table.css
│   └── ... (other components)
│
├── 6-utilities/
│   ├── text.css (text alignment, transform)
│   ├── spacing.css (margin, padding utilities)
│   ├── display.css (visibility, opacity)
│   └── responsive.css (media query helpers)
│
└── main.css (import order as above)
```

#### CSS Variables Example
```css
:root {
  /* Colors */
  --color-primary: #0066CC;
  --color-primary-dark: #0052A3;
  --color-success: #10B981;
  --color-error: #EF4444;
  
  /* Typography */
  --font-primary: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI";
  --font-mono: "Fira Code", monospace;
  --font-size-base: 16px;
  --line-height-base: 1.5;
  
  /* Spacing */
  --spacing-unit: 8px;
  --spacing-xs: calc(var(--spacing-unit) * 0.5); /* 4px */
  --spacing-sm: var(--spacing-unit);              /* 8px */
  --spacing-md: calc(var(--spacing-unit) * 2);   /* 16px */
  --spacing-lg: calc(var(--spacing-unit) * 3);   /* 24px */
  
  /* Shadows */
  --shadow-sm: 0px 1px 2px rgba(0,0,0,0.05), 0px 1px 3px rgba(0,0,0,0.1);
  --shadow-md: 0px 4px 6px rgba(0,0,0,0.07), 0px 2px 4px rgba(0,0,0,0.05);
  
  /* Transitions */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --easing-default: ease-in-out;
}
```

### 7.2 React Component Templates

#### Button Component
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'medium',
    isLoading = false,
    icon,
    children,
    disabled,
    className,
    ...props
  }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          button
          button--${variant}
          button--${size}
          ${isLoading ? 'is-loading' : ''}
          ${disabled ? 'is-disabled' : ''}
          ${className || ''}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Spinner />}
        {icon && <span className="button__icon">{icon}</span>}
        <span className="button__text">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
```

#### Modal Component
```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium'
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className={`modal modal--${size}`} role="dialog" aria-modal="true">
        {title && (
          <div className="modal__header">
            <h2 className="modal__title">{title}</h2>
            <button onClick={onClose} aria-label="Close modal">
              <X size={24} />
            </button>
          </div>
        )}
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </>
  );
};
```

---

## 8. Color Palette & Typography

### Master Reference

#### Complete Color Hex Values
```
Primary:        #0066CC (shade), #003D7A (darkest), #0052A3 (dark)
Secondary:      #00B4D8 (accent)
Success:        #10B981
Warning:        #F59E0B
Error:          #EF4444
Info:           #0EA5E9
White:          #FFFFFF
Light Gray:     #F9FAFB
Lighter Gray:   #F3F4F6
Grid/Borders:   #E5E7EB
Medium Border:  #D1D5DB
Dark Border:    #9CA3AF
Dark Text:      #111827
Medium Text:    #6B7280
Light Text:     #9CA3AF
Disabled:       #D1D5DB
```

#### Font Stack (Fallback Chain)
```
Display/Headings:
"Inter Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif

Body/UI:
"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif

Code/Monospace:
"Fira Code", "Courier New", monospace
```

---

## Best Practices Summary

### Do's ✅
- Use semantic HTML elements
- Maintain consistent spacing with 8px grid
- Test animations with `prefers-reduced-motion`
- Provide visible focus indicators
- Use descriptive alt text and labels
- Test on real devices (mobile, tablet, desktop)
- Keep animations under 300ms for UI feedback
- Use CSS variables for maintainability

### Don'ts ❌
- Don't rely on color alone for meaning
- Don't use auto-play video without user control
- Don't create animations that can't be disabled
- Don't ignore keyboard navigation
- Don't make text too small (min 12px, 14px preferred)
- Don't nest modals or create complex stacking contexts
- Don't use animation for critical information display
- Don't forget about dark mode support

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | March 27, 2026 | Initial design system documentation |

---

## Document Maintenance

**Last Updated:** March 27, 2026  
**Maintained By:** Design System Team  
**Next Review:** June 27, 2026  
**Contact:** design-system@pms-platform.com

---

## Appendix: Quick Reference

### Component Checklist
- [ ] Button (primary, secondary, tertiary, danger, ghost)
- [ ] Form Inputs (text, textarea, select, checkbox, radio)
- [ ] Cards (basic, header/footer sections)
- [ ] Modals (different sizes, with/without footer)
- [ ] Tables (sorting, selection, expandable rows)
- [ ] Notifications (toast, alert, banner)
- [ ] Navigation (sidebar, breadcrumbs, tabs)
- [ ] Data Visualizations (charts, sparklines, progress)

### Animation Library
- [ ] Fade transitions
- [ ] Slide transitions
- [ ] Stagger effects
- [ ] Micro-interactions (hover, click, focus)
- [ ] Loading spinners
- [ ] Sheet/drawer animations
- [ ] Tooltip animations

### Testing Checklist
- [ ] Keyboard accessibility (Tab, Enter, Escape)
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Color contrast verification
- [ ] Mobile responsiveness (320px, 768px, 1024px)
- [ ] Touch target sizing (48px minimum)
- [ ] Focus management in modals
- [ ] Animation performance (60fps)
- [ ] Cross-browser compatibility

---

**This document is a living guide. Updates and refinements should be made as the design system evolves and new components are added.**
