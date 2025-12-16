import React, { useState } from 'react';
import { GuestAssignment, AvailableTable, tablesApi } from '@/lib/api';

interface GuestRowProps {
  guest: GuestAssignment;
  availableTables: AvailableTable[];
  onAssignmentChange: (guestId: number, oldTableId: number | null, newTableId: number | null, newTableName: string | null) => void; // Callback con datos del cambio
}

export default function GuestRow({ guest, availableTables, onAssignmentChange }: GuestRowProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manejar cambio de mesa
  const handleTableChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    
    // Guardar valores anteriores
    const oldTableId = guest.tableId;
    const oldTableName = guest.tableName;
    
    try {
      setIsAssigning(true);
      setError(null);

      // Si selecciona "Sin asignar", enviamos null
      const newTableId = selectedValue === '' ? null : parseInt(selectedValue);
      
      // Buscar el nombre de la nueva mesa
      const newTableName = newTableId 
        ? availableTables.find(t => t.id === newTableId)?.tableName || null
        : null;

      // Llamar a la API para asignar la mesa
      await tablesApi.assignGuestToTable(guest.id, newTableId);

      // Actualizar el invitado localmente (optimistic update)
      guest.tableId = newTableId;
      guest.tableName = newTableName;

      // Notificar al componente padre con los datos del cambio
      onAssignmentChange(guest.id, oldTableId!, newTableId, newTableName);
      
    } catch (err) {
      console.error('Error assigning table:', err);
      setError(err instanceof Error ? err.message : 'Error al asignar mesa');
      
      // Revertir el select a su valor anterior
      event.target.value = oldTableId?.toString() || '';
      
      // Revertir el estado local
      guest.tableId = oldTableId;
      guest.tableName = oldTableName;
    } finally {
      setIsAssigning(false);
    }
  };

  // Obtener clase de color según el país (opcional, para distinguir visualmente)
  const getCountryBadgeColor = (country: string) => {
    if (country.toLowerCase().includes('méxico') || country.toLowerCase().includes('mexico')) {
      return 'bg-green-100 text-green-700';
    } else if (country.toLowerCase().includes('estados unidos') || country.toLowerCase().includes('usa')) {
      return 'bg-blue-100 text-blue-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <>
      <tr className={`border-b hover:bg-gray-50 transition ${isAssigning ? 'opacity-50' : ''}`}>
        {/* Nombre del invitado */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{guest.name}</span>
            {guest.isChild && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                Niño
              </span>
            )}
          </div>
          {guest.notes && (
            <p className="text-xs text-gray-500 mt-1">{guest.notes}</p>
          )}
        </td>

        {/* Familia */}
        <td className="px-4 py-3">
          <span className="text-sm text-gray-700">{guest.familyName}</span>
        </td>

        {/* País */}
        <td className="px-4 py-3">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCountryBadgeColor(guest.country)}`}>
            {guest.country}
          </span>
        </td>

        {/* Mesa actual */}
        <td className="px-4 py-3">
          {guest.tableName ? (
            <span className="inline-flex items-center gap-1 text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              {guest.tableName === 'Honor' && <span>⭐</span>}
              {guest.tableName}
            </span>
          ) : (
            <span className="text-sm text-gray-400 italic">Sin asignar</span>
          )}
        </td>

        {/* Dropdown de asignación */}
        <td className="px-4 py-3">
          <div className="relative">
            <select
              value={guest.tableId?.toString() || ''}
              onChange={handleTableChange}
              disabled={isAssigning}
              className={`
                w-full px-3 py-2 text-sm border rounded-lg
                ${isAssigning ? 'bg-gray-100 cursor-wait' : 'bg-white cursor-pointer'}
                ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
                focus:outline-none focus:ring-2 transition
              `}
            >
              <option value="">Sin asignar</option>
              
              {/* Opción actual si ya está asignado y la mesa está llena */}
              {guest.tableId && !availableTables.find(t => t.id === guest.tableId) && (
                <option value={guest.tableId}>
                  {guest.tableName} (Llena)
                </option>
              )}

              {/* Mesas disponibles */}
              {availableTables.map((table) => (
                <option 
                  key={table.id} 
                  value={table.id}
                  disabled={table.availableSeats <= 0 && table.id !== guest.tableId}
                >
                  {table.display}
                </option>
              ))}
            </select>

            {/* Indicador de carga */}
            {isAssigning && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </td>
      </tr>

      {/* Fila de error si hay alguno */}
      {error && (
        <tr>
          <td colSpan={5} className="px-4 py-2 bg-red-50">
            <div className="flex items-center gap-2 text-sm text-red-600">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}