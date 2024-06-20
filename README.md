# Hyfy Releases Repository README.md

## Grant Announcement

This repository was made possible through the generous support of the research grant obtained from the project:

“156084 ReDeN - Decentralized Neural Network for the Analysis and Inference of Video Streams through Deep Learning Techniques, Energy Efficiency, and Positive Environmental Impact.”

This project was financed through:

Action 1.2.1 - Stimulating the Demand for Innovation in Enterprises through R&D Projects Conducted by Individual Enterprises or in Partnership with R&D Institutes and Universities, Aiming at Process and Product Innovation in Economic Sectors with Growth Potential.

Call for Projects No. 2, Innovative Technological Project, Competition 2022, Call Code: POC/1033/1/3/Stimulating the Demand for Innovation in Enterprises through R&D Projects Conducted by Individual Enterprises or in Partnership with R&D Institutes and Universities, Aiming at Process and Product Innovation in Economic Sectors with Growth Potential.

We express our gratitude for the funding and support that made this research and de


## Overview

Welcome to the Hyfy Releases Repository, the central hub for managing and orchestrating releases across Hyfy's diverse software landscape. This repository is designed to streamline the release processes for our applications, ensuring consistency, reliability, and efficiency in how we deploy updates and manage versions across various environments.

The repository is structured to support multiple types of applications, specifically targeting:
- Edge devices (`e2`)
- Kubernetes-based applications (`optizone` and `preventics`)

Each application or component within our ecosystem has its dedicated directory containing a `release.yaml` file. These files are pivotal in defining the desired state and versioning information for deployments.

## Repository Structure

```
.
├── e2
│   └── release.yaml
├── optizone
│   └── release.yaml
├── preventics
│   └── release.yaml
└── deploy-app
```

## Deploy app
This is the front-end / back-end application that will handle users request, make changes to manifests and applyies them
Please reference the documentation at [README.md](deploy-app/README.MD)

### `e2/release.yaml` for Edge Devices

- **Purpose**: Manages the software lifecycle on edge devices, including version updates and deployments.
- **Approach**: Utilizes GitHub Actions to automatically retag images with semantic versioning to a human-readable format and pushes updated versions to the designated edge device registry.

```yaml
application:
  name: Execution Engine
  ## Types:
  ## - "k8s" (Kubernetes) - for applications deployed on Kubernetes - no retagging but rather
  ##                      update is done by changing the image tag
  ## - "edge" - for applications deployed on edge devices - will retag the images with the edge tag
  ##          and push them to the edge registry. Version information is taken from target repo
  type: edge

  # this is the repo where to get the version tags from 
  git_repo: https://github.com/Lummetry/AiXp-EE.git

  # this is the DockerHub repository where the images are stored
  docker_repo: aixpand/exe_eng 

  envs:
  # when modified this file will trigger docker pull-tag-push for the specified version for each environment
    staging: 1.0.1
    qa: 1.0.1
    preprod: 1.0.1
    prod: 1.0.1
  
```

### `optizone/release.yaml` and `preventics/release.yaml` for Kubernetes Applications

- **Purpose**: Declares the current state of Kubernetes applications, focusing on the used image tags for backend and frontend components.
- **Approach**: Does not involve retagging. Instead, updates are directly reflected in the Kubernetes manifests or Helm charts for deployment to the respective clusters.

## Workflow

### Edge Devices (`e2`)

1. **Version Assignment**: The target version for each edge device image is declared in `release.yaml`.
2. **Automated Retagging**: GitHub Actions workflows are triggered to retag the specified versions to a more human-readable format (e.g., `prod`, `qa`).
3. **Deployment**: Updated images are pushed to the edge registry, from where they are deployed to the target devices.

### Kubernetes Applications (`optizone` and `preventics`)

1. **Version Declaration**: The `release.yaml` files specify the current versions of backend and frontend components for each environment (staging, qa, preprod, prod).
2. **Manifests/Charts Update**: CI/CD pipelines use the version information to update Kubernetes manifests or Helm charts.
3. **Deployment**: Updated manifests or charts are applied to the target Kubernetes clusters, rolling out the specified versions.

## Best Practices

- **Version Control**: Always use semantic versioning for clarity and consistency.
- **Change Management**: Utilize pull requests for any changes to `release.yaml` files to ensure review and approval processes are followed.
- **Security**: Secure your CI/CD pipelines and GitHub Actions workflows. Use secrets for credentials and implement role-based access control where applicable.


## License

Copyright © 2024 Hyperfy Inc. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

- Redistributions of source code must retain the above copyright notice, this list of conditions, and the following disclaimer.

- Redistributions in binary form must reproduce the above copyright notice, this list of conditions, and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

