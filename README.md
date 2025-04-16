# CyberSecurity Simulation Platform

An interactive web-based platform for learning and solving real-world cybersecurity problems through visual simulations.

## Project Vision

### Goal
- Learn and solve real-world cybersecurity problems (e.g., attacks, cryptanalysis, network vulnerabilities)
- Visualize simulations (e.g., cryptographic attacks, packet analysis, penetration testing)
- Interact with step-by-step guides, terminals, and graph animations

## Tech Stack

### Frontend (Interactive UI)
- React.js + TypeScript – modular, component-based UI
- TailwindCSS – fast, customizable styling
- Framer Motion or D3.js – for animations and graph visualizations
- Monaco Editor – interactive code editor in-browser

### Backend
- FastAPI (Python) – perfect for serving Python-based simulations & logic
- Celery + Redis – for background simulations (e.g., running attack modules)
- Docker – containerized sandbox environments for code execution

### Other Tools
- Socket.IO or WebSockets – for live updates of simulations
- Jupyter Kernel Gateway (optional) – for real-time Python cells like Jupyter

## Key Features

1. **Problem Library Module**
   - Categorized problems (e.g., RSA Attacks, AES Oracles, Web Exploits)
   - Each problem has: difficulty, tags, explanation, "Launch Simulation" button

2. **Simulation Engine**
   - Backend runs simulations like Håstad's Attack, CBC Oracle, etc.
   - Input: keys, ciphertexts
   - Output: logs, step-by-step visual trace, graphs

3. **Graphical Visualizer**
   - Network packet flow
   - Modular exponentiation tree
   - RSA CRT structure

4. **Interactive Terminal**
   - Run guided scripts (like a CTF)
   - Live output display (e.g., packet captures, decrypted messages)

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (v16+)
- Python 3.9+

### Installation
1. Clone the repository
2. Run `docker-compose up` to start all services
3. Access the platform at `http://localhost:3000`

## Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Folder Structure
```
/cyber-sim-platform
├── backend/
│   ├── app/
│   │   ├── main.py (FastAPI)
│   │   ├── routes/
│   │   ├── services/
│   │   └── models/
│   └── simulations/
│       └── hastad_attack.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── visualizations/
│   │   └── editor/ (code editor or sandbox)
├── docs/
├── notebooks/ (demos or testing)
├── docker-compose.yml
├── README.md
```

## Screenshots Showcase

### Simulation Results
![Simulation Results](Screenshot%202025-04-17%20004051.png)
*Learn cybersecurity through interactive simulations with our platform*

### Interactive Attack Simulation
![Håstad's Broadcast Attack](Screenshot%202025-04-17%20004114.png)
*Popular cybersecurity simulations including RSA attacks, padding oracles, and MitM visualizations*

### Cybersecurity Simulations Library
![Simulations Library](Screenshot%202025-04-17%20004130.png)
*Browse our comprehensive collection of interactive cybersecurity simulations*

### Featured Simulations 
![Featured Simulations](Screenshot%202025-04-17%20004152.png)
*Håstad's broadcast attack simulation interface with parameters*

### Platform Homepage
![Platform Homepage](Screenshot%202025-04-17%20004618.png)
*Håstad's Broadcast Attack simulation showing original and recovered messages*

## Project Roadmap (Contributor-Friendly)

Here’s a roadmap that can be converted into GitHub issues or documentation:

### Phase 1: MVP (April–May)
- Build React app structure
- Design Håstad’s Attack simulation UI
- Backend FastAPI endpoint for Håstad’s Attack
- Graphical Visualizer module with D3.js
- Problem Library Page
- Simulation execution engine
- Dockerize backend sandbox

### Phase 2: Expansion (June)
- Add more attacks: CBC Oracle, Fermat’s, Bleichenbacher
- Add interactive terminal + logs
- User login + progress save
- Community problem contributions

### Phase 3: Learning Platform (July)
- Add guided tutorials
- Capture-the-flag styled labs
- Export simulations as GIFs/videos
- Certificate integration
