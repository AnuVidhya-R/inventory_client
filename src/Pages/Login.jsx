import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Popup from '../components/Popup'
import './css/Login.css'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [popup, setPopup] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!username || !password) {
      setPopup({ message: 'Please enter valid credentials', type: 'error' })
      return
    }

    try {
      const response = await fetch('https://inventory-server-1-atx9.onrender.com/inventix/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
     
      const data = await response.json()
      
      if (response.ok) {
        setPopup({ message: 'Login successful!', type: 'success' })
        setTimeout(() => {
          login({ username, role: data.role, name: username })
          if (username === 'admin' || data.role === 'admin') {
            navigate('/AdminDashBoard')
          } else {
            navigate('/dashboard')
          }
        }, 1500)
      } else {
        setPopup({ message: data.message, type: 'error' })
      }
    } catch (error) {
      setPopup({ message: 'Login failed. Please try again.', type: 'error' })
    }
  }

  return (
    <>
    <div className='body'>
        <div className="login-box">
      <b><h1 className="h-1">Login</h1></b> 
       <form onSubmit={handleSubmit}>
         <input 
           type="text" 
           placeholder="Enter Username" 
           className='i-1'
           value={username}
           onChange={(e) => setUsername(e.target.value)}
         />
         <input 
           type="password" 
           placeholder="Enter password" 
           className='i-1'
           value={password}
           onChange={(e) => setPassword(e.target.value)}
         />
         <button type="submit" className='i-2'>Submit</button>
       </form>
       <p className='p-1'>Don't Have An Account? <Link to='/register' className='i-3'>Register</Link></p>
       </div>
       {popup && (
         <Popup 
           message={popup.message} 
           type={popup.type} 
           onClose={() => setPopup(null)} 
         />
       )}
    </div>
    </>
  )
}

export default Login