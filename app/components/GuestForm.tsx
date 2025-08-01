'use client';

import { useState } from 'react';
import { User, Baby, MessageCircle, Check } from 'lucide-react';

interface Guest {
  name: string;
  isChild: boolean;
  dietaryRestrictions?: string;
  notes?: string;
}

interface CompleteFormRequest {
  guests: Guest[];
  familyMessage?: string;
}

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

  const handleSubmit = async () => {
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
    } catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
  alert(errorMessage || 'Error al guardar los datos. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const filledGuests = guests.filter(g => g.name.trim() !== '').length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div 
        className="backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border-t-4"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,240,0.4) 0%, rgba(255,255,240,0.3) 60%, rgba(88,110,38,0.2) 100%)`,
          borderColor: "#4c0013"
        }}
      >
        {/* Header elegante */}
        <div 
          className="px-6 py-6 border-b"
          style={{
            background: `linear-gradient(135deg, #4c0013 0%, #3a000e 100%)`,
            borderColor: "rgba(255,255,240,0.2)"
          }}
        >
          <h3 
            className="text-2xl font-serif text-center mb-2"
            style={{ color: "#fffff0" }}
          >
            Detalles de Invitados
          </h3>
          <p 
            className="text-center text-sm opacity-90"
            style={{ color: "#fffff0" }}
          >
            {familyName} • Espacios disponibles: {maxGuests} • Registrados: {filledGuests}
          </p>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <div 
              className="inline-block px-6 py-3 rounded-xl border-2 shadow-lg backdrop-blur-sm"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,240,0.4) 0%, rgba(255,255,240,0.3) 60%, rgba(88,110,38,0.2) 100%)`,
                borderColor: "#586e26",
                color: "#4c0013",
              }}
            >
              <p className="text-lg leading-relaxed">
                Por favor proporciona los nombres de las personas que asistirán a la recepción. 
                Puedes llenar solo los espacios que necesites.
              </p>
            </div>
          </div>

          {/* Lista de invitados */}
          <div className="space-y-6 mb-8">
            {guests.map((guest, index) => (
              <div 
                key={index} 
                className="backdrop-blur-sm rounded-xl p-6 border-l-4 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,240,0.4) 0%, rgba(255,255,240,0.3) 60%, rgba(88,110,38,0.2) 100%)`,
                  borderColor: "#586e26"
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Nombre */}
                  <div className="md:col-span-2">
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: "#4c0013" }}
                    >
                      Invitado {index + 1} {index === 0 && '(Obligatorio)'}
                    </label>
                    <input
                      type="text"
                      value={guest.name}
                      onChange={(e) => updateGuest(index, 'name', e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl backdrop-blur-sm transition-all focus:scale-105"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        borderColor: '#586e26',
                        color: '#4c0013'
                      }}
                      placeholder="Nombre completo"
                    />
                  </div>

                  {/* Solo mostrar opciones adicionales si hay nombre */}
                  {guest.name.trim() && (
                    <>
                      {/* Tipo de invitado */}
                      <div>
                        <label 
                          className="block text-sm font-medium mb-2"
                          style={{ color: "#4c0013" }}
                        >
                          Tipo de invitado
                        </label>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => updateGuest(index, 'isChild', false)}
                            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-300 text-sm font-medium hover:scale-105 ${
                              !guest.isChild
                                ? 'text-white shadow-lg'
                                : 'hover:shadow-md'
                            }`}
                            style={{
                              backgroundColor: !guest.isChild ? '#586e26' : 'rgba(255,255,255,0.8)',
                              borderColor: '#586e26',
                              color: !guest.isChild ? '#fffff0' : '#4c0013'
                            }}
                          >
                            <User size={16} className="inline mr-2" />
                            Adulto
                          </button>
                          <button
                            type="button"
                            onClick={() => updateGuest(index, 'isChild', true)}
                            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-300 text-sm font-medium hover:scale-105 ${
                              guest.isChild
                                ? 'text-white shadow-lg'
                                : 'hover:shadow-md'
                            }`}
                            style={{
                              backgroundColor: guest.isChild ? '#4c0013' : 'rgba(255,255,255,0.8)',
                              borderColor: '#4c0013',
                              color: guest.isChild ? '#fffff0' : '#4c0013'
                            }}
                          >
                            <Baby size={16} className="inline mr-2" />
                            Niño
                          </button>
                        </div>
                      </div>

                      {/* Restricciones alimentarias */}
                      <div>
                        <label 
                          className="block text-sm font-medium mb-2"
                          style={{ color: "#4c0013" }}
                        >
                          Alergias/Restricciones
                        </label>
                        <input
                          type="text"
                          value={guest.dietaryRestrictions || ''}
                          onChange={(e) => updateGuest(index, 'dietaryRestrictions', e.target.value)}
                          className="w-full px-4 py-3 border-2 rounded-xl backdrop-blur-sm transition-all focus:scale-105"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            borderColor: '#586e26',
                            color: '#4c0013'
                          }}
                          placeholder="Ej: Vegetariano, sin mariscos"
                        />
                      </div>

                      {/* Notas especiales - solo para niños */}
                      {guest.isChild && (
                        <div className="md:col-span-2">
                          <label 
                            className="block text-sm font-medium mb-2"
                            style={{ color: "#4c0013" }}
                          >
                            Notas especiales para niño
                          </label>
                          <input
                            type="text"
                            value={guest.notes || ''}
                            onChange={(e) => updateGuest(index, 'notes', e.target.value)}
                            className="w-full px-4 py-3 border-2 rounded-xl backdrop-blur-sm transition-all focus:scale-105"
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.8)',
                              borderColor: '#586e26',
                              color: '#4c0013'
                            }}
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
          <div className="mb-8">
            <label 
              className="block text-lg font-medium mb-3 font-serif"
              style={{ color: "#4c0013" }}
            >
              <MessageCircle size={20} className="inline mr-2" />
              Mensaje para Karen & Carlos (opcional)
            </label>
            <textarea
              value={familyMessage}
              onChange={(e) => setFamilyMessage(e.target.value)}
              className="w-full px-4 py-4 border-2 rounded-xl backdrop-blur-sm transition-all focus:scale-105"
              style={{
                backgroundColor: 'rgba(255,255,255,0.8)',
                borderColor: '#586e26',
                color: '#4c0013'
              }}
              rows={4}
              placeholder="¡Estamos muy emocionados de acompañarlos en este día tan especial!"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105 border-2"
              style={{
                backgroundColor: 'rgba(255,255,255,0.8)',
                borderColor: '#586e26',
                color: '#586e26'
              }}
            >
              Volver
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || filledGuests === 0}
              className="px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50 shadow-lg border-2 flex items-center gap-3"
              style={{
                background: submitting || filledGuests === 0 
                  ? 'rgba(76,0,19,0.5)' 
                  : 'linear-gradient(135deg, #4c0013 0%, #3a000e 100%)',
                borderColor: '#4c0013',
                color: '#fffff0'
              }}
            >
              <Check size={20} />
              {submitting ? 'Guardando...' : `Confirmar ${filledGuests} Invitado${filledGuests !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestForm;