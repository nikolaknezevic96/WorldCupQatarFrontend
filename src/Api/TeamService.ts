import axios from 'axios';

const API_URL = 'https://localhost:7031/api/Team'; // Adjust this to your API URL

const getTeamsByGroupId = async (groupId: number): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/byGroup/${groupId}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

const createTeam = async (teamData: any): Promise<any> => {
    try {
        const response = await axios.post(API_URL, teamData);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

const getTeamById = async (id: number): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

const deleteTeamsByGroupId = async (groupId: number): Promise<any> => {
    try {
        return await axios.delete(`${API_URL}/team/byGroup/${groupId}`);
    } catch (error: any) {
        throw error;
    }
};

const deleteTeam = async (id: number): Promise<any> => {
    try {
        return await axios.delete(`${API_URL}/${id}`);
    } catch (error: any) {
        throw error;
    }
};

const updateTeam = async (id: number, teamDto: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, teamDto);
    return response.status === 204; 
  } catch (error) {
    console.error('Failed to update team:', error);
    throw error; 
  }
};

export default {
    getTeamsByGroupId, 
    createTeam, 
    getTeamById,
    deleteTeamsByGroupId,
    deleteTeam,
    updateTeam
};
