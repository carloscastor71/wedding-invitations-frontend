import React from 'react';
import { TableSummary } from '@/lib/api';

interface TableCardProps {
  table: TableSummary;
  onClick?: () => void;
  onViewGuests: (tableId: number, tableName: string) => void; // ✅ NUEVA PROP
}

export default function TableCard({ table, onClick, onViewGuests }: TableCardProps) {
  // Determinar color según ocupación
  const getColorClasses = () => {
    if (table.currentOccupancy === 0) {
      return 'bg-gray-50 border-gray-300 text-gray-700';
    }
    
    const percentage = table.percentageOccupied;
    
    if (percentage >= 100) {
      return 'bg-red-50 border-red-400 text-red-900';
    } else if (percentage >= 80) {
      return 'bg-orange-50 border-orange-400 text-orange-900';
    } else if (percentage >= 50) {
      return 'bg-yellow-50 border-yellow-400 text-yellow-900';
    } else {
      return 'bg-green-50 border-green-400 text-green-900';
    }
  };

  // Determinar color del badge de ocupación
  const getBadgeColor = () => {
    if (table.currentOccupancy === 0) {
      return 'bg-gray-200 text-gray-700';
    }
    
    const percentage = table.percentageOccupied;
    
    if (percentage >= 100) {
      return 'bg-red-200 text-red-800';
    } else if (percentage >= 80) {
      return 'bg-orange-200 text-orange-800';
    } else if (percentage >= 50) {
      return 'bg-yellow-200 text-yellow-800';
    } else {
      return 'bg-green-200 text-green-800';
    }
  };

  // Manejar click en el botón de ver invitados (evitar propagación al card)
  const handleViewGuests = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se dispare el onClick del card
    onViewGuests(table.id, table.tableName);
  };

  return (
    <div
      className={`
        rounded-lg border-2 p-4 transition-all duration-200
        ${getColorClasses()}
        ${onClick ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''}
      `}
      onClick={onClick}
    >
      {/* Header - Nombre de la mesa */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">
          {table.tableName}
        </h3>
        
        {/* Badge especial para Mesa de Honor */}
        {table.isHonorTable && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
            ⭐ Honor
          </span>
        )}
      </div>

      {/* Ocupación actual */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Ocupación:</span>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${getBadgeColor()}`}>
          {table.currentOccupancy}/{table.maxCapacity}
        </span>
      </div>

      {/* Barra de progreso visual */}
      <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            table.percentageOccupied >= 100
              ? 'bg-red-500'
              : table.percentageOccupied >= 80
              ? 'bg-orange-500'
              : table.percentageOccupied >= 50
              ? 'bg-yellow-500'
              : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(table.percentageOccupied, 100)}%` }}
        />
      </div>

      {/* Porcentaje */}
      <div className="mt-2 text-center">
        <span className="text-xs font-semibold">
          {table.percentageOccupied.toFixed(0)}% ocupado
        </span>
      </div>

      {/* Indicador si está llena */}
      {table.isFull && (
        <div className="mt-2 text-center">
          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold">
            LLENA
          </span>
        </div>
      )}

      {/* Espacios disponibles */}
      {!table.isFull && table.currentOccupancy > 0 && (
        <div className="mt-2 text-center text-xs opacity-75">
          {table.availableSeats} {table.availableSeats === 1 ? 'espacio' : 'espacios'} disponible{table.availableSeats === 1 ? '' : 's'}
        </div>
      )}

      {/* ✅ NUEVO: Botón Ver Invitados */}
      <button
        onClick={handleViewGuests}
        disabled={table.currentOccupancy === 0}
       className={`
          mt-3 w-full py-2 px-3 rounded-lg text-xs font-semibold
          transition-all duration-200 border
          ${table.currentOccupancy > 0
            ? 'bg-white bg-opacity-10 text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:scale-95'
            : 'bg-gray-100 bg-opacity-60 text-gray-400 border-gray-200 cursor-not-allowed'
          }
        `}
      >
        {table.currentOccupancy > 0
          ? `👥 Ver invitados (${table.currentOccupancy})`
          : '👥 Sin invitados'}
      </button>
    </div>
  );
}