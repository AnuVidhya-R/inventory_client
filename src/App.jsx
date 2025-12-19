import React from 'react'

import AdminDashBoard from './Dashboard/AdminDashBoard'
import PublicDashboard from './Dashboard/PublicDashboard'
import TodoList from './components/TodoList'
import Header from './Components/Header'

import Home from './Pages/Home'
import Features from './Pages/Features'
import Contact from './Pages/Contact'
import Login from './Pages/Login'
import Register from './Pages/Register'
import { BrowserRouter as Router,Routes,Route,useLocation,Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? '/AdminDashBoard' : '/dashboard'} />
  }
  
  return children
}

const Layout = () =>{
  const location = useLocation();
  const hide=['/login','/AdminDashBoard','/dashboard','/register']
  const hideLayout =hide.includes(location.pathname)
  
  return (
     <>
     {!hideLayout && <Header />}
     <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/features' element={<Features/>} />
        <Route path='/contact' element={<Contact/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register/>}/>
        <Route path='/AdminDashBoard' element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashBoard/>
          </ProtectedRoute>
        }/>
        <Route path='/dashboard' element={
          <ProtectedRoute requiredRole="user">
            <PublicDashboard/>
          </ProtectedRoute>
        }/>
        <Route path='/todo' element={<TodoList/>}/>
     </Routes>
     </>
  )
}

const App = () => {
  return (
    <div>
      <Router>
        <AuthProvider>
          <DataProvider>
            <Layout />
          </DataProvider>
        </AuthProvider>
      </Router>
    </div>
  )
}
export default App
