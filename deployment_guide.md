# Deployment Guide for Cybersecurity Simulation Platform

This guide provides instructions for deploying the Cybersecurity Simulation Platform in different environments.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Local Development Deployment](#local-development-deployment)
3. [Production Deployment](#production-deployment)
4. [Configuration](#configuration)
5. [Maintenance](#maintenance)
6. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements
- Docker Engine 20.10.x or newer
- Docker Compose 2.0.0 or newer
- 4GB RAM
- 20GB available disk space
- Internet connection for pulling Docker images

### Recommended Requirements
- 8GB+ RAM
- 50GB+ available SSD storage
- 4+ CPU cores

## Local Development Deployment

### Prerequisites
1. Install [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
2. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd CyberSec_Simulatiom_Platform
   ```

### Start the Application
1. Run the following command to start all services:
   ```bash
   docker-compose up
   ```
   - This will build and start all containers defined in docker-compose.yml
   - The first build may take several minutes

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Jupyter Notebook: http://localhost:8888
   
3. To stop the application:
   ```bash
   # Press Ctrl+C if running in foreground, or
   docker-compose down
   ```

### Development Workflow
1. For frontend development:
   ```bash
   cd frontend
   npm install  # First time only
   npm start
   ```
   - Changes will automatically reload in the browser

2. For backend development:
   ```bash
   cd backend
   pip install -r requirements.txt  # First time only
   uvicorn app.main:app --reload
   ```
   - API docs available at http://localhost:8000/docs

## Production Deployment

### Option 1: Docker Compose (Single Server)

1. Clone the repository on your production server
2. Create a `.env` file for production settings:
   ```
   DEBUG=0
   REACT_APP_API_URL=https://your-domain.com/api
   REDIS_PASSWORD=secure-password-here
   ```

3. Update the docker-compose.yml for production:
   ```yaml
   # Add these changes to your existing docker-compose.yml or create docker-compose.prod.yml
   version: '3.8'
   
   services:
     backend:
       restart: always
       environment:
         - DEBUG=0
       # Add any production-specific settings
     
     frontend:
       restart: always
       environment:
         - REACT_APP_API_URL=https://your-domain.com/api
       # Use nginx to serve static files
     
     redis:
       restart: always
       environment:
         - REDIS_PASSWORD=${REDIS_PASSWORD}
       # Add volume for persistence
   ```

4. Deploy using docker-compose:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

5. Set up a reverse proxy (Nginx or Traefik) for HTTPS and routing:
   ```nginx
   # Example Nginx configuration
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$host$request_uri;
   }
   
   server {
       listen 443 ssl;
       server_name your-domain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location /api {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location /jupyter {
           proxy_pass http://localhost:8888;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```

### Option 2: Cloud Deployment (AWS)

#### Infrastructure Setup (AWS)
1. EC2 instance(s) for hosting the application
   - t3.medium or larger recommended
   - Amazon Linux 2 or Ubuntu Server 20.04
   
2. ElastiCache (Redis) for caching and task queue
   
3. ECS/Fargate (optional for container orchestration)
   
4. Application Load Balancer for traffic distribution
   
5. Route 53 for DNS management

#### Deployment Steps
1. Create an ECR repository for your Docker images:
   ```bash
   aws ecr create-repository --repository-name cybersec-platform
   ```

2. Build and push Docker images:
   ```bash
   docker-compose build
   aws ecr get-login-password | docker login --username AWS --password-stdin <your-aws-account>.dkr.ecr.<region>.amazonaws.com
   docker tag cybersec_frontend:latest <your-aws-account>.dkr.ecr.<region>.amazonaws.com/cybersec-platform:frontend
   docker tag cybersec_backend:latest <your-aws-account>.dkr.ecr.<region>.amazonaws.com/cybersec-platform:backend
   docker push <your-aws-account>.dkr.ecr.<region>.amazonaws.com/cybersec-platform:frontend
   docker push <your-aws-account>.dkr.ecr.<region>.amazonaws.com/cybersec-platform:backend
   ```

3. Create an ECS task definition and service
   - Use the AWS Console or CLI
   - Connect to ElastiCache for Redis
   - Set up appropriate IAM roles

4. Configure the Application Load Balancer
   - Create target groups for frontend and backend
   - Configure HTTPS listener
   - Set up path-based routing

## Configuration

### Environment Variables

#### Backend Service
- `DEBUG`: Set to 1 for development, 0 for production
- `SECRET_KEY`: For securing sessions and tokens
- `REDIS_HOST`: Redis server hostname
- `REDIS_PORT`: Redis server port (default: 6379)
- `REDIS_PASSWORD`: Password for Redis (if enabled)

#### Frontend Service
- `REACT_APP_API_URL`: URL for backend API
- `NODE_ENV`: Set to 'production' for production builds

#### Jupyter Service
- `JUPYTER_TOKEN`: For securing Jupyter access

### Persistent Storage

For production deployments, configure persistent storage:

1. Redis data:
   ```yaml
   volumes:
     redis_data:
       driver: local
       driver_opts:
         type: none
         device: /path/to/redis-data
         o: bind
   ```

2. Simulation data:
   ```yaml
   volumes:
     - /path/to/simulation-data:/app/data
   ```

## Maintenance

### Backups

1. Redis data:
   ```bash
   # SSH into the server
   docker exec -it redis redis-cli SAVE
   # Copy the dump.rdb file
   docker cp redis:/data/dump.rdb /backup/redis/dump.rdb
   ```

2. Application data (if any):
   ```bash
   docker cp backend:/app/data /backup/app-data/
   ```

### Updates

1. Pull the latest code:
   ```bash
   git pull origin main
   ```

2. Rebuild and restart containers:
   ```bash
   docker-compose down
   docker-compose build
   docker-compose up -d
   ```

### Monitoring

1. Container status:
   ```bash
   docker ps
   docker stats
   ```

2. Logs:
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

3. Consider integrating with monitoring tools:
   - Prometheus + Grafana
   - Datadog
   - New Relic

## Troubleshooting

### Common Issues

#### Connection Issues with Redis
- Check if Redis container is running: `docker ps | grep redis`
- Verify Redis connectivity:
  ```bash
  docker exec -it redis redis-cli ping
  ```
- Check Redis logs:
  ```bash
  docker-compose logs redis
  ```

#### Backend Service Not Starting
- Check for errors in logs:
  ```bash
  docker-compose logs backend
  ```
- Verify required environment variables are set
- Check if Redis is accessible from the backend container

#### Frontend Not Loading
- Check browser console for errors
- Verify the API URL is correctly set in environment variables
- Check if backend service is accessible

### Getting Help

For additional help or to report issues:
1. Review the project documentation in the `/docs` folder
2. Check the [GitHub Issues](https://github.com/your-repo/issues) page
3. Contact the development team