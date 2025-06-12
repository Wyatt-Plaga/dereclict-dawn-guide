**Derelict Dawn Implementation Plan**

Below is the step-by-step plan broken into five phases. Each step cites the corresponding document section for source reference. Remember: For Next.js projects, **install Next.js 14** (per recommendation) as it integrates best with modern AI coding tools.

## Phase 1: Environment Setup

1.  **Clone Starter Kit**: Clone the CodeGuide Starter Pro repo from `https://github.com/codeGuide-dev/codeguide-starter-pro` into your working directory (**Starter Kit: Project Repo Structure**).

2.  **Create Branches**: Initialize a Git repository if not already done, and create `develop` and `main` branches to enforce version control best practices (**PRD Section 1.4**).

3.  **Install Node.js**: Confirm Node.js is installed (recommended version per project requirements, e.g., Node LTS). Validate by running `node -v`. (**Tech Stack: Environment Setup**)

4.  **Install Next.js 14**: Since the project uses Next.js as the front-end framework, install exactly Next.js 14 along with TypeScript. Run `npx create-next-app@14 --typescript` if setting up a new project (Note: Next.js 14 is required for better integration with AI coding tools as per instructions) (**Tech Stack Document**).

5.  **Install Additional Frontend Dependencies**: Using npm or yarn, install Tailwind CSS, Shadcn UI, Radix UI, and Lucide Icons as specified:

    *   `npm install tailwindcss shadcn-ui radix-ui lucide-react` Validate installation by checking `package.json` (**Tech Stack & Frontend Guidelines Document**).

6.  **Install Supabase Client**: Install the Supabase JS client for authentication and progress tracking:

    *   `npm install @supabase/supabase-js` Validate by confirming dependency in `package.json` (**PRD & Tech Stack Document**).

## Phase 2: Frontend Development

1.  **Setup App Structure**: In the project root, structure the app folder as per the starter kit. Ensure directories like `/app`, `/components`, `/hooks`, `/lib`, `/types`, and `/utils` exist (**Starter Kit: Project Structure**).

2.  **Implement Global Layout**: Edit `/app/layout.tsx` to include a global layout that wraps all pages and imports `globals.css`. (Reference: App Flow Document "User Onboarding and Initial Landing")

3.  **Configure Tailwind CSS**: Update `/tailwind.config.ts` to reflect dark, evolving sci-fi themes starting with a broken-down aesthetic. Validate by previewing sample components (**PRD Section 4: Thematic UI & Navigation**).

4.  **Create Navigation Component**: Under `/components/ui`, build a navigation component (e.g., `NavBar.tsx`) that links to Reactor, Processor, Crew Quarters, Manufacturing, and Logs pages. Test by rendering it in the global layout (**App Flow Document: Navigation Flow**).

5.  **Develop Reactor Page**: Create `/app/pages/reactor.tsx` (or similar routing file) with:

    *   A manual click button to generate "Energy".
    *   Dynamic progress bars reflecting energy accumulation. Use Tailwind CSS and Lucide Icons to match the sci-fi aesthetic (**PRD Section 4 & Core Features: Reactor Page**).

6.  **Develop Processor Page**: Create `/app/pages/processor.tsx` to implement a tech tree system that displays "Insight" resource, capacity upgrades (Mainframe Capacity), and automation upgrades (Processing Threads). Validate by checking UI responsiveness and functionality (**PRD Section 4: Processor Page**).

7.  **Develop Crew Quarters Page**: Create `/app/pages/crew-quarters.tsx` to display UI for crew generation, including cues for awakening crew members and showing capacity upgrades (Quarters) and automation (Worker Crews). Test UI interactions for clarity (**PRD Section 4: Crew Quarters Page**).

8.  **Develop Manufacturing Page**: Create `/app/pages/manufacturing.tsx` with UI elements to collect Scrap, manage Cargo Hold capacity, and enable automation via Manufacturing Bay. Validate page elements for proper resource display (**PRD Section 4: Manufacturing Page**).

9.  **Develop Logs Page**: Create `/app/pages/logs.tsx` to show static, narrative log entries that evolve as game pages unlock. Ensure the narrative tone reflects mysterious and evolving AI memory (**PRD Section 4: Logs Page**).

10. **Implement Offline Simulation Visuals**: In each resource page, implement progress bars updating the resource count. Add placeholders for offline gain reminders as described (simulate time-gaps and capped offline progress) (**PRD Section 6: Offline Progress and Data Persistence**).

11. **Validation**: Run the development server with `npm run dev` and verify that navigation and each page render correctly and follow the dark sci-fi theme (**App Flow Document: User Onboarding and Initial Landing**).

## Phase 3: Backend Development

1.  **Setup Supabase Connection**: In `/utils/supabase/server.ts`, configure the Supabase client using your Supabase URL and API key. Validate connection by writing a simple query and console logging the result (**PRD Section 5: User Authentication & Progress Tracking**).
2.  **Implement Persistent Saving Logic**: In `/utils/supabase/context.tsx` or a dedicated progress manager file, develop functions to save and load game state including resources and last active timestamp. Validate by triggering a save and retrieving the stored data using Supabase UI or CLI (**PRD Section 6: Persistent Saving and Loading**).
3.  **Develop API Endpoint for Progress Updates**: Create `/app/api/progress/route.ts` that handles POST requests to update user progress. Implement logic to calculate offline progress based on timestamp differences. Validate with a test call using `curl` or Postman to ensure correct updates (**PRD Section 6: Offline Progress Simulation**).
4.  **Integrate Authentication**: Use the Supabase authentication system within the frontend. Edit `/components/providers/clerk-client-provider.tsx` (or create a Supabase auth provider if not using Clerk) to wrap the main app with authentication context. Validate login flow by testing user sign-up/sign-in (**PRD Section 4: User Authentication & Progress Tracking**).
5.  **Implement Error Handling and Data Integrity Checks**: In all backend functions, add try-catch blocks and validate data consistency before saving. Write unit tests (using your preferred testing framework) for key functions in `/backend/tests/gameState.test.ts` (**PRD Section 7: Data Integrity and Error Handling**).

## Phase 4: Integration

1.  **Connect Frontend to Progress API**: In each resource page (e.g., `/app/pages/reactor.tsx`), add a function that sends the current state to `/api/progress` via an Axios or Fetch call. Validate by manually triggering resource changes and ensuring data is sent successfully (**App Flow Document: Offline Progress and Data Persistence**).
2.  **Integrate Offline Progress Calculation**: Update the client-side logic to record the logout timestamp and, on next login, fetch and simulate offline gains using the function built in Phase 3. Validate by simulating time gaps and verifying resource totals (**PRD Section 6: Offline Progress Simulation**).
3.  **Error Handling UI**: Add components for displaying error messages when API calls fail. Place this component in `/components/ui/ErrorBanner.tsx` and integrate it across all pages. Validate by simulating API errors (**PRD Section 7: Data Integrity and Error Handling**).
4.  **Test Complete User Flow**: Manually test navigation from login to each game page, resource generation, progress saving, and offline simulation. Use browser dev tools to ensure state consistency (**App Flow Document: User Onboarding and Initial Landing**).

## Phase 5: Deployment

1.  **Set Environment Variables**: In the project root, create an `.env.local` file including your Supabase URL, API key, and any other secrets. Validate that the Next.js app loads these variables correctly (**Tech Stack: Backend & Storage**).
2.  **Configure Vercel for Deployment**: Link your GitHub repository to Vercel (or another preferred Next.js hosting platform). Set build commands and environment variables as specified.
3.  **Deploy the Application**: Initiate the deployment from Vercel. Confirm the build is successful and that environment variables are correctly loaded by reviewing Vercel logs (**PRD Section 7: Performance and Data Integrity**).
4.  **Post-Deployment Testing**: After deployment, manually test the entire user flow on the production URL. Verify authentication, resource generation, offline progress simulation, and data saving. Also check UI responsiveness and design consistency on different devices (**Q&A: Performance Optimization**).

**Notes:**

*   Ensure that every code file and configuration (e.g., API endpoints, component files) is placed exactly as indicated by the starter kit structure.
*   Validate with tests after key coding steps (e.g., running `npm run dev`, testing API endpoints with `curl`) to ensure functionality at each stage.
*   Maintain strict adherence to Next.js 14, as noted in the tech stack document, for optimal compatibility with AI-assisted coding tools.

This concludes the implementation plan for Derelict Dawn. Follow each step carefully and perform validations as noted to ensure a robust build.
