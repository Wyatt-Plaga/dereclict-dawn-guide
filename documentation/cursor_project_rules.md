## Project Overview

*   **Type:** cursor_project_rules
*   **Description:** Derelict Dawn is a multi-page web platform that brings a sci-fi themed idle/incremental game to life. Players manage an AI tasked with reviving a derelict spaceship, with gameplay revolving around resource management, system upgrades, and an evolving narrative that unfolds as new ship sections are unlocked. The game is purposefully designed for teenagers and young adults, blending manual interactions with idle progression and a progressively enriched UI aesthetic.
*   **Primary Goal:** Deliver a seamless, responsive, and engaging experience that progressively unlocks new ship sections and narrative elements, ensuring players remain immersed while managing resources and witnessing the ship's transformation from a derelict relic to a high-tech vessel.

## Project Structure

### Framework-Specific Routing

*   **Directory Rules:**

    *   **Next.js 14:** Enforce the App Router with nested route folders – use the `app/[route]/page.tsx` convention to manage multi-page layouts and dynamic routing.
    *   Example 1: "Next.js 14 (App Router)" → `app/[route]/page.tsx` conventions
    *   Example 2: "Next.js (Pages Router)" (not applicable but for reference) → `pages/[route].tsx` pattern
    *   Example 3: "React Router 6" → `src/routes/` with `createBrowserRouter`

### Core Directories

*   **Versioned Structure:**

    *   **app:** Holds the primary application logic including layouts, API routes, and individual page components tailored for Next.js 14.
    *   Example 1: `app/api` → Next.js 14 API routes with Route Handlers (e.g., for Supabase integrations)
    *   Example 2: `src/views` → For platforms like Vue 3, but not applicable for this project.

### Key Files

*   **Stack-Versioned Patterns:**

    *   **Key Layouts & Pages:**

        *   `app/dashboard/layout.tsx` → Implements Next.js 14 root layouts consistent with the App Router pattern.
        *   `app/page.tsx` → Serves as the primary landing page (Reactor) from which navigation begins.

    *   **API Endpoints & Helpers:**

        *   `app/api/webhooks/route.ts` → Example of API route adhering to latest Next.js conventions.

## Tech Stack Rules

*   **Version Enforcement:**

    *   **next@14:** Enforce usage of the App Router. Avoid using legacy patterns such as `getInitialProps` or the old `pages/` directory.
    *   **Tailwind CSS:** Use the latest Tailwind CSS, ensuring utility-first styling and responsiveness.
    *   **Typescript:** Maintain strict typing and leverage latest TypeScript features for robust application structure.
    *   **Supabase:** Utilize Supabase for authentication and persistent data management. Ensure API keys and endpoints adhere to best security practices.
    *   **Shadcn UI & Radix UI:** Incorporate these libraries consistently to build dynamic, accessible, and visually appealing components.
    *   **Clerk Auth & Open AI:** Integrate for secure authentication and intelligent code assistance, respectively.
    *   **Lucide Icons:** Use for enhancing the sci-fi aesthetic through consistent iconography.

## PRD Compliance

*   **Non-Negotiable:**

    *   "Derelict Dawn is a multi-page web platform that brings a sci-fi themed idle/incremental game to life."
    *   All game mechanics including resource thresholds, offline progress, and narrative progression via the Logs page must conform to the detailed requirements of the PRD.

## App Flow Integration

*   **Stack-Aligned Flow:**

    *   The application flow adheres to Next.js 14 architecture:

        *   Landing on the Reactor page: `app/page.tsx`
        *   Transition to subsequent sections (Processor, Crew Quarters, Manufacturing, Logs) as resource thresholds are met, implemented as separate nested folders within the `app` directory.
        *   API and authentication flows (Supabase and Clerk Auth) integrated within `app/api` and custom provider components.

## Best Practices

*   **Next.js**

    *   Use the App Router exclusively – organize pages under the `app` directory with nested folder structures.
    *   Leverage server components and static generation where possible for performance enhancements.
    *   Optimize data fetching with Suspense and error boundaries.

*   **Tailwind CSS**

    *   Follow utility-first conventions and keep class names organized using Tailwind’s recommended patterns.
    *   Use configuration files (`tailwind.config.ts`) to extend themes and ensure consistency in styling across components.
    *   Implement responsive design as a default strategy.

*   **Typescript**

    *   Use strict mode and explicit typing to catch errors during development.
    *   Leverage interfaces and type aliases for consistent prop management across components.
    *   Regularly update types to reflect API changes from Supabase and other integrations.

*   **Supabase**

    *   Secure communication with proper authentication and error handling.
    *   Regularly backup critical user data and implement robust offline persistence checks.
    *   Incorporate lazy loading and effective caching strategies for real-time data updates.

*   **Shadcn UI & Radix UI**

    *   Maintain consistency in component usage and adhere to accessibility guidelines.
    *   Customize components to reflect the evolving sci-fi aesthetic of the platform.
    *   Use modular design to ensure easy scalability and future component updates.

*   **Clerk Auth & Open AI**

    *   Ensure authentication flows are secure by following Clerk Auth’s best practices.
    *   Utilize Open AI models for intelligent code suggestions without compromising performance or security.
    *   Regularly review model updates to stay aligned with the latest recommendation in code assistance.

*   **Lucide Icons**

    *   Use icons to enhance the UI and maintain visual consistency throughout the platform.
    *   Follow size and color guidelines to ensure icons integrate seamlessly with the overall design.
    *   Optimize icon usage by bundling frequently used icons.

## Rules

*   Derive folder/file patterns directly from the established tech stack document, ensuring full compliance with Next.js 14 conventions.
*   If using Next.js 14 App Router: Enforce the `app/` directory with nested route folders and structured layouts.
*   If a Pages Router pattern is specified (not applicable here): Use the `pages/*.tsx` flat structure only for legacy reference.
*   Mirror this structured approach for any similar frameworks (React Router, SvelteKit) if adopted in future projects.
*   Never mix version patterns – avoid incorporating legacy folder patterns (e.g., no `pages/` in an App Router project).
