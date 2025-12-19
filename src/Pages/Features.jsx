import React from 'react'
import './css/Features.css'

const Features = () => {
  return (
    <div className="features-container">
      <div className="features-header">
        <h1 className="main-title">Our Features</h1>
        <p className="main-subtitle">Simple tools to help you manage your inventory better</p>
      </div>
      
      <div className="features-grid">
        <div className="feature-card">
          <div className="card-icon">📦</div>
          <h3 className="card-title">Inventory Tracking</h3>
          <p className="card-description">Keep track of your stock levels and get notified when items are running low</p>
          <ul className="feature-list">
            <li>• Real-time stock updates</li>
            <li>• Low stock alerts</li>
            <li>• Easy barcode scanning</li>
            <li>• Multiple warehouse support</li>
          </ul>
        </div>

        <div className="feature-card">
          <div className="card-icon">📈</div>
          <h3 className="card-title">Reports & Analytics</h3>
          <p className="card-description">Understand your business better with clear reports and insights</p>
          <ul className="feature-list">
            <li>• Sales reports</li>
            <li>• Inventory turnover</li>
            <li>• Profit tracking</li>
            <li>• Custom dashboards</li>
          </ul>
        </div>

        <div className="feature-card">
          <div className="card-icon">🔍</div>
          <h3 className="card-title">Search & Filter</h3>
          <p className="card-description">Find what you're looking for quickly with powerful search tools</p>
          <ul className="feature-list">
            <li>• Quick product search</li>
            <li>• Filter by category</li>
            <li>• Sort by price or stock</li>
            <li>• Advanced filters</li>
          </ul>
        </div>

        <div className="feature-card">
          <div className="card-icon">📋</div>
          <h3 className="card-title">Order Management</h3>
          <p className="card-description">Handle orders from start to finish with our simple order system</p>
          <ul className="feature-list">
            <li>• Track all orders</li>
            <li>• Manage suppliers</li>
            <li>• Create purchase orders</li>
            <li>• Automatic reordering</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Features