import axios from 'axios';
import { create } from 'ionicons/icons';

const API_URL = 'https://localhost:7031/api/Stadium'; 

const getAllStadiums = async (): Promise<any> => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

const getStadiumById = async (id: number): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

const updateStadium = async (id: number, stadiumDto: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, stadiumDto);
    return response.status === 204; 
  } catch (error) {
    console.error('Failed to update stadium:', error);
    throw error; 
  }
};

const createStadium = async (stadiumDto: { stadiumName: string }) => {
  try {
    const response = await axios.post(`${API_URL}`, stadiumDto);
    return response.data; 
  } catch (error) {
    console.error('Failed to create stadium:', error);
    throw error;
  }
};

const deleteStadium = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.status === 204; 
  } catch (error) {
    console.error('Failed to delete stadium:', error);
    throw error;
  }
};



export default {
    getAllStadiums,
    getStadiumById,
    updateStadium,
    createStadium,
    deleteStadium
};
