"use client";

import { useState, useEffect } from "react";
import { guestManagementApi, FamilyDropdownItem } from "@/lib/api";

export default function AddGuestTab() {
  // Estado para el modo (familia existente o nueva)
  const [mode, setMode] = useState<"existing" | "new">("existing");

  // Estado para familias (dropdown)
  const [families, setFamilies] = useState<FamilyDropdownItem[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);
  const [loadingFamilies, setLoadingFamilies] = useState(false);

  // Estado para nueva familia
  const [newFamily, setNewFamily] = useState({
    familyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    country: "MX",
  });

  // Estado para invitado
  const [guest, setGuest] = useState({
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

  // Cargar familias al montar el componente
  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      setLoadingFamilies(true);
      const data = await guestManagementApi.getFamiliesForDropdown();
      setFamilies(data);
    } catch (error) {
      console.error("Error loading families:", error);
      setMessage({
        type: "error",
        text: "Error al cargar familias",
      });
    } finally {
      setLoadingFamilies(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validar que tenga nombre de invitado
    if (!guest.name.trim()) {
      setMessage({
        type: "error",
        text: "El nombre del invitado es obligatorio",
      });
      return;
    }

    // Validar según el modo
    if (mode === "existing" && !selectedFamilyId) {
      setMessage({
        type: "error",
        text: "Debes seleccionar una familia",
      });
      return;
    }

    if (mode === "new") {
      if (
        !newFamily.familyName.trim() ||
        !newFamily.contactPerson.trim() ||
        !newFamily.phone.trim()
      ) {
        setMessage({
          type: "error",
          text: "Completa todos los campos obligatorios de la familia",
        });
        return;
      }
    }

    try {
      setLoading(true);

      const request = {
        familyId: mode === "existing" ? selectedFamilyId! : undefined,
        newFamily: mode === "new" ? newFamily : undefined,
        guest: {
          name: guest.name.trim(),
          isChild: guest.isChild,
          dietaryRestrictions: guest.dietaryRestrictions.trim() || undefined,
          notes: guest.notes.trim() || undefined,
        },
      };

      const response = await guestManagementApi.addGuest(request);

      setMessage({
        type: "success",
        text: `¡Invitado "${response.guest.name}" agregado exitosamente!`,
      });

      // Limpiar formulario
      setGuest({
        name: "",
        isChild: false,
        dietaryRestrictions: "",
        notes: "",
      });

      if (mode === "new") {
        setNewFamily({
          familyName: "",
          contactPerson: "",
          phone: "",
          email: "",
          country: "MX",
        });
      }

      // Recargar familias
      await loadFamilies();
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Error al agregar invitado",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setGuest({
      name: "",
      isChild: false,
      dietaryRestrictions: "",
      notes: "",
    });
    setNewFamily({
      familyName: "",
      contactPerson: "",
      phone: "",
      email: "",
      country: "MX",
    });
    setSelectedFamilyId(null);
    setMessage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Selector de modo */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          ¿Dónde agregar el invitado?
        </label>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="mode"
              value="existing"
              checked={mode === "existing"}
              onChange={() => setMode("existing")}
              className="w-5 h-5 text-amber-500"
            />
            <span className="text-gray-700 font-medium">
              Agregar a familia existente
            </span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="mode"
              value="new"
              checked={mode === "new"}
              onChange={() => setMode("new")}
              className="w-5 h-5 text-amber-500"
            />
            <span className="text-gray-700 font-medium">
              Crear familia nueva
            </span>
          </label>
        </div>
      </div>

      {/* Selector de familia existente */}
      {mode === "existing" && (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Seleccionar Familia *
          </label>
          {loadingFamilies ? (
            <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
              Cargando familias...
            </div>
          ) : (
            <select
              value={selectedFamilyId || ""}
              onChange={(e) =>
                setSelectedFamilyId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">-- Selecciona una familia --</option>
              {families.map((family) => (
                <option key={family.id} value={family.id}>
                  {family.displayName} ({family.currentGuests}/
                  {family.maxGuests} invitados) - {family.status}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Formulario de nueva familia */}
      {mode === "new" && (
        <div className="space-y-4 p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
          <h3 className="font-bold text-gray-800 text-lg">
            Datos de la Nueva Familia
          </h3>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Nombre de la Familia *
            </label>
            <input
              type="text"
              value={newFamily.familyName}
              onChange={(e) =>
                setNewFamily({ ...newFamily, familyName: e.target.value })
              }
              placeholder="Ej: Familia López"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Persona de Contacto *
            </label>
            <input
              type="text"
              value={newFamily.contactPerson}
              onChange={(e) =>
                setNewFamily({ ...newFamily, contactPerson: e.target.value })
              }
              placeholder="Ej: Juan López"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              value={newFamily.phone}
              onChange={(e) =>
                setNewFamily({ ...newFamily, phone: e.target.value })
              }
              placeholder="Ej: 8711234567"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email (opcional)
            </label>
            <input
              type="email"
              value={newFamily.email}
              onChange={(e) =>
                setNewFamily({ ...newFamily, email: e.target.value })
              }
              placeholder="Ej: juan@ejemplo.com"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      )}

      {/* Formulario de invitado */}
      <div className="space-y-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
        <h3 className="font-bold text-gray-800 text-lg">
          Datos del Invitado
        </h3>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Nombre del Invitado *
          </label>
          <input
            type="text"
            value={guest.name}
            onChange={(e) => setGuest({ ...guest, name: e.target.value })}
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
                checked={!guest.isChild}
                onChange={() => setGuest({ ...guest, isChild: false })}
                className="w-5 h-5 text-blue-500"
              />
              <span className="text-gray-700 font-medium">👤 Adulto</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={guest.isChild}
                onChange={() => setGuest({ ...guest, isChild: true })}
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
            value={guest.dietaryRestrictions}
            onChange={(e) =>
              setGuest({ ...guest, dietaryRestrictions: e.target.value })
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
            value={guest.notes}
            onChange={(e) => setGuest({ ...guest, notes: e.target.value })}
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
          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-4 px-6 rounded-lg hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          {loading ? "Agregando..." : "✅ Agregar Invitado"}
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={loading}
          className="px-6 py-4 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all"
        >
          🔄 Limpiar
        </button>
      </div>
    </form>
  );
}