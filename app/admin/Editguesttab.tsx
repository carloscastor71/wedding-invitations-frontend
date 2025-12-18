"use client";

import { useState, useEffect } from "react";
import { guestManagementApi, GuestSearchResult } from "@/lib/api";

export default function EditGuestTab() {
  // Estado para invitados disponibles
  const [guests, setGuests] = useState<GuestSearchResult[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<GuestSearchResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingGuests, setLoadingGuests] = useState(false);

  // Estado para invitado seleccionado
  const [selectedGuest, setSelectedGuest] = useState<GuestSearchResult | null>(
    null
  );

  // Estado para formulario de edición
  const [editData, setEditData] = useState({
    name: "",
    isChild: false,
    dietaryRestrictions: "",
    notes: "",
  });

  // Estado de loading y mensajes
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Cargar invitados al montar el componente
  useEffect(() => {
    loadGuests();
  }, []);

  // Filtrar invitados cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredGuests(guests);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = guests.filter(
        (g) =>
          g.name.toLowerCase().includes(term) ||
          g.familyName.toLowerCase().includes(term)
      );
      setFilteredGuests(filtered);
    }
  }, [searchTerm, guests]);

  const loadGuests = async () => {
    try {
      setLoadingGuests(true);
      const data = await guestManagementApi.searchGuests();
      setGuests(data);
      setFilteredGuests(data);
    } catch (error) {
      console.error("Error loading guests:", error);
      setMessage({
        type: "error",
        text: "Error al cargar invitados",
      });
    } finally {
      setLoadingGuests(false);
    }
  };

  const handleSelectGuest = (guest: GuestSearchResult) => {
    setSelectedGuest(guest);
    setEditData({
      name: guest.name,
      isChild: guest.isChild,
      dietaryRestrictions: guest.dietaryRestrictions || "",
      notes: guest.notes || "",
    });
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedGuest) {
      setMessage({
        type: "error",
        text: "Debes seleccionar un invitado",
      });
      return;
    }

    if (!editData.name.trim()) {
      setMessage({
        type: "error",
        text: "El nombre del invitado es obligatorio",
      });
      return;
    }

    try {
      setLoading(true);

      const request = {
        name: editData.name.trim(),
        isChild: editData.isChild,
        dietaryRestrictions: editData.dietaryRestrictions.trim() || undefined,
        notes: editData.notes.trim() || undefined,
      };

      const response = await guestManagementApi.updateGuest(
        selectedGuest.id,
        request
      );

      setMessage({
        type: "success",
        text: `¡Invitado "${response.guest.name}" actualizado exitosamente!`,
      });

      // Recargar invitados
      await loadGuests();

      // Actualizar el invitado seleccionado con los nuevos datos
      setSelectedGuest({
        ...selectedGuest,
        name: response.guest.name,
        isChild: response.guest.isChild,
        dietaryRestrictions: response.guest.dietaryRestrictions,
        notes: response.guest.notes,
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Error al actualizar invitado",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedGuest(null);
    setEditData({
      name: "",
      isChild: false,
      dietaryRestrictions: "",
      notes: "",
    });
    setSearchTerm("");
    setMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* Mensaje de éxito/error */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Selector de invitado */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Buscar Invitado *
        </label>

        {/* Búsqueda */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Buscar por nombre o familia..."
          className="w-full p-3 mb-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />

        {/* Dropdown de invitados */}
        {loadingGuests ? (
          <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
            Cargando invitados...
          </div>
        ) : (
          <select
            value={selectedGuest?.id || ""}
            onChange={(e) => {
              const guest = guests.find((g) => g.id === Number(e.target.value));
              if (guest) handleSelectGuest(guest);
            }}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            size={8}
          >
            <option value="">-- Selecciona un invitado --</option>
            {filteredGuests.map((guest) => (
              <option key={guest.id} value={guest.id}>
                {guest.name} ({guest.familyName}) -{" "}
                {guest.isChild ? "Niño" : "Adulto"}
              </option>
            ))}
          </select>
        )}

        {filteredGuests.length === 0 && searchTerm && (
          <p className="text-sm text-gray-500 mt-2">
            No se encontraron invitados con "{searchTerm}"
          </p>
        )}
      </div>

      {/* Formulario de edición */}
      {selectedGuest && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info de familia */}
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Familia:</strong> {selectedGuest.familyName}
            </p>
          </div>

          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h3 className="font-bold text-gray-800 text-lg">
              Modificar Datos del Invitado
            </h3>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nombre del Invitado *
              </label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                placeholder="Ej: María López"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Tipo de Invitado *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!editData.isChild}
                    onChange={() =>
                      setEditData({ ...editData, isChild: false })
                    }
                    className="w-5 h-5 text-blue-500"
                  />
                  <span className="text-gray-700 font-medium">👤 Adulto</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={editData.isChild}
                    onChange={() => setEditData({ ...editData, isChild: true })}
                    className="w-5 h-5 text-blue-500"
                  />
                  <span className="text-gray-700 font-medium">👶 Niño</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Restricciones Alimenticias (opcional)
              </label>
              <textarea
                value={editData.dietaryRestrictions}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    dietaryRestrictions: e.target.value,
                  })
                }
                placeholder="Ej: Vegetariano, alérgico a mariscos..."
                rows={2}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Notas Especiales (opcional)
              </label>
              <textarea
                value={editData.notes}
                onChange={(e) =>
                  setEditData({ ...editData, notes: e.target.value })
                }
                placeholder="Cualquier nota adicional..."
                rows={2}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {loading ? "Guardando..." : "💾 Guardar Cambios"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-4 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all"
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}