'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { invitationApi, InvitationData, CompleteFormRequest } from '../../../lib/api';
import GuestForm from '@/app/components/GuestForm';

export default function InvitationPage() {
  const params = useParams();
  const code = params.code as string;
  
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responding, setResponding] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const data = await invitationApi.getInvitation(code);
        setInvitation(data);
      } catch (err) {
        setError('Error al cargar la invitación');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchInvitation();
    }
  }, [code]);

  const handleResponse = async (attending: boolean) => {
    if (!invitation) return;
    
    setResponding(true);
    try {
      await invitationApi.respondToInvitation(code, attending);

      // Actualizar estado local
      setInvitation({
        ...invitation,
        hasResponded: true,
        isAttending: attending
      });

      // Si acepta, mostrar formulario de invitados
      if (attending) {
        setShowGuestForm(true);
      }

    } catch (err) {
      setError('Error al guardar tu respuesta');
      console.error(err);
    } finally {
      setResponding(false);
    }
  };

  const handleFormSubmit = async (formData: CompleteFormRequest) => {
    await invitationApi.completeForm(code, formData);
    
    // Actualizar estado para mostrar confirmación final
    setInvitation(prev => prev ? {
      ...prev,
      formCompleted: true,
      confirmedGuests: formData.guests.length
    } : null);
    
    setShowGuestForm(false);
  };

  const handleFormCancel = () => {
    setShowGuestForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-stone-100 flex items-center justify-center">
        <div className="text-xl text-gray-700">Cargando invitación...</div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error || 'Invitación no encontrada'}</div>
          <p className="text-gray-600">Verifica que el enlace sea correcto</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-stone-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif text-gray-900 mb-4">
            Carlos & Karen
          </h1>
          <h2 className="text-2xl font-semibold text-red-900 mb-2">
            ¡Nos Casamos! 💍
          </h2>
          <p className="text-xl text-gray-700">
            {formatDate(invitation.events[0].dateTime)}
          </p>
        </div>

        {/* Saludo personalizado */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-l-4 border-red-800">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            ¡Hola {invitation.familyName}! 👋
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed">
            Querido/a <strong>{invitation.contactPerson}</strong>, es un honor para nosotros 
            invitarte a celebrar uno de los días más importantes de nuestras vidas.
          </p>
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <p className="text-red-800 font-medium">
              Espacios reservados para tu familia: <strong>{invitation.maxGuests} personas</strong>
            </p>
          </div>
        </div>

        {/* Eventos */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-red-900 to-red-800 px-6 py-4">
            <h3 className="text-xl font-semibold text-white">Programa del Día</h3>
          </div>
          
          <div className="p-6 space-y-6">
            {invitation.events.map((event, index) => (
              <div key={index} className="border-l-4 border-red-200 pl-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl font-semibold text-gray-900">{event.name}</h4>
                  <span className="text-lg font-bold text-red-800">
                    {formatTime(event.dateTime)}
                  </span>
                </div>
                <p className="text-gray-700 font-medium">{event.venue}</p>
                <p className="text-gray-600 text-sm">{event.address}</p>
                {event.requiresConfirmation && (
                  <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                    Requiere confirmación para banquete
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Confirmación de asistencia y formulario */}
        {!invitation.hasResponded ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Confirma tu Asistencia
            </h3>
            <p className="text-gray-700 mb-2">
              Por favor confirma si podrás acompañarnos en la <strong>recepción</strong>
            </p>
            <p className="text-sm text-gray-600 mb-8">
              Fecha límite: {formatDate(invitation.responseDeadline)}
            </p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleResponse(true)}
                disabled={responding}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {responding ? 'Guardando...' : '✅ Sí, asistiré'}
              </button>
              <button
                onClick={() => handleResponse(false)}
                disabled={responding}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {responding ? 'Guardando...' : '❌ No podré asistir'}
              </button>
            </div>
          </div>
        ) : invitation.isAttending && !invitation.formCompleted && showGuestForm ? (
          // Formulario de invitados
          <GuestForm
            maxGuests={invitation.maxGuests}
            familyName={invitation.familyName}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        ) : invitation.isAttending && !invitation.formCompleted ? (
          // Botón para abrir formulario de invitados
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              ¡Gracias por confirmar!
            </h3>
            <div className="text-green-600 mb-6">
              <div className="text-6xl mb-2">🎉</div>
              <p className="text-xl font-semibold">¡Nos vemos el 20 de diciembre!</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 font-medium">
                Último paso: Por favor proporciona los nombres de las personas que asistirán
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                Espacios disponibles: {invitation.maxGuests} personas
              </p>
            </div>
            <button
              onClick={() => setShowGuestForm(true)}
              className="bg-red-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors"
            >
              📝 Completar Lista de Invitados
            </button>
          </div>
        ) : (
          // Confirmación final
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              {invitation.isAttending ? '¡Todo Listo!' : '¡Gracias por tu respuesta!'}
            </h3>
            {invitation.isAttending ? (
              <div className="text-green-600 mb-4">
                <div className="text-6xl mb-2">🎉</div>
                <p className="text-xl font-semibold">¡Nos vemos el 20 de diciembre!</p>
                <p className="text-gray-700 mt-2">
                  Hemos registrado {invitation.confirmedGuests} invitado{invitation.confirmedGuests !== 1 ? 's' : ''} para tu familia.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-green-800 font-medium">
                    ✅ Formulario completado - ¡Te esperamos!
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-gray-600 mb-4">
                <div className="text-6xl mb-2">😢</div>
                <p className="text-xl font-semibold">Lamentamos que no puedas acompañarnos</p>
                <p className="text-gray-700 mt-2">
                  Te agradecemos por avisarnos. ¡Esperamos celebrar contigo en otra ocasión!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p>Con amor,</p>
          <p className="text-xl font-semibold text-red-900 mt-2">Carlos & Karen 💕</p>
        </div>
        
      </div>
    </div>
  );
}