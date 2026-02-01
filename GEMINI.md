# GEMINI.md

## Project Overview

This is a Next.js web application for controlling and animating an LED matrix. The project is built with React, TypeScript, and Tailwind CSS. It communicates with an ESP32 microcontroller to control LEDs and a PostgreSQL database to store animations, states, and transitions.

The application has three main parts:

- A dashboard for managing modules.
- A state machine editor for creating and managing animations.
- A direct LED controller for interacting with the ESP32.

### Technologies

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **3D Graphics:** Three.js, @react-three/fiber, @react-three/drei
- **Database:** PostgreSQL
- **Hardware:** ESP32 Microcontroller

## Building and Running

### Prerequisites

- Node.js
- npm, yarn, or pnpm

### Installation

1. Clone the repository.
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

To run the development server, use the following command:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

To build the application for production, use the following command:

```bash
npm run build
```

### Starting the Production Server

To start the production server, use the following command:

```bash
npm run start
```

## Development Conventions

### Code Style

The project uses ESLint for code linting. To run the linter, use the following command:

```bash
npm run lint
```

### API Routes

The API routes are located in the `app/api` directory. They are used to interact with the PostgreSQL database.

### Rules

- Do not use libraries that have not been installed
