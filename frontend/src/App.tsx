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
import HomeAdminPage from '@/pages/homeadmin/HomeAdminPage'
import { useAuthStore } from '@/context/authStore'
import { useLang } from '@/context/LanguageContext'

function Guard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/connexion" replace />
  return <>{children}</>
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/connexion" replace />
  if (user?.role !== 'super_admin' && user?.role !== 'director')
    return <Navigate to="/tableau-de-bord" replace />
  return <>{children}</>
}

export default function App() {
  const { lang } = useLang()

  return (
    // key={lang} forces full re-render on language change — this is what makes ALL text change
    <BrowserRouter key={lang}>
      <Routes>
        <Route path="/"                    element={<HomePage />} />
        <Route path="/connexion"           element={<LoginPage />} />
        <Route path="/inscription"         element={<RegisterPage />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />

        <Route element={<Guard><Layout /></Guard>}>
          <Route path="/tableau-de-bord"  element={<DashboardPage />} />
          <Route path="/employes"         element={<EmployeesPage />} />
          <Route path="/concessions"      element={<ConcessionsPage />} />
          <Route path="/zones"            element={<ZonesPage />} />
          <Route path="/elevage"          element={<LivestockPage />} />
          <Route path="/cultures"         element={<CropsPage />} />
          <Route path="/recoltes"         element={<HarvestsPage />} />
          <Route path="/stock"            element={<StockPage />} />
          <Route path="/machines"         element={<MachinesPage />} />
          <Route path="/taches"           element={<TasksPage />} />
          <Route path="/finance"          element={<FinancePage />} />
          <Route path="/alertes"          element={<AlertsPage />} />
          <Route path="/rapports"         element={<ReportsPage />} />
          <Route path="/parametres"       element={<SettingsPage />} />
          <Route path="/audit"            element={<AuditPage />} />
          <Route path="/accueil-admin"    element={<AdminOnly><HomeAdminPage /></AdminOnly>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
