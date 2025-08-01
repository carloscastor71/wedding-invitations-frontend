"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  invitationApi,
  InvitationData,
  CompleteFormRequest,
} from "../../../lib/api";
import GuestForm from "@/app/components/GuestForm";
import { MapPin, Clock, Shirt, Heart } from "lucide-react";


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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  // Estados para las transiciones elegantes
  const [showIntro, setShowIntro] = useState(true);
  const [introStage, setIntroStage] = useState(0);
  const [currentEvent, setCurrentEvent] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  // Contador regresivo
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const weddingDate = new Date("2025-12-20T17:30:00-06:00");

  const events: WeddingEvent[] = [
    {
      name: "Ceremonia Religiosa",
      time: "5:30 PM",
      venue: "Parroquia De San Agustín",
      address: "Paseo Viento Sur 350, 27258 Torreón",
      icon: "⛪",
    },
    {
      name: "Ceremonia Civil",
      time: "8:00 PM",
      venue: "Salon MONET",
      address: "Cll Lisboa 101 Granjas de San Isidro, 27100 Torreón, Coahuila",
      icon: "💍",
    },
    {
      name: "Recepción",
      time: "8:30 PM",
      venue: "Salon MONET",
      address: "Cll Lisboa 101 Granjas de San Isidro, 27100 Torreón, Coahuila",
      icon: "🎉",
    },
  ];

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  // Optimized scroll listener
  useEffect(() => {
    let rafId: number;

    const throttledScroll = () => {
      rafId = requestAnimationFrame(() => {
        handleScroll();
      });
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [handleScroll]);

  const openGoogleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, "_blank");
  };

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const data = await invitationApi.getInvitation(code);
        setInvitation(data);
      } catch (err) {
        setError("Error al cargar la invitación");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchInvitation();
    }
  }, [code]);

  // Secuencia de intro elegante
  useEffect(() => {
    const timer1 = setTimeout(() => setIntroStage(1), 2000);
    const timer2 = setTimeout(() => setIntroStage(2), 4000);
    const timer3 = setTimeout(() => setShowIntro(false), 7000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Contador regresivo optimizado
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = weddingDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [weddingDate]);

  const handleResponse = async (attending: boolean) => {
    if (!invitation) return;

    setResponding(true);
    try {
      await invitationApi.respondToInvitation(code, attending);
      setInvitation({
        ...invitation,
        hasResponded: true,
        isAttending: attending,
      });
      if (attending) {
        setShowGuestForm(true);
      }
    } catch (err) {
      setError("Error al guardar tu respuesta");
      console.error(err);
    } finally {
      setResponding(false);
    }
  };

  const handleFormSubmit = async (formData: CompleteFormRequest) => {
    await invitationApi.completeForm(code, formData);
    setInvitation((prev) =>
      prev
        ? {
            ...prev,
            formCompleted: true,
            confirmedGuests: formData.guests.length,
          }
        : null
    );
    setShowGuestForm(false);
  };

  const handleFormCancel = () => {
    setShowGuestForm(false);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative"
        style={{
          backgroundImage: `url('/images/roses-intro.webp')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div
          className="relative z-10 text-xl font-serif"
          style={{ color: "#4c0013" }}
        >
          Cargando invitación...
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative"
        style={{
          backgroundImage: `url('/images/roses-intro.webp')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="relative z-10 text-center">
          <div className="text-xl mb-4 font-serif" style={{ color: "#4c0013" }}>
            {error || "Invitación no encontrada"}
          </div>
          <p style={{ color: "#586e26" }}>
            Verifica que el enlace sea correcto
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Fondo independiente con efecto scroll optimizado */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center will-change-transform"
        style={{
          backgroundImage: `url('/images/roses-intro.webp')`,
          backgroundAttachment: "fixed",
          transform: showIntro
            ? `scale(1.1) translateY(20px)`
            : `scale(${1 + scrollY * 0.0005}) translateY(${scrollY * 0.05}px)`,
          filter: showIntro
            ? `blur(6px)`
            : `blur(${Math.min(scrollY * 0.01, 5)}px)`,
          transition: showIntro
            ? "transform 4s ease-out, filter 4s ease-out"
            : "transform 0.1s ease-out, filter 0.1s ease-out",
        }}
      />

      {/* ===== INTRO ELEGANTE CON SECUENCIAS ===== */}
      {showIntro && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Fondo base de imagen con zoom progresivo */}
          <div
            className={`absolute inset-0 transition-all duration-[4000ms] ease-out`}
            style={{
              backgroundImage: `url('/images/roses-intro.webp')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform:
                introStage >= 1
                  ? "scale(1.1) translateY(20px)"
                  : "scale(1) translateY(0)",
              filter: introStage >= 1 ? "blur(6px) sepia(20%)" : "none",
              transition: "transform 4s ease-out, filter 4s ease-out",
            }}
          />

          {/* Overlay degradado que aparece progresivamente */}
          <div
            className={`absolute inset-0 transition-all duration-2000 ${
              introStage >= 1 ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Elementos ondulados decorativos */}
          <div
            className={`absolute inset-0 transition-all duration-2500 ${
              introStage >= 1 ? "opacity-40" : "opacity-0"
            }`}
          >
            <div
              className="absolute top-0 left-0 w-full h-32 opacity-30"
              style={{
                background: `linear-gradient(135deg, transparent 0%, #586e26 50%, transparent 100%)`,
                clipPath: "polygon(0 0, 100% 0, 85% 100%, 15% 100%)",
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-full h-32 opacity-30"
              style={{
                background: `linear-gradient(225deg, transparent 0%, #4c0013 50%, transparent 100%)`,
                clipPath: "polygon(15% 0, 85% 0, 100% 100%, 0 100%)",
              }}
            />
          </div>

          {/* Contenido de nombres */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-2000 ${
              introStage >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="text-center px-6">
              <div className="flex justify-center gap-3 mb-8">
                <Heart
                  className="w-5 h-5 animate-pulse"
                  fill="#4c0013"
                  style={{ color: "#4c0013" }}
                />
                <Heart
                  className="w-7 h-7 animate-pulse delay-300"
                  fill="#4c0013"
                  style={{ color: "#4c0013" }}
                />
                <Heart
                  className="w-5 h-5 animate-pulse delay-500"
                  fill="#4c0013"
                  style={{ color: "#4c0013" }}
                />
              </div>

              <h1
                className="text-5xl md:text-7xl font-serif mb-6 tracking-wide leading-tight"
                style={{ color: "#4c0013" }}
              >
                Karen
                <span className="mx-3" style={{ color: "#586e26" }}>
                  &
                </span>
                Carlos
              </h1>

              <div
                className="w-24 h-0.5 mx-auto mb-8"
                style={{ backgroundColor: "#4c0013" }}
              ></div>

              <h2
                className="text-2xl md:text-3xl font-light mb-8 tracking-widest"
                style={{ color: "#4c0013" }}
              >
                NOS CASAMOS
              </h2>

              <div
                className="inline-block px-8 py-4 rounded-xl border-2 shadow-2xl backdrop-blur-sm"
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,240,0.4) 100%, rgba(255,255,240,0.3) 60%, rgba(88,110,38,0.2) 100%)`,
                  borderColor: "#586e26",
                  color: "#4c0013",
                }}
              >
                <p className="text-xl md:text-2xl font-semibold">
                  Sábado, 20 de Diciembre 2025
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowIntro(false)}
            className="absolute inset-0 w-full h-full cursor-pointer z-10 bg-transparent"
            aria-label="Continuar a la invitación"
          />
        </div>
      )}

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <div
        className={`transition-all duration-1000 ${
          showIntro ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* SECCIÓN 1: HERO - Nombres con overlay elegante */}
        <section className="min-h-screen flex flex-col justify-center items-center relative px-6">
          {/* Elementos decorativos ondulados */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 -right-20 w-96 h-96 opacity-10 rounded-full" />
            <div className="absolute bottom-20 -left-20 w-80 h-80 opacity-10 rounded-full" />
          </div>

          <div className="relative z-10 text-center">
            <div className="flex justify-center gap-3 mb-8">
              <Heart
                className="w-6 h-6 animate-pulse"
                fill="#4c0013"
                style={{ color: "#4c0013" }}
              />
              <Heart
                className="w-8 h-8 animate-pulse delay-300"
                fill="#4c0013"
                style={{ color: "#4c0013" }}
              />
              <Heart
                className="w-6 h-6 animate-pulse delay-500"
                fill="#4c0013"
                style={{ color: "#4c0013" }}
              />
            </div>

            <h1
              className="text-5xl md:text-7xl font-serif mb-6 tracking-wide leading-tight"
              style={{
                color: "#4c0013",
                textShadow:
                  "2px 2px 4px rgba(0,0,0,0.3), 0 0 8px rgba(255,255,255,0.8)",
              }}
            >
              Karen
              <span className="mx-3" style={{ color: "#586e26" }}>
                {" "}
                &{" "}
              </span>
              Carlos
            </h1>

            <div
              className="w-24 h-0.5 mx-auto mb-8"
              style={{ backgroundColor: "#4c0013" }}
            ></div>

            <h2
              className="text-xl md:text-2xl font-light mb-8 tracking-widest opacity-90"
              style={{ color: "#4c0013" }}
            >
              NOS CASAMOS
            </h2>

            <div
              className="inline-block px-8 py-4 rounded-xl border-2 shadow-lg backdrop-blur-sm"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,240,0.4) 100%, rgba(255,255,240,0.3) 60%, rgba(88,110,38,0.2) 100%)`,
                borderColor: "#586e26",
                color: "#4c0013",
              }}
            >
              <p className="text-lg md:text-xl font-semibold">
                Sábado, 20 de Diciembre 2025
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: SALUDO PERSONAL */}
        <section className="py-20 px-6 relative">
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <h3
              className="text-3xl font-serif mb-6"
              style={{
                color: "#fffff0",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              ¡Hola {invitation.familyName}! 👋
            </h3>
            <div
              className="inline-block px-8 py-4 rounded-xl border-2 shadow-lg backdrop-blur-sm"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,240,0.4) 100%, rgba(255,255,240,0.3) 60%, rgba(88,110,38,0.2) 100%)`,
                borderColor: "#586e26",
                color: "#4c0013",
              }}
            >
              <p className="text-lg leading-relaxed">
                Querido/a <strong>{invitation.contactPerson}</strong>, es un
                honor para nosotros invitarte a celebrar uno de los días más
                importantes de nuestras vidas. Tu presencia hará que este
                momento sea aún más especial.
              </p>
            </div>
            <div
              className="w-16 h-0.5 mx-auto"
              style={{ backgroundColor: "#fffff0" }}
            ></div>
          </div>
        </section>

        {/* SECCIÓN 3: ITINERARIO CON CARRUSEL */}
        <section className="py-20 relative">
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <h3
              className="text-3xl font-serif text-center mb-12"
              style={{
                color: "#fffff0",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              Programa del Día
            </h3>

            {/* Carrusel móvil */}
{/* Carrusel móvil con swipe y navegación */}
<div className="md:hidden">
  <div className="relative">
    {/* Área de swipe */}
    <div 
      className="overflow-hidden rounded-xl"
      onTouchStart={(e) => {
        const touch = e.touches[0];
        setTouchStart(touch.clientX);
      }}
      onTouchMove={(e) => {
        if (!touchStart) return;
        const currentTouch = e.touches[0].clientX;
        const diff = touchStart - currentTouch;
        
        if (Math.abs(diff) > 50) {
          if (diff > 0 && currentEvent < events.length - 1) {
            setCurrentEvent(currentEvent + 1);
          } else if (diff < 0 && currentEvent > 0) {
            setCurrentEvent(currentEvent - 1);
          }
          setTouchStart(null);
        }
      }}
      onTouchEnd={() => {
        setTouchStart(null);
      }}
    >
      <div
        className="flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentEvent * 100}%)` }}
      >
        {events.map((event, index) => (
          <div key={index} className="w-full flex-shrink-0 px-4">
            <EventCard event={event} onOpenMaps={openGoogleMaps} />
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Indicadores mejorados */}
  <div className="flex justify-center gap-3 mt-6">
    {events.map((_, index) => (
      <button
        key={index}
        onClick={() => setCurrentEvent(index)}
        className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 ${
          currentEvent === index ? "scale-125" : "scale-100"
        }`}
        style={{
          backgroundColor:
            currentEvent === index
              ? "#fffff0"
              : "rgba(255,255,240,0.4)",
        }}
        aria-label={`Ver ${events[index].name}`}
      />
    ))}
  </div>

  {/* Instrucciones */}
  <div className="text-center mt-3">
    <p className="text-sm opacity-70" style={{ color: "#fffff0" }}>
      👆 Desliza para navegar
    </p>
  </div>
</div>


            {/* Grid para desktop */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <EventCard
                  key={index}
                  event={event}
                  onOpenMaps={openGoogleMaps}
                />
              ))}
            </div>
          </div>
        </section>

        {/* SECCIÓN 4: CÓDIGO DE VESTIMENTA */}
        <section className="py-20 px-6 relative">
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <div className="flex justify-center mb-6">
              <div
                className="p-4 rounded-full shadow-lg"
                style={{ backgroundColor: "#586e26" }}
              >
                <Shirt className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3
              className="text-3xl font-serif mb-6"
              style={{ color: "#4c0013" }}
            >
              Código de Vestimenta
            </h3>

            <div
              className="backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,240,0.4) 100%, rgba(255,255,240,0.3) 60%, rgba(88,110,38,0.2) 100%)`,
                borderColor: "#586e26",
                color: "#4c0013",
              }}
            >
              <p
                className="text-2xl font-semibold mb-2"
                style={{ color: "#4c0013" }}
              >
                FORMAL
              </p>
              <p className="text-lg mb-6" style={{ color: "#586e26" }}>
                Te sugerimos vestir elegante para esta ocasión especial
              </p>

              {/* Separador sutil */}
              <div
                className="w-16 h-px mx-auto mb-6"
                style={{ backgroundColor: "#4c0013", opacity: 0.3 }}
              ></div>

              <div className="text-left">
                <p
                  className="font-medium mb-3 text-center"
                  style={{ color: "#4c0013" }}
                >
                  Por favor evita estos colores:
                </p>
                <div className="space-y-2 text-sm">
                  <p style={{ color: "#586e26" }}>
                    <span className="font-medium" style={{ color: "#4c0013" }}>
                      • Blanco o marfil
                    </span>{" "}
                    - reservado para la novia
                  </p>
                  <p style={{ color: "#586e26" }}>
                    <span className="font-medium" style={{ color: "#4c0013" }}>
                      • Negro total
                    </span>{" "}
                    - muy formal para la ocasión
                  </p>
                  <p style={{ color: "#586e26" }}>
                    <span className="font-medium" style={{ color: "#4c0013" }}>
                      • Rojo intenso
                    </span>{" "}
                    - muy llamativo
                  </p>
                  <p style={{ color: "#586e26" }}>
                    <span className="font-medium" style={{ color: "#4c0013" }}>
                      • Colores neón
                    </span>{" "}
                    - muy brillantes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 5: CONTADOR REGRESIVO */}
        <section className="py-20 relative">
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h3
              className="text-3xl font-serif mb-8"
              style={{
                color: "#fffff0",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              Faltan solo...
            </h3>

            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { value: timeLeft.days, label: "Días" },
                { value: timeLeft.hours, label: "Horas" },
                { value: timeLeft.minutes, label: "Min" },
                { value: timeLeft.seconds, label: "Seg" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="backdrop-blur-sm rounded-xl p-4 shadow-lg border-2"
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,240,0.4) 100%, rgba(255,255,240,0.3) 60%, rgba(88,110,38,0.2) 100%)`,
                    borderColor: "#4c0013",
                  }}
                >
                  <div
                    className="text-2xl md:text-3xl font-bold"
                    style={{ color: "#4c0013" }}
                  >
                    {item.value.toString().padStart(2, "0")}
                  </div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: "#586e26" }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <p
              className="text-xl md:text-2xl opacity-90"
              style={{
                color: "#fffff0",
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
              }}
            >
              ¡No te lo pierdas!
            </p>
          </div>
        </section>
        {/* SECCIÓN 6: CONFIRMACIÓN DE ASISTENCIA */}
        {!invitation.hasResponded ? (
          <section className="py-20 px-6 relative">
            <div className="max-w-2xl mx-auto text-center relative z-10">
              <h3
                className="text-3xl font-serif mb-6"
                style={{ color: "#4c0013" }}
              >
                Confirma tu Asistencia
              </h3>
              <p className="text-lg mb-6" style={{ color: "#4c0013" }}>
                Por favor confirma si podrás acompañarnos en la{" "}
                <strong>recepción</strong>
              </p>
              <p
                className="text-sm mb-8 opacity-80"
                style={{ color: "#4c0013" }}
              >
                Fecha límite: 20 de Noviembre 2025
              </p>

              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => handleResponse(true)}
                  disabled={responding}
                  className="px-8 py-4 rounded-xl font-semibold transition-all hover:opacity-90 hover:scale-105 disabled:opacity-50 shadow-lg border-2"
                  style={{
                    backgroundColor: "#586e26",
                    color: "#fffff0",
                    borderColor: "#586e26",
                  }}
                >
                  {responding ? "Guardando..." : "✅ Sí, asistiré"}
                </button>
                <button
                  onClick={() => handleResponse(false)}
                  disabled={responding}
                  className="px-8 py-4 rounded-xl font-semibold transition-all hover:opacity-90 hover:scale-105 disabled:opacity-50 shadow-lg border-2"
                  style={{
                    backgroundColor: "#4c0013",
                    color: "#fffff0",
                    borderColor: "#4c0013",
                  }}
                >
                  {responding ? "Guardando..." : "❌ No podré asistir"}
                </button>
              </div>
            </div>
          </section>
        ) : invitation.isAttending &&
          !invitation.formCompleted &&
          showGuestForm ? (
          <div className="relative">
            <div
              className="absolute inset-0"
              style={{
                background: `rgba(255,255,240,0.95)`,
              }}
            />
            <div className="relative z-10">
              <GuestForm
                maxGuests={invitation.maxGuests}
                familyName={invitation.familyName}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        ) : invitation.isAttending && !invitation.formCompleted ? (
          <section className="py-20 px-6 relative">
            <div
              className="absolute inset-0"
              style={{
                background: `rgba(255,255,240,0.95)`,
              }}
            />
            <div className="max-w-2xl mx-auto text-center relative z-10">
              <h3
                className="text-3xl font-serif mb-6"
                style={{ color: "#4c0013" }}
              >
                ¡Gracias por confirmar!
              </h3>
              <div className="mb-8">
                <div className="text-6xl mb-4">🎉</div>
                <p
                  className="text-xl font-semibold mb-4"
                  style={{ color: "#586e26" }}
                >
                  ¡Nos vemos el 20 de diciembre!
                </p>
              </div>
              <div
                className="bg-yellow-50 border-2 rounded-xl p-6 mb-8"
                style={{ borderColor: "#586e26" }}
              >
                <p className="font-medium text-lg" style={{ color: "#586e26" }}>
                  Último paso: Por favor proporciona los nombres de las personas
                  que asistirán
                </p>
              </div>
              <button
                onClick={() => setShowGuestForm(true)}
                className="px-8 py-4 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:scale-105 shadow-lg"
                style={{ backgroundColor: "#4c0013" }}
              >
                📝 Completar Lista de Invitados
              </button>
            </div>
          </section>
        ) : (
          <section className="py-20 px-6 relative">
            <div className="absolute inset-0" style={{}} />
            <div className="max-w-2xl mx-auto text-center relative z-10">
              <h3
                className="text-3xl font-serif mb-6"
                style={{ color: "#4c0013" }}
              >
                {invitation.isAttending
                  ? "¡Todo Listo!"
                  : "¡Gracias por tu respuesta!"}
              </h3>
              {invitation.isAttending ? (
                <div className="mb-6">
                  <div className="text-6xl mb-4">🎉</div>
                  <p
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#586e26" }}
                  >
                    ¡Nos vemos el 20 de diciembre!
                  </p>
                  <p className="mb-4" style={{ color: "#586e26" }}>
                    Hemos registrado {invitation.confirmedGuests} invitado
                    {invitation.confirmedGuests !== 1 ? "s" : ""} para tu
                    familia.
                  </p>
                  <div
                    className="bg-green-50 border-2 rounded-xl p-4"
                    style={{ borderColor: "#586e26" }}
                  >
                    <p className="font-medium" style={{ color: "#586e26" }}>
                      ✅ Formulario completado - ¡Te esperamos!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="text-6xl mb-4">😢</div>
                  <p
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#586e26" }}
                  >
                    Lamentamos que no puedas acompañarnos
                  </p>
                  <p style={{ color: "#586e26" }}>
                    Te agradecemos por avisarnos. ¡Esperamos celebrar contigo en
                    otra ocasión!
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="py-12 relative">
          <div className="max-w-md mx-auto text-center relative z-10">
            <p className="opacity-90 mb-2" style={{ color: "#586e26" }}>
              Con amor,
            </p>
            <p className="text-2xl font-serif" style={{ color: "#586e26" }}>
              Carlos & Karen 💕
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Componente EventCard elegante con funcionalidad de Maps y fondo consistente
const EventCard = ({
  event,
  onOpenMaps,
}: {
  event: WeddingEvent;
  onOpenMaps: (address: string) => void;
}) => (
  <div
    className="backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border-t-4 hover:shadow-2xl transition-all duration-300 hover:scale-105"
    style={{
      background: `linear-gradient(135deg, rgba(255,255,240,0.4) 100%, rgba(255,255,240,0.3) 60%, rgba(88,110,38,0.2) 100%)`,
      borderColor: "#4c0013",
    }}
  >
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{event.icon}</span>
        <h4
          className="text-xl font-semibold font-serif"
          style={{ color: "#4c0013" }}
        >
          {event.name}
        </h4>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2" style={{ color: "#586e26" }}>
          <Clock className="w-5 h-5" />
          <span className="font-medium text-lg">{event.time}</span>
        </div>
        <div className="flex items-start gap-2" style={{ color: "#586e26" }}>
          <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
          <div>
            <div className="font-semibold text-lg">{event.venue}</div>
            <div className="text-sm opacity-80 leading-relaxed">
              {event.address}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onOpenMaps(event.address)}
        className="w-full py-3 px-4 rounded-xl text-white font-semibold transition-all hover:opacity-90 hover:scale-105 shadow-lg border-2"
        style={{
          backgroundColor: "#586e26",
          borderColor: "#586e26",
        }}
      >
        📍 Ver en Google Maps
      </button>
    </div>
  </div>
);
