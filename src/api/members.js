import api from "./axios";

export const fetchMembers = () => 
  api.get("/members");

export const addMember = (data) => 
  api.post("/members", data); // Assuming this is your route

export const deleteMember = (id) => 
  api.delete(`/members/${id}`);

export const updateMemberRole = (id, role) => 
  api.put(`/members/${id}/role`, { role });