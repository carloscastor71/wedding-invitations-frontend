const API_BASE_URL = 'https://localhost:44342';

export interface Family {
  id: number;
  familyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  maxGuests: number;
  invitationCode: string;
  invitationSent: boolean;
  sentDate?: string;
  responded: boolean;
  responseDate?: string;
  attending?: boolean;
  confirmedGuests: number;
  status: string;
  dietaryRestrictions?: string;
  specialMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export const familiesApi = {
  getAll: async (): Promise<Family[]> => {
    const response = await fetch(`${API_BASE_URL}/api/families`);
    return response.json();
  },
  
  create: async (family: Partial<Family>): Promise<Family> => {
    const response = await fetch(`${API_BASE_URL}/api/families`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(family)
    });
    return response.json();
  }
};