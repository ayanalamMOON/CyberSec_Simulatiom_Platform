# Architecture Guide

## Technical Architecture Overview

The Cybersecurity Simulation Platform is designed with a modern, scalable architecture that separates concerns into distinct layers while maintaining clear communication channels between components. This document details the architectural decisions, patterns, and how the various components interact.

## High-Level Architecture

The platform follows a client-server architecture with the following major components:

1. **Client Layer** - React TypeScript frontend application
2. **API Layer** - FastAPI-based RESTful API
3. **Service Layer** - Business logic and simulation orchestration
4. **Execution Layer** - Simulation execution engine
5. **Data Layer** - Redis for task queues and caching

### Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐    │
│  │ React         │    │ Visualization │    │ Monaco        │    │
│  │ Components    │    │ Engine (D3.js)│    │ Code Editor   │    │
│  └───────────────┘    └───────────────┘    └───────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                           API LAYER                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐    │
│  │ FastAPI       │    │ WebSocket     │    │ Authentication│    │
│  │ Endpoints     │    │ Server        │    │ & Authorization│   │
│  └───────────────┘    └───────────────┘    └───────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐    │
│  │ Simulation    │    │ Task          │    │ Result        │    │
│  │ Service       │    │ Manager       │    │ Formatter     │    │
│  └───────────────┘    └───────────────┘    └───────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                      EXECUTION LAYER                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐    │
│  │ Execution     │    │ Simulation    │    │ Step          │    │
│  │ Engine        │    │ Implementations│   │ Tracker       │    │
│  └───────────────┘    └───────────────┘    └───────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐    │
│  │ Redis Cache   │    │ Redis Queue   │    │ File Storage  │    │
│  │               │    │               │    │ (Optional)    │    │
│  └───────────────┘    └───────────────┘    └───────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Component Interactions

### Frontend Architecture

The React frontend follows a component-based architecture with:

1. **Pages** - Route-specific views (SimulationLibraryPage, HastadAttackPage, etc.)
2. **Components** - Reusable UI elements (Navbar, SimulationForm, TaskStatusTracker, etc.)
3. **Contexts** - State management (VisualizationContext, EditorContext)
4. **API Clients** - Communication with backend (simulationApi.ts)
5. **Visualizations** - Interactive visual representations of simulations
6. **Editors** - Interactive code and text editors

```
src/
├── pages/                 # Route-specific components
├── components/            # Shared UI components
├── visualizations/        # D3.js visualizations
│   └── components/        # Visualization-specific components
├── editor/                # Monaco editor integration
├── api/                   # API client modules
└── utils/                 # Helper utilities
```

### Backend Architecture

The backend follows a layered architecture:

1. **Routes Layer** - API endpoints and request handling
2. **Service Layer** - Business logic and orchestration
3. **Model Layer** - Data models and schemas
4. **Engine Layer** - Simulation execution logic
5. **Simulation Layer** - Individual simulation implementations

```
app/
├── routes/                # API endpoint definitions
├── services/              # Business logic services
├── models/                # Pydantic data models
└── engine/                # Execution engine components
    ├── execution_engine.py
    ├── simulation_runner.py
    └── task_manager.py
```

## Design Patterns

The platform implements several design patterns:

1. **Repository Pattern** - Data access abstraction
2. **Service Pattern** - Business logic encapsulation
3. **Factory Pattern** - Dynamic simulation instantiation
4. **Observer Pattern** - Real-time updates via WebSockets
5. **Strategy Pattern** - Interchangeable simulation algorithms
6. **Decorator Pattern** - For cross-cutting concerns like logging and caching

## Communication Protocols

### REST API

The platform provides a RESTful API with the following primary endpoints:

- `GET /api/simulations` - List available simulations
- `GET /api/simulations/{id}` - Retrieve simulation details
- `POST /api/simulations/{id}/execute` - Execute a simulation with parameters
- `GET /api/tasks/{task_id}` - Check task status and retrieve results

### WebSockets

WebSockets are used for real-time updates:
- Task progress updates
- Intermediate simulation results
- Live visualization data

## Redis Usage

Redis serves multiple purposes within the architecture:

1. **Task Queue** - Background task processing for long-running simulations
2. **Caching** - Caching of simulation results and frequent queries
3. **Pub/Sub** - Real-time event broadcasting
4. **Rate Limiting** - API rate limiting for security

## Security Architecture

The platform implements multiple security measures:

1. **Input Validation** - All user inputs are validated with Pydantic models
2. **Rate Limiting** - Protection against brute force and DoS attacks
3. **CORS Configuration** - Control over cross-origin requests
4. **Content Security Policy** - Protection against XSS attacks
5. **Parameter Sanitization** - Protection against injection attacks

## Scalability Considerations

The architecture is designed with scalability in mind:

1. **Stateless API** - Allows for horizontal scaling
2. **Containerization** - Docker-based deployment enables easy scaling
3. **Background Processing** - Long-running tasks are offloaded to worker processes
4. **Caching Strategy** - Reduces database load
5. **Microservices-Ready** - Components can be separated into individual services

## Technology Decisions

### Frontend
- **React** - Component-based architecture for UI
- **TypeScript** - Type safety and developer experience
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **D3.js** - Complex data visualizations
- **Monaco Editor** - Rich code editing experience

### Backend
- **FastAPI** - Modern, high-performance Python web framework
- **Uvicorn** - ASGI server for FastAPI
- **Pydantic** - Data validation and settings management
- **Redis** - In-memory data store and task queue
- **Python Cryptography Libraries** - For simulation implementations

## Future Architecture Considerations

1. **Authentication System** - OAuth2 or JWT-based user authentication
2. **Database Integration** - Persistent storage for user progress and custom simulations
3. **Containerized Execution Environment** - Isolated execution of user-submitted code
4. **Microservices Split** - Separation of concerns into distinct services
5. **CDN Integration** - For content delivery optimization

## Conclusion

The Cybersecurity Simulation Platform architecture is designed to provide a seamless, interactive experience while maintaining security, scalability, and extensibility. By separating concerns into distinct layers and using modern design patterns, the platform can grow to accommodate new simulation types and educational features.

For implementation details of specific components, refer to the [Developer Guide](04_developer_guide.md) and [API Documentation](05_api_documentation.md).