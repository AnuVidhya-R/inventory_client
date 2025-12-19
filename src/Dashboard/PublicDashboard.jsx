import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import TodoList from '../components/TodoList'
import Popup from '../components/Popup'
import './css/PublicDashboard.css'

const PublicDashboard = () => {
  const { user, logout } = useAuth()
  const { products, addUserAsCustomer, orders, placeOrder } = useData()
  const [activeSection, setActiveSection] = useState('overview')
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [userOrders, setUserOrders] = useState([])
  const [popup, setPopup] = useState(null)
  const [viewBillModal, setViewBillModal] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)
  const [cart, setCart] = useState([])
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    preferences: {
      notifications: true,
      newsletter: false,
      darkMode: false
    }
  })
  
  // Fetch user orders from database
  const fetchUserOrders = async () => {
    if (user) {
      try {
        const response = await fetch('http://localhost:5001/inventix/orders')
        const allOrders = await response.json()
        const myOrders = allOrders.filter(order => order.customerName === user.name)
        setUserOrders(myOrders)
      } catch (error) {
        console.error('Error fetching orders:', error)
      }
    }
  }

  // Add current user as customer when component mounts
  useEffect(() => {
    if (user) {
      addUserAsCustomer(user)
      fetchUserOrders()
      setProfileData({
        name: user.name || '',
        email: user.username + '@email.com' || '',
        phone: '+1-000-000-0000',
        address: '123 Main St, City, State 12345',
        preferences: {
          notifications: true,
          newsletter: false,
          darkMode: false
        }
      })
    }
  }, [user, addUserAsCustomer])

  const addToCart = (product) => {
    if (product.stock > 0) {
      const existingItem = cart.find(item => item.id === product.id)
      if (existingItem) {
        setCart(cart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ))
      } else {
        setCart([...cart, { ...product, quantity: 1 }])
      }
      setPopup({ message: `${product.name} added to cart!`, type: 'success' })
      setTimeout(() => setPopup(null), 2000)
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  const placeOrderFromCart = async (cartItem) => {
    try {
      const orderData = {
        orderId: `ORD-${Date.now()}`,
        customerName: user.name,
        productName: cartItem.name,
        quantity: cartItem.quantity,
        price: cartItem.price,
        total: cartItem.price * cartItem.quantity,
        status: 'Processing',
        date: new Date().toISOString().split('T')[0],
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
      
      const response = await fetch('http://localhost:5001/inventix/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      
      if (response.ok) {
        removeFromCart(cartItem.id)
        fetchUserOrders()
        setOrderSuccess({
          orderId: orderData.orderId,
          productName: cartItem.name,
          total: orderData.total,
          estimatedDelivery: orderData.estimatedDelivery
        })
        setTimeout(() => setOrderSuccess(null), 5000)
      } else {
        alert('Failed to place order. Please try again.')
      }
    } catch (error) {
      console.error('Order error:', error)
      alert('Failed to place order. Please try again.')
    }
  }

  const deleteOrder = async (orderId) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        const response = await fetch(`http://localhost:5001/inventix/orders/${orderId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          fetchUserOrders()
          setPopup({ message: 'Order deleted successfully!', type: 'success' })
          setTimeout(() => setPopup(null), 3000)
        } else {
          alert('Failed to delete order. Please try again.')
        }
      } catch (error) {
        console.error('Delete error:', error)
        alert('Failed to delete order. Please try again.')
      }
    }
  }

  const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0)
  
  const downloadBill = (order) => {
    const currentDate = new Date().toLocaleDateString()
    
    const billHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${order.orderId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #d4af37; margin: 0; font-size: 28px; }
          .invoice-info { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 20px 0; }
          .section { margin-bottom: 25px; }
          .section h3 { color: #d4af37; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .bill-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .bill-table th, .bill-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .bill-table th { background: #f9f9f9; color: #d4af37; font-weight: bold; }
          .total-row { background: #f9f9f9; font-weight: bold; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📦 INVENTIX</h1>
          <p>Inventory Management System</p>
          <h2>INVOICE</h2>
        </div>
        
        <div class="invoice-info">
          <div class="section">
            <h3>Bill To:</h3>
            <p><strong>${order.customerName}</strong></p>
            <p>Customer ID: CUST-${order.customerName.replace(/\s+/g, '').toUpperCase()}</p>
          </div>
          <div class="section">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice #:</strong> ${order.orderId}</p>
            <p><strong>Date:</strong> ${order.date}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Est. Delivery:</strong> ${order.estimatedDelivery}</p>
          </div>
        </div>
        
        <table class="bill-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${order.productName}</td>
              <td>${order.quantity}</td>
              <td>$${order.price}</td>
              <td>$${order.total}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3"><strong>Grand Total</strong></td>
              <td><strong>$${order.total}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <div class="section">
          <h3>Payment Information:</h3>
          <p>Payment Method: Online Payment</p>
          <p>Transaction ID: TXN-${order.orderId}-${Date.now()}</p>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>© 2024 Inventix - Inventory Management System</p>
          <p>For support, contact: support@inventix.com</p>
        </div>
      </body>
      </html>
    `
    
    const blob = new Blob([billHTML], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Invoice_${order.orderId}_${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    setPopup({ 
      message: 'Bill downloaded! Open the HTML file in your browser and use Ctrl+P to save as PDF.', 
      type: 'success' 
    })
    setTimeout(() => setPopup(null), 4000)
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'products', label: 'Shop', icon: '🛍️' },
    { id: 'cart', label: 'Cart', icon: '🛒' },
    { id: 'orders', label: 'My Orders', icon: '📦' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ]

  const renderContent = () => {
    switch(activeSection) {
      case 'overview':
        return (
          <div className="overview-content">
            <div className="welcome-card">
              <h2>Welcome back, {user?.name || 'User'}!</h2>
              <p>Here's what's happening with your account</p>
            </div>
            <div className="user-stats">
              <div className="user-stat-card">
                <div className="stat-icon">🛒</div>
                <div className="stat-info">
                  <h3>{userOrders.length}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              <div className="user-stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>{totalSpent}</h3>
                  <p>Total Spent</p>
                </div>
              </div>
              <div className="user-stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>{userOrders.filter(o => o.status === 'Processing').length}</h3>
                  <p>Pending Orders</p>
                </div>
              </div>
            </div>
          </div>
        )
      case 'products':
        return (
          <div className="products-content">
            <h2>Available Products</h2>
            {orderSuccess && (
              <div className="order-success-banner">
                <div className="success-content">
                  <span className="success-icon">✓</span>
                  <div className="success-details">
                    <h4>Order Placed Successfully!</h4>
                    <p>Order #{orderSuccess.orderId} for {orderSuccess.productName}</p>
                    <p>Total: ${orderSuccess.total} | Estimated Delivery: {orderSuccess.estimatedDelivery}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="product-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop'
                      }}
                    />
                  </div>
                  <h3>{product.name}</h3>
                  <p className="product-price">{product.price}</p>
                  <p className="stock-info">
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </p>
                  <div className="product-actions">
                    <button 
                      className="add-to-cart-btn" 
                      disabled={product.stock === 0}
                      onClick={() => addToCart(product)}
                    >
                      {product.stock > 0 ? '🛒 Add to Cart' : 'Out of Stock'}
                    </button>
                    {product.stock <= product.minLevel && product.stock > 0 && (
                      <span className="low-stock-warning">⚠️ Limited Stock</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'cart':
        const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        return (
          <div className="cart-content">
            <h2>Shopping Cart ({cart.length} items)</h2>
            {cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some products to get started!</p>
                <button 
                  className="shop-now-btn"
                  onClick={() => setActiveSection('products')}
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p className="cart-item-price">${item.price} each</p>
                    </div>
                    <div className="cart-item-controls">
                      <div className="quantity-controls">
                        <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <div className="cart-item-total">${(item.price * item.quantity).toFixed(2)}</div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        🗑️
                      </button>
                    </div>
                    <button 
                      className="place-order-btn"
                      onClick={() => placeOrderFromCart(item)}
                    >
                      Place Order
                    </button>
                  </div>
                ))}
                <div className="cart-summary">
                  <h3>Total: ${cartTotal.toFixed(2)}</h3>
                </div>
              </div>
            )}
          </div>
        )
      case 'orders':
        return (
          <div className="orders-content">
            <h2>My Orders</h2>
            {userOrders.length === 0 ? (
              <div className="empty-orders">
                <div className="empty-icon">📦</div>
                <h3>No orders yet</h3>
                <p>Start shopping to see your orders here!</p>
                <button 
                  className="shop-now-btn"
                  onClick={() => setActiveSection('products')}
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="order-list">
                {userOrders.map(order => (
                  <div key={order._id || order.id} className="order-item">
                    <div className="order-info">
                      <h4>{order.orderId}</h4>
                      <p>{order.productName} (x{order.quantity}) - {order.total}</p>
                      <span className="order-date">{order.date}</span>
                      <span className="delivery-date">Est. Delivery: {order.estimatedDelivery}</span>
                    </div>
                    <div className="order-actions">
                      <div className={`order-status ${order.status.toLowerCase()}`}>
                        {order.status}
                      </div>
                      <div className="bill-buttons">
                        <button 
                          className="view-bill-btn"
                          onClick={() => {
                            setSelectedBill(order)
                            setViewBillModal(true)
                          }}
                        >
                          📄 View Bill
                        </button>
                        <button 
                          className="download-bill-btn"
                          onClick={() => downloadBill(order)}
                        >
                          📥 Download
                        </button>
                        <button 
                          className="delete-order-btn"
                          onClick={() => deleteOrder(order._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      case 'profile':
        return (
          <div className="profile-content">
            <div className="profile-header">
              <div className="profile-avatar">
                <div className="avatar-circle">👤</div>
                <button className="change-avatar-btn" style={{display: 'none'}}>Change Photo</button>
              </div>
              <div className="profile-summary">
                <h2>{profileData.name}</h2>
                <p className="profile-email">{profileData.email}</p>
                <div className="profile-stats">
                  <span>🛒 {userOrders.length} Orders</span>
                  <span>💰 ${totalSpent} Spent</span>
                </div>
              </div>
            </div>
            
            <div className="profile-sections">
              <div className="profile-section">
                <h3>Personal Information</h3>
                <div className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone</label>
                      <input 
                        type="tel" 
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <input type="text" value={user?.role || 'user'} readOnly />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <textarea 
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      rows="3"
                    />
                  </div>
                </div>
              </div>
              
              <div className="profile-section">
                <h3>Preferences</h3>
                <div className="preferences-list">
                  <div className="preference-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={profileData.preferences.notifications}
                        onChange={(e) => setProfileData({
                          ...profileData, 
                          preferences: {...profileData.preferences, notifications: e.target.checked}
                        })}
                      />
                      <span>Email Notifications</span>
                    </label>
                  </div>
                  <div className="preference-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={profileData.preferences.newsletter}
                        onChange={(e) => setProfileData({
                          ...profileData, 
                          preferences: {...profileData.preferences, newsletter: e.target.checked}
                        })}
                      />
                      <span>Newsletter Subscription</span>
                    </label>
                  </div>
                  <div className="preference-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={darkMode}
                        onChange={(e) => {
                          setDarkMode(e.target.checked)
                          setProfileData({
                            ...profileData, 
                            preferences: {...profileData.preferences, darkMode: e.target.checked}
                          })
                        }}
                      />
                      <span>Dark Mode</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="profile-actions">
                <button className="save-btn" onClick={() => {
                  setPopup({ message: 'Profile changes saved successfully!', type: 'success' })
                  setTimeout(() => setPopup(null), 3000)
                }}>Save Changes</button>
                <button className="reset-btn" onClick={() => {
                  setProfileData({
                    name: user?.name || '',
                    email: user?.username + '@email.com' || '',
                    phone: '+1-000-000-0000',
                    address: '123 Main St, City, State 12345',
                    preferences: {
                      notifications: true,
                      newsletter: false,
                      darkMode: false
                    }
                  })
                  setDarkMode(false)
                  setPopup({ message: 'Profile reset to default values!', type: 'success' })
                  setTimeout(() => setPopup(null), 3000)
                }}>Reset to Default</button>
                <button className="reset-btn" onClick={() => {
                  if (confirm('Are you sure you want to reset your password?')) {
                    setPopup({ message: 'Password reset link sent to your email!', type: 'success' })
                    setTimeout(() => setPopup(null), 3000)
                  }
                }}>Reset Password</button>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Content coming soon...</div>
    }
  }

  return (
    <div className={`public-dashboard ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      <div className="sidebar">
        <div className="logo">
          <h2>📦 Inventix</h2>
        </div>
        <nav className="nav-menu">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="main-content">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="user-info">
            <button 
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <span>{user?.name || 'User'}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
            <div className="user-avatar">👤</div>
          </div>
        </header>
        
        <main className="content-area">
          {renderContent()}
        </main>
      </div>
      {/* Bill View Modal */}
      {viewBillModal && selectedBill && (
        <div className="modal-overlay" onClick={() => setViewBillModal(false)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📄 Invoice Details</h3>
              <button className="close-btn" onClick={() => setViewBillModal(false)}>×</button>
            </div>
            
            <div className="order-details">
              <div className="order-info-grid">
                <div className="info-item">
                  <span className="info-label">Invoice #:</span>
                  <span className="info-value">{selectedBill.orderId}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Customer:</span>
                  <span className="info-value">{selectedBill.customerName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Product:</span>
                  <span className="info-value">{selectedBill.productName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Quantity:</span>
                  <span className="info-value">{selectedBill.quantity}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Unit Price:</span>
                  <span className="info-value">{selectedBill.price}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total Amount:</span>
                  <span className="info-value total-amount">{selectedBill.total}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Order Date:</span>
                  <span className="info-value">{selectedBill.date}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className={`info-value status-badge ${selectedBill.status.toLowerCase()}`}>
                    {selectedBill.status}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Est. Delivery:</span>
                  <span className="info-value">{selectedBill.estimatedDelivery}</span>
                </div>
              </div>
              
              <div className="order-actions">
                <button 
                  className="complete-order-btn"
                  onClick={() => {
                    downloadBill(selectedBill)
                    setViewBillModal(false)
                  }}
                >
                  📥 Download Bill
                </button>
                <button className="close-order-btn" onClick={() => setViewBillModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {popup && (
        <Popup 
          message={popup.message} 
          type={popup.type} 
          onClose={() => setPopup(null)} 
        />
      )}
    </div>
  )
}

export default PublicDashboard