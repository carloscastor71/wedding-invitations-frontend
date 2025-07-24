'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { invitationApi, InvitationData, CompleteFormRequest } from '../../../lib/api';
import GuestForm from '@/app/components/GuestForm';
import { MapPin, Calendar, Clock, Shirt, Heart } from 'lucide-react';

// Definir el tipo para los eventos
interface WeddingEvent {
  name: string;
  time: string;
  venue: string;
  address: string;
  icon: string;
}

export default function InvitationPage() {
  const params = useParams();
  const code = params.code as string;
  
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responding, setResponding] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  
  // Estados para las transiciones
  const [showIntro, setShowIntro] = useState(true);
  const [showNames, setShowNames] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(0);
  
  // Contador regresivo
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const weddingDate = new Date('2025-12-20T23:30:00Z');

  const events: WeddingEvent[] = [
    {
      name: "Ceremonia Religiosa",
      time: "5:30 PM",
      venue: "Parroquia De San Agustín",
      address: "Paseo Viento Sur 350, 27258 Torreón",
      icon: "⛪"
    },
    {
      name: "Ceremonia Civil", 
      time: "8:00 PM",
      venue: "Salon MONET",
      address: "Cll Lisboa 101 Granjas de San Isidro, 27100 Torreón, Coahuila",
      icon: "💍"
    },
    {
      name: "Recepción",
      time: "8:30 PM", 
      venue: "Salon MONET",
      address: "Cll Lisboa 101 Granjas de San Isidro, 27100 Torreón, Coahuila",
      icon: "🎉"
    }
  ];

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

  // Transición elegante: Rosas con zoom in → Fusión de colores → Invitación
  useEffect(() => {
    const nameTimer = setTimeout(() => {
      setShowNames(true);
    }, 2500);
    
    const invitationTimer = setTimeout(() => {
      setShowIntro(false);
    }, 6000);
    
    return () => {
      clearTimeout(nameTimer);
      clearTimeout(invitationTimer);
    };
  }, []);

  // Contador regresivo
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = weddingDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleResponse = async (attending: boolean) => {
    if (!invitation) return;
    
    setResponding(true);
    try {
      await invitationApi.respondToInvitation(code, attending);

      setInvitation({
        ...invitation,
        hasResponded: true,
        isAttending: attending
      });

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#fffff0'}}>
        <div className="text-xl" style={{color: '#4c0013'}}>Cargando invitación...</div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#fffff0'}}>
        <div className="text-center">
          <div className="text-xl mb-4" style={{color: '#4c0013'}}>{error || 'Invitación no encontrada'}</div>
          <p style={{color: '#586e26'}}>Verifica que el enlace sea correcto</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen" style={{backgroundColor: '#fffff0'}}>
      
      {/* INTRO ELEGANTE - Zoom in de rosas → Fusión de colores */}
      {showIntro && (
        <div className="fixed inset-0 z-50">
          {/* Imagen de rosas con zoom in */}
          <div 
            className={`absolute inset-0 transition-all duration-4000 ${
              showNames ? 'opacity-30 scale-110' : 'opacity-100 scale-100'
            }`}
          >
            <img 
              src="/images/roses-intro.webp"
              alt="Rosas de boda"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"></div>
          </div>
          
          {/* Fusión de colores ivory + verde que aparece gradualmente */}
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-all duration-3000 ${
              showNames ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{
              background: showNames 
                ? 'linear-gradient(135deg, #fffff0 0%, #f0f5e6 30%, #586e26 70%, #4a5f22 100%)'
                : 'transparent'
            }}
          >
            <div className="text-center px-6" style={{color: '#4c0013'}}>
              <div className="flex justify-center gap-3 mb-8">
                <Heart className="w-6 h-6 animate-pulse" fill="currentColor" />
                <Heart className="w-8 h-8 animate-pulse delay-300" fill="currentColor" />
                <Heart className="w-6 h-6 animate-pulse delay-500" fill="currentColor" />
              </div>

              <h1 className="text-6xl md:text-8xl font-serif mb-6 tracking-wide leading-tight">
                Carlos
                <span style={{color: '#586e26'}}> & </span>
                Karen
              </h1>
              
              <div className="w-24 h-0.5 mx-auto mb-8" style={{backgroundColor: '#4c0013'}}></div>
              
              <h2 className="text-2xl md:text-3xl font-light mb-8 tracking-widest">
                NOS CASAMOS
              </h2>
              
              {/* Fecha con fondo para contraste */}
              <div 
                className="backdrop-blur-sm rounded-lg px-6 py-4 border-2 shadow-lg"
                style={{
                  backgroundColor: 'rgba(255, 255, 240, 0.9)',
                  borderColor: '#4c0013',
                  color: '#4c0013'
                }}
              >
                <p className="text-xl md:text-2xl font-semibold">
                  Sábado, 20 de Diciembre 2025
                </p>
              </div>
            </div>
          </div>
          
          {/* Click para saltar */}
          <button 
            onClick={() => setShowIntro(false)}
            className="absolute inset-0 w-full h-full cursor-pointer z-10"
            aria-label="Continuar a la invitación"
          />
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className={`min-h-screen transition-all duration-1000 ${
        showIntro ? 'opacity-0' : 'opacity-100'
      }`}>
        
        {/* HERO SECTION - Nombres con gradiente ivory-verde */}
        <section className="min-h-screen flex flex-col justify-center items-center relative px-6" 
                 style={{background: `linear-gradient(135deg, #fffff0 0%, #f0f5e6 30%, #586e26 70%, #4a5f22 100%)`}}>
          
          <div className="relative z-10 text-center" style={{color: '#4c0013'}}>
            <div className="flex justify-center gap-3 mb-8">
              <Heart className="w-6 h-6 animate-pulse" fill="currentColor" />
              <Heart className="w-8 h-8 animate-pulse delay-300" fill="currentColor" />
              <Heart className="w-6 h-6 animate-pulse delay-500" fill="currentColor" />
            </div>

            <h1 className="text-5xl md:text-7xl font-serif mb-6 tracking-wide leading-tight">
              Carlos
              <span style={{color: '#586e26'}}> & </span>
              Karen
            </h1>
            
            <div className="w-24 h-0.5 mx-auto mb-8" style={{backgroundColor: '#4c0013'}}></div>
            
            <h2 className="text-xl md:text-2xl font-light mb-8 tracking-widest opacity-90">
              NOS CASAMOS
            </h2>
            
            {/* Fecha con fondo ivory para contraste */}
            <div 
              className="backdrop-blur-sm rounded-lg px-6 py-4 border-2 shadow-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 240, 0.95)',
                borderColor: '#4c0013',
                color: '#4c0013'
              }}
            >
              <p className="text-lg md:text-xl font-semibold">
                Sábado, 20 de Diciembre 2025
              </p>
            </div>
          </div>
        </section>

        {/* SALUDO PERSONAL - Base ivory con vino fluyendo */}
        <section className="py-16 px-6 relative" 
                 style={{
                   background: `linear-gradient(135deg, #586e26 0%, rgba(88, 110, 38, 0.8) 15%, rgba(240, 245, 230, 0.9) 35%, #fffff0 50%, #fffff0 100%)`,
                   backgroundBlendMode: 'soft-light'
                 }}>
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-serif mb-6" style={{color: '#4c0013'}}>
              ¡Hola {invitation.familyName}! 👋
            </h3>
            <p className="text-lg leading-relaxed mb-6" style={{color: '#4c0013'}}>
              Querido/a <strong>{invitation.contactPerson}</strong>, es un honor para nosotros 
              invitarte a celebrar uno de los días más importantes de nuestras vidas. 
              Tu presencia hará que este momento sea aún más especial.
            </p>
            <div className="w-16 h-0.5 mx-auto" style={{backgroundColor: '#4c0013'}}></div>
          </div>
        </section>

        {/* ITINERARIO - Ivory base con vino deslizándose suavemente */}
        <section className="py-16 relative" 
                 style={{
                   background: `linear-gradient(135deg, #fffff0 0%, #fffff0 30%, rgba(76, 0, 19, 0.1) 45%, rgba(76, 0, 19, 0.7) 70%, #4c0013 85%, #4c0013 100%)`,
                   backgroundBlendMode: 'multiply'
                 }}>
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-3xl font-serif text-center mb-12" 
                style={{
                  color: '#fffff0',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}>
              Programa del Día
            </h3>
            
            {/* Mobile Carousel */}
            <div className="md:hidden">
              <div className="relative overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentEvent * 100}%)` }}
                >
                  {events.map((event, index) => (
                    <div key={index} className="w-full flex-shrink-0 px-4">
                      <EventCard event={event} />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Carousel dots */}
              <div className="flex justify-center gap-2 mt-6">
                {events.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentEvent(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentEvent === index ? 'opacity-100' : 'opacity-40'
                    }`}
                    style={{backgroundColor: '#4c0013'}}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <EventCard key={index} event={event} />
              ))}
            </div>
          </div>
        </section>

        {/* CÓDIGO DE VESTIMENTA - Continuación del flujo vino a ivory */}
        <section className="py-16 px-6 relative" 
                 style={{
                   background: `linear-gradient(135deg, #4c0013 0%, rgba(76, 0, 19, 0.8) 15%, rgba(248, 244, 240, 0.9) 35%, #fffff0 50%, #fffff0 100%)`,
                   backgroundBlendMode: 'soft-light'
                 }}>
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full" style={{backgroundColor: '#586e26'}}>
                <Shirt className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-serif mb-4" style={{color: '#4c0013'}}>
              Código de Vestimenta
            </h3>
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4" style={{borderColor: '#586e26'}}>
              <p className="text-xl font-semibold mb-2" style={{color: '#4c0013'}}>
                FORMAL
              </p>
              <p style={{color: '#586e26'}}>
                Te sugerimos vestir elegante para esta ocasión especial
              </p>
            </div>
          </div>
        </section>

        {/* CONTADOR REGRESIVO - Verde deslizando suavemente */}
        <section className="py-16 relative" 
                 style={{
                   background: `linear-gradient(135deg, #fffff0 0%, #fffff0 30%, rgba(88, 110, 38, 0.2) 45%, rgba(88, 110, 38, 0.8) 70%, #586e26 85%, #586e26 100%)`,
                   backgroundBlendMode: 'multiply'
                 }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h3 className="text-3xl font-serif mb-8" 
                style={{
                  color: '#fffff0',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}>
              Faltan solo...
            </h3>
            
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { value: timeLeft.days, label: 'Días' },
                { value: timeLeft.hours, label: 'Horas' },
                { value: timeLeft.minutes, label: 'Min' },
                { value: timeLeft.seconds, label: 'Seg' }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="text-2xl md:text-3xl font-bold" style={{color: '#4c0013'}}>
                    {item.value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm" style={{color: '#586e26'}}>{item.label}</div>
                </div>
              ))}
            </div>
            
            <p className="text-lg opacity-90" 
               style={{
                 color: '#fffff0',
                 textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
               }}>
              ¡No te lo pierdas!
            </p>
          </div>
        </section>

        {/* CONFIRMACIÓN DE ASISTENCIA - Cierre con vino fluyendo */}
        {!invitation.hasResponded ? (
          <section className="py-16 px-6 relative" 
                   style={{
                     background: `linear-gradient(135deg, #586e26 0%, rgba(88, 110, 38, 0.7) 15%, rgba(255, 255, 240, 0.9) 35%, #fffff0 50%, rgba(76, 0, 19, 0.1) 70%, rgba(76, 0, 19, 0.8) 90%, #4c0013 100%)`,
                     backgroundBlendMode: 'soft-light'
                   }}>
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-3xl font-serif mb-6" style={{color: '#4c0013'}}>
                Confirma tu Asistencia
              </h3>
              <p className="text-lg mb-8" style={{color: '#4c0013'}}>
                Por favor confirma si podrás acompañarnos en la <strong>recepción</strong>
              </p>
              <p className="text-sm mb-8" style={{color: '#4c0013', opacity: 0.8}}>
                Fecha límite: 31 de Octubre 2025
              </p>
              
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => handleResponse(true)}
                  disabled={responding}
                  className="px-8 py-3 rounded-lg font-semibold transition-colors hover:opacity-90 disabled:opacity-50 shadow-lg"
                  style={{backgroundColor: '#586e26', color: '#fffff0'}}
                >
                  {responding ? 'Guardando...' : '✅ Sí, asistiré'}
                </button>
                <button 
                  onClick={() => handleResponse(false)}
                  disabled={responding}
                  className="px-8 py-3 rounded-lg font-semibold transition-colors hover:opacity-90 disabled:opacity-50 shadow-lg"
                  style={{backgroundColor: '#4c0013', color: '#fffff0'}}
                >
                  {responding ? 'Guardando...' : '❌ No podré asistir'}
                </button>
              </div>
            </div>
          </section>
        ) : invitation.isAttending && !invitation.formCompleted && showGuestForm ? (
          <GuestForm
            maxGuests={invitation.maxGuests}
            familyName={invitation.familyName}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        ) : invitation.isAttending && !invitation.formCompleted ? (
          <section className="py-16 px-6" style={{backgroundColor: '#fffff0'}}>
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-semibold mb-4" style={{color: '#4c0013'}}>
                ¡Gracias por confirmar!
              </h3>
              <div className="mb-6" style={{color: '#586e26'}}>
                <div className="text-6xl mb-2">🎉</div>
                <p className="text-xl font-semibold">¡Nos vemos el 20 de diciembre!</p>
              </div>
              <div className="bg-yellow-50 border-2 rounded-lg p-4 mb-6" style={{borderColor: '#586e26'}}>
                <p className="font-medium" style={{color: '#586e26'}}>
                  Último paso: Por favor proporciona los nombres de las personas que asistirán
                </p>
              </div>
              <button
                onClick={() => setShowGuestForm(true)}
                className="px-8 py-3 rounded-lg font-semibold text-white transition-colors hover:opacity-90"
                style={{backgroundColor: '#4c0013'}}
              >
                📝 Completar Lista de Invitados
              </button>
            </div>
          </section>
        ) : (
          <section className="py-16 px-6" style={{backgroundColor: '#fffff0'}}>
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-semibold mb-4" style={{color: '#4c0013'}}>
                {invitation.isAttending ? '¡Todo Listo!' : '¡Gracias por tu respuesta!'}
              </h3>
              {invitation.isAttending ? (
                <div className="mb-4" style={{color: '#586e26'}}>
                  <div className="text-6xl mb-2">🎉</div>
                  <p className="text-xl font-semibold">¡Nos vemos el 20 de diciembre!</p>
                  <p className="mt-2" style={{color: '#586e26'}}>
                    Hemos registrado {invitation.confirmedGuests} invitado{invitation.confirmedGuests !== 1 ? 's' : ''} para tu familia.
                  </p>
                  <div className="bg-green-50 border-2 rounded-lg p-4 mt-4" style={{borderColor: '#586e26'}}>
                    <p className="font-medium" style={{color: '#586e26'}}>
                      ✅ Formulario completado - ¡Te esperamos!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-4" style={{color: '#586e26'}}>
                  <div className="text-6xl mb-2">😢</div>
                  <p className="text-xl font-semibold">Lamentamos que no puedas acompañarnos</p>
                  <p className="mt-2">
                    Te agradecemos por avisarnos. ¡Esperamos celebrar contigo en otra ocasión!
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="py-12 text-center" style={{backgroundColor: '#4c0013'}}>
          <p className="text-white opacity-90">Con amor,</p>
          <p className="text-xl font-serif text-white mt-2">Carlos & Karen 💕</p>
        </footer>
        
      </div>
    </div>
  );
}

// Componente EventCard elegante
const EventCard = ({ event }: { event: WeddingEvent }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden border-t-4 hover:shadow-xl transition-shadow" 
       style={{borderColor: '#4c0013'}}>
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{event.icon}</span>
        <h4 className="text-xl font-semibold" style={{color: '#4c0013'}}>
          {event.name}
        </h4>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2" style={{color: '#586e26'}}>
          <Clock className="w-4 h-4" />
          <span className="font-medium">{event.time}</span>
        </div>
        <div className="flex items-start gap-2" style={{color: '#586e26'}}>
          <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
          <div>
            <div className="font-medium">{event.venue}</div>
            <div className="text-sm opacity-80">{event.address}</div>
          </div>
        </div>
      </div>
      
      <button 
        className="w-full py-3 px-4 rounded-lg text-white font-medium transition-all hover:opacity-90 hover:scale-105"
        style={{backgroundColor: '#586e26'}}
      >
        📍 Ver en Maps
      </button>
    </div>
  </div>
);