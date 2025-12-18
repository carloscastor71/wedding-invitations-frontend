"use client";

import { useState } from "react";
import AddGuestTab from "@/app/admin/Addguesttab";
import EditGuestTab from "@/app/admin/Editguesttab";

export default function GuestManagementPage() {
  const [activeTab, setActiveTab] = useState<"add" | "edit">("add");

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Gestión de Invitados
          </h1>
          <p className="text-gray-600">
            Agregar nuevos invitados o modificar información existente
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("add")}
              className={`flex-1 px-6 py-4 text-lg font-semibold transition-all ${
                activeTab === "add"
                  ? "bg-amber-500 text-white border-b-4 border-amber-600"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              ➕ Agregar Invitado
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`flex-1 px-6 py-4 text-lg font-semibold transition-all ${
                activeTab === "edit"
                  ? "bg-amber-500 text-white border-b-4 border-amber-600"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              ✏️ Modificar Invitado
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "add" && <AddGuestTab />}
            {activeTab === "edit" && <EditGuestTab />}
          </div>
        </div>
      </div>
    </div>
  );
}