# constants.py
import os

# Define user roles
ADMIN_ROLE = 'admin'       # Admin role
REGULAR_ROLE = 'regular'   # Regular user role

# GitHub constants
GITHUB_USER = os.getenv('GITHUB_USER', None)                          # GitHub username, used to clone the repository
GITHUB_API_TOKEN = os.getenv('GITHUB_API_TOKEN', None)                # GitHub API token, used to authenticate with the GitHub API
GITHUB_REPOSITORY_NAME = os.getenv('GITHUB_REPOSITORY_NAME', None)    # GitHub repository name, used to clone the repository
RELEASE_FILE_NAME = 'release.yaml'                                    # Release file name
RELEASE_TEMPLATE_FILE_NAME = '.release.yaml'                          # Release template file name
VERSIONS_FILE_NAME = 'versions.yaml'                                  # Versions file name
GIT_COMMITER_NAME = os.getenv('GIT_COMMITER_EMAIL', None)             # Git commiter name
GIT_COMMITER_EMAIL = os.getenv('GIT_COMMITER_EMAIL', None)            # Git commiter email

# Other constants
SECRET_KEY = os.getenv('SECRET_KEY', None)                            # Secret key used to sign the JWT token
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Path constants
BASE_DIR = os.path.dirname(os.path.abspath(__file__))                 # Get the directory where constants.py is located
STORAGE_DIR = os.path.join(BASE_DIR, '..', 'storage')                 # Define the storage directory path
TEMPLATES_DIR = os.path.join(BASE_DIR, 'templates')                   # Define the templates directory path