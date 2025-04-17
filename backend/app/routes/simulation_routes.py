"""
Routes for simulation endpoints in the CyberSecurity Simulation Platform.
"""
from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Dict, Any

from ..models.simulation import SimulationInfo, HastadAttackRequest, HastadAttackResponse, CBCPaddingOracleResponse
from ..services.simulation_service import SimulationService

router = APIRouter(
    prefix="/simulations",
    tags=["simulations"],
)

# Dependency to get the simulation service
def get_simulation_service():
    return SimulationService()


@router.get("/", response_model=List[SimulationInfo])
async def get_simulations(service: SimulationService = Depends(get_simulation_service)):
    """
    Get a list of all available simulations.
    """
    return service.get_all_simulations()


@router.get("/{simulation_id}", response_model=SimulationInfo)
async def get_simulation_info(
    simulation_id: str,
    service: SimulationService = Depends(get_simulation_service)
):
    """
    Get detailed information about a specific simulation.
    """
    try:
        return service.get_simulation_by_id(simulation_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/hastad-attack/run", response_model=HastadAttackResponse)
async def run_hastad_attack(
    request: HastadAttackRequest,
    service: SimulationService = Depends(get_simulation_service)
):
    """
    Run a Håstad's Attack simulation with the provided parameters.
    """
    try:
        return service.run_hastad_attack(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")


@router.post("/{simulation_id}/run-async", response_model=Dict[str, str])
async def run_simulation_async(
    simulation_id: str,
    params: Dict[str, Any],
    service: SimulationService = Depends(get_simulation_service)
):
    """
    Run a simulation asynchronously with the provided parameters.
    Returns a task ID that can be used to check the status.
    """
    try:
        return service.run_simulation_async(simulation_id, params)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")


@router.get("/tasks/{task_id}", response_model=Dict[str, Any])
async def get_task_status(
    task_id: str,
    service: SimulationService = Depends(get_simulation_service)
):
    """
    Get the status of an asynchronous simulation task.
    """
    try:
        return service.get_task_status(task_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting task status: {str(e)}")


@router.post("/cbc-padding-oracle/run", response_model=CBCPaddingOracleResponse)
async def run_cbc_padding_oracle(
    params: Dict[str, Any] = Body(...),
    service: SimulationService = Depends(get_simulation_service)
):
    """
    Run a CBC Padding Oracle simulation with the provided parameters.
    """
    try:
        return service.run_cbc_padding_oracle(params)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")