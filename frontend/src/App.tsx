import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/home/HomePage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import LivestockPage from '@/pages/livestock/LivestockPage'
import EmployeesPage from '@/pages/employees/EmployeesPage'
import TasksPage from '@/pages/tasks/TasksPage'
import FinancePage from '@/pages/finance/FinancePage'
import StockPage from '@/pages/stock/StockPage'
import { AlertsPage } from '@/pages/alerts/AlertsPage'
import CropsPage from '@/pages/crops/CropsPage'
import ZonesPage from '@/pages/zones/ZonesPage'
import ConcessionsPage from '@/pages/concessions/ConcessionsPage'
import { HarvestsPage, MachinesPage, ReportsPage, SettingsPage, AuditPage } from '@/pages/shared/AllPages'
import { useAuthStore } from '@/context/authStore'

function Guard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/connexion" replace />
  return <>{children}</>
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/tableau-de-bord" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/"                element={<HomePage />} />
        <Route path="/connexion"       element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/inscription"     element={<PublicOnly><RegisterPage /></PublicOnly>} />
        <Route path="/mot-de-passe-oublie" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} />

        {/* Protected routes — inside Layout */}
        <Route element={<Guard><Layout /></Guard>}>
          <Route path="/tableau-de-bord" element={<DashboardPage />} />
          <Route path="/employes"        element={<EmployeesPage />} />
          <Route path="/concessions"     element={<ConcessionsPage />} />
          <Route path="/zones"           element={<ZonesPage />} />
          <Route path="/elevage"         element={<LivestockPage />} />
          <Route path="/cultures"        element={<CropsPage />} />
          <Route path="/recoltes"        element={<HarvestsPage />} />
          <Route path="/stock"           element={<StockPage />} />
          <Route path="/machines"        element={<MachinesPage />} />
          <Route path="/taches"          element={<TasksPage />} />
          <Route path="/finance"         element={<FinancePage />} />
          <Route path="/alertes"         element={<AlertsPage />} />
          <Route path="/rapports"        element={<ReportsPage />} />
          <Route path="/parametres"      element={<SettingsPage />} />
          <Route path="/audit"           element={<AuditPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
