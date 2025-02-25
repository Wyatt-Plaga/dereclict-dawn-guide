# Frontend Guideline Document

## Introduction

Welcome to the Frontend Guideline Document for Derelict Dawn. This project is a multi-page, sci-fi themed idle game where players revive a derelict spaceship by managing an AI system. The audience includes teenagers and young adults who appreciate both a deep narrative and engaging resource management. The frontend plays a key role in immersing users with its dynamic interfaces, smooth animations, and evolving design that mirrors the ship’s revitalization. Every part of the experience, from generating Energy in the Reactor to unlocking narrative logs, has been designed to create an engaging and intuitive user experience.

## Frontend Architecture

The architecture of Derelict Dawn is built on Next.js 14 paired with TypeScript, forming a strong foundation for building a scalable and maintainable multi-page application. The design leverages a component-based structure that allows for clear separation of concerns, enabling each page (such as Reactor, Processor, Crew Quarters, Manufacturing, and Logs) to function as part of a larger, cohesive whole. This architecture not only facilitates better code reuse and testing but also ensures that as the game evolves, adding new features or sections remains efficient and organized. In addition, the robust infrastructure communicates seamlessly with Supabase to handle authentication and progress tracking, ensuring that user data is safely stored and retrieved.

## Design Principles

At the heart of Derelict Dawn is the principle of engaging storytelling combined with intuitive interaction. The design is centered on usability, seeking to minimize confusion while guiding users through a progressive discovery process. Accessibility is also a priority, meaning that the interface has been developed with clear visual cues and smooth animations to enhance user engagement. Responsiveness is key, as the design needs to adapt seamlessly to different devices so that the dark and mysterious atmosphere remains intact whether users are on desktop or mobile devices. The iterative evolution in style—from a broken-down, dim aesthetic to a more high-tech and polished look—reinforces the idea of a reawakening spaceship coming back to life.

## Styling and Theming

For styling, the project employs Tailwind CSS, which offers a utility-first approach that makes it easy to maintain a consistent and responsive design. With Tailwind, the CSS is modular and adaptable, perfect for the evolving theme of the game. The design starts with a dark and fractured look that represents the derelict state of the spaceship and gradually transitions into a sleek, high-tech aesthetic as players unlock new sections. The theme is further enhanced by using Shadcn UI and Radix UI, which ensure that interactive components are both visually appealing and accessible. All visual elements, including Lucide Icons, contribute to the overall sci-fi atmosphere, keeping the style cohesive across all pages and interactions.

## Component Structure

The frontend is organized into reusable, component-based structures using Next.js. Each component, from the resource generators on the Reactor page to the dynamic tech tree in the Processor section, is designed to be self-contained and reusable across the application. This structure helps in maintaining consistency while simplifying future updates or enhancements. Components are grouped logically so that similar functionalities are placed together, allowing for a modular development approach that supports easier debugging, testing, and overall maintainability. Such organization means that updates are isolated to specific parts of the UI without affecting the overall application performance.

## State Management

To keep the game’s interactive experience fluid, the project employs modern state management techniques using Next.js’s built-in capabilities alongside well-known patterns like the Context API. This approach is designed to ensure that state related to resource generation, upgrades, and user progress is managed centrally and efficiently. By maintaining a clear and connected state across the different sections of the game, from manual clicks in the Reactor to automatic offline progress updates, the game can update components in real time with minimal delay. This strategy not only ensures a smooth user experience but also simplifies both the development and debugging processes.

## Routing and Navigation

The routing in Derelict Dawn is managed via Next.js’s file-based routing system. Navigation is made intuitive with a clear flow starting from the Reactor and expanding into additional sections such as the Processor, Crew Quarters, Manufacturing, and finally Logs. Each route corresponds to a dedicated page that is designed with a consistent layout to maintain a uniform sci-fi aesthetic. Although different pages present unique content and functionalities, the overall navigation is streamlined to ensure that users can switch between sections without confusion, reflecting the progression of ship reactivation in a natural and engaging manner.

## Performance Optimization

Performance is a critical focus for keeping the gameplay fluid, particularly because the game needs to handle real-time updates along with idle progress simulation. Several strategies are used to keep performance in check, such as lazy loading for components and images, code splitting to reduce initial load times, and efficient state updates that prevent unnecessary re-renders. Asset optimization and streamlined data fetching methods ensure that the game runs smoothly even on lower-end devices. These optimizations directly contribute to a better user experience by keeping the interface responsive and the gameplay engaging, even as more of the ship’s systems come online.

## Testing and Quality Assurance

Quality assurance for Derelict Dawn is taken seriously to ensure that every interaction works smoothly. Unit tests are written for individual components to validate that they function correctly, while integration tests are in place to ensure the components interact properly. End-to-end tests simulate user interactions across the entire application to catch any workflow issues. Tools and frameworks such as Jest and React Testing Library are used for these purposes, ensuring that any changes or additions to the code do not disrupt the player’s experience. Regular testing is a key part of the development process that helps catch bugs early and maintain the high reliability required for an engaging and immersive game.

## Conclusion and Overall Frontend Summary

In summary, the frontend of Derelict Dawn is designed with both performance and a deep, engaging user experience in mind. With a robust architecture built on Next.js 14, TypeScript, and Tailwind CSS, every element from component structure to state management has been crafted to ensure that the game not only looks good but also runs flawlessly. Progressive unlocking of pages, dynamic resource management, and a design that evolves alongside the narrative make this project stand out. The combined use of modern libraries like Shadcn UI, Radix UI, and Lucide Icons creates a consistent and immersive sci-fi environment that reinforces the game’s storyline, keeping players engaged from the first click to the final revelation. Every decision, from developing reusable components to optimizing performance and rigorously testing each part of the system, supports the overarching goal: to deliver an intuitive, dynamic, and immersive gaming experience.
