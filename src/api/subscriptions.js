import api from "./axios";

// Get all payment records (for the "List View")
export const fetchContributions = () => 
  api.get("/subscriptions/payments");

// Get a single member's subscription card
export const fetchMemberSubscription = (memberId) => 
  api.get(`/subscriptions/member/${memberId}`);

// Pay a specific installment (Week or Month)
export const payInstallment = (data) => 
  api.post("/subscriptions/pay", data);