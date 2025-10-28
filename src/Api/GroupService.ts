import axios from 'axios';

const API_URL = 'https://localhost:7031/api/Group'; 

const createGroup = async (groupName: string) => {
    try {
        const response = await axios.post(API_URL, { groupName: groupName });
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

const getAllGroups = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

const deleteGroup = async (groupId: number) => {
    try {
        return await axios.delete(`${API_URL}/${groupId}`);
    } catch (error: any) {
        throw error;
    }
};

export default {
    createGroup,
    getAllGroups,
    deleteGroup
};
