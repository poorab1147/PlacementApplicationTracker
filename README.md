# Placement Application Tracker

A full-stack web application for managing and tracking job applications, interviews, deadlines, and application documents in one place.

## Features

### Authentication
- User registration and login
- Secure password hashing with Argon2
- JWT-based authentication
- Protected API routes
- User-specific data access

### Application Management
- Create, view, edit, and delete applications
- Search applications by company or job title
- Filter applications by status and priority
- Track application status and priority
- Track application and deadline dates
- Store job posting URLs
- Store salary ranges and notes

### Interview Management
- Add interview rounds
- View interviews associated with applications
- Edit interviews
- Delete interviews
- Track interview type
- Track interviewer
- Track scheduled date and time
- Track interview result
- Store interview notes

### Document Management
- Upload PDF documents
- Maximum file size of 5 MB
- PDF extension and MIME-type validation
- Secure UUID-based stored filenames
- Download documents
- Delete documents
- Store document metadata in PostgreSQL

### Dashboard
- Total application count
- Interview count
- Offer count
- Rejection count
- Applications grouped by status
- Upcoming application deadlines
- Upcoming interviews

---

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Python
- FastAPI
- Pydantic
- SQLAlchemy
- PyJWT
- Uvicorn
- python-multipart
- pwdlib

### Database
- PostgreSQL
- Psycopg

---

## Application Architecture

```text
                    +---------------------+
                    |        React        |
                    |      Frontend       |
                    | Vite + Tailwind CSS |
                    +----------+----------+
                               |
                             Axios
                               |
                               v
                    +---------------------+
                    |       FastAPI       |
                    |       Backend       |
                    +----------+----------+
                               |
                 +-------------+-------------+
                 |             |             |
                 v             v             v
             Auth API    Application API   Dashboard
                 |             |
                 |       +-----+-----+
                 |       |           |
                 v       v           v
              Users  Interviews  Documents
                         |           |
                         +-----+-----+
                               |
                               v
                         PostgreSQL
```

---

## Project Structure

```text
PlacementApplicationTracker/
|
+-- backend/
|   +-- app/
|   |   +-- dependencies/
|   |   |   +-- auth.py
|   |   |
|   |   +-- models/
|   |   |   +-- __init__.py
|   |   |   +-- user.py
|   |   |   +-- application.py
|   |   |   +-- interview.py
|   |   |   +-- document.py
|   |   |
|   |   +-- routers/
|   |   |   +-- auth.py
|   |   |   +-- applications.py
|   |   |   +-- interviews.py
|   |   |   +-- documents.py
|   |   |   +-- dashboard.py
|   |   |
|   |   +-- schemas/
|   |   |   +-- user.py
|   |   |   +-- auth.py
|   |   |   +-- application.py
|   |   |   +-- interview.py
|   |   |   +-- document.py
|   |   |
|   |   +-- services/
|   |   |   +-- application_service.py
|   |   |   +-- interview_service.py
|   |   |   +-- document_service.py
|   |   |
|   |   +-- utils/
|   |   |   +-- security.py
|   |   |   +-- file_validation.py
|   |   |
|   |   +-- database.py
|   |   +-- main.py
|   |
|   +-- requirements.txt
|   +-- .env
|
+-- frontend/
|   +-- src/
|   |   +-- components/
|   |   |   +-- ProtectedRoute.jsx
|   |   |
|   |   +-- context/
|   |   |   +-- AuthContext.jsx
|   |   |   +-- useAuth.js
|   |   |
|   |   +-- pages/
|   |   |   +-- Login.jsx
|   |   |   +-- Register.jsx
|   |   |   +-- Dashboard.jsx
|   |   |   +-- Applications.jsx
|   |   |   +-- ApplicationDetails.jsx
|   |   |
|   |   +-- services/
|   |   |   +-- api.js
|   |   |
|   |   +-- App.jsx
|   |   +-- main.jsx
|   |   +-- index.css
|   |
|   +-- package.json
|   +-- vite.config.js
|
+-- .gitignore
+-- README.md
```

---

## Database Design

The application uses a normalized relational database.

```text
Users
  |
  | 1
  |
  | N
Applications
  |
  +----------------+
  |                |
  | 1              | 1
  |                |
  v N              v N
Interviews     Documents
```

### Users

Stores authenticated user information.

Main fields:

- `id`
- `full_name`
- `email`
- `password_hash`
- `created_at`
- `updated_at`

### Applications

Stores job application information.

Main fields:

- `id`
- `user_id`
- `company_name`
- `job_title`
- `job_type`
- `location`
- `application_url`
- `status`
- `priority`
- `applied_date`
- `deadline`
- `salary_range`
- `notes`
- `created_at`
- `updated_at`

### Interviews

Stores interview rounds associated with applications.

Main fields:

- `id`
- `application_id`
- `round_name`
- `interview_type`
- `scheduled_at`
- `interviewer`
- `result`
- `notes`
- `created_at`
- `updated_at`

### Documents

Stores uploaded document metadata.

Main fields:

- `id`
- `application_id`
- `document_type`
- `original_filename`
- `stored_filename`
- `file_path`
- `mime_type`
- `file_size`
- `uploaded_at`

---

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Applications

```text
POST   /api/applications
GET    /api/applications
GET    /api/applications/{application_id}
PUT    /api/applications/{application_id}
DELETE /api/applications/{application_id}
```

### Interviews

```text
POST   /api/applications/{application_id}/interviews
GET    /api/applications/{application_id}/interviews
GET    /api/applications/{application_id}/interviews/{interview_id}
PUT    /api/applications/{application_id}/interviews/{interview_id}
DELETE /api/applications/{application_id}/interviews/{interview_id}
```

### Documents

```text
POST   /api/applications/{application_id}/documents
GET    /api/applications/{application_id}/documents
GET    /api/applications/{application_id}/documents/{document_id}
DELETE /api/applications/{application_id}/documents/{document_id}
```

### Dashboard

```text
GET /api/dashboard/stats
GET /api/dashboard/upcoming-deadlines
GET /api/dashboard/upcoming-interviews
```

---

## Authentication Flow

```text
User
 |
 v
Register / Login
 |
 v
FastAPI Authentication
 |
 +-- Password verification
 |
 +-- JWT generation
        |
        v
   Access Token
        |
        v
React localStorage
        |
        v
Axios Authorization Header
        |
        v
Protected FastAPI Endpoint
        |
        v
Authenticated User
```

The backend determines the current user from the JWT token. Application ownership is based on the authenticated user rather than a client-provided `user_id`.

---

## File Upload Security

Uploaded documents are restricted to PDF files.

Validation includes:

- PDF file extension
- `application/pdf` MIME type
- Maximum size of 5 MB
- UUID-based stored filename
- Original filename stored separately as metadata

Uploaded files are stored outside the Git repository and are excluded using `.gitignore`.

---

## Setup

### Prerequisites

Make sure the following are installed:

- Python 3.13+
- Node.js
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd PlacementApplicationTracker
```

### 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install Python dependencies:

```powershell
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create:

```text
backend/.env
```

Add:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/placement_tracker
JWT_SECRET=YOUR_SECRET
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
UPLOAD_DIR=uploads/resumes
MAX_UPLOAD_SIZE_MB=5
```

Replace the database password and JWT secret with your own values.

Do not commit `.env` to GitHub.

### 4. Start the Backend

From the `backend` directory:

```powershell
uvicorn app.main:app --reload
```

The API runs at:

```text
http://127.0.0.1:8000
```

FastAPI Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

### 5. Frontend Setup

Open another terminal and navigate to:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the frontend:

```powershell
npm run dev
```

Vite will display the local development URL in the terminal.

---

## Testing and Validation

### Frontend Lint

```powershell
npm run lint
```

### Production Build

```powershell
npm run build
```

The project currently passes both frontend validation commands successfully.

---

## Security Considerations

- Passwords are never stored in plain text.
- Passwords are hashed using Argon2.
- JWT tokens protect authenticated endpoints.
- Application ownership is enforced on the backend.
- Client-provided `user_id` values are not trusted.
- Uploaded files are restricted to PDF.
- Uploaded files are limited to 5 MB.
- Stored filenames use UUIDs.
- Environment variables are excluded from Git.
- Uploaded files are excluded from Git.

---

## Future Improvements

Potential future enhancements include:

- Email notifications for upcoming deadlines
- Calendar integration
- Application analytics
- Application conversion-rate charts
- Resume version tracking
- Job recommendation system
- Automated placement reminders
- Interview preparation notes
- Docker containerization
- Cloud deployment

---

## Author

**Poorab Verma**

Computer Science & Engineering  
SRM Institute of Science and Technology
