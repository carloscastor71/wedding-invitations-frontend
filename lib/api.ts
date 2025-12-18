const API_BASE_URL = "https://weddinginvitationsapi-production.up.railway.app";

// === INTERFACES EXISTENTES ===
export interface Family {
  id: number;
  familyName: string; 
  correctedFamilyName?: string; 
  contactPerson: string;
  email?: string;
  phone: string;
  country?: string;
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
  email?: string;
  phone: string; 
  country?: string;
  maxGuests: number;
}

export interface InvitationData {
  familyName: string;  
  correctedFamilyName?: string;
  contactPerson: string;
  maxGuests: number;
  confirmedGuests: number;
  hasResponded: boolean;
  isAttending: boolean | null;
  formCompleted: boolean;
  responseDeadline: string;
  guests: Guest[];
  events: {
    name: string;
    dateTime: string;
    venue: string;
    address: string;
    requiresConfirmation: boolean;
  }[];
}

export interface Guest {
  id?: number;
  name: string;
  isChild: boolean;
  dietaryRestrictions?: string;
  notes?: string;
}

export interface CompleteFormRequest {
  guests: Guest[];
  familyMessage?: string;
  correctedFamilyName?: string;
}

// === INTERFACES PARA SISTEMA DE MESAS ===

export interface Table {
  id: number;
  tableNumber: number;
  tableName: string;
  maxCapacity: number;
  currentOccupancy: number;
}

export interface TableSummary extends Table {
  availableSeats: number;
  percentageOccupied: number;
  isFull: boolean;
  isHonorTable: boolean;
}

export interface AvailableTable {
  id: number;
  tableName: string;
  availableSeats: number;
  display: string;
}

export interface GuestAssignment {
  id: number;
  name: string;
  isChild: boolean;
  notes?: string;
  familyId: number;
  familyName: string;
  tableId?: number | null;
  tableName?: string | null;
  country: string;
}

export interface GuestsAssignmentResponse {
  data: GuestAssignment[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface TableStats {
  totalGuests: number;
  assignedGuests: number;
  unassignedGuests: number;
  totalCapacity: number;
  totalOccupied: number;
  availableSeats: number;
  percentageAssigned: number;
}

export interface AssignTableRequest {
  tableId: number | null;
}

export interface TableGuest {
  id: number;
  name: string;
  isChild: boolean;
  familyName: string;
  notes?: string;
}

export interface TableGuestsResponse {
  id: number;
  tableName: string;
  currentOccupancy: number;
  maxCapacity: number;
  guests: TableGuest[];
}

// === INTERFACES PARA GENERACIÓN DE PASES ===
export interface GeneratePassesResponse {
  success: boolean;
  familyName: string;
  passesCount: number;
  passes: {
    tableNumber?: number;
    tableName?: string;
    guestCount: number;
    fileName: string;
    url: string;
    sizeKB: number;
  }[];
  whatsappMessage: string;
  whatsappUrl: string;
}

// === INTERFACES PARA GUEST MANAGEMENT ===

export interface GuestData {
  name: string;
  isChild: boolean;
  dietaryRestrictions?: string;
  notes?: string;
}

export interface NewFamilyData {
  familyName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  country?: string;
}

export interface AddGuestRequest {
  familyId?: number;
  newFamily?: NewFamilyData;
  guest: GuestData;
}

export interface UpdateGuestRequest {
  name: string;
  isChild: boolean;
  dietaryRestrictions?: string;
  notes?: string;
}

export interface FamilyDropdownItem {
  id: number;
  displayName: string;
  currentGuests: number;
  maxGuests: number;
  status: string;
}

export interface GuestSearchResult {
  id: number;
  name: string;
  isChild: boolean;
  dietaryRestrictions?: string;
  notes?: string;
  familyId: number;
  familyName: string;
}

// === API PARA FAMILIAS ===

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

  delete: async (familyId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/families/${familyId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al eliminar familia");
    }

    return response.json();
  },

  exportExcel: async (): Promise<Blob> => {
    console.log("📊 Requesting Excel export...");

    const response = await fetch(`${API_BASE_URL}/api/families/export-excel`);

    console.log("📊 Excel response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al descargar Excel: ${errorText}`);
    }

    return response.blob();
  },

  getGuestsForAssignment: async (
    page: number = 1,
    pageSize: number = 20,
    filter?: string
  ): Promise<GuestsAssignmentResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (filter) {
      params.append("filter", filter);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/families/guests-for-assignment?${params}`
    );

    if (!response.ok) {
      throw new Error("Error al obtener invitados");
    }

    return response.json();
  },

  generatePasses: async (familyId: number): Promise<GeneratePassesResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/api/families/${familyId}/generate-passes`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al generar pases");
    }

    return response.json();
  },
};

// === API PARA INVITACIONES ===

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

  completeForm: async (code: string, formData: CompleteFormRequest) => {
    const response = await fetch(
      `${API_BASE_URL}/api/invitation/${code}/complete-form`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al completar formulario");
    }
    return response.json();
  },
};

// === API PARA SISTEMA DE MESAS ===

export const tablesApi = {
  getSummary: async (): Promise<TableSummary[]> => {
    const response = await fetch(`${API_BASE_URL}/api/tables/summary`);
    
    if (!response.ok) {
      throw new Error("Error al obtener mesas");
    }
    
    return response.json();
  },

  getAvailable: async (): Promise<AvailableTable[]> => {
    const response = await fetch(`${API_BASE_URL}/api/tables/available`);
    
    if (!response.ok) {
      throw new Error("Error al obtener mesas disponibles");
    }
    
    return response.json();
  },

  getStats: async (): Promise<TableStats> => {
    const response = await fetch(`${API_BASE_URL}/api/tables/stats`);
    
    if (!response.ok) {
      throw new Error("Error al obtener estadísticas");
    }
    
    return response.json();
  },

  getTableGuests: async (tableId: number): Promise<TableGuestsResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/tables/${tableId}/guests`);
    
    if (!response.ok) {
      throw new Error("Error al obtener invitados de la mesa");
    }
    
    return response.json();
  },

  assignGuestToTable: async (
    guestId: number, 
    tableId: number | null
  ): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(
      `${API_BASE_URL}/api/guests/${guestId}/assign-table`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al asignar mesa");
    }

    return response.json();
  },
};

// === API PARA GUEST MANAGEMENT ===

export const guestManagementApi = {
  addGuest: async (request: AddGuestRequest) => {
    const response = await fetch(
      `${API_BASE_URL}/api/guest-management/guests`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al agregar invitado");
    }

    return response.json();
  },

  updateGuest: async (guestId: number, request: UpdateGuestRequest) => {
    const response = await fetch(
      `${API_BASE_URL}/api/guest-management/guests/${guestId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al actualizar invitado");
    }

    return response.json();
  },

  getFamiliesForDropdown: async (): Promise<FamilyDropdownItem[]> => {
    const response = await fetch(
      `${API_BASE_URL}/api/guest-management/families/dropdown`
    );

    if (!response.ok) {
      throw new Error("Error al obtener familias");
    }

    return response.json();
  },

  searchGuests: async (
    familyId?: number,
    search?: string
  ): Promise<GuestSearchResult[]> => {
    const params = new URLSearchParams();
    
    if (familyId) {
      params.append("familyId", familyId.toString());
    }
    
    if (search) {
      params.append("search", search);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/guest-management/guests/search?${params}`
    );

    if (!response.ok) {
      throw new Error("Error al buscar invitados");
    }

    return response.json();
  },

  deleteGuest: async (guestId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/api/guest-management/guests/${guestId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al eliminar invitado");
    }

    return response.json();
  },
};