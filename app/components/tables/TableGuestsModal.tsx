"use client";

import { useState, useEffect } from "react";
import { tablesApi, TableGuestsResponse } from "@/lib/api";

interface TableGuestsModalProps {
  tableId: number;
  tableName: string;
  onClose: () => void;
}

export default function TableGuestsModal({
  tableId,
  tableName,
  onClose,
}: TableGuestsModalProps) {
  const [guestsData, setGuestsData] = useState<TableGuestsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        setLoading(true);
        const data = await tablesApi.getTableGuests(tableId);
        setGuestsData(data);
      } catch (err) {
        setError("Error al cargar los invitados");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();
  }, [tableId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-white-600 to-gray-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-black">
              Mesa {tableId}: {tableName}
            </h2>
            {guestsData && (
              <span className="text-sm text-white-100 bg-white-800 bg-opacity-50 px-3 py-1 rounded-full font-medium">
                {guestsData.currentOccupancy} (Confirmados) / {guestsData.maxCapacity} (MaxGuests)
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 transition-colors text-3xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">❌ {error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : guestsData && guestsData.guests.length > 0 ? (
            <>
              {/* Header de la lista */}
              <div className="mb-4 pb-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Invitados Asignados ({guestsData.guests.length})
                </h3>
              </div>

              {/* Lista de invitados - estilo tabla */}
              <div className="space-y-0">
                {guestsData.guests.map((guest, index) => (
                  <div
                    key={guest.id}
                    className="border-b border-gray-200 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Número */}
                      <span className="text-gray-400 font-medium text-sm mt-0.5">
                        {index + 1}.
                      </span>
                      
                      {/* Contenido */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900">
                            {guest.name}
                          </span>
                          
                          {guest.isChild && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                              Niño
                            </span>
                          )}
                          
                          <span className="text-gray-400 mx-1">/</span>
                          
                          <span className="text-sm text-gray-700">
                            Familia: <span className="font-medium">{guest.familyName}</span>
                          </span>
                        </div>
                        
                        {guest.notes && (
                          <p className="text-xs text-gray-500 mt-1">
                            {guest.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🪑</div>
              <p className="text-gray-600 text-lg">
                No hay invitados asignados a esta mesa
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}