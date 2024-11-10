// src/apps/artist/components/TermsModal/api.ts

import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Fetch terms and conditions text
export const fetchTermsText = async (): Promise<string> => {
  try {
    const termsUrl = `${BASE_URL}/termsAndConditions/read`;
    const response = await axios.get(termsUrl);
    return response.data.terms.termsAndConditions;
  } catch (error) {
    console.error('Error fetching terms and conditions:', error);
    throw error;
  }
};

// Fetch the user's terms agreement status
export const fetchTermsAgreementStatus = async (userId: string): Promise<boolean> => {
  try {
    const agreementUrl = `${BASE_URL}/prixer/get/${userId}`;
    const response = await axios.get(agreementUrl);
    return response.data.termsAgree;
  } catch (error) {
    console.error('Error fetching terms agreement status:', error);
    throw error;
  }
};

// Update the user's terms agreement status
export const updateTermsAgreement = async (userId: string): Promise<boolean> => {
  try {
    const updateUrl = `${BASE_URL}/prixer/update-terms/${userId}`;
    const response = await axios.put(updateUrl, { termsAgree: true });
    return response.data.success;
  } catch (error) {
    console.error('Error updating terms agreement:', error);
    throw error;
  }
};
