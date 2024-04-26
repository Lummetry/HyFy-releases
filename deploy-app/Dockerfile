# Build stage for React frontend
FROM node:18-alpine as react-build

# Set the working directory in the container
WORKDIR /app/frontend

# Copy the frontend directory contents into the container
COPY src/frontend/ .

# Install npm dependencies and build the React app
RUN npm install
RUN npm run build

# Python stage for FastAPI backend
FROM python:3.10.13-slim

# Set the working directory in the container
WORKDIR /app

# Copy the FastAPI application code and the requirements.txt file to the container
COPY src/backend/ ./backend
COPY requirements.txt .
COPY src/seed.sh ./seed.sh

RUN apt update && apt upgrade -y && apt install -y git

# Install the necessary Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the React build from the previous stage
COPY --from=react-build /app/frontend/dist /app/frontend/dist

# Copy the entrypoint script
ADD ver.txt .
ADD entrypoint.sh .
RUN chmod +x entrypoint.sh

# Set the entrypoint script to run before the application starts
ENTRYPOINT ["./entrypoint.sh"]

# Set the command to run the application
# Make sure the FastAPI app is configured to serve the static files from the React build directory
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--reload"]
