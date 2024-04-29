import './App.css'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Users from './pages/Users';
import UsersCreate from './pages/UsersCreate';
import UsersEdit from './pages/UsersEdit';
import Profile from './pages/Profile';


function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route path="" element={<Dashboard />} />
        </Route>
        <Route path="/users" element={<ProtectedRoute />}>
          <Route path="" element={<Users />} />
        </Route>
        <Route path="/users/create" element={<ProtectedRoute />}>
          <Route path="" element={<UsersCreate />} />
        </Route>
        <Route path="/users/update/:uuid" element={<ProtectedRoute />}>
          <Route path="" element={<UsersEdit />} />
        </Route>
        <Route path="/users/me" element={<ProtectedRoute />}>
          <Route path="" element={<Profile />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
