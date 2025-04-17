# API Documentation

## Overview

The Cybersecurity Simulation Platform exposes a RESTful API for managing and executing cybersecurity simulations. This document describes the available endpoints, request/response formats, authentication, and usage examples.

## Base URL

- Local development: `http://localhost:8000/api/`
- Production: `https://your-domain.com/api/`

## Authentication

Currently, the API is open for local development. For production, consider implementing authentication (e.g., JWT or OAuth2) for protected endpoints.

## Endpoints

### 1. List Available Simulations

- **GET** `/api/simulations`

**Description:**
Returns a list of all available simulations with metadata.

**Response Example:**
```json
[
  {
    "id": "hastad_attack",
    "name": "Håstad's Broadcast Attack",
    "description": "Demonstrates the vulnerability of RSA with small exponents.",
    "parameters": [ ... ]
  },
  ...
]
```

---

### 2. Get Simulation Details

- **GET** `/api/simulations/{simulation_id}`

**Description:**
Returns detailed information about a specific simulation, including required parameters.

**Response Example:**
```json
{
  "id": "cbc_padding_oracle",
  "name": "CBC Padding Oracle",
  "description": "Shows how padding validation errors can be exploited.",
  "parameters": [
    {
      "name": "ciphertext",
      "type": "string",
      "label": "Ciphertext (hex)",
      "required": true
    },
    ...
  ]
}
```

---

### 3. Execute a Simulation

- **POST** `/api/simulations/{simulation_id}/execute`

**Description:**
Submits parameters to run a simulation. Returns a task ID for asynchronous result fetching.

**Request Example:**
```json
{
  "parameters": {
    "ciphertext": "...",
    "key": "..."
  }
}
```

**Response Example:**
```json
{
  "task_id": "abc123",
  "status": "pending"
}
```

---

### 4. Get Task Status & Results

- **GET** `/api/tasks/{task_id}`

**Description:**
Fetches the status and results of a simulation execution.

**Response Example (pending):**
```json
{
  "task_id": "abc123",
  "status": "pending"
}
```

**Response Example (completed):**
```json
{
  "task_id": "abc123",
  "status": "completed",
  "result": {
    "output": "...",
    "steps": [ ... ],
    "visualization_data": { ... }
  }
}
```

---

### 5. WebSocket for Real-Time Updates

- **URL:** `ws://localhost:8000/ws/tasks/{task_id}`

**Description:**
Subscribe to real-time updates for a simulation task (progress, intermediate results).

**Message Example:**
```json
{
  "event": "progress",
  "step": 3,
  "total_steps": 10,
  "message": "Decrypting block 3..."
}
```

---

## Error Handling

All error responses follow this format:
```json
{
  "detail": "Error message here."
}
```

Common error codes:
- 400: Bad request (invalid parameters)
- 404: Not found (invalid simulation or task ID)
- 500: Internal server error

## Example Usage

### Python (requests)
```python
import requests

# List simulations
resp = requests.get('http://localhost:8000/api/simulations')
print(resp.json())

# Execute a simulation
payload = {"parameters": {"ciphertext": "...", "key": "..."}}
resp = requests.post('http://localhost:8000/api/simulations/hastad_attack/execute', json=payload)
task_id = resp.json()["task_id"]

# Poll for results
while True:
    status = requests.get(f'http://localhost:8000/api/tasks/{task_id}').json()
    if status["status"] == "completed":
        print(status["result"])
        break
```

### JavaScript (fetch)
```js
// List simulations
fetch('/api/simulations')
  .then(res => res.json())
  .then(data => console.log(data));

// Execute a simulation
fetch('/api/simulations/hastad_attack/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ parameters: { ciphertext: '...', key: '...' } })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## OpenAPI/Swagger Docs

Interactive API documentation is available at:
- `http://localhost:8000/docs`

## Extending the API

To add new endpoints or simulations, see the [Developer Guide](04_developer_guide.md).
