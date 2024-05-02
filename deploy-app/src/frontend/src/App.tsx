import './App.css'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Users from './pages/Users';
import UsersCreate from './pages/UsersCreate';
import UsersEdit from './pages/UsersEdit';
import Profile from './pages/Profile';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useContext, useMemo } from 'react';
import GlobalContext from './contexts/GlobalContext';
import { PaletteMode } from '@mui/material';


function App() {

  const { getUserPreferences } = useContext(GlobalContext);
  const preferences = getUserPreferences();

  const updateTheme = (): PaletteMode => {
    let mode: PaletteMode = 'light';
    if (preferences) {
      mode = preferences.darkMode ? 'dark' : 'light';
    }
    return mode;
  };

  let theme = createTheme({
    palette: {
      mode: updateTheme(),
    },
  });

  useMemo(() => {updateTheme()}, [preferences]);

  return (
    <>
      <ThemeProvider theme={theme}>
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
      </ThemeProvider>
    </>
  )
}

export default App
