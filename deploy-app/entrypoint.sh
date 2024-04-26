#!/bin/bash

APP_VER=$(cat ver.txt)

# Replace placeholders with environment variable values in JavaScript files
sed -i "s|__REACT_APP_API_URL__|${REACT_APP_API_URL}|g" /app/frontend/dist/assets/*.js

sed -i "s|__REACT_APP_VER__|${APP_VER}|g" /app/frontend/dist/assets/*.js

# Execute the passed command
exec "$@"
