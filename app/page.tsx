'use client';

import { useState, useEffect } from 'react';
import { familiesApi, Family } from '../lib/api';

export default function Home() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const data = await familiesApi.getAll();
        setFamilies(data);
      } catch (err) {
        setError('Error conectando con la API');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilies();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-xl text-gray-700">Cargando...</div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-xl text-red-600">Error: {error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-stone-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Panel de Administración
          </h1>
          <h2 className="text-2xl font-semibold text-red-900">
            Boda Carlos & Karen 💍
          </h2>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-800">
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Total Familias</h3>
            <p className="text-3xl font-bold text-red-800">{families.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-700">
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Confirmadas</h3>
            <p className="text-3xl font-bold text-green-700">
              {families.filter(f => f.status === 'confirmed').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-600">
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Pendientes</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {families.filter(f => f.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-900">
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Invitados</h3>
            <p className="text-3xl font-bold text-red-900">
              {families.reduce((sum, f) => sum + f.confirmedGuests, 0)}
            </p>
          </div>
        </div>
        
        {/* Families Table */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-900 to-red-800 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Familias Invitadas</h2>
          </div>
          
          {families.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Familia
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Invitados
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Código
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {families.map((family) => (
                    <tr key={family.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-gray-900">
                          {family.familyName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-base font-medium text-gray-800">
                          {family.contactPerson}
                        </div>
                        <div className="text-sm text-gray-600">
                          {family.phone || 'Sin teléfono'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-base text-gray-800">
                          {family.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-semibold text-gray-900">
                          {family.confirmedGuests} / {family.maxGuests}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                          family.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          family.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          family.status === 'declined' ? 'bg-red-100 text-red-800' :
                          'bg-stone-100 text-stone-800'
                        }`}>
                          {family.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-700 bg-stone-100 px-2 py-1 rounded">
                          {family.invitationCode.slice(0, 8)}...
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-xl text-gray-600 mb-2">
                No hay familias registradas aún
              </div>
              <button className="bg-red-900 text-white px-6 py-3 rounded-lg hover:bg-red-800 transition-colors font-semibold">
                Agregar Primera Familia
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}