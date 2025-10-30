# InnoviaHub

InnoviaHub is a full-stack web application designed to streamline the booking of office resources and user management.
It provides real-time updates through SignalR, secure authentication with JWT, and AI-driven booking capabilities for a more intuitive user experience.

## System Overview

InnoviaHub consists of a React frontend and a .NET 9.0 backend, hosted in the Azure cloud.
The system allows users to book office resources (e.g., rooms, desks, or equipment) and enables administrators to manage users and resources through an intuitive web interface.

## Features

- **User Registration & Authentication**: Secure sign-up and login with JWT tokens.
- **Admin Controls**: Manage users and resources via dedicated admin endpoints.
- **Resource Booking**: Users can book and manage available office resources via the dashboard.
- **Responsive UI**: Built with React and styled with CSS modules.
- **AI-Implementation**: Booking available through freetext 

## Tech Stack

### Backend

- ASP.NET Core 9.0
- SignalR – Real-time communication for live booking updates
- Entity Framework Core – Database management with SQL Server
- JWT (JSON Web Tokens) – Secure authentication and authorization
- OpenAI API – AI-based free-text interpretation for booking requests
- Swagger – API documentation

### Frontend

- React.js (Vite)
- Fetch API – Communication with backend
- CSS Modules – Modular and responsive design


### DevOps & Infrastructure

- Azure App Services – Hosting for backend and frontend
- GitHub – Version control
- Trello – Project management
- .env configuration – Environment variables for secure credentials

## Run the project locally

### Prerequisites

Make sure the following are installed:
- .NET SDK 9.0 (https://dotnet.microsoft.com/download/dotnet/9.0)
- Node.js & npm (https://nodejs.org/en/download)

### Backend Setup

1. **Clone the repository:**

```bash
git clone https://github.com/Brinkentosh/InnoviaHub.git
cd InnoviaHub/Backend 
```

2. **Restore Dependencies**

```bash
dotnet restore
```

3. **Create .env file in the root of Backend folder with this context**
```bash
AZURE_SQL_CONNECTIONSTRING='XXXX'
JWT_SECRET='XXXX'
OpenAI__ApiKey=XXXX
```

4. **Build the project:**

```bash
dotnet build
```

5. **Run the application:**

```bash
dotnet run
```

The backend will be accessible at <http://localhost:5271>.

The API documentation will be accesable via Swagger UI: <http://localhost:5271/swagger>

### Frontend Setup

1. **Navigate to the frontend directory:**

```bash
cd ../Frontend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start the development server:**

```bash
npm run dev
```

The frontend will be accessible at <http://localhost:5173>.

### Personal contributions
The following parts of the system were personally developed or further enhanced:
-   AI Implementation
    ntegrated OpenAI API to enable free-text booking requests.
    (Example: users can type “Book a meeting room at 10 AM” instead of filling out forms.)
-   Sensor Integration (IoT Module)
    Implemented the structure for collecting sensor data (e.g., temperature, presence).
    This functionality is prepared but not yet deployed to the production APIs.
-   UI & CSS Improvements
    Refined the office layout view and fixed several CSS inconsistencies to improve responsiveness and overall design quality.

### Testaccount
Username: test@mail.com
Password: Test123!

Adminaccount is sent to course coordinator!