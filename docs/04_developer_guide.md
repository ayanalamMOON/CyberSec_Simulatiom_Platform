# Developer Guide

## Contributing to the Cybersecurity Simulation Platform

This guide provides comprehensive information for developers who want to contribute to, extend, or modify the Cybersecurity Simulation Platform. It covers development environment setup, codebase organization, contribution workflows, and best practices.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Backend Development](#backend-development)
4. [Frontend Development](#frontend-development)
5. [Creating New Simulations](#creating-new-simulations)
6. [Testing](#testing)
7. [Style Guidelines](#style-guidelines)
8. [Contribution Workflow](#contribution-workflow)

## Development Environment Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Docker and Docker Compose** (recommended method)
- **Git** for version control
- **Node.js** v16+ and npm v8+ (for frontend development)
- **Python** 3.9+ (for backend development)
- **Code editor** (VS Code recommended with Python and React extensions)

### Setting Up the Development Environment

#### Option 1: Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd CyberSec_Simulatiom_Platform
   ```

2. Start the development containers:
   ```bash
   docker-compose up
   ```
   
   This will start all services defined in `docker-compose.yml`:
   - Frontend: React development server on http://localhost:3000
   - Backend: FastAPI server on http://localhost:8000
   - Redis: Cache and task queue on port 6379
   - Jupyter: Notebook server on http://localhost:8888

3. Access the services:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Jupyter Notebook: http://localhost:8888

#### Option 2: Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd CyberSec_Simulatiom_Platform
   ```

2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. Start Redis:
   ```bash
   # Install Redis locally or use Docker
   docker run -p 6379:6379 redis:alpine
   ```

## Project Structure

The project is organized into several key directories:

```
/CyberSec_Simulatiom_Platform
├── backend/               # FastAPI backend service
│   ├── app/               # Main application code
│   │   ├── main.py        # Application entry point
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data models
│   │   └── engine/        # Simulation execution engine
│   ├── simulations/       # Individual simulation implementations
│   ├── Dockerfile         # Docker configuration for backend
│   └── requirements.txt   # Python dependencies
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── visualizations/# D3.js visualizations
│   │   ├── api/           # API client code
│   │   ├── editor/        # Code editor components
│   │   └── utils/         # Utility functions
│   ├── Dockerfile         # Docker configuration for frontend
│   └── package.json       # Node.js dependencies
├── notebook/              # Jupyter notebooks
│   └── Dockerfile         # Docker configuration for Jupyter
├── docs/                  # Documentation
├── docker-compose.yml     # Docker services configuration
└── README.md              # Project overview
```

## Backend Development

### FastAPI Application Structure

The backend follows a modular design pattern:

#### Main Application (`app/main.py`)

The entry point that configures and starts the FastAPI application.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import simulation_routes

app = FastAPI(
    title="Cybersecurity Simulation Platform API",
    description="API for running cybersecurity simulations",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(simulation_routes.router)
```

#### Routes (`app/routes/`)

Define API endpoints and handle HTTP requests.

```python
# Example from simulation_routes.py
from fastapi import APIRouter, BackgroundTasks, HTTPException
from ..services.simulation_service import SimulationService
from ..models.simulation import SimulationRequest, SimulationResponse

router = APIRouter(prefix="/api/simulations", tags=["simulations"])

@router.post("/{simulation_id}/execute")
async def execute_simulation(
    simulation_id: str, 
    request: SimulationRequest, 
    background_tasks: BackgroundTasks
):
    # Implementation
    pass
```

#### Services (`app/services/`)

Contain business logic and orchestrate operations.

#### Models (`app/models/`)

Define data structures using Pydantic models.

#### Engine (`app/engine/`)

Core simulation execution components.

### Adding a New API Endpoint

1. Identify the appropriate router file in `app/routes/` or create a new one
2. Define the endpoint function with proper typing and documentation
3. Implement the business logic or delegate to a service class
4. Add appropriate error handling
5. Update any necessary models in `app/models/`

### Working with Redis

The platform uses Redis for task queuing and caching:

```python
# Example of task queuing
from .engine.task_manager import TaskManager

task_manager = TaskManager(redis_url="redis://redis:6379")

# Queue a task
task_id = await task_manager.enqueue_task("hastad_attack", params)

# Check task status
status = await task_manager.get_task_status(task_id)

# Get task result
result = await task_manager.get_task_result(task_id)
```

## Frontend Development

### React Application Structure

The frontend is built with React, TypeScript, and various supporting libraries:

#### Entry Point (`src/index.tsx`)

Renders the root React component.

#### Application Root (`src/App.tsx`)

Defines the main layout and routing structure.

#### Pages (`src/pages/`)

Contains components for different pages/routes.

#### Components (`src/components/`)

Reusable UI components used across pages.

#### API Client (`src/api/simulationApi.ts`)

Handles communication with the backend API:

```typescript
// Example API function
export async function executeSimulation(
  simulationId: string, 
  params: SimulationParams
): Promise<TaskResponse> {
  const response = await fetch(`${API_URL}/api/simulations/${simulationId}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  return await response.json();
}
```

#### Visualizations (`src/visualizations/`)

D3.js visualization components.

### Adding a New Page

1. Create a new component file in `src/pages/`
2. Implement the component with appropriate hooks and state management
3. Add the page to the routing configuration in `App.tsx`
4. Create any necessary API client functions in `src/api/`

### Working with TypeScript

All frontend code should use TypeScript. Define interfaces for data structures:

```typescript
// Example type definitions
interface SimulationParameter {
  name: string;
  type: 'number' | 'string' | 'boolean';
  label: string;
  defaultValue: any;
  min?: number;
  max?: number;
  required: boolean;
}

interface Simulation {
  id: string;
  name: string;
  description: string;
  parameters: SimulationParameter[];
}
```

## Creating New Simulations

The platform is designed to be extensible with new simulation types. Here's how to add a new simulation:

### 1. Create the Simulation Implementation

Add a new Python file in `backend/simulations/`:

```python
# Example: new_simulation.py
from typing import Dict, Any, List

class NewSimulation:
    """
    Documentation for the simulation.
    """
    
    @staticmethod
    def get_parameters() -> List[Dict[str, Any]]:
        """Define the parameters required by this simulation."""
        return [
            {
                "name": "parameter_name",
                "type": "number",
                "label": "Human-readable label",
                "default_value": 123,
                "min": 1,
                "max": 1000,
                "required": True
            }
        ]
    
    @staticmethod
    async def execute(params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the simulation with the given parameters.
        Returns visualization data and results.
        """
        # Simulation implementation
        result = {}
        
        # Track steps for visualization
        steps = []
        
        # Perform simulation logic
        # ...
        
        # Return results
        return {
            "result": result,
            "steps": steps,
            "visualization_data": {
                # Data needed for visualization
            }
        }
```

### 2. Register the Simulation

Update the simulation registry to include your new simulation:

```python
# In app/engine/simulation_runner.py
from ...simulations.new_simulation import NewSimulation

SIMULATIONS = {
    "hastad_attack": HastadAttack,
    "cbc_padding_oracle": CBCPaddingOracle,
    "new_simulation": NewSimulation,  # Add your simulation here
}
```

### 3. Create Frontend Components

1. Create a simulation page in `frontend/src/pages/`:
   ```tsx
   // NewSimulationPage.tsx
   import React from 'react';
   import SimulationForm from '../components/SimulationForm';
   import { useParams } from 'react-router-dom';
   
   export default function NewSimulationPage() {
     const { id } = useParams();
     
     return (
       <div className="container mx-auto px-4 py-8">
         <h1 className="text-3xl font-bold mb-6">New Simulation</h1>
         <SimulationForm simulationId="new_simulation" />
       </div>
     );
   }
   ```

2. Create visualization components in `frontend/src/visualizations/`:
   ```tsx
   // NewSimulationVisualization.tsx
   import React, { useEffect, useRef } from 'react';
   import * as d3 from 'd3';
   
   interface NewSimulationProps {
     data: any;
   }
   
   export default function NewSimulationVisualization({ data }: NewSimulationProps) {
     const svgRef = useRef<SVGSVGElement>(null);
     
     useEffect(() => {
       if (!data || !svgRef.current) return;
       
       // D3.js visualization code
       // ...
     }, [data]);
     
     return <svg ref={svgRef} width="800" height="600" />;
   }
   ```

3. Add routing in `App.tsx`:
   ```tsx
   <Route path="/simulations/new_simulation" element={<NewSimulationPage />} />
   ```

## Testing

### Backend Testing

The backend uses pytest for testing:

```bash
# Run backend tests
cd backend
pytest
```

Example test structure:
```python
# tests/test_simulations/test_new_simulation.py
import pytest
from app.simulations.new_simulation import NewSimulation

@pytest.mark.asyncio
async def test_new_simulation_execution():
    # Arrange
    params = {
        "parameter_name": 123,
    }
    
    # Act
    result = await NewSimulation.execute(params)
    
    # Assert
    assert "result" in result
    assert "steps" in result
    assert isinstance(result["steps"], list)
```

### Frontend Testing

The frontend uses Jest and React Testing Library:

```bash
# Run frontend tests
cd frontend
npm test
```

Example test:
```typescript
// src/components/SimulationForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import SimulationForm from './SimulationForm';

test('renders simulation form with parameters', () => {
  render(<SimulationForm simulationId="new_simulation" />);
  
  expect(screen.getByText('Human-readable label')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /run simulation/i })).toBeInTheDocument();
});
```

## Style Guidelines

### Python Code Style

- Follow PEP 8 guidelines
- Use type hints for function parameters and return values
- Document classes and functions with docstrings
- Use async/await for I/O-bound operations

### TypeScript/React Code Style

- Use functional components with hooks
- Prefer named exports over default exports
- Use TypeScript interfaces for props and state
- Use CSS utility classes from TailwindCSS
- Follow the React component file structure:
  ```tsx
  import React from 'react';
  
  interface Props {
    // Props definition
  }
  
  export function ComponentName({ prop1, prop2 }: Props) {
    // Component implementation
    return (
      <div>
        {/* JSX content */}
      </div>
    );
  }
  ```

## Contribution Workflow

### Git Workflow

1. **Fork the repository** (for external contributors)
2. **Clone your fork** (or the main repository for core team)
   ```bash
   git clone <your-fork-url>
   cd CyberSec_Simulatiom_Platform
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/new-simulation
   ```

4. **Make your changes**
   - Implement the feature or fix
   - Add or update tests
   - Update documentation

5. **Run tests**
   ```bash
   # Backend tests
   cd backend && pytest
   
   # Frontend tests
   cd frontend && npm test
   ```

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add new simulation: XYZ attack"
   ```

7. **Push to your fork**
   ```bash
   git push origin feature/new-simulation
   ```

8. **Create a Pull Request** against the main repository

### Code Review Process

All contributions go through a code review process:

1. **Automated checks**:
   - Linting
   - Type checking
   - Test passing

2. **Manual review**:
   - Code quality and maintainability
   - Adherence to design patterns
   - Security considerations
   - Performance impact

3. **Approval and merge**:
   - At least one approval from a core maintainer
   - All CI checks passing
   - No merge conflicts

## Conclusion

This developer guide provides a foundation for contributing to the Cybersecurity Simulation Platform. By following these guidelines, you'll ensure that your contributions maintain the project's high standards for code quality, security, and user experience.

For any questions or clarifications, please reach out to the core development team or open an issue on the project repository.