// Crear archivo: components/GuestForm.tsx

'use client';

import { useState } from 'react';
import { User, Baby, MessageCircle, Check } from 'lucide-react';
import { Guest, CompleteFormRequest } from '@/lib/api';

interface GuestFormProps {
  maxGuests: number;
  familyName: string;
  onSubmit: (formData: CompleteFormRequest) => Promise<void>;
  onCancel: () => void;
}

const GuestForm: React.FC<GuestFormProps> = ({
  maxGuests,
  familyName,
  onSubmit,
  onCancel
}) => {
  // Inicializar con el número exacto de espacios disponibles
  const [guests, setGuests] = useState<Guest[]>(
    Array.from({ length: maxGuests }, () => ({
      name: '',
      isChild: false,
      dietaryRestrictions: '',
      notes: ''
    }))
  );
  
  const [familyMessage, setFamilyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateGuest = (index: number, field: keyof Guest, value: string | boolean) => {
    const updated = guests.map((guest, i) => 
      i === index ? { ...guest, [field]: value } : guest
    );
    setGuests(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filtrar solo los invitados con nombre
    const validGuests = guests.filter(g => g.name.trim() !== '');
    
    if (validGuests.length === 0) {
      alert('Por favor ingresa al menos un invitado');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        guests: validGuests.map(g => ({
          ...g,
          name: g.name.trim(),
          dietaryRestrictions: g.dietaryRestrictions?.trim() || undefined,
          notes: g.notes?.trim() || undefined
        })),
        familyMessage: familyMessage.trim() || undefined
      });
    } catch (error: any) {
      alert(error.message || 'Error al guardar los datos. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const filledGuests = guests.filter(g => g.name.trim() !== '').length;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-red-900 to-red-800 px-6 py-4">
        <h3 className="text-xl font-semibold text-white">
          Detalles de Invitados - {familyName}
        </h3>
        <p className="text-red-100 text-sm mt-1">
          Espacios disponibles: {maxGuests} • Registrados: {filledGuests}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Por favor proporciona los nombres de las personas que asistirán a la recepción. 
            Puedes llenar solo los espacios que necesites.
          </p>
        </div>

        {/* Lista de invitados */}
        <div className="space-y-4 mb-6">
          {guests.map((guest, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Nombre */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invitado {index + 1} {index === 0 && '(Obligatorio)'}
                  </label>
                  <input
                    type="text"
                    value={guest.name}
                    onChange={(e) => updateGuest(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Nombre completo"
                    required={index === 0}
                  />
                </div>

                {/* Solo mostrar opciones adicionales si hay nombre */}
                {guest.name.trim() && (
                  <>
                    {/* Tipo de invitado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de invitado
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateGuest(index, 'isChild', false)}
                          className={`flex-1 px-3 py-2 rounded-lg border transition-colors text-sm ${
                            !guest.isChild
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <User size={14} className="inline mr-1" />
                          Adulto
                        </button>
                        <button
                          type="button"
                          onClick={() => updateGuest(index, 'isChild', true)}
                          className={`flex-1 px-3 py-2 rounded-lg border transition-colors text-sm ${
                            guest.isChild
                              ? 'bg-orange-600 text-white border-orange-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <Baby size={14} className="inline mr-1" />
                          Niño
                        </button>
                      </div>
                    </div>

                    {/* Restricciones alimentarias */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alergias/Restricciones
                      </label>
                      <input
                        type="text"
                        value={guest.dietaryRestrictions || ''}
                        onChange={(e) => updateGuest(index, 'dietaryRestrictions', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Ej: Vegetariano, sin mariscos"
                      />
                    </div>

                    {/* Notas especiales - solo para niños */}
                    {guest.isChild && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notas especiales para niño
                        </label>
                        <input
                          type="text"
                          value={guest.notes || ''}
                          onChange={(e) => updateGuest(index, 'notes', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Ej: Silla para bebé, menú infantil"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje de la familia */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MessageCircle size={16} className="inline mr-1" />
            Mensaje para Carlos & Karen (opcional)
          </label>
          <textarea
            value={familyMessage}
            onChange={(e) => setFamilyMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
            placeholder="¡Estamos muy emocionados de acompañarlos en este día tan especial!"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={submitting || filledGuests === 0}
            className="px-6 py-3 bg-red-900 text-white rounded-lg hover:bg-red-800 disabled:opacity-50 transition-colors font-semibold flex items-center gap-2"
          >
            <Check size={18} />
            {submitting ? 'Guardando...' : `Confirmar ${filledGuests} Invitado${filledGuests !== 1 ? 's' : ''}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GuestForm;