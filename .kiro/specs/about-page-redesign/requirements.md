# Requirements Document

## Introduction

This feature redesigns the existing About page (`src/pages/about/index.astro`) for the LazyNoman novel review blog. The redesign shifts the page's focus from "what is this site" toward "who am I?" — centering the author's identity under the username `rockyxwall`, adding contact links (GitHub and Discord), keeping a human, casual-voice bio, and removing the existing "big dream" / tracking-platform section.

The headline addition is a **reading-preferences section rendered as animated tags**. Each tag carries its own animation thematically matched to its meaning (for example, `system` gets a tech/glitch motion while `fantasy` gets a magical shimmer). The animated tags must live in a separate, reusable React island component that is imported into the About page, must respect the project's dark/light theme tokens, and must honor `prefers-reduced-motion`.

Because the author wants to add, replace, and remix these tag animations later (and wants other AI agents to do so without asking questions), the feature also requires a documented, copy-paste-friendly animation registry and an accompanying authoring guide.

The writing voice across all copy must match the existing About page: lowercase, conversational, honest, and human.

## Glossary

- **About_Page**: The Astro page rendered at `/about`, located at `src/pages/about/index.astro`.
- **Animated_Tags_Component**: A standalone, reusable React (`.tsx`) island component that renders the list of reading-preference tags, each with its own themed animation. It is imported into the About_Page and hydrated with a client directive.
- **Reading_Tag**: A single labeled tag representing one of the author's novel reading preferences (for example, `cultivation`).
- **Tag_Animation**: The visual motion effect applied to an individual Reading_Tag, thematically matched to that tag's meaning.
- **Animation_Registry**: A documented data structure that maps each Reading_Tag label to its Tag_Animation definition, serving as the single source of truth for which animation each tag uses.
- **Theme_Tokens**: The project's oklch CSS custom properties and Tailwind utility classes (for example, `text-muted-foreground`, `bg-primary/10`, `border-border`) that adapt automatically between light and dark modes.
- **Reduced_Motion**: The user preference exposed by the CSS media feature `prefers-reduced-motion: reduce`.
- **Authoring_Guide**: A human- and AI-readable document that explains how to add, replace, or remove a Reading_Tag and its Tag_Animation.
- **Author**: The site owner, identified by the username `rockyxwall`.
- **GitHub_Link**: The outbound link to the Author's GitHub profile.
- **Discord_Link**: The outbound link to the Author's Discord invite.

## Requirements

### Requirement 1: Page Identity and Focus

**User Story:** As a visitor, I want the About page to clearly tell me who the author is, so that I understand who is behind the reviews.

#### Acceptance Criteria

1. THE About_Page SHALL display the username `rockyxwall` as the Author's primary identity at least once within the main content as visible text, including a closing sign-off line attributed to that username.
2. THE About_Page SHALL present a single top-level heading that poses a first-person "who am i?" identity question.
3. THE About_Page SHALL organize its body content as a first-person ("i"/"my") answer to the "who am i?" question, structured as an introduction followed by the Author's stated likes and dislikes.
4. THE About_Page SHALL render all heading and body text in lowercase, except for the username `rockyxwall`, proper nouns, and numeric/statistic values.
5. WHEN a visitor navigates to the `/about` route, THE About_Page SHALL render its complete content as a pre-built static Astro page without client-side data fetching.
6. THE About_Page SHALL include exactly one `BaseHead`, one `Header`, and one `Footer` component, with `Header` rendered before the main content and `Footer` rendered after it.

### Requirement 2: Remove the Dream Section

**User Story:** As the author, I want the old "big dream" tracking-platform section removed, so that the page reflects my current focus.

#### Acceptance Criteria

1. WHEN the About_Page is rendered, THE About_Page SHALL NOT display the "the big dream" heading or its associated content block.
2. WHEN the About_Page is rendered, THE About_Page SHALL NOT display any text that references building, planning, or aspiring to a tracking platform (including references to logging anime, manga, novels, or games together in one place) as a current or future goal.
3. WHERE the "the big dream" section is removed, IF any empty container, decorative wrapper, or separator element that previously enclosed that section would remain, THEN THE About_Page SHALL NOT retain that element.
4. WHEN the About_Page is rendered after removal, THE About_Page SHALL preserve, with unchanged content, every other section present before removal that is not itself being redesigned by this feature.
5. WHEN the About_Page is rendered after removal, THE About_Page SHALL apply the same vertical spacing between the two sections that previously bordered the removed section as the spacing applied between other adjacent sections on the page.

### Requirement 3: Contact Links

**User Story:** As a visitor, I want links to the author's GitHub and Discord, so that I can follow or contact the author.

#### Acceptance Criteria

1. THE About_Page SHALL display a GitHub_Link rendered as a visible, keyboard-activatable element.
2. THE About_Page SHALL display a Discord_Link, rendered as a visible, keyboard-activatable element, whose destination is `https://discord.gg/cunXbtHm5g`.
3. THE GitHub_Link SHALL point to `https://github.com/rockyxwall`. (ASSUMPTION: the GitHub URL was inferred from the username `rockyxwall` because the user pasted only the Discord URL. The Author should confirm this URL.)
4. WHEN a visitor activates the GitHub_Link, THE About_Page SHALL open `https://github.com/rockyxwall` in a new browser tab while keeping the About_Page open in the original tab.
5. WHEN a visitor activates the Discord_Link, THE About_Page SHALL open `https://discord.gg/cunXbtHm5g` in a new browser tab while keeping the About_Page open in the original tab.
6. THE About_Page SHALL apply `rel="noopener noreferrer"` to the GitHub_Link and the Discord_Link regardless of whether each link opens in a new tab.
7. THE About_Page SHALL NOT display an AniList link, an email link, or an X/Twitter link.
8. THE About_Page SHALL provide an accessible name for the GitHub_Link that contains the text "GitHub" and an accessible name for the Discord_Link that contains the text "Discord".

### Requirement 4: Bio Section

**User Story:** As a visitor, I want a short bio written in the author's real voice, so that I get a sense of who the author is.

#### Acceptance Criteria

1. THE About_Page SHALL include a bio section rendered as a visually distinct region that introduces the Author.
2. THE bio section SHALL render its body prose entirely in lowercase, permitting uppercase only within proper nouns, usernames, and acronyms.
3. THE bio section SHALL be written in the first-person, conversational voice used throughout the existing About_Page.
4. THE bio section SHALL identify the Author as someone who reads webnovels and writes reviews of them.
5. THE bio section SHALL NOT contain the "the big dream" tracking-platform content or any reference to building a tracking platform.
6. THE bio section SHALL contain between 2 and 6 paragraphs of prose.

### Requirement 5: Reading Preferences as Animated Tags

**User Story:** As a visitor, I want to see the author's novel reading preferences as a set of animated tags, so that I quickly grasp the author's taste in an engaging way.

#### Acceptance Criteria

1. THE About_Page SHALL display a reading-preferences section that renders the following Reading_Tag labels: `cheat`, `system`, `transmigration`, `reincarnation`, `overpowered mc`, `male mc`, `fantasy`, `cultivation`, `xianxia`, `xuanhuan`, `low-key mc`, `cold mc`.
2. THE reading-preferences section SHALL replace the previous "what i actually like" and "what i can't stand" tag groups such that no tag element from either prior group remains.
3. THE About_Page SHALL render each Reading_Tag label with the exact spelling and casing listed in criterion 1.
4. THE reading-preferences section SHALL display exactly twelve Reading_Tag items with no duplicated or omitted labels.
5. WHEN the viewport width is at most 480px, THE reading-preferences section SHALL wrap the Reading_Tag items onto multiple lines with no clipped item and no horizontal scrollbar.
6. WHEN the reading-preferences section enters the viewport, THE Animated_Tags_Component SHALL play an entrance animation for each Reading_Tag and SHALL leave all twelve Reading_Tag items visible within 2000 milliseconds.
7. WHERE Reduced_Motion is enabled, THE Animated_Tags_Component SHALL present all twelve Reading_Tag items in their final visible state with no entrance animation.

### Requirement 6: Separate Reusable Animated Tags Component

**User Story:** As a developer, I want the animated tags built as a separate reusable component that is imported into the page, so that the animation logic stays modular and maintainable.

#### Acceptance Criteria

1. THE Animated_Tags_Component SHALL be implemented as a standalone React TypeScript (`.tsx`) file located in a separate file from the About_Page source file.
2. WHEN the About_Page is rendered, THE About_Page SHALL render the Animated_Tags_Component by importing it, and THE Animated_Tags_Component SHALL render each provided Reading_Tag label as a distinct rendered element.
3. THE Animated_Tags_Component SHALL be hydrated on the About_Page using the `client:visible` client directive.
4. THE Animated_Tags_Component SHALL reference shared modules using the `@/*` path alias rather than relative parent-directory import paths.
5. THE Animated_Tags_Component SHALL accept the Reading_Tag labels to render as a component input (props), supporting between 1 and 50 labels inclusive, rather than hardcoding the labels within the component.
6. WHILE the Astro static build runs, THE Animated_Tags_Component SHALL render to static HTML without throwing a runtime error and without emitting a build warning attributable to the component.
7. WHEN the Animated_Tags_Component is hydrated in the browser, THE Animated_Tags_Component SHALL complete hydration without emitting a hydration-mismatch error to the browser console.
8. IF the Reading_Tag labels input is empty or undefined, THEN THE Animated_Tags_Component SHALL render zero Reading_Tag elements and SHALL NOT throw a runtime error.

### Requirement 7: Per-Tag Themed Animations

**User Story:** As a visitor, I want each tag to animate in a way that matches its meaning, so that the tags feel expressive and intentional.

#### Acceptance Criteria

1. THE Animated_Tags_Component SHALL apply a Tag_Animation to each Reading_Tag.
2. THE Animation_Registry SHALL define a Tag_Animation for each of the twelve Reading_Tag labels listed in Requirement 5.
3. WHEN a Reading_Tag is rendered, THE Animated_Tags_Component SHALL apply the Tag_Animation mapped to that label in the Animation_Registry.
4. THE Tag_Animation for `system` SHALL exhibit continuous, visible motion themed as tech or sci-fi (for example, glitch, scanline, digital flicker, or blinking cursor).
5. THE Tag_Animation for `fantasy` SHALL exhibit continuous, visible motion themed as magical (for example, sparkle or shimmer).
6. THE Tag_Animation for `overpowered mc` SHALL exhibit continuous, visible motion themed as power or aura (for example, pulse or glow surge).
7. THE Tag_Animation for `cultivation`, `xianxia`, and `xuanhuan` SHALL exhibit continuous, visible motion themed as rising, floating, or ascending.
8. IF a Reading_Tag label has no entry in the Animation_Registry, THEN THE Animated_Tags_Component SHALL render that tag with its full label text using a defined default Tag_Animation rather than omitting the tag or failing to render.
9. WHILE any Tag_Animation is playing, THE Animated_Tags_Component SHALL keep the full label text of each Reading_Tag continuously visible and legible, never fully transparent, blanked, or clipped.

### Requirement 8: Dark and Light Theme Support

**User Story:** As a visitor, I want the redesigned page and animated tags to look correct in both light and dark mode, so that the experience matches my theme preference.

#### Acceptance Criteria

1. THE About_Page SHALL style all new content using the project's Theme_Tokens.
2. THE Animated_Tags_Component SHALL style its tags and animations using the project's Theme_Tokens rather than hardcoded color values.
3. WHEN the active theme is light, THE About_Page SHALL render all new text content at a contrast ratio of at least 4.5:1 against its background for normal-size text and at least 3:1 against its background for large-scale text (text at least 24px, or at least 18.66px when bold).
4. WHEN the active theme is dark, THE About_Page SHALL render all new text content at a contrast ratio of at least 4.5:1 against its background for normal-size text and at least 3:1 against its background for large-scale text (text at least 24px, or at least 18.66px when bold).
5. WHEN the visitor switches the active theme using the existing ModeToggle, THE Animated_Tags_Component SHALL reflect the newly resolved theme within 200 milliseconds without requiring a page reload.
6. WHILE the active theme is light or dark, THE Animated_Tags_Component SHALL render each Reading_Tag label at a contrast ratio of at least 4.5:1 against its tag background throughout the full duration of that tag's Tag_Animation.

### Requirement 9: Reduced-Motion Accessibility

**User Story:** As a visitor who is sensitive to motion, I want animations to respect my reduced-motion preference, so that I can browse comfortably.

#### Acceptance Criteria

1. WHILE Reduced_Motion is enabled, THE Animated_Tags_Component SHALL present all Reading_Tag labels in a static layout with no Tag_Animation motion, meaning no position change, scaling, rotation, or movement-based transitions.
2. WHILE Reduced_Motion is enabled, THE Animated_Tags_Component SHALL keep every Reading_Tag label fully opaque, unclipped, and within the visible viewport at all times, including during any state change.
3. THE Animated_Tags_Component SHALL render a non-animated presentation of all Reading_Tag labels as its baseline state before any Tag_Animation begins, with each label fully opaque and unclipped.
4. WHEN the visitor's Reduced_Motion preference changes to enabled during a session, THE Animated_Tags_Component SHALL stop any in-progress Tag_Animation within 1 second and present all Reading_Tag labels in the static, non-animated baseline state.

### Requirement 10: Animation Authoring Guide and Documented Registry

**User Story:** As the author and as future AI agents working on this code, I want a clear documented pattern for adding, replacing, or removing tag animations, so that changes can be made without asking for clarification.

#### Acceptance Criteria

1. THE Animation_Registry SHALL map each of the twelve Reading_Tag labels listed in Requirement 5 to exactly one Tag_Animation definition, and SHALL be the only location that defines these Reading_Tag-to-Tag_Animation mappings.
2. THE Animation_Registry SHALL be structured so that adding a new Reading_Tag with its Tag_Animation requires adding exactly one entry in the Animation_Registry and no changes to the render logic of the Animated_Tags_Component.
3. THE Authoring_Guide SHALL include written step-by-step instructions for adding a new Reading_Tag and its Tag_Animation that identify the single Animation_Registry location to edit and the steps required to define the Tag_Animation.
4. THE Authoring_Guide SHALL include written step-by-step instructions for replacing an existing Tag_Animation.
5. THE Authoring_Guide SHALL include at least one complete, copy-paste-ready code example of defining a new Tag_Animation in the Animation_Registry that requires changing only the Reading_Tag label and animation values to reuse.
6. THE Authoring_Guide SHALL document the requirement that every Tag_Animation use Theme_Tokens rather than hardcoded color values.
7. THE Animation_Registry SHALL include inline comments describing how to add, replace, or remove a Tag_Animation entry.
8. THE Authoring_Guide SHALL include written step-by-step instructions for removing an existing Reading_Tag and its Tag_Animation.
9. THE Authoring_Guide SHALL document the requirement that every Tag_Animation honor Reduced_Motion by providing a reduced or suppressed-motion presentation.
10. THE Animated_Tags_Component SHALL include inline comments describing how to extend the animation set with a new Tag_Animation.
