import api from "./axios";

// Get the currently active financial year
export const fetchActiveYear = () => 
  api.get("/years/active");

// Start a new year
export const createYear = (data) => 
  api.post("/years", data);

// Update existing year settings
export const updateYear = (id, data) => 
  api.put(`/years/${id}`, data);

// Close the year (Archive it)
export const closeYear = (id) => 
  api.post(`/years/${id}/close`);