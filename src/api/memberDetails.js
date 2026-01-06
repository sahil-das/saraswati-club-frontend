import api from "./axios";

export const getMemberSubscription = (memberId) => {
  return api.get(`/subscriptions/member/${memberId}`);
};

export const getMemberFees = (userId) => {
  return api.get(`/member-fees/member/${userId}`);
};

export const updateSubscriptionPayment = (data) => {
  // data: { subscriptionId, installmentNumber }
  return api.post("/subscriptions/pay", data);
};