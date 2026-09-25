from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auth import router as auth_router
from app.routers.applications import router as applications_router
from app.routers.interviews import router as interviews_router
from app.routers.documents import router as documents_router
from app.routers.dashboard import router as dashboard_router


app = FastAPI(
    title="Placement Application Tracker API",
    version="1.0.0",
)


# Allow the React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(applications_router)
app.include_router(interviews_router)
app.include_router(documents_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {
        "message": "Placement Application Tracker API is running"
    }