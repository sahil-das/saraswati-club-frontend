import api from "./axios";

export const fetchExpenses = () => 
  api.get("/expenses");

export const createExpense = (data) => 
  api.post("/expenses", data);

export const approveExpense = (id) => 
  api.put(`/expenses/${id}/status`, { status: 'approved' });

export const rejectExpense = (id) => 
  api.put(`/expenses/${id}/status`, { status: 'rejected' });

export const deleteExpense = (id) => 
  api.delete(`/expenses/${id}`);