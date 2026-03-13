# ADAMBOOT MCO -- WCAG Accessibility Checklist

Version: 1.0 | Last updated: 2026-03-12

Target: **WCAG 2.1 Level AA**

---

## 1. Current Status

| Area                  | Status         | Notes                                 |
| --------------------- | -------------- | ------------------------------------- |
| Semantic HTML         | Partial        | Most components use semantic elements |
| Color contrast        | Implemented    | Vale corporate palette reviewed       |
| Focus management      | Partial        | Needs audit on modal/dialog flows     |
| Keyboard navigation   | Partial        | Main routes navigable, some gaps      |
| Screen reader support | Needs work     | Missing ARIA labels in several places |
| i18n                  | Implemented    | pt-BR + en-US via react-intl          |
| RTL support           | Not applicable | Portuguese and English are LTR        |

---

## 2. Perceivable (WCAG 1.x)

### 2.1 Text Alternatives (1.1)

| Criterion | Description                        | Status  | Action Required                           |
| --------- | ---------------------------------- | ------- | ----------------------------------------- |
| 1.1.1     | Non-text content has alt text      | Partial | Audit all `<img>` tags for alt attrs      |
|           | Decorative images use alt=""       | Partial | Review icon-only buttons                  |
|           | Form inputs have associated labels | Partial | Add `<label>` or aria-label to all inputs |

### 2.2 Time-based Media (1.2)

Not applicable -- the application does not include audio or video content.

### 2.3 Adaptable (1.3)

| Criterion | Description                         | Status     | Action Required                               |
| --------- | ----------------------------------- | ---------- | --------------------------------------------- |
| 1.3.1     | Info and relationships programmatic | Partial    | Use heading hierarchy (h1-h6) consistently    |
| 1.3.2     | Meaningful sequence                 | OK         | DOM order matches visual order                |
| 1.3.3     | Sensory characteristics             | OK         | Instructions don't rely solely on shape/color |
| 1.3.4     | Orientation (AA)                    | OK         | No orientation lock enforced                  |
| 1.3.5     | Identify input purpose (AA)         | Needs work | Add autocomplete attributes to forms          |

### 2.4 Distinguishable (1.4)

| Criterion | Description                 | Status  | Action Required                        |
| --------- | --------------------------- | ------- | -------------------------------------- |
| 1.4.1     | Use of color                | OK      | Status uses color + icon/text          |
| 1.4.2     | Audio control               | N/A     | No audio content                       |
| 1.4.3     | Contrast (minimum) (AA)     | Review  | Verify Vale teal on white >= 4.5:1     |
| 1.4.4     | Resize text                 | OK      | Uses rem/em units                      |
| 1.4.5     | Images of text              | OK      | No text rendered as images             |
| 1.4.10    | Reflow (AA)                 | Partial | Test at 320px width                    |
| 1.4.11    | Non-text contrast (AA)      | Review  | Verify UI control borders >= 3:1       |
| 1.4.12    | Text spacing (AA)           | OK      | No fixed line-height clipping          |
| 1.4.13    | Content on hover/focus (AA) | Partial | Tooltips need dismissible + persistent |

---

## 3. Operable (WCAG 2.x)

### 3.1 Keyboard Accessible (2.1)

| Criterion | Description                  | Status  | Action Required                             |
| --------- | ---------------------------- | ------- | ------------------------------------------- |
| 2.1.1     | Keyboard                     | Partial | Audit custom components (dropdowns, modals) |
| 2.1.2     | No keyboard trap             | OK      | Modal focus trapping returns focus on close |
| 2.1.4     | Character key shortcuts (AA) | OK      | No single-character shortcuts used          |

**Known gaps:**

- Phase wizard tab navigation needs Tab/Arrow key support
- Custom dropdown menus may not be fully keyboard accessible
- Drag-and-drop interactions (if any) need keyboard alternatives

### 3.2 Enough Time (2.2)

| Criterion | Description       | Status | Action Required                       |
| --------- | ----------------- | ------ | ------------------------------------- |
| 2.2.1     | Timing adjustable | OK     | No time limits on content             |
| 2.2.2     | Pause, stop, hide | OK     | Loading spinner is the only animation |

### 3.3 Seizures and Physical Reactions (2.3)

| Criterion | Description            | Status | Action Required     |
| --------- | ---------------------- | ------ | ------------------- |
| 2.3.1     | Three flashes or below | OK     | No flashing content |

### 3.4 Navigable (2.4)

| Criterion | Description               | Status     | Action Required                               |
| --------- | ------------------------- | ---------- | --------------------------------------------- |
| 2.4.1     | Bypass blocks             | Needs work | Add skip-to-content link                      |
| 2.4.2     | Page titled               | Partial    | Set document.title per route                  |
| 2.4.3     | Focus order               | OK         | Logical tab order follows visual layout       |
| 2.4.4     | Link purpose (in context) | OK         | Links have descriptive text                   |
| 2.4.5     | Multiple ways (AA)        | OK         | Navigation + direct URL access                |
| 2.4.6     | Headings and labels (AA)  | Partial    | Standardize heading hierarchy                 |
| 2.4.7     | Focus visible (AA)        | Partial    | Verify focus ring on all interactive elements |

---

## 4. Understandable (WCAG 3.x)

### 4.1 Readable (3.1)

| Criterion | Description            | Status  | Action Required                    |
| --------- | ---------------------- | ------- | ---------------------------------- |
| 3.1.1     | Language of page       | OK      | `<html lang="pt-BR">` set          |
| 3.1.2     | Language of parts (AA) | Partial | English technical terms not marked |

### 4.2 Predictable (3.2)

| Criterion | Description                    | Status | Action Required                          |
| --------- | ------------------------------ | ------ | ---------------------------------------- |
| 3.2.1     | On focus                       | OK     | No context change on focus               |
| 3.2.2     | On input                       | OK     | Form submission requires explicit action |
| 3.2.3     | Consistent navigation (AA)     | OK     | Sidebar navigation is consistent         |
| 3.2.4     | Consistent identification (AA) | OK     | Same functions use same labels           |

### 4.3 Input Assistance (3.3)

| Criterion | Description            | Status  | Action Required                         |
| --------- | ---------------------- | ------- | --------------------------------------- |
| 3.3.1     | Error identification   | OK      | Form errors displayed with text         |
| 3.3.2     | Labels or instructions | Partial | Add help text to complex form fields    |
| 3.3.3     | Error suggestion (AA)  | Partial | Add correction suggestions              |
| 3.3.4     | Error prevention (AA)  | OK      | Phase advancement requires confirmation |

---

## 5. Robust (WCAG 4.x)

| Criterion | Description          | Status     | Action Required                       |
| --------- | -------------------- | ---------- | ------------------------------------- |
| 4.1.1     | Parsing              | OK         | React ensures valid DOM output        |
| 4.1.2     | Name, role, value    | Partial    | Add ARIA roles to custom widgets      |
| 4.1.3     | Status messages (AA) | Needs work | Use aria-live for toast notifications |

---

## 6. Color Contrast -- Vale Palette

The Vale corporate palette must meet minimum contrast ratios:

| Color Pair              | Usage                  | Ratio Required | Status |
| ----------------------- | ---------------------- | -------------- | ------ |
| Vale Teal on White      | Primary buttons, links | 4.5:1 (AA)     | Verify |
| Dark text on White      | Body text              | 4.5:1 (AA)     | OK     |
| White text on Vale Teal | Button labels          | 4.5:1 (AA)     | Verify |
| Muted text on White     | Secondary text         | 4.5:1 (AA)     | Verify |
| Error Red on White      | Error messages         | 4.5:1 (AA)     | Verify |
| Success Green on White  | Success indicators     | 4.5:1 (AA)     | Verify |

**Tool:** Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify specific hex values.

---

## 7. Priority Remediation Plan

| Priority | Item                             | Effort | Impact |
| -------- | -------------------------------- | ------ | ------ |
| 1        | Add skip-to-content link         | Low    | High   |
| 2        | Add aria-live regions for toasts | Low    | High   |
| 3        | Audit and add ARIA labels        | Medium | High   |
| 4        | Set document.title per route     | Low    | Medium |
| 5        | Verify all color contrast ratios | Low    | Medium |
| 6        | Keyboard audit of custom widgets | Medium | High   |
| 7        | Add autocomplete to form inputs  | Low    | Low    |
| 8        | Standardize heading hierarchy    | Medium | Medium |

---

## 8. Testing Tools

| Tool                        | Purpose                          |
| --------------------------- | -------------------------------- |
| axe DevTools (browser ext.) | Automated WCAG scanning          |
| Lighthouse (Chrome)         | Accessibility score + audit      |
| NVDA / VoiceOver            | Screen reader manual testing     |
| Keyboard-only navigation    | Tab/Enter/Escape flow testing    |
| High contrast mode (OS)     | Visibility in forced colors mode |
