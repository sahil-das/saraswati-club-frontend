import api from "./axios";

export const fetchFestivalFees = () => 
  api.get("/member-fees");

export const addFestivalFee = (data) => 
  api.post("/member-fees", data);

export const deleteFestivalFee = (id) => 
  api.delete(`/member-fees/${id}`);