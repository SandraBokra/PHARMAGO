import axios from 'axios';

const API_URL = import.meta.env.PROD 
  ? 'https://pharmago-api.onrender.com/api'  // Mettre l'URL de votre backend sur Render
  : 'http://localhost:5000/api';

export const api = {
  async getAllPharmacies() {
    const response = await axios.get(`${API_URL}/pharmacies-de-garde`);
    return response.data;
  },

  async getPharmacyById(id: number) {
    const response = await axios.get(`${API_URL}/pharmacie/${id}`);
    return response.data;
  }
};
