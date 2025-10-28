import axios from 'axios';

const API_URL = 'https://localhost:7031/api/Match';

const getMatchesByGroupId = async (groupId: number): Promise<any> => {
    try {
        return await axios.get(`${API_URL}/ByGroup/${groupId}`);
    } catch (error: any) {
        throw error;
    }
};

const createMatch = async (matchData: any): Promise<any> => {
    try {
        return await axios.post(API_URL, matchData);
    } catch (error: any) {
        throw error;
    }
};

const scheduleMatch = async (matchDetails: any): Promise<any> => {
    try {
        const response = await axios.post(`${API_URL}`, matchDetails);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

const updateMatch = async (id: number, matchData: any): Promise<any> => {
    try {
        return await axios.put(`${API_URL}/${id}`, matchData);
    } catch (error: any) {
        throw error;
    }
};

const deleteMatch = async (id: number): Promise<any> => {
    try {
        return await axios.delete(`${API_URL}/${id}`);
    } catch (error: any) {
        throw error;
    }
};

const setMatchResult = async (id: number, team1GoalsScored: number, team2GoalsScored: number): Promise<any> => {
    try {
        const response = await axios.put(`${API_URL}/${id}/SetScore`, { team1GoalsScored, team2GoalsScored });
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

const setForfeit = async (matchId: number, team1Forfeits: boolean, team2Forfeits: boolean): Promise<any> => {
    try {
        const response = await axios.put(`${API_URL}/${matchId}/SetScore`, {
            team1Forfeited: team1Forfeits,
            team2Forfeited: team2Forfeits,
            team1GoalsScored: team1Forfeits ? 0 : null,
            team2GoalsScored: team2Forfeits ? 0 : null
        });
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

export default {
    scheduleMatch,
    getMatchesByGroupId,
    createMatch,
    updateMatch,
    deleteMatch,
    setMatchResult, 
    setForfeit
};
