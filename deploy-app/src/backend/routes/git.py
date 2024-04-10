from fastapi import APIRouter, Depends, HTTPException
from backend.models import User, TagData
from .auth import get_current_user
from backend.services.git_operations_service import GitOperationsService
from backend.constants import GITHUB_REPOSITORY_NAME, RELEASE_FILE_NAME

router = APIRouter(prefix="/git")

@router.post('/update-version')
def mark_tag(tag_data: TagData, current_user: User = Depends(get_current_user)):
    config_file_path = f"{tag_data.directory}/{RELEASE_FILE_NAME}"

    try:
        git_operations_service = GitOperationsService(GITHUB_REPOSITORY_NAME, None, config_file_path)
        git_operations_service.update_and_push_changes(tag_data, user=current_user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"tag": tag_data.tag, "environment": tag_data.environment}

@router.get('/config')
def get_config(current_user: User = Depends(get_current_user)):
    git_operations_service = GitOperationsService(GITHUB_REPOSITORY_NAME)
    return git_operations_service.find_release_files()

@router.get('/refresh-config')
def refresh_config(current_user: User = Depends(get_current_user)):
    git_operations_service = GitOperationsService(GITHUB_REPOSITORY_NAME)
    git_operations_service.prepare_repository()
    return git_operations_service.find_release_files()

@router.get('/config/{directory}')
def get_config_from_directory(directory: str, current_user: User = Depends(get_current_user)):
    git_operations_service = GitOperationsService(GITHUB_REPOSITORY_NAME)
    return git_operations_service.get_release_file_contents(directory)