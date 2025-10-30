'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TableCard from '@/app/components/tables/TableCard';
import GuestsList from '@/app/components/tables/GuestsList';
import { tablesApi, TableSummary, TableStats } from '@/lib/api';

export default function TablesPage() {
  const [tables, setTables] = useState<TableSummary[]>([]);
  const [stats, setStats] = useState<TableStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch inicial de datos
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar mesas y estadísticas en paralelo
      const [tablesData, statsData] = await Promise.all([
        tablesApi.getSummary(),
        tablesApi.getStats()
      ]);

      setTables(tablesData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar solo las mesas afectadas sin recargar toda la página
  const handleTableAssignment = (oldTableId: number | null, newTableId: number | null) => {
    // Actualizar ocupación de las mesas afectadas
    setTables(prevTables => 
      prevTables.map(table => {
        // Si es la mesa anterior, decrementar ocupación
        if (oldTableId && table.id === oldTableId) {
          const newOccupancy = Math.max(0, table.currentOccupancy - 1);
          const newAvailable = table.maxCapacity - newOccupancy;
          const newPercentage = (newOccupancy / table.maxCapacity) * 100;
          return {
            ...table,
            currentOccupancy: newOccupancy,
            availableSeats: newAvailable,
            percentageOccupied: newPercentage,
            isFull: newOccupancy >= table.maxCapacity
          };
        }
        
        // Si es la mesa nueva, incrementar ocupación
        if (newTableId && table.id === newTableId) {
          const newOccupancy = Math.min(table.maxCapacity, table.currentOccupancy + 1);
          const newAvailable = table.maxCapacity - newOccupancy;
          const newPercentage = (newOccupancy / table.maxCapacity) * 100;
          return {
            ...table,
            currentOccupancy: newOccupancy,
            availableSeats: newAvailable,
            percentageOccupied: newPercentage,
            isFull: newOccupancy >= table.maxCapacity
          };
        }
        
        return table;
      })
    );

    // Actualizar estadísticas
    setStats(prevStats => {
      if (!prevStats) return null;
      
      // Si cambió de "sin asignar" a "asignado"
      if (!oldTableId && newTableId) {
        return {
          ...prevStats,
          assignedGuests: prevStats.assignedGuests + 1,
          unassignedGuests: Math.max(0, prevStats.unassignedGuests - 1),
          totalOccupied: prevStats.totalOccupied + 1,
          availableSeats: prevStats.availableSeats - 1,
          percentageAssigned: ((prevStats.assignedGuests + 1) / prevStats.totalGuests) * 100
        };
      }
      
      // Si cambió de "asignado" a "sin asignar"
      if (oldTableId && !newTableId) {
        return {
          ...prevStats,
          assignedGuests: Math.max(0, prevStats.assignedGuests - 1),
          unassignedGuests: prevStats.unassignedGuests + 1,
          totalOccupied: Math.max(0, prevStats.totalOccupied - 1),
          availableSeats: prevStats.availableSeats + 1,
          percentageAssigned: ((prevStats.assignedGuests - 1) / prevStats.totalGuests) * 100
        };
      }
      
      // Si solo cambió de mesa (asignado a asignado), stats no cambian
      return prevStats;
    });
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mesas...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Asignación de Mesas
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Gestiona la distribución de invitados en las mesas
              </p>
            </div>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium transition flex items-center gap-2"
            >
              <span>←</span>
              <span className="hidden sm:inline">Volver al Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ESTADÍSTICAS GENERALES */}
        {stats && (
          <section className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen General
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Invitados</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalGuests}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Asignados</p>
                <p className="text-3xl font-bold text-green-900">{stats.assignedGuests}</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Sin Asignar</p>
                <p className="text-3xl font-bold text-orange-900">{stats.unassignedGuests}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">% Asignado</p>
                <p className="text-3xl font-bold text-purple-900">
                  {stats.percentageAssigned.toFixed(0)}%
                </p>
              </div>
            </div>
          </section>
        )}

        {/* GRID DE MESAS */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Estado de las Mesas
            </h2>
            <button
              onClick={loadData}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition flex items-center gap-2"
            >
              <span className="text-lg">↻</span>
              <span>Actualizar</span>
            </button>
          </div>

          {/* Grid responsive: 2 columnas en móvil, 4 en tablet, 7 en desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {tables.map((table) => (
              <TableCard 
                key={table.id} 
                table={table}
              />
            ))}
          </div>

          {/* Mensaje si no hay mesas */}
          {tables.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">No se encontraron mesas</p>
            </div>
          )}
        </section>

        {/* LISTA DE INVITADOS CON ASIGNACIÓN */}
        <section>
          <GuestsList onTableAssignment={handleTableAssignment} />
        </section>

      </main>
    </div>
  );
}