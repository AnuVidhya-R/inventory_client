import React from 'react'
import {Link, useNavigate} from 'react-router-dom'
import './css/Header.css'
const Header = () => {
  const navigate=useNavigate();
  return (
    <>
    <div className="head-box">
        <img src="https://tse2.mm.bing.net/th/id/OIP.1njaRSFkzP3dAjZhI851KwHaHa?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3" class="img"/>
        <ul className='nav'>
          <Link to='/'> <li>Home</li></Link> 
            <Link to='/features'><li>Features</li></Link> 
           <Link to='/contact'> <li>Contact</li></Link> 
          <li onClick={()=>{navigate("/login")}}>   <button className='bu'>Login</button></li>
          <li onClick={()=>{navigate("/register")}}> <button className='bu'>Register</button></li> 
        </ul>
    </div>
    </>
  )
}

export default Header