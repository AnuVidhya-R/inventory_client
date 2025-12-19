import React from 'react'
import './css/Contact.css'
const Contact = () => {
  return (
    <div className='contact-box'>
        <h2 className='head-c'><b>Contact Us 🤝</b></h2>
        <p className='para-c'>If you need support or have any questions regarding our inventory system, we’re always here to help 💡. Feel free to reach out anytime and we’ll respond as soon as possible.</p>
        <div className='it'>
        <input type="text" placeholder='Enter Name' className='i1'/>
        <input type="Number" placeholder='Enter Number' className='i2'/>
        <textarea className='text' ></textarea>
        <button className='b-c'>Submit</button>
        <p className='para-c1'><b>📧Email: </b>support@inventorysystem.com    <b>📱 Phone: </b>+91 98765 43210   <b>🌐 Website: </b> www.inventorysystem.com    <b>📍 Location: </b>  India</p>
        </div>
    </div>
  )
}

export default Contact