import os
import logging
import requests
import subprocess
from backend.constants import (
  GITHUB_USER, GITHUB_API_TOKEN, STORAGE_DIR, 
  GIT_COMMITER_NAME, GIT_COMMITER_EMAIL
)

from backend.exceptions.git_operation_exception import GitOperationException

from backend.utils import log_with_color

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

import requests





class GitService:
  """
  Handles Git operations such as clone, pull, commit, and push for a specified repository.
  """
  
  def __init__(self, repo_name):
    """
    Initialize the GitService with the specified repository name.

    :param repo_name: The name of the repository to be managed.
    """
    log_with_color(f"Initializing GitService for repository {repo_name}", "yellow")
    self.base_url = 'github.com'
    self.repo_name = repo_name
    self.repo_url = self._build_repo_url()
    log_with_color(f"  Repository URL: {self.repo_url}", "yellow")    
    self.default_repo_path = self._get_default_repo_path()
    return

  def _build_repo_url(self):
    """
    Constructs the full repository URL with authentication token.

    :return: The full HTTPS URL for the repository.
    """
    return f'https://{GITHUB_USER}:{GITHUB_API_TOKEN}@{self.base_url}/{self.repo_name}'
  
  def __check_github_actions_running(self, repo_name: str) -> bool:
    """
    Checks if there are any running GitHub Actions in the specified public repository.

    Parameters
    ----------
    repo_name : str
        The repository name in the format "owner/repo".

    Returns
    -------
    bool
        True if any GitHub Actions are currently running, False otherwise.
    """
    url = f"https://api.github.com/repos/{repo_name}/actions/runs"
    
    log_with_color(f"Checking for running GitHub Actions in {url}", "yellow")
    
    response = requests.get(url)
    
    if response.status_code != 200:
      raise Exception(f"Failed to fetch data from GitHub API: {response.status_code}")
    
    runs = response.json().get("workflow_runs", [])
    
    result = False  
    for run in runs:
      if run['status'] == 'in_progress':
        result = True  
    
    if result:
      log_with_color("  GitHub Actions are currently running", "red")
    else:
      log_with_color("  No GitHub Actions are currently running", "green")
    return result


  def _ensure_storage_dir(self, path):
    """
    Ensures that the storage directory exists, creating it if necessary.

    :param path: The path to the storage directory.
    """
    if not os.path.exists(path):
      os.makedirs(path, exist_ok=True)

  def _get_default_repo_path(self):
    """
    Determines the default local storage path for the repository.

    :return: The path to the local repository directory.
    """
    repo_dir_name = self.repo_name.split('/')[-1]
    if repo_dir_name.endswith('.git'):
      repo_dir_name = repo_dir_name[:-4]
    return os.path.join(STORAGE_DIR, repo_dir_name)
  
  def _set_commiter_identity(self, clone_path):
    """
    Sets the Git committer identity for the specified repository path.

    :param clone_path: The path to the cloned repository.
    """
    if GIT_COMMITER_NAME and GIT_COMMITER_EMAIL:
      subprocess.run(['git', 'config', 'user.name', GIT_COMMITER_NAME], cwd=clone_path, check=True)
      subprocess.run(['git', 'config', 'user.email', GIT_COMMITER_EMAIL], cwd=clone_path, check=True)
    else:
      print("Committer identity not set. GIT_COMMITER_NAME and GIT_COMMITER_EMAIL must be defined.")        

  def git_clone(self, clone_path=None):
    """
    Clones the repository to the specified path, setting the committer identity.

    :param clone_path: The path where the repository will be cloned.
    """
    clone_path = clone_path or self._get_default_repo_path()
    self._ensure_storage_dir(clone_path)
    try:
        subprocess.run(['git', 'clone', self.repo_url, clone_path], check=True, capture_output=True)
        self._set_commiter_identity(clone_path)
    except subprocess.CalledProcessError as e:
        logger.error(f"Error cloning repository: {e.stderr.decode()}")
        raise GitOperationException('clone', e.stderr.decode(), e)

  def git_pull(self, repo_path=None):
    """
    Pulls the latest changes from the remote repository.

    :param repo_path: The path of the local repository to pull changes into.
    """
    repo_path = repo_path or self._get_default_repo_path()
    try:
        result = subprocess.run(['git', 'pull'], cwd=repo_path, capture_output=True, check=True)
    except subprocess.CalledProcessError as e:
        logger.error(f"Error pulling repository: {e.stderr.decode()}")
        raise GitOperationException('pull', e.stderr.decode(), e)

  def git_commit(self, message, repo_path=None):
    """
    Commits any changes in the local repository with the provided message.

    :param message: The commit message.
    :param repo_path: The path of the local repository where the commit will be made.
    """
    repo_path = repo_path or self._get_default_repo_path()
    try:
        subprocess.run(['git', 'add', '.'], cwd=repo_path, check=True)
        subprocess.run(['git', 'commit', '-m', message], cwd=repo_path, check=True, capture_output=True)
    except subprocess.CalledProcessError as e:
        logger.error(f"Error committing changes: {e.stderr.decode()}")
        raise GitOperationException('commit', e.stderr.decode(), e)

  def git_push(self, repo_path=None):
    """
    Pushes committed changes from the local repository to the remote repository.

    :param repo_path: The path of the local repository from which changes will be pushed.
    """
    repo_path = repo_path or self._get_default_repo_path()
    try:
        subprocess.run(['git', 'push'], cwd=repo_path, check=True, capture_output=True)
    except subprocess.CalledProcessError as e:
        logger.error(f"Error pushing changes: {e.stderr.decode()}")
        raise GitOperationException('push', e.stderr.decode(), e)

  def check_github_actions_running(self) -> bool:
    return self.__check_github_actions_running(self.repo_name)