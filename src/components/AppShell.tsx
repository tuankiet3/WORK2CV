"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile Top Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Workspace Area */}
      <div className="flex-1 md:pl-64">
        <main className="min-h-screen p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
