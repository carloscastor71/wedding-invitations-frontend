"use client";

import { useState, useEffect } from "react";
import { familiesApi, Family } from "../lib/api";

export default function Home() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el modal
  const [showModal, setShowModal] = useState(false);
  const [invitationType, setInvitationType] = useState<
    "individual" | "family" | null
  >(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    familyName: "",
    contactPerson: "",
    maxGuests: 2,
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const data = await familiesApi.getAll();
        setFamilies(data);
      } catch (err) {
        setError("Error conectando con la API");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilies();
  }, []);

  const resetModal = () => {
    setShowModal(false);
    setInvitationType(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      familyName: "",
      contactPerson: "",
      maxGuests: 2,
    });
  };

  const openWhatsApp = (family: Family) => {
    // Mensaje personalizado para WhatsApp
const message = `¡Hola ${family.familyName}!

Carlos y Karen nos casamos y queremos celebrarlo contigo!

*20 de Diciembre de 2025*

• Ceremonia Religiosa: 5:30 PM - Parroquia De San Agustín
• Ceremonia Civil: 8:00 PM - Salon MONET  
• Recepción: 8:30 PM - Salon MONET

Por favor confirma tu asistencia:
https://karen-carlos-wedding.vercel.app/invite/${family.invitationCode}

Espacios disponibles: *${family.maxGuests} personas*
Fecha límite: *20 de Noviembre de 2025*

*Si necesitas hacer algún cambio, contáctanos por WhatsApp.*

¡Esperamos verte en nuestro gran día!

Con amor,
Carlos & Karen`;

    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(message);

    // Crear link de WhatsApp al número de la familia
    const familyPhone = family.phone.replace(/\D/g, ""); // Quitar caracteres no numéricos
    const whatsappUrl = `https://wa.me/52${familyPhone}?text=${encodedMessage}`;
    //                                   ↑ Tu número personal aquí
    // Abrir WhatsApp
    window.open(whatsappUrl, "_blank");

    // Marcar como enviada después de 2 segundos
    setTimeout(() => {
      markAsSent(family.id);
    }, 2000);
  };

  const markAsSent = async (familyId: number) => {
    try {
      // Actualizar en base de datos
      const updatedFamily = await familiesApi.markAsSent(familyId);

      // Actualizar estado local con datos de BD
      setFamilies(families.map((f) => (f.id === familyId ? updatedFamily : f)));
    } catch (error) {
      console.error("Error marcando como enviada:", error);
    }
  };
  const deleteFamily = async (familyId: number, familyName: string) => {
    // Solo una confirmación simple
    const confirmMessage = `¿Estás seguro de eliminar la familia "${familyName}"?\n\nEsto eliminará:\n- La invitación\n- Todos los invitados registrados\n- Toda la información relacionada\n\nEsta acción NO se puede deshacer.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      const result = await familiesApi.delete(familyId);
      setFamilies(families.filter((f) => f.id !== familyId));
      alert(`✅ ${result.message}`);
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const downloadExcel = async () => {
    try {
      setLoading(true);
      console.log("📊 Starting Excel download...");

      const blob = await familiesApi.exportExcel();
      console.log("📊 Excel blob received, size:", blob.size);

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Nombre del archivo con fecha
      const fecha = new Date().toISOString().split("T")[0];
      link.download = `Invitados_Boda_Karen_Carlos_${fecha}.xlsx`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      window.URL.revokeObjectURL(url);

      console.log("✅ Excel download completed");
      alert("✅ Excel descargado exitosamente");
    } catch (error: any) {
      console.error("❌ Error downloading Excel:", error);
      alert(`❌ Error al descargar Excel: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createInvitation = async () => {
    console.log("🚀 createInvitation ejecutándose!");
    console.log("formData:", formData);
    console.log("invitationType:", invitationType);

    if (!formData.phone) {
      console.log("❌ Error: Sin teléfono");
      alert("El teléfono WhatsApp es obligatorio");
      return;
    }

    setIsCreating(true);
    try {
      let familyData;

      if (invitationType === "individual") {
        // Para individual, usar el nombre como familia y contacto
        familyData = {
          familyName: formData.name,
          contactPerson: formData.name,
          email: formData.email || undefined,
          phone: formData.phone,
          maxGuests: 1,
        };
      } else {
        // Para familiar
        if (!formData.familyName || !formData.contactPerson) {
          alert("Nombre de familia y contacto son obligatorios");
          return;
        }
        familyData = {
          familyName: formData.familyName,
          contactPerson: formData.contactPerson,
          email: formData.email || undefined,
          phone: formData.phone,
          maxGuests: formData.maxGuests,
        };
      }

      // Crear en la base de datos
      const newFamily = await familiesApi.create(familyData);

      // Actualizar lista
      setFamilies([...families, newFamily]);

      // Mostrar éxito (después agregamos WhatsApp)
      alert(`¡Invitación creada! Código: ${newFamily.invitationCode}`);

      // Cerrar modal
      resetModal();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear la invitación");
    } finally {
      setIsCreating(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-700">Cargando...</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-stone-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Panel de Administración
          </h1>
          <h2 className="text-2xl font-semibold text-red-900">
            Boda Carlos & Karen 💍
          </h2>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-800">
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Total Familias
            </h3>
            <p className="text-3xl font-bold text-red-800">{families.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-700">
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Confirmadas
            </h3>
            <p className="text-3xl font-bold text-green-700">
              {families.filter((f) => f.status === "confirmed").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-600">
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Pendientes
            </h3>
            <p className="text-3xl font-bold text-yellow-600">
              {families.filter((f) => f.status === "pending").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-900">
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Invitados
            </h3>
            <p className="text-3xl font-bold text-red-900">
              {families.reduce((sum, f) => sum + f.confirmedGuests, 0)}
            </p>
          </div>
        </div>

        {/* Families Table */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-900 to-red-800 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              Familias Invitadas
            </h2>
            <div className="flex gap-3">
              {/* NUEVO: Botón Excel */}
              <button
                onClick={downloadExcel}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Descargando...
                  </>
                ) : (
                  <>📊 Descargar Excel</>
                )}
              </button>

              {/* Botón crear existente */}
              <button
                onClick={() => setShowModal(true)}
                className="bg-white text-red-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                + Crear Invitación
              </button>
            </div>
          </div>

          {families.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Familia
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Invitados
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {families.map((family) => (
                    <tr
                      key={family.id}
                      className="hover:bg-stone-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-gray-900">
                          {family.familyName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-base font-medium text-gray-800">
                          {family.contactPerson}
                        </div>
                        <div className="text-sm text-gray-600">
                          {family.phone || "Sin teléfono"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-base text-gray-800">
                          {family.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-semibold text-gray-900">
                          {family.confirmedGuests} / {family.maxGuests}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-sm font-bold rounded-full ${
                            family.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : family.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : family.status === "declined"
                              ? "bg-red-100 text-red-800"
                              : "bg-stone-100 text-stone-800"
                          }`}
                        >
                          {String(family.status || "draft").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-700 bg-stone-100 px-2 py-1 rounded">
                          {family.invitationCode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2 items-center">
                          {!family.invitationSent ? (
                            <button
                              onClick={() => openWhatsApp(family)}
                              className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                            >
                              📱 Enviar
                            </button>
                          ) : (
                            <button
                              onClick={() => openWhatsApp(family)}
                              className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                            >
                              🔔 Recordatorio
                            </button>
                          )}

                          <button
                            onClick={() =>
                              deleteFamily(family.id, family.familyName)
                            }
                            disabled={loading}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-xl text-gray-600 mb-2">
                No hay familias registradas aún
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="bg-red-900 text-white px-6 py-3 rounded-lg hover:bg-red-800 transition-colors font-semibold"
              >
                Crear Primera Invitación
              </button>
            </div>
          )}
        </div>

        {/* Modal Crear Invitación */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Crear Invitación</h3>

              {!invitationType ? (
                // Selección de tipo
                <div className="space-y-4">
                  <button
                    onClick={() => setInvitationType("individual")}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-red-800 hover:bg-red-50 transition-colors"
                  >
                    <div className="text-4xl mb-2">👤</div>
                    <div className="font-semibold">Invitación Individual</div>
                    <div className="text-sm text-gray-600">
                      Para una persona
                    </div>
                  </button>

                  <button
                    onClick={() => setInvitationType("family")}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-red-800 hover:bg-red-50 transition-colors"
                  >
                    <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
                    <div className="font-semibold">Invitación Familiar</div>
                    <div className="text-sm text-gray-600">
                      Para múltiples personas
                    </div>
                  </button>
                </div>
              ) : (
                // Formularios específicos
                <div>
                  <button
                    onClick={() => setInvitationType(null)}
                    className="text-sm text-gray-500 hover:text-gray-700 mb-4"
                  >
                    ← Volver
                  </button>

                  {invitationType === "individual" ? (
                    // Formulario Individual
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">
                        👤 Invitación Individual
                      </h4>
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <input
                        type="tel"
                        placeholder="Teléfono WhatsApp"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <input
                        type="email"
                        placeholder="Email (opcional)"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <button
                        onClick={createInvitation}
                        disabled={isCreating}
                        className="w-full bg-red-900 text-white py-3 rounded-lg hover:bg-red-800 transition-colors font-semibold disabled:opacity-50"
                      >
                        {isCreating
                          ? "Creando..."
                          : "Crear Invitación Individual"}
                      </button>
                    </div>
                  ) : (
                    // Formulario Familiar
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">
                        👨‍👩‍👧‍👦 Invitación Familiar
                      </h4>
                      <input
                        type="text"
                        placeholder="Nombre de la familia"
                        value={formData.familyName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            familyName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Persona de contacto"
                        value={formData.contactPerson}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactPerson: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <input
                        type="tel"
                        placeholder="Teléfono WhatsApp"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <input
                        type="email"
                        placeholder="Email (opcional)"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número de espacios
                        </label>
                        <select
                          value={formData.maxGuests}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxGuests: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="2">2 personas</option>
                          <option value="3">3 personas</option>
                          <option value="4">4 personas</option>
                          <option value="5">5 personas</option>
                          <option value="6">6 personas</option>
                          <option value="7">7 personas</option>
                          <option value="8">8 personas</option>
                        </select>
                      </div>
                      <button
                        disabled={isCreating}
                        onClick={createInvitation}
                        className="w-full bg-red-900 text-white py-3 rounded-lg hover:bg-red-800 transition-colors font-semibold disabled:opacity-50"
                      >
                        {isCreating
                          ? "Creando..."
                          : "Crear Invitación Familiar"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={resetModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
