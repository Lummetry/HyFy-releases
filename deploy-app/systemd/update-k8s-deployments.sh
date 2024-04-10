#!/bin/bash

# Configuration
config_file="./config.yaml"
iteration_interval=3600  # Interval in seconds between each iteration

# Clone or pull repository to the specified path
clone_or_pull_repo() {
    local repository=$1
    local clone_path=$2

    if [ -d "$clone_path/.git" ]; then
        echo "Repository exists. Pulling the latest changes..."
        git -C "$clone_path" pull
    else
        echo "Cloning the repository..."
        git clone "$repository" "$clone_path"
    fi
}

# Update Kubernetes deployment with new images
update_k8s_deployment() {
    local deployment_name=$1
    local image=$2
    local namespace=$3

    echo "Updating deployment $deployment_name in namespace $namespace with image $image"
    kubectl set image deployment/"$deployment_name" *="$image" -n "$namespace"
}

# Extract version number from the input string and update the deployment
extract_version() {
    local input_string=$1
    local deployment_name=$2
    local variable_name=$3

    # Extract the version number using a more general pattern
    version=$(echo "$input_string" | sed 's/.*-\([0-9]*\.[0-9]*\.[0-9]*\)$/\1/')

    echo "Version: $version"
    # Update the deployment with the new version
    set_environment_variable "$deployment_name" "$variable_name" "$version" "$namespace"
}

# Set environment variable for the deployment
set_environment_variable() {
    local deployment_name=$1
    local variable_name=$2
    local variable_value=$3
    local namespace=$4

    echo "Setting environment variable $variable_name=$variable_value for deployment $deployment_name in namespace $namespace"
    kubectl set env deployment/"$deployment_name" --env="$variable_name=$variable_value" -n "$namespace"
}

# Main function to update deployment based on the configuration
update_deployment() {
    local environment=$1
    local repository=$2
    local directory_name=$3
    local backend_deployment_name=$4
    local frontend_deployment_name=$5
    local namespace=$6

    local clone_path="${PWD}/updates/"
    local release_file="${clone_path}/${directory_name}/release.yaml"

    # Clone or pull the repository
    clone_or_pull_repo "$repository" "$clone_path"

    # Exit if the release file does not exist
    if [ ! -f "$release_file" ]; then
        echo "Release file not found: $release_file"
        exit 1
    fi

    local current_version=$(yq eval ".application.envs.${environment}" "$release_file")
    local previous_version_file="${PWD}/previous_version_${environment}_${directory_name}.txt"
    local previous_version="0.0.0"

    if [ -f "$previous_version_file" ]; then
        previous_version=$(cat "$previous_version_file")
    fi

    if [ "$current_version" != "$previous_version" ]; then
        local backend_image=$(yq eval ".application.versions[\"${current_version}\"].backend.image" "$release_file")
        local frontend_image=$(yq eval ".application.versions[\"${current_version}\"].frontend.image" "$release_file")
        local release_summary=$(yq eval ".application.versions[\"${current_version}\"].summary" "$release_file")

        if [[ "$backend_image" == "null" ]] || [[ "$frontend_image" == "null" ]]; then
            echo "Error: Could not find backend or frontend image in the release file."
            exit 1
        fi
        
        # Update the deployment with the new images
        echo "Updating deployment for $environment with version $current_version"
        update_k8s_deployment "$backend_deployment_name" "$backend_image" "$namespace"
        update_k8s_deployment "$frontend_deployment_name" "$frontend_image" "$namespace"

        # Apply the version number to the deployment
        extract_version "$frontend_image" "$frontend_deployment_name" "UI_VERSION"
        extract_version "$backend_image" "$frontend_deployment_name" "API_VERSION"

        # Set the pseudo version and release summary
        set_environment_variable "$frontend_deployment_name" "PSEUDO_VERSION" "$current_version" "$namespace"
        set_environment_variable "$frontend_deployment_name" "RELEASE_SUMMARY" "$release_summary" "$namespace"

        echo "$current_version" > "$previous_version_file"
    else
        echo "No version change detected for $environment."
    fi
}

# Loop through deployments defined in the configuration file
while true; do
    num_deployments=$(yq eval '.deployments | length' "$config_file")

    for ((i = 0; i < num_deployments; i++)); do
        environment=$(yq eval ".deployments[$i].environment" "$config_file")
        repository=$(yq eval ".repository" "$config_file")
        directory_name=$(yq eval ".deployments[$i].directory_name" "$config_file")
        backend_deployment_name=$(yq eval ".deployments[$i].backend_deployment_name" "$config_file")
        frontend_deployment_name=$(yq eval ".deployments[$i].frontend_deployment_name" "$config_file")
        namespace=$(yq eval ".deployments[$i].namespace" "$config_file")

        update_deployment "$environment" "$repository" "$directory_name" \
                          "$backend_deployment_name" "$frontend_deployment_name" "$namespace"
    done

    echo "Waiting for the next iteration..."
    sleep $iteration_interval
done
