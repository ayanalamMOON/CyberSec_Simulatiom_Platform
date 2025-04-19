"""
Main application module for the CyberSecurity Simulation Platform API.
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import simulation_routes, challenge_routes

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

# Create FastAPI application
app = FastAPI(
    title="CyberSecurity Simulation Platform API",
    description="API for running interactive cybersecurity simulations",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(simulation_routes.router)
app.include_router(challenge_routes.router)


@app.get("/")
async def root():
    """Root endpoint to verify API is running."""
    return {
        "message": "Welcome to the CyberSecurity Simulation Platform API",
        "documentation": "/docs",
        "simulations": "/simulations",
        "challenges": "/challenges",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}
