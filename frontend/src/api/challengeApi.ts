import axios from 'axios';

// Define base API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// API interfaces
export enum ChallengeType {
  CTF = "ctf",
  TIMED = "timed", 
  BLIND = "blind",
  MULTI_STAGE = "multi_stage"
}

export interface ChallengeStage {
  id: string;
  name: string;
  description: string;
  simulation_id: string;
  parameters?: Record<string, any>;
  hints?: string[];
  points: number;
  time_limit_seconds?: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  difficulty: string;
  tags: string[];
  time_limit_seconds?: number;
  points: number;
  simulation_ids?: string[];
  stages?: ChallengeStage[];
  parameters?: Record<string, any>;
  expected_answer?: string;
  hints?: string[];
  created_at: string;
  icon: string;
}

export interface ChallengeAttempt {
  id: string;
  challenge_id: string;
  user_id?: string;
  start_time: string;
  end_time?: string;
  current_stage_index: number;
  completed: boolean;
  score: number;
  answers: Record<string, any>;
  hints_used: number;
  time_spent_seconds: number;
}

export interface ChallengeResult {
  success: boolean;
  score: number;
  time_spent_seconds: number;
  hints_used: number;
  correct_stages: number;
  total_stages: number;
  feedback: string;
  next_challenge_id?: string;
}

// API functions
const challengeApi = {
  // Get list of available challenges
  getChallenges: async (): Promise<Challenge[]> => {
    try {
      const response = await axios.get(`${API_URL}/challenges`);
      return response.data;
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  },

  // Get details about a specific challenge
  getChallenge: async (id: string): Promise<Challenge> => {
    try {
      const response = await axios.get(`${API_URL}/challenges/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching challenge ${id}:`, error);
      throw error;
    }
  },

  // Start a challenge attempt
  startChallenge: async (challengeId: string, userId?: string): Promise<ChallengeAttempt> => {
    try {
      const response = await axios.post(
        `${API_URL}/challenges/${challengeId}/start`,
        { user_id: userId }
      );
      return response.data;
    } catch (error) {
      console.error(`Error starting challenge ${challengeId}:`, error);
      throw error;
    }
  },

  // Submit an answer for a challenge
  submitAnswer: async (
    challengeId: string, 
    attemptId: string, 
    answer: Record<string, any>
  ): Promise<ChallengeResult> => {
    try {
      const response = await axios.post(
        `${API_URL}/challenges/${challengeId}/attempts/${attemptId}/submit`,
        answer
      );
      return response.data;
    } catch (error) {
      console.error(`Error submitting answer for challenge ${challengeId}:`, error);
      throw error;
    }
  },

  // Get a hint for a challenge
  getHint: async (challengeId: string, attemptId: string): Promise<string> => {
    try {
      const response = await axios.get(
        `${API_URL}/challenges/${challengeId}/attempts/${attemptId}/hint`
      );
      return response.data.hint;
    } catch (error) {
      console.error(`Error getting hint for challenge ${challengeId}:`, error);
      throw error;
    }
  },

  // Get current stage for a multi-stage challenge
  getCurrentStage: async (challengeId: string, attemptId: string): Promise<ChallengeStage> => {
    try {
      const response = await axios.get(
        `${API_URL}/challenges/${challengeId}/attempts/${attemptId}/stage`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting current stage for challenge ${challengeId}:`, error);
      throw error;
    }
  },

  // Run a simulation as part of a challenge
  runChallengeSimulation: async (
    challengeId: string,
    attemptId: string,
    params?: Record<string, any>
  ): Promise<Record<string, any>> => {
    try {
      const response = await axios.post(
        `${API_URL}/challenges/${challengeId}/attempts/${attemptId}/simulate`,
        params
      );
      return response.data;
    } catch (error) {
      console.error(`Error running simulation for challenge ${challengeId}:`, error);
      throw error;
    }
  }
};

export default challengeApi;