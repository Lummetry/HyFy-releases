# Hyfy Deploy Application

## Folder structure
```
./
│
├── README.md  # Main readme file with project information
│
├── src/
│   ├── backend/            # Backend application code and resources
│   ├── frontend/           # Frontend application code and resources
│   ├── storage/            # Directory for storage related files and scripts
│   └── seed.sh             # Script for seeding the database or other initial setup tasks
│
├──  Dockerfile             # Dockerfile for building Docker containers for the project
├──  entrypoint.sh          # Script used as the Docker entrypoint
└──  requirements.txt       # Python pip requirements file
```

> Note: The `kubernetes` is not part of the app repo anymore and was moved to `k8s` repo

```
└── kubernetes/
    ├── install.sh          # Script to install Kubernetes configurations
    └── src/
        ├── namespace.yaml  # YAML file for Kubernetes namespace configuration
        ├── deploy.yaml     # Deployment configuration for Kubernetes
        └── .secrets.yaml   # Hidden file for sensitive configuration secrets
```

## Installation on k8s cluster
To install the application you can modify the manifests located under the `kubernetes` directory and run the `install` script

```bash
./install.sh
```

## Create your first user
After installing the application following the steps above, you can use the `seed.sh` script to create your frist user.

** Note: ** all the users created with the `seed.sh` script will be administrators.

```bash
kubectl exec -it <container_name> -- bash -c '/app/seed.sh'
```

## Configuration
There are a number of configuration parameters that you need to pay attention to, these parameters can be found under the `src/backend/constants.py` path.

```python
# GitHub constants
GITHUB_USER = os.getenv('GITHUB_USER', None)                          # GitHub username, used to clone the repository
GITHUB_API_TOKEN = os.getenv('GITHUB_API_TOKEN', None)                # GitHub API token, used to authenticate with the GitHub API
GITHUB_REPOSITORY_NAME = os.getenv('GITHUB_REPOSITORY_NAME', None)    # GitHub repository name, used to clone the repository
RELEASE_FILE_NAME = 'release.yaml'                                    # Release file name
VERSIONS_FILE_NAME = 'versions.yaml'                                  # Versions file name
GIT_COMMITER_NAME = os.getenv('GIT_COMMITER_EMAIL', None)             # Git commiter name
GIT_COMMITER_EMAIL = os.getenv('GIT_COMMITER_EMAIL', None)            # Git commiter email

# Other constants
SECRET_KEY = os.getenv('SECRET_KEY', None)                            # Secret key used to sign the JWT token
```

### Configuration parameters explained
1. `GITHUB_USER`, the username for the account that is going to be used to clone/pull the configuration repository
2. `GITHUB_API_TOKEN`, the personal access token for the user above
3. `GITHUB_REPOSITORY_NAME`, this is the name of the configuration repository and the format is: `username/repository-name` or `organization/repository-name`, you don't need the full URL to the repository.
4. `GIT_COMMITER_NAME`, this is the name associated with the commit in the configuration repository, it can be the same as the `GITHUB_USER`.
5. `GIT_COMMITER_EMAIL`, this is the email address associated with the github account of the commiter.
6. `SECRET_KEY`, this is a secret used to sign the JWT token, use an elaborate string, it could be a sha256 hash

### Application overview 
```
./
│
├── backend /
│   ├── exceptions/            # Custom exceptions are defined in this directory
│   ├── routes/                # FastAPI routes are defined in this directory
│   ├── services/              # Business logic services are defined in this directory
│   ├── storage_engines/       # Login and interfaces for data persistance is defined in this directory
│   ├── constants.py           # Application wide constants are defined in this file
│   ├── main.py                # The main application entry point
│   ├── models.py              # Models and DTOs are defined in this file
│   └── seed.py                # Handles user seeding (administrators only!)
│
├── frontend/
│   ├── public                 # Public assests
│   └── src                    # Application sources
│       ├── assets/            # Public assets used by the application
│       ├── components/        # Custom components are defined in this directory
│       ├── contexts/          # Custom contexts are defined in this directory
│       ├── hooks/             # Custom hooks are defined in this directory
│       ├── layouts/           # Application wide layouts will be defined in here
│       ├── models/            # Models for data transfer are defined in this directory
│       ├── pages/             # Application pages are defined in this directory
│       ├── services/          # Business logic services are defined in this directory
│       ├── App.css            # Application wide custom styles
│       ├── App.tsx            # Application
│       ├── Constnats.ts       # Application wide constants are defined in this file
│       ├── index.css          # Base styles are deined in this file
│       └── main.tsx           # Main application entry point
│
├── storage/
└── seed.sh
```
