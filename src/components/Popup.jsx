import React from 'react'
import './css/Popup.css'

const Popup = ({ message, type, onClose }) => {
  return (
    <div className={`popup ${type}`}>
      <div className="popup-content">
        <span className="popup-message">{message}</span>
        <button className="popup-close" onClick={onClose}>×</button>
      </div>
    </div>
  )
}

export default Popup