# UI/UX Design Principles for LLM Implementation

This document provides foundational theoretical knowledge for making UI/UX decisions based on core human-centered design principles and psychological cognitive constraints. These are not absolute rules. These are directions to consider. At the core of design is creativity, my friend. 

## 1. Core Laws of Usability
*   **Krug’s First Law:** Don’t make the user think. Every screen should be self-evident or self-explanatory.
*   **The Big Bang Theory of Web Design:** Users form a critical first impression within 50 milliseconds; they must immediately understand what the site is, what it has, and what they can do.
*   **The Principle of Satisficing:** Users do not make optimal choices; they scan for the first "good enough" option and click it immediately.
*   **The Goodwill Reservoir:** Every user starts with a limited amount of patience. Bad design (confusing navigation, forced registration) depletes it; helpful design (saving steps, candor about costs) refills it.

## 2. Fundamental Interaction Principles (Norman's Framework)
*   **Affordances:** The relationship between an object and an agent that determines possible actions (e.g., a chair affords sitting).
*   **Signifiers:** Perceivable signals that communicate where and how an action should take place. These are more important to designers than affordances because they ensure discoverability.
*   **Mapping:** The relationship between controls and the things they affect. Use **Natural Mapping** (spatial analogies) to ensure immediate understanding.
*   **Feedback:** Immediate, informative communication regarding the result of an action.
*   **Conceptual Models:** Provide the user with a simplified explanation of how the system works to help them predict outcomes and recover from errors.
*   **Gulfs of Execution and Evaluation:** Design must bridge the gap between the user's goal and the physical action (Execution), and the gap between the physical state and the user's interpretation (Evaluation).

## 3. Human Cognition & Vision Constraints
*   **Scanning Patterns:** Users scan in their culture's normal reading pattern (e.g., F-pattern or left-to-right) but prioritize the center and avoid screen edges.
*   **Visual Hierarchy:** Use size, color, and white space to signify importance. Related items must be logically grouped and "nested" visually.
*   **Memory Limits:** 
    *   **Short-Term Memory:** Limited to 3–5 items. 
    *   **Chunking:** Group information into small, meaningful chunks to enhance recall.
    *   **Recognition over Recall:** It is easier for users to recognize information than to remember it from a blank state.
*   **Vision:** Use peripheral vision for the "gist" of a scene and central vision for detail. Avoid blinking or movement in the periphery unless an urgent alert is required.
*   **Reading:** Computer screens are 25% harder to read than paper; use high contrast (black text on white), bulleted lists, and short paragraphs.

## 4. UI Element Guidelines
*   **Buttons:** Must look like buttons (raised, 3D shadows) to signify clickability. The whole button must be clickable, not just the label.
*   **Navigation:** 
    *   **Persistent Navigation:** Keep Site ID, Sections, Utilities, and Search in the same location on every page.
    *   **Breadcrumbs:** Essential for large hierarchies to show location and provide a path back.
    *   **The Trunk Test:** A user dropped on any page must immediately identify: Site ID, Page Name, Sections, Local Navigation, and Search.
*   **Search:** Provide a text field with a button labeled "Search" or a magnifying glass icon. Avoid hiding it behind a link.
*   **Icons:** Never use "mystery meat" navigation. Icons must always have a text label unless they are universally recognized (e.g., bold, italic).
*   **Forms:** 
    *   **Be Forgiving:** Accept phone numbers and zip codes in any format; do not clear data on validation failure.
    *   **Minimize Friction:** Do not ask for more information than is strictly necessary for the task.
    *   **In-Line Validation:** Validate data as soon as the user finishes a field rather than waiting for submission.

## 5. Typography & Color
*   **Typefaces:** Use a maximum of two typefaces (one for headers, one for body). Use the **System Font Stack** to ensure speed and readability.
*   **Default Size:** Use 16px for body copy with a 1.5 line height as the standard.
*   **Line Length:** Prefer 45–72 characters per line for comfort, though 100 characters per line is faster for reading speed.
*   **Accessibility:** 
    *   **Contrast Ratio:** Minimum 4.5:1 (WCAG standard). 
    *   **Color-Blindness:** 9% of men are color-blind. Never use color alone to convey information; use redundant coding (e.g., text + color).

## 6. Error Management & Resilience
*   **Slips vs. Mistakes:** 
    *   **Slips:** Result from automatic actions (wrong key pressed). Prevent by making actions dissimilar. 
    *   **Mistakes:** Result from wrong goals/plans. Prevent by improving the conceptual model.
*   **Undo:** Always provide an "Undo" feature for destructive actions rather than rely solely on confirmation dialogs.
*   **Error Messages:** Avoid generic "Something went wrong." Explicitly state what happened, why, and how to fix it in plain language.
*   **Forcing Functions:** Use interlocks, lock-ins, and lockouts to prevent dangerous or unintended sequences.

## 7. Strategic Design Mindsets
*   **Progressive Disclosure:** Show only the information needed at that exact moment to avoid overwhelming the user.
*   **Activity-Centered Design:** Focus on the whole activity (e.g., "listening to music") rather than isolated tasks.
*   **Mobile-First:** Design for the smallest screen first to prioritize essential features and content.
*   **The "Mensch" Principle:** Be a "stand-up guy" by being upfront about prices, outages, and shipping costs.


# Refactoring UI — Actionable Frontend Design Rules for LLMs

---

## 1. Start from Functionality, Not Layout
- Design one concrete feature first.
- Identify inputs, outputs, and actions before navigation.
- Ship the smallest useful version.
- Never imply unbuilt functionality.

## 2. Delay Visual Polish
- Ignore fonts, shadows, icons, and color early.
- Design in grayscale first.
- Wireframes are disposable.

## 3. Design in Cycles
- Design → build → learn → refine.
- Discover edge cases through usage, not imagination.

## 4. Choose One Personality
- Define via typography, color, radius, and language.
- Stay consistent.
- UI copy is part of the design.

## 5. Limit Choices with Systems
- Predefine systems for font, color, spacing, shadows.
- Use constrained scales.
- Eliminate arbitrary tweaking.

## 6. Hierarchy Is Core
- Primary content dominates.
- Secondary content recedes.
- Use size, weight, contrast, and spacing deliberately.

## 7. Don’t Overuse Font Size
- Prefer weight and contrast.
- Avoid weights < 400.
- Two weights and three colors are usually enough.

## 8. No Grey Text on Color
- Match hue, adjust saturation/lightness.
- Never fade text with opacity.

## 9. Emphasize by De-Emphasizing
- Quiet competing elements.
- Reduce noise before adding emphasis.

## 10. Labels Are Secondary
- Prefer value-first display.
- Combine labels with values.
- De-emphasize labels when needed.

## 11. Semantics ≠ Visual Hierarchy
- Use semantic markup freely.
- Style purely for visual clarity.

## 12. Balance Weight and Contrast
- Heavy elements need lower contrast.
- Light elements need more weight.

## 13. Actions Reflect Priority
- One primary action.
- Secondary = outline.
- Tertiary = link.

## 14. Start with Too Much Space
- Remove space deliberately.
- Density must be intentional.

## 15. Non-Linear Spacing Systems
- Small steps small, large steps large.
- Base scale around 16px.

## 16. Don’t Fill Space
- Use max-width.
- Mobile-first constraints help clarity.

## 17. Grids Are Optional
- Fixed widths often beat fluid.
- Components define their own size.

## 18. Relative Scaling Breaks
- Large elements shrink faster.
- Padding should not scale proportionally.

## 19. Avoid Ambiguous Spacing
- More space between groups than within.
- Applies vertically and horizontally.

## 20. Text Design Rules
- Handcrafted type scales.
- Use px or rem, not em.
- Favor legibility over novelty.

## 21. Line Length & Rhythm
- 45–75 characters per line.
- Align mixed sizes by baseline.
- Smaller text → more line-height.

## 22. Subtle Links
- Avoid over-colored links in dense UIs.
- Use weight or contrast instead.

---

**Meta-rule:**  
If a UI decision cannot be justified by hierarchy, readability, or system consistency — it’s wrong.
