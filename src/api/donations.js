import api from "./axios";

export const fetchDonations = () => 
  api.get("/donations");

export const createDonation = (data) => 
  api.post("/donations", data);

export const deleteDonation = (id) => 
  api.delete(`/donations/${id}`);