# PoliEats

This is a **Next.js 15** project using **React 19** and includes integration with **Prisma** for database management and **shadcn/ui** for styling. Below are the instructions to set up, install dependencies, and understand the project structure.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/en/download/) (version 16+ recommended)
- [Docker](https://docs.docker.com/get-docker/) (for containerized development)
- [Git](https://git-scm.com/)

### Cloning the Project

```bash
git clone https://github.com/PoliEats-XP/polieats.git
cd polieats
```

### Installing Dependencies

After cloning the project, run the following command to install all dependencies:

```bash
npm install
```

This will install all the required packages, including Next.js, React, Prisma, and TailwindCSS.

### Running the project

After installing the project, run the following command to run the project in development mode:

```bash
npm run dev
```

### Installing New shadcn/ui Components

To install new components from **shadcn/ui**, use the following command:

```bash
npx shadcn-ui add <component-name>
```

Replace `<component-name>` with the desired component (e.g., `button`, `card`, etc.).

For more information on available components, visit the official documentation: [shadcn/ui](https://shadcn.dev/docs).

### Authentication using better-auth

This project uses BetterAuth, a modern and extensible authentication framework for Next.js.

On this project, BetterAuth is already basically setted-up (you just need to setup your own env variables)

```bash
BETTER_AUTH_SECRET=''
BETTER_AUTH_URL=http://localhost:3000
```

## Project Structure

Here's a brief overview of the key directories and files in the project:

### `/app`

The root folder for all Next.js pages and API routes.

- **`/app/api`**: Contains API route handlers that act as the server-side logic for the application.
- **`/app/page.tsx`**: The main entry point for the homepage of the application.

### `/components`

Reusable UI components live here, organized by feature or function. This folder allows for better separation of concerns and reusability.

### `/prisma`

Contains Prisma schema (`schema.prisma`) and migrations for managing the database. To interact with the database:

- **Run migrations**:
  ```bash
  npx prisma migrate dev
  ```
- **Generate Prisma client**:
  ```bash
  npx prisma generate
  ```

For more information, refer to the [Prisma Documentation](https://www.prisma.io/docs).

### `/docker`

The Docker setup for containerizing the project. It includes Dockerfiles and Docker Compose configurations to simplify development and deployment.

To build and start the Docker container:

```bash
docker-compose up -d
```

Ensure Docker is running and properly configured for your environment.

## Environment Variables

The project uses `.env` files for environment variables such as database connection strings, API keys, and authentication secrets.

### Example `.env` setup:

```env
DATABASE_URL="this url here will be available soon for all the devs"
```

Make sure to create a `.env` file at the root of the project with the necessary variables for local development.

## Styling with TailwindCSS

TailwindCSS is used for styling the project. You can find the configuration file `tailwind.config.js` in the root directory.

For more details, check the [TailwindCSS Documentation](https://tailwindcss.com/docs).

---

## Contributing to **Polieats**

We appreciate your interest in contributing to **Polieats**! If you'd like to contribute, please follow our guidelines and instructions in the [CONTRIBUTING](CONTRIBUTING.md) file.

Whether you’re a project developer or an external contributor, the guide will walk you through the steps to get started.

---

If you have any questions or issues, please refer to the respective documentation links or open an issue in the repository.
