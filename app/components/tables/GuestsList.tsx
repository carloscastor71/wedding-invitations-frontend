import React, { useEffect, useState } from 'react';
import GuestRow from '@/app/components/tables/Guestrow';
import { familiesApi, tablesApi, GuestAssignment, AvailableTable, GuestsAssignmentResponse } from '@/lib/api';

interface GuestsListProps {
  onDataChange: () => void; // Callback para refrescar mesas y estadísticas
}

export default function GuestsList({ onDataChange }: GuestsListProps) {
  const [guests, setGuests] = useState<GuestAssignment[]>([]);
  const [availableTables, setAvailableTables] = useState<AvailableTable[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  });
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales y cuando cambia la página o filtro
  useEffect(() => {
    loadData();
  }, [pagination.currentPage, searchFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar invitados y mesas disponibles en paralelo
      const [guestsData, tablesData] = await Promise.all([
        familiesApi.getGuestsForAssignment(
          pagination.currentPage,
          pagination.pageSize,
          searchFilter || undefined
        ),
        tablesApi.getAvailable()
      ]);

      setGuests(guestsData.data);
      setPagination(guestsData.pagination);
      setAvailableTables(tablesData);
    } catch (err) {
      console.error('Error loading guests:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar invitados');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio en la asignación de un invitado
  const handleAssignmentChange = async () => {
    // Recargar datos locales
    await loadData();
    
    // Notificar al componente padre para que actualice mesas y estadísticas
    onDataChange();
  };

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  // Manejar búsqueda con debounce
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchFilter(value);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset a página 1 al buscar
  };

  // Estado de carga
  if (loading && guests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando invitados...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error && guests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header con título y búsqueda */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Lista de Invitados
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Total: {pagination.totalItems} invitados
            </p>
          </div>

          {/* Buscador */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar por nombre o familia..."
              value={searchFilter}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Tabla de invitados */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Familia
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                País
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Mesa Actual
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-48">
                Asignar Mesa
              </th>
            </tr>
          </thead>
          <tbody>
            {guests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  {searchFilter ? 'No se encontraron invitados con ese filtro' : 'No hay invitados'}
                </td>
              </tr>
            ) : (
              guests.map((guest) => (
                <GuestRow
                  key={guest.id}
                  guest={guest}
                  availableTables={availableTables}
                  onAssignmentChange={handleAssignmentChange}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Info de página */}
            <div className="text-sm text-gray-600">
              Página {pagination.currentPage} de {pagination.totalPages}
              <span className="ml-2 text-gray-400">
                ({guests.length} de {pagination.totalItems} invitados)
              </span>
            </div>

            {/* Controles de paginación */}
            <div className="flex items-center gap-2">
              {/* Botón Primera página */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1 || loading}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ««
              </button>

              {/* Botón Anterior */}
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1 || loading}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ‹ Anterior
              </button>

              {/* Números de página */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className={`
                        px-3 py-2 text-sm border rounded-lg transition
                        ${pagination.currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Botón Siguiente */}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages || loading}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Siguiente ›
              </button>

              {/* Botón Última página */}
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages || loading}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                »»
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de carga flotante */}
      {loading && guests.length > 0 && (
        <div className="absolute top-4 right-4">
          <div className="bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Actualizando...</span>
          </div>
        </div>
      )}
    </div>
  );
}