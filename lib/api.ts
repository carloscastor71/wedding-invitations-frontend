const API_BASE_URL = "https://localhost:7098";

export interface Family {
  id: number;
  familyName: string;
  contactPerson: string;
  email?: string;
  phone: string;
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

export interface CreateFamilyRequest {
  familyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  maxGuests: number;
}

export interface InvitationData {
  familyName: string;
  contactPerson: string;
  maxGuests: number;
  confirmedGuests: number;
  hasResponded: boolean;
  isAttending: boolean | null;
  formCompleted: boolean;
  responseDeadline: string;
  guests: any[];
  events: {
    name: string;
    dateTime: string;
    venue: string;
    address: string;
    requiresConfirmation: boolean;
  }[];
}

export const familiesApi = {
  getAll: async (): Promise<Family[]> => {
    const response = await fetch(`${API_BASE_URL}/api/families`);
    return response.json();
  },

  create: async (family: Partial<Family>): Promise<Family> => {
    const response = await fetch(`${API_BASE_URL}/api/families`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(family),
    });
    return response.json();
  },
  
  markAsSent: async (familyId: number): Promise<Family> => {
    const response = await fetch(
      `${API_BASE_URL}/api/families/${familyId}/mark-sent`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  },
};

export const invitationApi = {
  getInvitation: async (code: string): Promise<InvitationData> => {
    const response = await fetch(`${API_BASE_URL}/api/invitation/${code}`);
    if (!response.ok) {
      throw new Error("Invitación no encontrada");
    }
    return response.json();
  },

  respondToInvitation: async (code: string, attending: boolean) => {
    const response = await fetch(
      `${API_BASE_URL}/api/invitation/${code}/respond`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attending }),
      }
    );
    if (!response.ok) {
      throw new Error("Error al guardar respuesta");
    }
    return response.json();
  },
};
