import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Popup from '../components/Popup'
import './css/Register.css'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [popup, setPopup] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setPopup({ message: 'Passwords do not match', type: 'error' })
      return
    }

    try {
      const response = await fetch('https://inventory-server-12od.onrender.com/inventix/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          username: formData.username,
          password: formData.password
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setPopup({ message: 'Registration successful! Redirecting to login...', type: 'success' })
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setPopup({ message: data.message, type: 'error' })
      }
    } catch (error) {
      setPopup({ message: 'Registration failed. Please try again.', type: 'error' })
    }
  }

  return (
    <div className='register-body'>
      <div className="register-box">
        <h1 className="register-title">Create Account</h1>
        <p className="register-subtitle">Join our inventory management system</p>
        
        <form className="register-form" onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="name"
            placeholder="Full Name" 
            className='register-input'
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input 
            type="email" 
            name="email"
            placeholder="Email Address" 
            className='register-input'
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input 
            type="text" 
            name="username"
            placeholder="Username" 
            className='register-input'
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input 
            type="password" 
            name="password"
            placeholder="Password" 
            className='register-input'
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input 
            type="password" 
            name="confirmPassword"
            placeholder="Confirm Password" 
            className='register-input'
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button type="submit" className='register-btn'>Create Account</button>
          
          <p className='register-login-link'>
            Already have an account? 
            <Link to='/login' className='link-btn'>Login here</Link>
          </p>
        </form>
        {popup && (
          <Popup 
            message={popup.message} 
            type={popup.type} 
            onClose={() => setPopup(null)} 
          />
        )}
      </div>
    </div>
  )
}

export default Register