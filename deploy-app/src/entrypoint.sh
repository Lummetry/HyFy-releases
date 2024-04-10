#!/bin/bash

# Replace placeholders with environment variable values in JavaScript files
sed -i "s|__REACT_APP_API_URL__|${REACT_APP_API_URL}|g" /app/frontend/dist/assets/*.js

# Execute the passed command
exec "$@"
