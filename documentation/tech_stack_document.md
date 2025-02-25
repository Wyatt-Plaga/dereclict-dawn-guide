# Tech Stack Document

## Introduction

The project, Derelict Dawn, is a multi-page web platform built as a sci-fi themed idle/incremental game. The game allows players to manage an AI that gradually reactivates a long-forgotten spaceship. The game is designed for teenagers and young adults, where the focus is on resource management, progression through various ship sections, and an immersive narrative experience. The technology choices were made to ensure a smooth and engaging journey, starting from manual resource generation to unlocking automated systems as the experience evolves. The overall aim is to create a responsive, reliable, and visually stunning application that scales with the players’ accomplishments.

## Frontend Technologies

The frontend of Derelict Dawn is built with Next.js 14 combined with TypeScript, providing a robust and scalable framework that is ideal for developing multi-page applications. The user interface is styled using Tailwind CSS, which simplifies design through utility-first styling, ensuring a clean and fast-loading appearance. To deliver dynamic, accessible components that enhance interaction, Shadcn UI and Radix UI are integrated into the project. Additionally, Lucide Icons are used to enhance the sci-fi aesthetic, adding futuristic visuals that blend seamlessly with the overall theme. These tools work together to create an engaging and intuitive user experience, making it easy for players to navigate the evolving story and game mechanics.

## Backend Technologies

On the backend, Supabase forms the cornerstone of our data management and user authentication strategy. This platform provides a safe and scalable environment for handling user progress, auto-saving game states, and ensuring data integrity across sessions. The use of Supabase aids in managing the complexity of real-time resource updates and simulating progress during offline periods. It seamlessly supports the game's requirements by offering secure user authentication and persistent storage, ensuring that every action and milestone is recorded accurately and reliably.

## Infrastructure and Deployment

The application is deployed using a robust infrastructure that emphasizes reliability and ease of scaling. Version control is handled via Git, and the project repository is based on the CodeGuide Starter Pro kit. This starter kit brings with it a well-organized project structure that supports rapid development and collaborative work. Continuous integration and continuous deployment (CI/CD) pipelines are set up to ensure that new updates are delivered smoothly and efficiently. Hosting the application on modern cloud platforms allows us to maintain high uptime and scaling capabilities, ensuring that the game remains accessible and responsive even as the user base grows and the game’s complexity increases.

## Third-Party Integrations

The project integrates several third-party tools that enhance both development efficiency and user experience. Among these are Claude AI, ChatGPT, and Cursor. Claude AI, with its Sonnet 3.5 model, assists in intelligent code suggestions, ensuring that the code remains clean and effective. ChatGPT, which utilizes OpenAI’s GPT-4 O1 model, contributes to advanced code generation and problem-solving during development. Cursor is used as an advanced integrated development environment that provides real-time suggestions, further streamlining the development process. These integrations not only boost developer productivity but also reinforce the project's commitment to innovative, high-quality performance throughout its lifecycle.

## Security and Performance Considerations

Maintaining player data integrity and ensuring optimal performance are top priorities for Derelict Dawn. Supabase handles secure user authentication and persistent progress tracking, which helps prevent data loss or corruption even when the game is operating at high frequency. Offline progress is carefully simulated to both reward players and preserve game balance. The use of lazy loading for images and components, along with efficient data fetching and event handling, guarantees a quick and smooth gameplay experience across devices. Security practices such as HTTPS, secure API endpoints, and regular data backups are implemented to further protect sensitive player data and ensure that the application runs smoothly even under demanding conditions.

## Conclusion and Overall Tech Stack Summary

In summary, Derelict Dawn is built on a tech stack that brings together Next.js, TypeScript, Tailwind CSS, Shadcn UI, Radix UI, and Lucide Icons on the frontend, with a robust backend powered by Supabase. The infrastructure supports seamless deployment and continuous updates, while third-party integrations such as Claude AI, ChatGPT, and Cursor streamline the development process. Emphasis on security, performance, and a carefully crafted user experience ensures that the game remains engaging and reliable through each progressive stage of ship reactivation and narrative evolution. This thoughtful combination of technologies not only meets the requirements for an innovative idle game experience but also provides a solid foundation for future enhancements and scalability.
