import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import CreateGroup from './pages/CreateGroup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import GroupDetails from './pages/GroupDetails'
import JoinGroup from './pages/JoinGroup'
import FundWallet from './pages/FundWallet'
import ExploreCircles from './pages/ExploreCircles'

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/group/:id" element={<GroupDetails />} />
          <Route path="/join/:id" element={<JoinGroup />} />
          <Route path="/fund-wallet" element={<FundWallet />} />
          <Route path="/explore" element={<ExploreCircles />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
