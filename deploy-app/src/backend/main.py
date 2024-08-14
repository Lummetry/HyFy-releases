import os
import shutil
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .services.git_operations_service import GitOperationsService
from .constants import BASE_DIR, GITHUB_REPOSITORY_NAME, STORAGE_DIR

from .routes import users, auth, git

from .utils import get_version, log_with_color


version = get_version()
log_with_color(f"Starting the Deploy-App FastAPI server v{version}...", "green")


# Seed the configuration repository
git_operations_service = GitOperationsService(GITHUB_REPOSITORY_NAME)
git_operations_service.prepare_repository() # Bootstrap the repository


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust the allowed origins as per your React app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your API routers first
app.include_router(users.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(git.router, prefix="/api")

# Then mount the static files; this ensures that the API routes take precedence
app.mount("/assets", StaticFiles(directory="frontend/dist/assets", html=True), name="assets")

# Serve index.html for all non-API routes
@app.get("/{full_path:path}")
async def read_index(full_path: str):
    return FileResponse('frontend/dist/index.html')