import axios from 'axios';

// Define base API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// API interfaces
export interface SimulationInfo {
  id: string;
  name: string;
  description: string;
  complexity: string;
  tags: string[];
}

export interface HastadAttackRequest {
  exponent: number;
  key_size: number;
  message?: number;
}

export interface HastadAttackResponse {
  original_message: string;
  recovered_message: string;
  success: boolean;
  recipients: Array<{
    p: string;
    q: string;
    n: string;
    d: string;
    index: number;
  }>;
  ciphertexts: string[];
  simulation_steps: Array<{
    step: string;
    description: string;
  }>;
}

// New interfaces for asynchronous operations
export interface TaskResponse {
  task_id: string;
}

export enum SimulationStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled"
}

export interface TaskStatusResponse {
  task_id: string;
  status: SimulationStatus;
  progress: number;
  message?: string;
  start_time?: number;
  end_time?: number;
  execution_time?: number;
  has_result: boolean;
  error?: string;
}

// CBC Padding Oracle interfaces
export interface CBCBlock {
  index: number;
  data: string;
  decrypted: boolean;
  decrypted_data?: string;
}

export interface CBCPaddingOracleResponse {
  original_message: string;
  encrypted_message: string;
  iv: string;
  blocks: CBCBlock[];
  decrypted_blocks: Array<{
    block_index: number;
    decrypted_hex: string;
    decrypted_text: string;
  }>;
  simulation_steps: Array<{
    step: string;
    description: string;
  }>;
  success: boolean;
}

export interface CBCPaddingOracleRequest {
  message?: string;
  key_size?: number;
  auto_decrypt?: boolean;
  specific_blocks?: number[];
}

// API functions
export const simulationApi = {
  // Get list of available simulations
  getSimulations: async (): Promise<SimulationInfo[]> => {
    try {
      const response = await axios.get(`${API_URL}/simulations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching simulations:', error);
      throw error;
    }
  },

  // Get details about a specific simulation
  getSimulationInfo: async (id: string): Promise<SimulationInfo> => {
    try {
      const response = await axios.get(`${API_URL}/simulations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching simulation ${id}:`, error);
      throw error;
    }
  },

  // Run Hastad Attack simulation
  runHastadAttack: async (params: HastadAttackRequest): Promise<HastadAttackResponse> => {
    try {
      const response = await axios.post(
        `${API_URL}/simulations/hastad-attack/run`,
        params
      );
      return response.data;
    } catch (error) {
      console.error('Error running Hastad Attack simulation:', error);
      throw error;
    }
  },
  
  // New function for running any simulation asynchronously
  runSimulationAsync: async (simulationId: string, params: any): Promise<TaskResponse> => {
    try {
      const response = await axios.post(
        `${API_URL}/simulations/${simulationId}/run-async`,
        params
      );
      return response.data;
    } catch (error) {
      console.error(`Error running simulation ${simulationId} asynchronously:`, error);
      throw error;
    }
  },
  
  // New function for checking task status
  getTaskStatus: async (taskId: string): Promise<TaskStatusResponse> => {
    try {
      const response = await axios.get(`${API_URL}/simulations/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching task status for ${taskId}:`, error);
      throw error;
    }
  },
  
  // New function for running Hastad Attack asynchronously
  runHastadAttackAsync: async (params: HastadAttackRequest): Promise<TaskResponse> => {
    try {
      return await simulationApi.runSimulationAsync('hastad-attack', params);
    } catch (error) {
      console.error('Error running Hastad Attack simulation asynchronously:', error);
      throw error;
    }
  },

  // Run CBC Padding Oracle simulation
  runCBCPaddingOracle: async (params: CBCPaddingOracleRequest): Promise<CBCPaddingOracleResponse> => {
    try {
      const response = await axios.post(
        `${API_URL}/simulations/cbc-padding-oracle/run`,
        params
      );
      return response.data;
    } catch (error) {
      console.error('Error running CBC Padding Oracle simulation:', error);
      throw error;
    }
  }
};

export default simulationApi;