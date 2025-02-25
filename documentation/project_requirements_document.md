# Derelict Dawn - Project Requirements Document

## 1. Project Overview

Derelict Dawn is a multi-page web platform that brings a sci-fi themed idle/incremental game to life. In this game, players take on the role of managing an AI tasked with reviving and automating a derelict spaceship. The game combines resource management, system upgrades, and an unfolding narrative that guides players through the reactivation of the ship, while keeping them engaged through idle mechanics and gradually unlocked game sections.

The platform is designed primarily for teenagers and young adults who enjoy strategic planning and immersive storytelling. The game starts with manual resource generation in the Reactor and evolves into automated processes, unlocking new sections such as the Processor, Crew Quarters, Manufacturing, and immersive Logs. By building the platform with a robust tech stack, the purpose is to deliver a seamless, responsive, and engaging experience that keeps players coming back for more as they discover the mysteries of the ship and the AI’s hidden past.

## 2. In-Scope vs. Out-of-Scope

**In-Scope:**

*   A multi-page web app with dedicated pages: Reactor, Processor, Crew Quarters, Manufacturing, and Logs.
*   Real-time resource management systems for four core resource types (Energy, Insight, Crew, Scrap) with capacity and automation upgrades.
*   An engaging narrative presented in the Logs page that unfolds the backstory of the derelict ship and the AI.
*   Progressive unlocking of game sections based on resource thresholds.
*   Idle game mechanics that continue generating resources even when the player is offline.
*   User authentication and progress saving through Supabase for a seamless and persistent user experience.
*   A dynamic and evolving sci-fi themed UI that transitions from a dark, broken-down aesthetic to a high-tech appearance as the player progresses.

**Out-of-Scope:**

*   Social features or leaderboards, as the game is strictly designed as a single-player experience.
*   Advanced payment integration or ad-based revenue models; these are planned for a later update.
*   Real-time AI integration for generating narrative content; the logs will contain static, pre-authored entries rather than live AI responses.
*   Custom crew roles or levels; crew awakening will be handled uniformly without distinct types or levels.

## 3. User Flow

When a new player lands on Derelict Dawn, they are greeted by a dark, mysterious landing page that sets the stage for a long-dormant spaceship waiting to be reawakened. The player will first encounter the Reactor page where they manually click to generate Energy — the primary resource used to kickstart the ship’s systems. As progress is made, subtle visual cues such as progress bars and animations indicate system upgrades and help build anticipation for future sections.

After reaching a resource threshold in the Reactor, new pages like the Processor, Crew Quarters, and Manufacturing become available. Each section introduces its own resource type (Insight, Crew, Scrap) and unique mechanics, along with additional capacity and automation upgrades. The user journey is designed to be smooth and intuitive: from resource generation to progressive unlocking of new pages, and finally experiencing immersive narrative elements within the Logs page that reveal the mysterious past of the ship and the AI.

## 4. Core Features

*   **Reactor Page:**

    *   Manual clicking mechanism to generate "Energy".
    *   Resource upgrades including Capacity (Containment Field) and Automation (Fuel Injectors).

*   **Processor Page:**

    *   A tech tree system for accumulating "Insight".
    *   Upgrades for increasing storage (Mainframe Capacity) and automation (Processing Threads).

*   **Crew Quarters Page:**

    *   Awakening of Crew members as a resource.
    *   Upgrades for expanding crew capacity (Quarters) and automating crew functions (Worker Crews).

*   **Manufacturing Page:**

    *   Collection and use of "Scrap" for crafting enhancements.
    *   Upgrades for Scrap storage (Cargo Hold) and automation via the Manufacturing Bay.

*   **Logs Page:**

    *   Static, AI-authored narrative entries that slowly reveal the backstory.
    *   Story progression tied to unlocked ship sections and events like ship attacks.

*   **User Authentication & Progress Tracking:**

    *   Secure login using Supabase.
    *   Automatic saving of game state and handling offline progress by calculating time gaps.

*   **Idle Mechanics:**

    *   Continuous resource generation and state updates even when offline.
    *   Visual feedback such as progress bars that update smoothly in real time.

*   **Thematic UI & Navigation:**

    *   Consistent sci-fi aesthetic with a dark, evolving design.
    *   Seamless navigation from Reactor to other sections, gradually unveiling the ship’s capabilities.

## 5. Tech Stack & Tools

**Frontend:**

*   Next.js 14 with TypeScript – For building the fast, scalable, and robust multi-page application.
*   Tailwind CSS – To streamline styling and ensure a responsive design with a sci-fi vibe.
*   Shadcn UI & Radix UI – For dynamic and accessible component integration.
*   Lucide Icons – To enhance the visual appeal with futuristic icons.

**Backend & Storage:**

*   Supabase – Handling user authentication, persistent progress tracking, and scalable data management.

**Additional Tools & Integrations:**

*   Claude AI (Anthropic's Sonnet 3.5 model) – For intelligent code assistance when needed.
*   ChatGPT (OpenAI's GPT-4 O1 model) – For advanced code generation support.
*   Cursor – An advanced IDE that provides real-time suggestions and optimizes the development process.

## 6. Non-Functional Requirements

*   **Performance:**

    *   The game should load quickly on various devices, including lower-end hardware.
    *   Utilize lazy loading for images and components to keep load times minimal.
    *   Efficient data fetching from Supabase to ensure real-time updates without significant delays.

*   **Security:**

    *   Securely handle user authentication and data storage using Supabase.
    *   Regularly save game state to prevent data loss or corruption.
    *   Implement standard security practices (e.g., HTTPS, secure API endpoints).

*   **Usability & Responsiveness:**

    *   Ensure a smooth and intuitive navigation across all pages.
    *   Responsive design that adapts well to both desktop and mobile devices.
    *   Visual feedback (like progress bars) to reflect real-time changes without lag.

*   **Data Integrity:**

    *   Regular backups and error handling to maintain game progress across sessions.
    *   Robust offline progress simulation with capped gains to maintain game balance.

## 7. Constraints & Assumptions

*   **Constraints:**

    *   The project relies on Supabase for authentication and progress tracking; any downtimes or API changes can affect the platform.
    *   Resource generation must accommodate both manual and automated (idle) play, meaning state updates must be handled efficiently with frequent data persistence.
    *   The design is intended to function on multiple devices; however, performance optimizations will be critical for lower-end devices.

*   **Assumptions:**

    *   The target audience (teenagers and young adults) will appreciate both strategic planning and an engaging narrative.
    *   Resource thresholds trigger page unlocks and game progression, with automation upgrades unlocking further gameplay enhancements.
    *   The narrative delivered via Logs is static and enriched by pre-authoring rather than dynamic AI integration during gameplay.
    *   All critical game events will trigger an automatic save to ensure players do not lose progress, including sessions interrupted by closing the app or browser.

## 8. Known Issues & Potential Pitfalls

*   **API Rate Limits & Downtime:**

    *   Supabase may impose API rate limits which could impact real-time updates. Mitigation includes caching frequently used data and implementing backoff strategies.

*   **Handling Offline Progress:**

    *   Calculating and simulating offline gains may become complex with varying progression states. Ensure thorough testing to cap gains appropriately and avoid any undue advantage.

*   **Performance Bottlenecks:**

    *   The need for smooth animations and frequent component updates might strain performance, especially on mobile devices. Implement lazy loading and optimize update cycles to minimize overhead.

*   **User Data Protection:**

    *   Data loss or corruption during high-frequency state updates is a risk. Regular error handling, data validation, and backup strategies must be in place.

*   **Responsive Design Consistency:**

    *   Maintaining a consistent sci-fi aesthetic across all pages may be challenging as the UI evolves. Early design prototypes and regular reviews will help ensure design integrity is maintained.

This document serves as the foundation for all subsequent technical documents, ensuring that every component of Derelict Dawn is clearly understood and implemented with precision. The focus is on delivering an engaging, smooth, and secure single-player game experience that evolves with the player, both in gameplay and in its narrative journey.
