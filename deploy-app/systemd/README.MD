# Kubernetes Synchronization Script

## Overview
This set of scripts is designed to automate the deployment synchronization process in a Kubernetes cluster. It continuously checks for updates in a Git repository and applies the latest image versions to the specified Kubernetes deployments.

## Components
- `config.yaml`: Configuration file containing repository information and deployment details.
- `update-k8s-deployments.sh`: Main script that performs the synchronization based on `config.yaml`.
- `install.sh`: Installation script to set up the synchronization script as a system service.
- `update-k8s-deployments.service.template`: Systemd service template for the synchronization service.

## Configuration (`config.yaml`)
This file specifies the Git repository and the deployments to synchronize.
```yaml
repository: git@github.com:Lummetry/HyFy-releases.git
deployments:
  - application: optizone
    environment: staging
    directory_name: optizone
    backend_deployment_name: optiz-be-app
    frontend_deployment_name: optiz-fe
    namespace: hyfy
  - application: preventics
    environment: staging
    directory_name: preventics
    backend_deployment_name: prevx-be-app
    frontend_deployment_name: prevx-fe
    namespace: hyfy
```

## Script (update-k8s-deployments.sh)
This is the main script that checks the config.yaml file, clones/pulls the Git repository, compares the image versions, and updates the Kubernetes deployments accordingly.

## Installation (install.sh)
This script installs update-k8s-deployments.sh as a systemd service, using the update-k8s-deployments.service.template file.

## Usage
1. Ensure you have kubectl, git, and yq installed on your system.
2. Place the update-k8s-deployments.sh, install.sh, config.yaml, and update-k8s-deployments.service.template in the same directory.
3. Run install.sh to set up the service:
```bash
   ./install.sh
```

This will:
* Modify the service template with the correct paths.
* Install and start the synchronization service.

## Running the Script
Once installed, the synchronization script will run as a service, continuously monitoring the specified Git repository and updating the Kubernetes deployments as defined in `config.yaml`.

## Logs
Use journalctl to view the logs for the synchronization service:

```bash
journalctl -u update-k8s-deployments.service
```

## Customization
Modify config.yaml to add or remove deployments from the synchronization process. You can also adjust the iteration_interval in update-k8s-deployments.sh to change how frequently the script checks for updates.
