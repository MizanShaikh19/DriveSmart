import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/Signup'
import RoleSelection from '@/pages/onboarding/RoleSelection'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/layouts/DashboardLayout'
import Dashboard from '@/pages/dashboard/Dashboard'
import Users from '@/pages/dashboard/Users'
import Drivers from '@/pages/dashboard/Drivers'
import Bookings from '@/pages/dashboard/Bookings'
import Payments from '@/pages/dashboard/Payments'
import Settings from '@/pages/dashboard/Settings'
import DispatchConsole from '@/pages/dashboard/DispatchConsole'
import Simulation from '@/pages/dashboard/Simulation'

// Customer App Imports
import CustomerLayout from '@/layouts/CustomerLayout'
import CustomerHome from '@/pages/customer/CustomerHome'
import BookRide from '@/pages/customer/BookRide'
import ActiveRide from '@/pages/customer/ActiveRide'
import History from '@/pages/customer/History'
import Wallet from '@/pages/customer/Wallet'

// Driver App Imports
import DriverLayout from '@/layouts/DriverLayout'
import DriverHome from '@/pages/driver/DriverHome'
import Requests from '@/pages/driver/Requests'
import DriverActiveRide from '@/pages/driver/DriverActiveRide'
import Earnings from '@/pages/driver/Earnings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/role-selection" element={<RoleSelection />} />

        {/* Customer App Routes */}
        <Route path="/customer" element={<ProtectedRoute><CustomerLayout /></ProtectedRoute>}>
          <Route index element={<CustomerHome />} />
          <Route path="book" element={<BookRide />} />
          <Route path="active-ride/:bookingId" element={<ActiveRide />} />
          <Route path="history" element={<History />} />
          <Route path="wallet" element={<Wallet />} />
          {/* We will add Profile route here later */}
        </Route>

        {/* Driver App Routes */}
        <Route path="/driver" element={<ProtectedRoute><DriverLayout /></ProtectedRoute>}>
          <Route index element={<DriverHome />} />
          <Route path="requests" element={<Requests />} />
          <Route path="active-ride/:bookingId" element={<DriverActiveRide />} />
          <Route path="earnings" element={<Earnings />} />
        </Route>
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="dispatch" element={<DispatchConsole />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="payments" element={<Payments />} />
          <Route path="settings" element={<Settings />} />
          <Route path="simulation" element={<Simulation />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
