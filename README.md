# Scriptorium
## CSC309 Project
### Yash Sethi, Homayoun Elyasi, Christopher Flores

[![GitHub](https://img.shields.io/badge/GitHub-Scriptorium-blue?logo=github)](https://github.com/your-username/Scriptorium)

![scriptorium](https://github.com/user-attachments/assets/example-image-id)
<img width="1470" height="764" alt="Screenshot 2025-09-29 at 3 58 00 PM" src="https://github.com/user-attachments/assets/4e6cfe2f-8e32-420b-bd2c-90457e7f6e11" />
<img width="1470" height="771" alt="Screenshot 2025-09-29 at 3 57 19 PM" src="https://github.com/user-attachments/assets/44d81e1f-3615-4466-aed4-29fafc42f393" />


<!-- Tech Stack Badges -->
<p align="center">
  <!-- Backend -->
  <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white" alt="Prisma"/>

  <!-- Frontend -->
  <img src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white" alt="TailwindCSS"/>

  <!-- Infra -->
  <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/REST-FF6F00?logo=swagger&logoColor=white" alt="REST API"/>

  <!-- Dev -->
  <img src="https://img.shields.io/badge/Jira-0052CC?logo=jira&logoColor=white" alt="Jira"/>
  <img src="https://img.shields.io/badge/CI%2FCD-2088FF?logo=githubactions&logoColor=white" alt="CI/CD"/>
</p>


An online collaborative platform for writing, executing, and sharing code across multiple programming languages with an emphasis on security, usability, and extensibility.

## Overview

Scriptorium is a full-stack web application that provides developers and learners with a real-time code execution environment. Built with Next.js and Prisma on top of a PostgreSQL backend, it combines flexibility with security to deliver a reliable collaborative coding space.

### Key Features

- **Multi-language Support**: Write and run code in various programming languages  
- **Secure Execution**: Sandbox-based environment with Docker isolation  
- **Collaboration**: Share code snippets and projects with others  
- **Custom Templates**: Create reusable boilerplates for quick project setup  
- **Database Integration**: Backed by Prisma ORM and PostgreSQL  
- **Modern UI**: Responsive frontend with TailwindCSS and Next.js

### Technology Stack

- **Backend**: Node.js, Next.js, Prisma, PostgreSQL  
- **Frontend**: React, Next.js, TailwindCSS  
- **Infrastructure**: Docker, REST APIs  
- **Development**: Jira, CI/CD pipelines

## Architecture

The project consists of three main components:

1. **Execution Engine**: Handles sandboxed code execution  
2. **Web Interface**: Frontend for writing and sharing code  
3. **Database Layer**: Manages user data, code snippets, and templates

## Quick Start

### Prerequisites

- Docker Desktop  
- Node.js 18+ (for local development)  
- PostgreSQL (for local database testing)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sahibsethi17/Scriptorium.git
   cd Scriptorium
   ```

2. **Start with Docker (Recommended)**
   ```bash
   docker compose up --build
  ```

3. **Access the application**
   - Frontend: http://localhost:3000  
   - Backend API: http://localhost:5000

### Alternative Local Development

If you prefer to run without Docker:

**Backend:**
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Usage

1. Open the web interface at http://localhost:3000  
2. Select a programming language and start coding in the editor  
3. Execute your code securely in the sandbox environment  
4. Save and share snippets with others in real time

## Development Commands

### Clean Rebuild
```bash
docker compose down -v --remove-orphans
rm -rf frontend/node_modules frontend/package-lock.json backend/node_modules backend/package-lock.json
docker compose build --no-cache
docker compose up
```

### Quick Start (Reusing Images)
```bash
docker compose up
```

## Research Context

Scriptorium addresses the challenge of secure, scalable, and collaborative code execution in educational and professional settings. It integrates modern web technologies with containerized infrastructure to ensure both usability and safety.

### Data Pipeline

Our backend pipeline leverages Prisma to:  
- Manage relational data models  
- Enable efficient CRUD operations  
- Ensure data integrity with PostgreSQL  
- Support scalability through Dockerized deployments

## Project Structure

```
Scriptorium/
├── backend/           # Express.js API and Prisma ORM
├── frontend/          # Next.js + React web interface
├── docker-compose.yml # Multi-container orchestration
└── README.md          # This file
```

## Acknowledgments

- **Contributors**: Core development team and open-source collaborators  
- **Frameworks**: Built upon Next.js, Prisma, and Docker  
- **Inspiration**: Collaborative coding platforms and online IDEs  
- **Infrastructure**: PostgreSQL and Dockerized environments  

---

**Note**: This is an experimental project intended to explore collaborative coding with a strong emphasis on secure and extensible design.  
