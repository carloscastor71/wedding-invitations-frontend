'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TableCard from '@/app/components/tables/TableCard';
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

        {/* PLACEHOLDER PARA LISTA DE INVITADOS */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Lista de Invitados
            </h3>
            <p className="text-gray-500 mb-4">
              Próximamente: Lista paginada de invitados con asignación de mesas
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-gray-400">
              <span>🚧</span>
              <span>En construcción...</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}