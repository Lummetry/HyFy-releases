from typing import List
from fastapi import APIRouter, Depends, HTTPException
from jsonschema import ValidationError
from backend.models import User, TagData
from .auth import get_current_user
import logging
from backend.services.git_operations_service import GitOperationsService
from backend.constants import GITHUB_REPOSITORY_NAME, RELEASE_FILE_NAME
from backend.exceptions.git_operation_exception import GitOperationException

from backend.utils import log_with_color

router = APIRouter(prefix="/git")
logger = logging.getLogger(__name__)

@router.post('/check-precedence')
def check_precedence(tag_data: List[TagData], current_user: User = Depends(get_current_user)):
    if not tag_data:
        return {'success': False, 'message': 'No tags provided'}

    config_file_path = f"{tag_data[0].directory}/{RELEASE_FILE_NAME}"
    try:
        git_operations_service = GitOperationsService(GITHUB_REPOSITORY_NAME, None, config_file_path)
        git_operations_service.prepare_repository()
        success, error = git_operations_service.check_tag_list_precedence(tag_data)
        print(f"Success: {success}, Error: {error}")
        if not success:
            return {'success': False, 'message': error}
        return {'success': True, 'message': 'Precedence check passed'}
    except Exception as e:
        error_message = f"An error occurred while checking precedence: {e}"
        logger.error(f"[git::check_precedence] {error_message}")
        raise HTTPException(status_code=500, detail=error_message)

@router.post('/commit-changes')
def commit_changes(change_list: List[TagData], current_user: User = Depends(get_current_user)):
  config_file_path = f"{change_list[0].directory}/{RELEASE_FILE_NAME}"
  try:
    log_with_color(f"Committing user {current_user} changes for {change_list} using '{config_file_path}'", "yellow")
    git_operations_service = GitOperationsService(GITHUB_REPOSITORY_NAME, None, config_file_path)
    git_operations_service.update_and_push_changes(change_list, user=current_user)
    return {"success": True}
  except GitOperationException as e:
    logger.error(f"Git operation failed: {e}")
    raise HTTPException(status_code=500, detail=f"Git operation failed {e}")
  except Exception as e:
    logger.error(f"Error updating version: {e}")
    raise HTTPException(status_code=500, detail=f"{e}")

# should be deprecated
@router.post('/update-version')
def mark_tag(tag_data: TagData, current_user: User = Depends(get_current_user)):
    config_file_path = f"{tag_data.directory}/{RELEASE_FILE_NAME}"
    try:
        git_operations_service = GitOperationsService(GITHUB_REPOSITORY_NAME, None, config_file_path)
        git_operations_service.update_and_push_changes(tag_data, user=current_user)
        return {"tag": tag_data.tag, "environment": tag_data.environment}
    except GitOperationException as e:
        logger.error(f"Git operation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Git operation failed {e}")
    except Exception as e:
        logger.error(f"Error updating version: {e}")
        raise HTTPException(status_code=500, detail=f"{e}")

@router.get('/config')
def get_config(current_user: User = Depends(get_current_user)):
    try:
        git_operations_service = GitOperationsService(GITHUB_REPOSITORY_NAME)
        return git_operations_service.find_version_files()
    except ValidationError as e:
        logger.error(f"Error validating schema: {e}")
        raise HTTPException(status_code=400, detail=f"Schema validation failed: {e}")
    except Exception as e:
        logger.error(f"Error retrieving configuration: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while retrieving the configuration")

@router.get('/refresh-config')
def refresh_config(current_user: User = Depends(get_current_user)):
    try:
        git_operations_service = GitOperationsService(GITHUB_REPOSITORY_NAME)
        git_operations_service.prepare_repository()
        return git_operations_service.find_version_files()
    except Exception as e:
        logger.error(f"Error refreshing configuration: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while refreshing the configuration")

@router.get('/config/{directory}')
def get_config_from_directory(directory: str, current_user: User = Depends(get_current_user)):
    try:
        git_operations_service = GitOperationsService(GITHUB_REPOSITORY_NAME)
        return git_operations_service.get_release_file_contents(directory)
    except Exception as e:
        logger.error(f"Error retrieving directory configuration: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred while retrieving the directory configuration {e}")

@router.get('/config/{directory}/releases')
def get_releases_from_directory(directory: str, current_user: User = Depends(get_current_user)):
    try:
        git_operations_service = GitOperationsService(GITHUB_REPOSITORY_NAME)
        return git_operations_service.get_release_file_contents(directory)
    except Exception as e:
        logger.error(f"Error retrieving releases: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while retrieving the releases")

@router.get('/config/{directory}/versions')
def get_versions_from_directory(directory: str, current_user: User = Depends(get_current_user)):
    try:
        git_operations_service = GitOperationsService(GITHUB_REPOSITORY_NAME)
        return git_operations_service.get_versions_file_contents(directory)
    except Exception as e:
        logger.error(f"Error retrieving versions: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while retrieving the versions")