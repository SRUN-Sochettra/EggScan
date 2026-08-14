
## 2024-06-22 - Explicit Focus States and SR-Only Labels
**Learning:** Custom inputs with absolute-positioned visual elements (like an adjacent `@` symbol) and native select elements often drop standard accessibility affordances. Using `aria-label` is good, but connecting an explicit, visually-hidden `<label className="sr-only">` provides stronger support for form autofill and screen reader context. Furthermore, interactive elements (buttons, inputs, selects) need explicitly defined `focus-visible` styles matching the theme (`focus-visible:ring-2 focus-visible:ring-brown-500 outline-none`) because browsers drop native focus rings when custom borders/backgrounds are applied.
**Action:** When creating custom form layouts or using Tailwind utility classes that override native browser styles, always manually implement a `focus-visible` state and ensure standard `<label>` semantics are preserved using `sr-only` if visual design prohibits a visible label.
## 2026-06-24 - Explicit focus-visible styling on icon-only buttons
**Learning:** When using custom focus rings with Tailwind (e.g., `focus-visible:ring-2`), it's critical to include `outline-none` to prevent browsers from simultaneously rendering their native focus outlines over the custom styles.
**Action:** Always pair custom `focus-visible:ring-*` classes with `outline-none` for clean, consistent accessibility styling across all interactive elements.
## 2024-08-01 - Apply focus-visible and outline-none to all form inputs
**Learning:** Found multiple form inputs (inputs, selects, submit buttons) missing proper accessible focus outlines in CommitmentShame, ReadmeRater, and StackRoast components, which degrades keyboard navigation usability.
**Action:** Consistently append `focus-visible:ring-2 focus-visible:ring-brown-500 outline-none` to all interactive form elements that override default browser styling to maintain accessibility standards.
## 2026-07-12 - Adding aria-hidden to decorative SVGs
**Learning:** SVG icons that are purely decorative, especially inside buttons that already have text labels (like 'Download Image' or 'Share Battle'), can cause screen readers to announce confusing or redundant information if not properly hidden.
**Action:** Always append `aria-hidden="true"` to SVG tags used as decorative icons alongside text, or when they are part of a visually complex but semantically simple interactive element.

## 2026-07-13 - Hide decorative SVGs from screen readers
**Learning:** Decorative inline SVGs in buttons or loaders lack semantic value and should be hidden from screen readers using `aria-hidden="true"` to prevent cluttering the accessibility tree.
**Action:** Add `aria-hidden="true"` to all purely visual `<svg>` elements.
