# 🎨 Visual Design Guide - Enhanced Quiz Components

## Color Palette

### Primary Colors (Dark Mode)
```
Primary Text:     #f3f1e8  (Off-white)
Secondary Text:   #b9c1ba  (Light gray)
Background:       #1a1d1b  (Deep dark)
Borders:          #3a4540  (Dark gray)
```

### Accent Colors (Universal)
```
Success/Primary:  #27745c  (Deep green)
Success Alt:      #69c59a  (Light green)
Warning/Timer:    #e9b949  (Gold)
Error/Incorrect:  #bd493f  (Dark red)
Error Alt:        #ff8a78  (Light red)
Info:             #4a90e2  (Blue)
```

### Primary Colors (Light Mode)
```
Primary Text:     #1c211f  (Dark gray)
Secondary Text:   #65706b  (Muted gray)
Background:       #fffdf7  (Off-white)
Borders:          #d6ddd5  (Light gray)
```

## Typography System

### Headers
- **Size**: 2.8rem (h1), 2.2rem (h2), 1.3rem (h3)
- **Weight**: 800-900 (extra bold)
- **Letter Spacing**: -0.3px to -0.5px (tight tracking)
- **Line Height**: 1.1 - 1.2

### Body Text
- **Size**: 1rem - 1.05rem
- **Weight**: 600 (semibold)
- **Line Height**: 1.3 - 1.5

### Labels & Tags
- **Size**: 0.75rem - 0.85rem
- **Weight**: 800-900 (ultra bold)
- **Case**: UPPERCASE
- **Letter Spacing**: 0.05em - 0.08em

### Emphasis
- **Bold Words**: #1c211f (dark) or #f3f1e8 (light)
- **Weight**: 900
- **Size**: 1.05em relative to parent

## Shadow System

### Elevation Levels
```
Level 1 (Base):      0 4px 12px rgba(0, 0, 0, 0.05-0.06)
Level 2 (Hover):     0 8px 24px rgba(0, 0, 0, 0.08-0.15)
Level 3 (Focus):     0 12px 32px rgba(0, 0, 0, 0.15-0.2)
Level 4 (Maximum):   0 16px 48px rgba(0, 0, 0, 0.2-0.25)
Inset (Subtle):      inset 0 1px 3px rgba(0, 0, 0, 0.06-0.08)
```

### Shadow Colors
- Colored shadows for accent elements
- Example: `0 4px 12px rgba(39, 116, 92, 0.3)` for green elements

## Component Dimensions

### Grid Cards (Groups)
```
Desktop:  280px - 320px width, auto height
Tablet:   200px - 240px width, auto height
Mobile:   Full width - 32px padding
Min Height: 220px (desktop), 180px (tablet), 160px (mobile)
```

### Answer Buttons (MCQ)
```
Height: 64px (desktop), 56px (tablet), 48px (mobile)
Padding: 16px 20px (desktop), 14px 16px (tablet), 12px 14px (mobile)
Gap: 16px (desktop), 12px (tablet)
Border Radius: 12px
```

### Badges & Tags
```
Padding: 6px 12px - 8px 14px
Border Radius: 8px - 10px
Font Size: 0.75rem - 0.85rem
Min Width: 40px - 50px
```

## Spacing System

### Standard Gaps
```
xs: 8px    (micro interactions)
sm: 12px   (small elements)
md: 16px   (medium spacing)
lg: 20px   (large gaps)
xl: 24px   (section spacing)
2xl: 28px  (major gaps)
3xl: 32px  (page margins)
4xl: 40px  (section margins)
5xl: 50px  (large sections)
```

### Padding
```
Small: 12px - 14px (buttons, tags)
Medium: 16px - 20px (cards, containers)
Large: 24px - 28px (sections)
X-Large: 40px (page padding)
```

## Animation & Transitions

### Timing Functions
```
Standard:     200-350ms cubic-bezier(0.4, 0.0, 0.2, 1)
Bouncy:       300-600ms cubic-bezier(0.34, 1.56, 0.64, 1)
Linear:       300-500ms linear (progress bars)
Ease-Out:     300-500ms cubic-bezier(0.34, 1.56, 0.64, 1)
Ease-In:      200-300ms cubic-bezier(0.4, 0.0, 0.2, 1)
```

### Animation Durations
```
Micro Hover:   200ms
Click Feedback: 300ms
Slide Enter:   300-500ms
Fade:          300-600ms
Keyframe Loop: 2s - 2.5s
```

### Transform Effects
- **Hover**: `translateY(-2px)` or `scale(1.05)`
- **Active**: `translateY(-4px)` or `scale(1.1)`
- **Release**: `translateY(0)` smooth return
- **Rotations**: Scale only, no rotation for flat design

## State Styles

### Button States
```
Default:     Base colors, normal shadow
Hover:       Lighter background, +1 shadow level, -2px Y translate
Active:      Lighter background, +2 shadow level, -4px Y translate
Focus:       Visible focus ring, enhanced shadow
Disabled:    Opacity 60-70%, cursor: not-allowed
```

### Answer States
```
Neutral:     Border #d6ddd5, background transparent
Hover:       Border #27745c, background +6% green, -2px translate
Selected:    Border green, shadow glow
Correct:     Border #27745c, background +12% green, checkmark
Incorrect:   Border red, background +12% red, X mark
```

## Responsive Breakpoints

### Desktop (1200px+)
- 3-4 column grid
- Full padding and spacing
- All animations enabled
- Hover states active
- Maximum shadow depths

### Tablet (769px - 1199px)
- 2-3 column grid
- Medium padding
- Optimized spacing
- Touch-friendly targets (44x44px minimum)
- Reduced animation complexity

### Mobile (< 768px)
- 1-2 column grid (1 for most components)
- Reduced padding (12px-16px)
- Compact spacing (8px-12px)
- Full-width components minus margins
- Simplified animations

### Small Mobile (< 480px)
- Full width - 12px padding
- Stacked layouts
- Minimal spacing
- Touch-optimized (50x50px buttons)
- Essential animations only

## Gradients

### Text Gradients
```
Green to Gold:    linear-gradient(135deg, #27745c, #e9b949)
Dark to Light:    linear-gradient(135deg, #1d5a47, #20c997)
Multi Color:      linear-gradient(135deg, #e9b949, #27745c, #ff8a78)
```

### Background Gradients
```
Subtle:    linear-gradient(135deg, color 4%, transparent 100%)
Medium:    linear-gradient(135deg, color 8%, color2 100%)
Strong:    linear-gradient(135deg, color 12%, color2 100%)
```

## Icon System

### Emoji Used
- 🚀 Launch/Start action
- ⏭️ Skip/Next action
- ⏱️ Timer/Time warning
- 📝 Sentence type question
- 💡 Meaning type question
- ✓ Correct answer
- ✗ Incorrect answer
- 🎉 Celebration/Success

### Size Scaling
```
Small:  0.85em (inline)
Medium: 1.0em  (standard)
Large:  1.2em  (feedback)
X-Large: 1.8em (header)
```

## Specific Component Styles

### Multiple-Choice Question Container
```
Max Width: 980px
Background: Light with subtle gradient
Border Radius: 16px
Padding: 20px (desktop) - 12px (mobile)
Shadow: Level 2 (0 20px 60px)
```

### Group Card (Unselected)
```
Border: 2px solid #d6ddd5
Border Radius: 16px
Background: Gradient light
Padding: 24px
Min Height: 220px
Hover: -8px Y transform, Level 3 shadow
```

### Group Card (Selected/Hover)
```
Border: 2px solid #27745c
Background: Lighter shade
Shadow: Level 3 (0 16px 48px)
Transform: translateY(-8px)
```

### Progress Bar
```
Height: 6px - 4px
Border Radius: 3px - 2px
Background: Gradient (green → gold)
Shadow: Subtle glow 0 0 12px
Transition: width 300-350ms linear
```

### Timer Display
```
Font Size: 1.8rem (number) + 0.85rem (unit)
Font Weight: 800 (number) + 700 (unit)
Font Variant: tabular-nums
Min Width: 45px (for stable layout)
Color: Green (normal) → Gold (warning) → Red (urgent)
```

## Accessibility Colors

### Contrast Ratios
- Text on Background: 7:1 (AAA)
- Button Text: 8:1 (AAA)
- Icons: 4.5:1 (AA minimum)
- Disabled Text: 3:1 (minimum)

### Color Blind Safe
- Uses green, gold, blue, red (distinct hues)
- Also uses patterns: checkmark (✓), X mark (✗)
- Supports monochrome viewing
- High contrast dark/light mode

## Dark Mode Adjustments

### Opacity Adjustments
```
Borders: +10% opacity in dark
Backgrounds: Lighter % increases for visibility
Shadows: Stronger (multiply by 2-3x)
Glows: More visible in dark backgrounds
```

### Color Inversions
```
Green:  #27745c (dark) ↔ #69c59a (light)
Gold:   #e9b949 (same - works in both)
Red:    #bd493f (dark) ↔ #ff8a78 (light)
Blue:   #4a90e2 (dark) ↔ #64b5f6 (light)
```

## Animation Choreography

### Entry Sequence
1. Background fades in (0ms)
2. Header slides down (100ms)
3. Cards fade in staggered (200-400ms)
4. Buttons appear (300-500ms)
5. Ready for interaction (600ms+)

### Interaction Sequence
1. Hover effect (immediate 200ms)
2. Shadow increase (simultaneous)
3. Transform apply (simultaneous)
4. Click down (simultaneous)
5. Feedback pop (300ms animation)

### Feedback Sequence
1. Slide up (300ms ease-out)
2. Emoji bounce (600ms elastic)
3. Definition fade (200ms delay then fade)
4. Checkout mark pop (300ms scale)

## File Reference

- **CSS Variables**: `mcq-shell` and `group-selector-container`
- **Animations**: Define in `@keyframes` sections
- **Shadows**: Used in `box-shadow` properties
- **Transitions**: Set on individual elements
- **Media Queries**: `@media (max-width: 768px)` and `@media (max-width: 480px)`

---

**Visual Design Version**: 1.0
**Last Updated**: October 6, 2026
**Theme Support**: Light ✅ / Dark ✅
**Accessibility**: WCAG 2.1 AA ✅
