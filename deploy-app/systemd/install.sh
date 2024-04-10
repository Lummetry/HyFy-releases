#!/bin/bash

# Get the current working directory
current_dir=$(pwd)

# The name of your service and script
service_name="update-k8s-deployments"
script_name="update-k8s-deployments.sh"
config_file="config.yml"
service_template="${service_name}.service.template"
service_file="/etc/systemd/system/${service_name}.service"

# Check if the service template file exists
if [ ! -f "$current_dir/$service_template" ]; then
    echo "Service template file not found: $service_template"
    exit 1
fi

# Replace the placeholder in the service file template with the actual path
sed "s|/path/to|$current_dir|g" "$current_dir/$service_template" > "$service_file"

# Ensure the script and config file are present and executable
if [ ! -f "$current_dir/$script_name" ] || [ ! -f "$current_dir/$config_file" ]; then
    echo "Script or config file not found in $current_dir"
    exit 1
fi

# Make the script executable
chmod +x "$current_dir/$script_name"

# Reload systemd to recognize the new service
systemctl daemon-reload

# Enable and start the service
systemctl enable "$service_name"
systemctl start "$service_name"

echo "Service $service_name has been installed and started."
