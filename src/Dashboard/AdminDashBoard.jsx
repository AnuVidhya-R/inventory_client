import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import TodoList from '../components/TodoList'
import { api } from '../services/api'
import Popup from '../components/Popup'
import './css/AdminDashBoard.css'

const AdminDashBoard = () => {
  const [activeSection, setActiveSection] = useState('dashboard')
  const { user, logout } = useAuth()
  const { products, setProducts, customers, setCustomers, orders, setOrders, fetchProducts } = useData()
  const [realCustomers, setRealCustomers] = useState([])
  const [realOrders, setRealOrders] = useState([])
  const [darkMode, setDarkMode] = useState(true)
  const [popup, setPopup] = useState(null)
  const [adminProfile, setAdminProfile] = useState({
    name: user?.name || 'Administrator',
    username: user?.username || 'admin',
    email: 'admin@inventix.com',
    phone: '+1-555-0123',
    role: 'System Administrator',
    department: 'IT Management',
    joinDate: '2024-01-15',
    permissions: ['Full Access', 'User Management', 'System Settings', 'Data Analytics']
  })
  
  // State for suppliers
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'Tech Supplies Co.', contact: 'tech@supplies.com', products: 'Electronics', status: 'Active' },
    { id: 2, name: 'Global Parts Ltd.', contact: 'info@globalparts.com', products: 'Accessories', status: 'Active' }
  ])
  
  // State for sales
  const [sales, setSales] = useState([
    { id: 1, saleId: 'SAL-001', customer: 'John Doe', product: 'Laptop Pro', amount: 999, date: 'Today' },
    { id: 2, saleId: 'SAL-002', customer: 'Jane Smith', product: 'iPhone Case', amount: 25, date: 'Yesterday' }
  ])
  

  

  
  // State for recent activities
  const [activities, setActivities] = useState([
    { id: 1, icon: '📦', text: 'System initialized', time: '1 hour ago' },
    { id: 2, icon: '🛒', text: 'Order #ORD-001 completed', time: '2 hours ago' }
  ])
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  
  // Form states
  const [formData, setFormData] = useState({})
  const [viewOrderModal, setViewOrderModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [viewSupplierModal, setViewSupplierModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [viewCustomerModal, setViewCustomerModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  
  // Fetch real data from backend
  useEffect(() => {
    fetchCustomers()
    fetchOrders()
  }, [])
  
  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:5001/inventix/users')
      const users = await response.json()
      setRealCustomers(users.filter(u => u.role !== 'admin'))
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }
  
  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders')
      setRealOrders(response)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'inventory', label: 'Inventory', icon: '📋' },
    { id: 'suppliers', label: 'Suppliers', icon: '🚚' },
    { id: 'sales', label: 'Sales', icon: '💰' },
    { id: 'orders', label: 'Orders', icon: '🛒' },
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'todo', label: 'Todo List', icon: '📝' },
    { id: 'reports', label: 'Reports', icon: '📈' }
  ]
  
  // Helper functions
  const openModal = (type, item = null) => {
    setModalType(type)
    setSelectedItem(item)
    setFormData(item || {})
    setShowModal(true)
  }
  
  const closeModal = () => {
    setShowModal(false)
    setModalType('')
    setSelectedItem(null)
    setFormData({})
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (modalType === 'add-product') {
      const newProduct = {
        name: formData.name,
        category: formData.category,
        stock: parseInt(formData.stock),
        price: parseFloat(formData.price),
        minLevel: parseInt(formData.minLevel),
        image: formData.image && formData.image.trim() !== '' ? formData.image : getDefaultImage(formData.category, formData.name)
      }
      
      // Save to database
      fetch('http://localhost:5001/inventix/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      }).then(response => {
        if (response.ok) {
          // Refresh products from database
          fetchProducts()
          addActivity('📦', `New product "${formData.name}" added`)
        }
      }).catch(error => {
        console.error('Error adding product:', error)
        alert('Failed to add product')
      })
    } else if (modalType === 'edit-product') {
      const updatedProduct = {
        ...formData,
        stock: parseInt(formData.stock),
        price: parseFloat(formData.price),
        minLevel: parseInt(formData.minLevel),
        image: formData.image && formData.image.trim() !== '' ? formData.image : getDefaultImage(formData.category, formData.name)
      }
      
      // Update in database if it has an _id (from database)
      if (selectedItem._id) {
        fetch(`http://localhost:5001/inventix/products/${selectedItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProduct)
        }).then(response => {
          if (response.ok) {
            setProducts(products.map(p => p.id === selectedItem.id ? { ...p, ...updatedProduct } : p))
            addActivity('✏️', `Product "${formData.name}" updated`)
          }
        }).catch(error => {
          console.error('Error updating product:', error)
        })
      } else {
        // Update local state only
        setProducts(products.map(p => p.id === selectedItem.id ? { ...p, ...updatedProduct } : p))
        addActivity('✏️', `Product "${formData.name}" updated`)
      }
    } else if (modalType === 'update-stock') {
      // Update in database if it has an _id (from database)
      if (selectedItem._id) {
        fetch(`http://localhost:5001/inventix/products/${selectedItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock: parseInt(formData.stock) })
        }).then(response => {
          if (response.ok) {
            fetchProducts() // Refresh products from database
            addActivity('📊', `Stock updated for "${selectedItem.name}" to ${formData.stock} units`)
          }
        }).catch(error => {
          console.error('Error updating stock:', error)
        })
      } else {
        // Update local state only for non-database products
        setProducts(products.map(p => 
          p.id === selectedItem.id ? { ...p, stock: parseInt(formData.stock) } : p
        ))
        addActivity('📊', `Stock updated for "${selectedItem.name}" to ${formData.stock} units`)
      }
    } else if (modalType === 'add-supplier') {
      const newSupplier = { id: Date.now(), ...formData, status: 'Active' }
      setSuppliers([...suppliers, newSupplier])
      addActivity('🚚', `New supplier "${formData.name}" added`)
    } else if (modalType === 'add-customer') {
      const newCustomer = { id: Date.now(), ...formData, orders: 0, totalSpent: 0 }
      setCustomers([...customers, newCustomer])
      addActivity('👤', `New customer "${formData.name}" added`)
    } else if (modalType === 'edit-supplier') {
      setSuppliers(suppliers.map(s => s.id === selectedItem.id ? { ...s, ...formData } : s))
      addActivity('✏️', `Supplier "${formData.name}" updated`)
    } else if (modalType === 'edit-customer') {
      setCustomers(customers.map(c => c.id === selectedItem.id ? { ...c, ...formData } : c))
      addActivity('✏️', `Customer "${formData.name}" updated`)
    } else if (modalType === 'add-order') {
      const selectedProduct = products.find(p => p.name === formData.product.split(' - ')[0])
      const total = selectedProduct ? selectedProduct.price * parseInt(formData.quantity) : 0
      const newOrder = {
        id: Date.now(),
        orderId: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
        customerName: formData.customer,
        productName: selectedProduct?.name || '',
        quantity: parseInt(formData.quantity),
        price: selectedProduct?.price || 0,
        total: total,
        status: 'Processing',
        date: new Date().toISOString().split('T')[0],
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
      setOrders([...orders, newOrder])
      addActivity('🛒', `New order ${newOrder.orderId} created for ${formData.customer}`)
    }
    
    closeModal()
  }
  
  const deleteProduct = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const product = products.find(p => p.id === id)
      setProducts(products.filter(p => p.id !== id))
      addActivity('🗑️', `Product "${product.name}" deleted`)
    }
  }
  
  const deleteSupplier = (id) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      const supplier = suppliers.find(s => s.id === id)
      setSuppliers(suppliers.filter(s => s.id !== id))
      addActivity('🗑️', `Supplier "${supplier.name}" removed`)
    }
  }
  
  const updateOrderStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5001/inventix/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        // Update local state
        setRealOrders(realOrders.map(o => o._id === id ? { ...o, status: newStatus } : o))
        const order = realOrders.find(o => o._id === id)
        if (order) {
          addActivity('📋', `Order ${order.orderId} status updated to ${newStatus}`)
        }
        // Refresh orders from database
        fetchOrders()
      } else {
        alert('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Failed to update order status')
    }
  }
  
  const getDefaultImage = (category, productName = '') => {
    const name = productName.toLowerCase()
    
    // Specific product images
    if (name.includes('laptop')) return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop'
    if (name.includes('phone') || name.includes('case')) return 'https://images.unsplash.com/photo-1601593346740-925612772716?w=300&h=300&fit=crop'
    if (name.includes('mouse')) return 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop'
    if (name.includes('keyboard')) return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=300&fit=crop'
    if (name.includes('headphone')) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'
    if (name.includes('watch')) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'
    
    // Category-based with variety
    const categoryImages = {
      'Electronics': [
        'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=300&fit=crop'
      ],
      'Accessories': [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop'
      ]
    }
    
    const images = categoryImages[category] || categoryImages['Electronics']
    const hash = productName.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
    return images[Math.abs(hash) % images.length]
  }

  const downloadReportAsPDF = () => {
    const reportData = {
      totalRevenue: realOrders.filter(o => o.status === 'Completed').reduce((sum, order) => sum + order.total, 0),
      pendingRevenue: realOrders.filter(o => o.status === 'Processing').reduce((sum, order) => sum + order.total, 0),
      totalOrders: realOrders.length,
      completedOrders: realOrders.filter(o => o.status === 'Completed').length,
      processingOrders: realOrders.filter(o => o.status === 'Processing').length,
      totalProducts: products.length,
      totalCustomers: realCustomers.length,
      totalInventoryValue: products.reduce((sum, p) => sum + (p.stock * p.price), 0),
      lowStockItems: products.filter(p => {
        const minLevel = p.minLevel || 10
        const stock = parseInt(p.stock) || 0
        return stock <= minLevel && stock > 0
      }).length,
      outOfStockItems: products.filter(p => {
        const stock = parseInt(p.stock) || 0
        return stock === 0
      }).length,
      topProducts: Object.entries(
        realOrders.reduce((acc, order) => {
          if (acc[order.productName]) {
            acc[order.productName] += order.total
          } else {
            acc[order.productName] = order.total
          }
          return acc
        }, {})
      ).sort(([,a], [,b]) => b - a).slice(0, 5)
    }
    
    generatePDFReport(reportData)
  }
  
  const generatePDFReport = (data) => {
    const currentDate = new Date().toLocaleDateString()
    
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Inventix Business Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #d4af37; margin: 0; font-size: 28px; }
          .header p { margin: 5px 0; color: #666; }
          .section { margin-bottom: 25px; }
          .section h2 { color: #d4af37; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 15px 0; }
          .stat-item { background: #f9f9f9; padding: 15px; border-radius: 5px; }
          .stat-label { font-weight: bold; color: #555; }
          .stat-value { font-size: 18px; color: #d4af37; font-weight: bold; }
          .products-list { background: #f9f9f9; padding: 15px; border-radius: 5px; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📦 INVENTIX BUSINESS REPORT</h1>
          <p>Generated on: ${currentDate}</p>
        </div>
        
        <div class="section">
          <h2>💰 FINANCIAL SUMMARY</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">Total Revenue (Completed)</div>
              <div class="stat-value">$${data.totalRevenue}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Pending Revenue</div>
              <div class="stat-value">$${data.pendingRevenue}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Total Inventory Value</div>
              <div class="stat-value">$${data.totalInventoryValue.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2>📊 ORDER STATISTICS</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">Total Orders</div>
              <div class="stat-value">${data.totalOrders}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Completed Orders</div>
              <div class="stat-value">${data.completedOrders}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Processing Orders</div>
              <div class="stat-value">${data.processingOrders}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2>📦 INVENTORY STATUS</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">Total Products</div>
              <div class="stat-value">${data.totalProducts}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Low Stock Items</div>
              <div class="stat-value">${data.lowStockItems}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Out of Stock Items</div>
              <div class="stat-value">${data.outOfStockItems}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Total Customers</div>
              <div class="stat-value">${data.totalCustomers}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2>🏆 TOP SELLING PRODUCTS (by Revenue)</h2>
          <div class="products-list">
            ${data.topProducts.map(([product, revenue], index) => 
              `<div style="margin: 8px 0; padding: 8px; background: white; border-radius: 3px;">
                <strong>${index + 1}. ${product}</strong> - <span style="color: #d4af37;">$${revenue}</span>
              </div>`
            ).join('')}
          </div>
        </div>
        
        <div class="footer">
          <p>Report generated by Inventix Admin Dashboard</p>
          <p>© 2024 Inventix - Inventory Management System</p>
        </div>
      </body>
      </html>
    `
    
    // Create and download HTML file that can be printed as PDF
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Inventix_Report_${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    // Show instructions for PDF conversion
    setPopup({ 
      message: 'Report downloaded as HTML file. Open it in your browser and use Ctrl+P to save as PDF!', 
      type: 'success' 
    })
    setTimeout(() => setPopup(null), 5000)
    
    addActivity('📄', 'Business report downloaded as HTML')
  }

  const addActivity = (icon, text) => {
    const newActivity = {
      id: Date.now(),
      icon,
      text,
      time: 'Just now'
    }
    setActivities([newActivity, ...activities.slice(0, 4)])
  }

  const renderContent = () => {
    switch(activeSection) {
      case 'dashboard':
        const dashboardRevenue = realOrders.filter(o => o.status === 'Completed').reduce((sum, order) => sum + order.total, 0)
        const todayOrders = realOrders.filter(order => new Date(order.createdAt || order.date).toDateString() === new Date().toDateString()).length
        const lowStockCount = products.filter(p => {
          const minLevel = p.minLevel || 10
          const stock = parseInt(p.stock) || 0
          return stock <= minLevel && stock > 0
        }).length
        const outOfStockCount = products.filter(p => {
          const stock = parseInt(p.stock) || 0
          return stock === 0
        }).length
        
        console.log('Products for stock check:', products.length)
        console.log('Low stock items:', products.filter(p => {
          const minLevel = p.minLevel || 10
          const stock = parseInt(p.stock) || 0
          return stock <= minLevel && stock > 0
        }))
        console.log('Out of stock items:', products.filter(p => {
          const stock = parseInt(p.stock) || 0
          return stock === 0
        }))
        const processingOrders = realOrders.filter(o => o.status === 'Processing').length
        return (
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>{products.length}</h3>
                  <p>Total Products</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🛒</div>
                <div className="stat-info">
                  <h3>{realOrders.length}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>{dashboardRevenue}</h3>
                  <p>Completed Revenue</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{realCustomers.length}</h3>
                  <p>Registered Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>{processingOrders}</h3>
                  <p>Pending Orders</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚠️</div>
                <div className="stat-info">
                  <h3>{lowStockCount + outOfStockCount}</h3>
                  <p>Stock Alerts</p>
                </div>
              </div>
            </div>
            <div className="dashboard-overview">
              <div className="recent-activity">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                  {activities.length > 0 ? activities.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <span className="activity-icon">{activity.icon}</span>
                      <span>{activity.text}</span>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  )) : (
                    <div className="activity-item">
                      <span className="activity-icon">📊</span>
                      <span>System ready - No recent activity</span>
                      <span className="activity-time">Now</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="quick-stats">
                <h2>Today's Summary</h2>
                <div className="today-stats">
                  <div className="today-stat">
                    <span className="stat-label">Orders Today:</span>
                    <span className="stat-value">{todayOrders}</span>
                  </div>
                  <div className="today-stat">
                    <span className="stat-label">Low Stock Items:</span>
                    <span className="stat-value">{lowStockCount}</span>
                  </div>
                  <div className="today-stat">
                    <span className="stat-label">Out of Stock:</span>
                    <span className="stat-value">{outOfStockCount}</span>
                  </div>
                  <div className="today-stat">
                    <span className="stat-label">Processing Orders:</span>
                    <span className="stat-value">{processingOrders}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'products':
        return (
          <div className="products-content">
            <div className="section-header">
              <h2>Product Management</h2>
              <button className="add-btn" onClick={() => openModal('add-product')}>+ Add Product</button>
            </div>
            <div className="products-table">
              <div className="table-header">
                <span>Product</span>
                <span>Category</span>
                <span>Stock</span>
                <span>Price</span>
                <span>Actions</span>
              </div>
              {products.map(product => (
                <div key={product.id} className="table-row">
                  <span>{product.name}</span>
                  <span>{product.category}</span>
                  <span>{product.stock}</span>
                  <span>{product.price}</span>
                  <span className="actions">
                    <button className="edit-btn" onClick={() => openModal('edit-product', product)}>Edit</button>
                    <button className="delete-btn" onClick={() => deleteProduct(product.id)}>Delete</button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      case 'orders':
        return (
          <div className="orders-content">
            <div className="section-header">
              <h2>🛒 Customer Orders</h2>
            </div>
            <div className="orders-table">
              <div className="table-header">
                <span>Order ID</span>
                <span>Customer</span>
                <span>Product</span>
                <span>Quantity</span>
                <span>Total</span>
                <span>Status</span>
                <span>Date</span>
                <span>Actions</span>
              </div>
              {realOrders && realOrders.length > 0 ? realOrders.map(order => (
                <div key={order._id} className="table-row">
                  <span>{order.orderId}</span>
                  <span>{order.customerName}</span>
                  <span>{order.productName}</span>
                  <span>{order.quantity}</span>
                  <span>{order.total}</span>
                  <span className={order.status === 'Completed' ? 'status-completed' : 'status-pending'}>
                    {order.status}
                  </span>
                  <span>{new Date(order.createdAt || order.date).toLocaleDateString()}</span>
                  <span className="actions">
                    <button className="view-btn" onClick={() => {
                      setSelectedOrder(order)
                      setViewOrderModal(true)
                    }}>View</button>
                    {order.status === 'Processing' && (
                      <button className="edit-btn" onClick={() => updateOrderStatus(order._id, 'Completed')}>Complete</button>
                    )}
                  </span>
                </div>
              )) : (
                <div className="table-row">
                  <span style={{textAlign: 'center', color: '#999', gridColumn: '1 / -1', padding: '2rem'}}>No orders found. Orders will appear here when customers place them.</span>
                </div>
              )}
            </div>
          </div>
        )
      case 'customers':
        return (
          <div className="customers-content">
            <div className="section-header">
              <h2>👥 Registered Customers</h2>
            </div>
            <div className="customers-table">
              <div className="table-header">
                <span>Name</span>
                <span>Username</span>
                <span>Email</span>
                <span>Role</span>
                <span>Registration Date</span>
                <span>Actions</span>
              </div>
              {realCustomers.length > 0 ? realCustomers.map(customer => (
                <div key={customer._id} className="table-row">
                  <span>{customer.name}</span>
                  <span>{customer.username}</span>
                  <span>{customer.email}</span>
                  <span>{customer.role}</span>
                  <span>{new Date(customer.createdAt || Date.now()).toLocaleDateString()}</span>
                  <span className="actions">
                    <button className="view-btn" onClick={() => {
                      setSelectedCustomer(customer)
                      setViewCustomerModal(true)
                    }}>View</button>
                  </span>
                </div>
              )) : (
                <div className="table-row">
                  <span style={{textAlign: 'center', color: '#999', gridColumn: '1 / -1', padding: '2rem'}}>No registered customers found.</span>
                </div>
              )}
            </div>
          </div>
        )
      case 'reports':
        const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0)
        const stockAvailability = products.length > 0 ? Math.round((products.filter(p => p.stock > 0).length / products.length) * 100) : 0
        const totalRevenue = realOrders.filter(o => o.status === 'Completed').reduce((sum, order) => sum + order.total, 0)
        const pendingRevenue = realOrders.filter(o => o.status === 'Processing').reduce((sum, order) => sum + order.total, 0)
        
        // Calculate top selling products by revenue from orders
        const productRevenue = {}
        realOrders.forEach(order => {
          if (productRevenue[order.productName]) {
            productRevenue[order.productName] += order.total
          } else {
            productRevenue[order.productName] = order.total
          }
        })
        const topSellingProducts = Object.entries(productRevenue)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
        
        return (
          <div className="reports-content">
            <div className="reports-header">
              <h2>📈 Business Reports</h2>
              <button className="download-pdf-btn" onClick={() => downloadReportAsPDF()}>
                📄 Download PDF Report
              </button>
            </div>
            <div className="reports-grid">
              <div className="report-card">
                <h3>Total Revenue</h3>
                <div className="report-value">{totalRevenue}</div>
                <p>From {realOrders.filter(o => o.status === 'Completed').length} completed orders</p>
              </div>
              <div className="report-card">
                <h3>Pending Revenue</h3>
                <div className="report-value">{pendingRevenue}</div>
                <p>From {realOrders.filter(o => o.status === 'Processing').length} pending orders</p>
              </div>
              <div className="report-card">
                <h3>Top Products by Revenue</h3>
                <div className="report-list">
                  {topSellingProducts.length > 0 ? topSellingProducts.map(([product, revenue], index) => (
                    <div key={product}>{index + 1}. {product} - {revenue}</div>
                  )) : (
                    <div>No sales data available</div>
                  )}
                </div>
              </div>
              <div className="report-card">
                <h3>Customer Stats</h3>
                <div className="report-value">{realCustomers.length}</div>
                <p>Registered customers</p>
              </div>
              <div className="report-card">
                <h3>Inventory Value</h3>
                <div className="report-value">{totalInventoryValue.toLocaleString()}</div>
                <p>Total inventory worth</p>
              </div>
              <div className="report-card">
                <h3>Stock Status</h3>
                <div className="report-value">{stockAvailability}%</div>
                <p>Products in stock</p>
              </div>
            </div>
          </div>
        )

      case 'inventory':
        return (
          <div className="inventory-content">
            <div className="section-header">
              <h2>📋 Inventory Management</h2>
            </div>
            <div className="inventory-table">
              <div className="table-header">
                <span>Product</span>
                <span>Current Stock</span>
                <span>Min Level</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {products.map(product => (
                <div key={product.id} className="table-row">
                  <span>{product.name}</span>
                  <span>{product.stock}</span>
                  <span>{product.minLevel || 10}</span>
                  <span className={product.stock > (product.minLevel || 10) ? 'status-completed' : product.stock === 0 ? 'status-out-of-stock' : 'status-pending'}>
                    {product.stock === 0 ? 'Out of Stock' : product.stock > (product.minLevel || 10) ? 'Good' : 'Low Stock'}
                  </span>
                  <span className="actions">
                    <button className="edit-btn" onClick={() => openModal('update-stock', product)}>Update</button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      case 'suppliers':
        return (
          <div className="suppliers-content">
            <div className="section-header">
              <h2>🚚 Supplier Management</h2>
              <button className="add-btn" onClick={() => openModal('add-supplier')}>+ Add Supplier</button>
            </div>
            <div className="suppliers-table">
              <div className="table-header">
                <span>Supplier Name</span>
                <span>Contact</span>
                <span>Products</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {suppliers.map(supplier => (
                <div key={supplier.id} className="table-row">
                  <span>{supplier.name}</span>
                  <span>{supplier.contact}</span>
                  <span>{supplier.products}</span>
                  <span className="status-completed">{supplier.status}</span>
                  <span className="actions">
                    <button className="view-btn" onClick={() => {
                      setSelectedSupplier(supplier)
                      setViewSupplierModal(true)
                    }}>View</button>
                    <button className="edit-btn" onClick={() => openModal('edit-supplier', supplier)}>Edit</button>
                    <button className="delete-btn" onClick={() => deleteSupplier(supplier.id)}>Delete</button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      case 'sales':
        const totalSales = realOrders.reduce((sum, order) => sum + order.total, 0)
        const completedOrders = realOrders.filter(order => order.status === 'Completed')
        const completedSales = completedOrders.reduce((sum, order) => sum + order.total, 0)
        return (
          <div className="sales-content">
            <div className="section-header">
              <h2>💰 Sales Management</h2>
            </div>
            <div className="sales-stats">
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>{completedSales}</h3>
                  <p>Completed Sales</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-info">
                  <h3>{realOrders.length}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{completedOrders.length}</h3>
                  <p>Completed Orders</p>
                </div>
              </div>
            </div>
            <div className="sales-table">
              <div className="table-header">
                <span>Order ID</span>
                <span>Customer</span>
                <span>Product</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Date</span>
              </div>
              {realOrders.length > 0 ? realOrders.map(order => (
                <div key={order._id} className="table-row">
                  <span>{order.orderId}</span>
                  <span>{order.customerName}</span>
                  <span>{order.productName}</span>
                  <span>{order.total}</span>
                  <span className={order.status === 'Completed' ? 'status-completed' : 'status-pending'}>
                    {order.status}
                  </span>
                  <span>{new Date(order.createdAt || order.date).toLocaleDateString()}</span>
                </div>
              )) : (
                <div className="table-row">
                  <span style={{textAlign: 'center', color: '#999', gridColumn: '1 / -1', padding: '2rem'}}>No sales data available.</span>
                </div>
              )}
            </div>
          </div>
        )
      case 'profile':
        return (
          <div className="profile-content">
            <div className="admin-profile-header">
              <div className="admin-avatar">
                <div className="avatar-circle">👨‍💼</div>
                <button className="change-photo-btn" style={{display: 'none'}}>Change Photo</button>
              </div>
              <div className="admin-info">
                <h2>{adminProfile.name}</h2>
                <p className="admin-username">@{adminProfile.username}</p>
                <p className="admin-role">{adminProfile.role}</p>
                <p className="admin-department">{adminProfile.department}</p>
                <div className="admin-stats">
                  <span>📅 Joined: {adminProfile.joinDate}</span>
                  <span>🔑 Full Access</span>
                  <span>📊 {realOrders.length} Orders Managed</span>
                  <span>👥 {realCustomers.length} Customers</span>
                </div>
              </div>
            </div>
            
            <div className="admin-profile-sections">
              <div className="profile-section">
                <h3>📋 Personal Information</h3>
                <div className="admin-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>👤 Full Name</label>
                      <input 
                        type="text" 
                        value={adminProfile.name}
                        onChange={(e) => setAdminProfile({...adminProfile, name: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>📧 Email</label>
                      <input 
                        type="email" 
                        value={adminProfile.email}
                        onChange={(e) => setAdminProfile({...adminProfile, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>📱 Phone</label>
                      <input 
                        type="tel" 
                        value={adminProfile.phone}
                        onChange={(e) => setAdminProfile({...adminProfile, phone: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>🏢 Department</label>
                      <input 
                        type="text" 
                        value={adminProfile.department}
                        onChange={(e) => setAdminProfile({...adminProfile, department: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>🔑 Username</label>
                    <input 
                      type="text" 
                      value={adminProfile.username}
                      onChange={(e) => setAdminProfile({...adminProfile, username: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              

              <div className="profile-section">
                <h3>⚙️ System Preferences</h3>
                <div className="preferences-grid">
                  <div className="preference-card">
                    <div className="preference-header">
                      <span className="preference-icon">{darkMode ? '🌙' : '☀️'}</span>
                      <span>Theme</span>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={darkMode}
                        onChange={(e) => setDarkMode(e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="preference-card">
                    <div className="preference-header">
                      <span className="preference-icon">📧</span>
                      <span>Email Notifications</span>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="preference-card">
                    <div className="preference-header">
                      <span className="preference-icon">🔔</span>
                      <span>System Alerts</span>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="profile-actions">
                <button className="save-btn" onClick={() => {
                  setPopup({ message: 'Admin profile changes saved successfully!', type: 'success' })
                  setTimeout(() => setPopup(null), 3000)
                  addActivity('👤', 'Admin profile updated')
                }}>Save Changes</button>
                <button className="reset-btn" onClick={() => {
                  if (confirm('Are you sure you want to reset your password?')) {
                    setPopup({ message: 'Password reset link sent to your email!', type: 'success' })
                    setTimeout(() => setPopup(null), 3000)
                    addActivity('🔑', 'Password reset requested')
                  }
                }}>Reset Password</button>
              </div>
            </div>
          </div>
        )
      case 'todo':
        return (
          <div className="todo-content">
            <TodoList />
          </div>
        )
      default:
        return (
          <div className="default-content">
            <h2>{menuItems.find(item => item.id === activeSection)?.label}</h2>
            <p>Content for {activeSection} section coming soon...</p>
          </div>
        )
    }
  }

  return (
    <div className={`admin-dashboard ${darkMode ? 'dark-theme' : 'light-theme'}`}>
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
          <h1>Admin Dashboard</h1>
          <div className="user-info">
            <button 
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <span>Welcome, {user?.name || 'Admin'}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
            <div className="user-avatar">👤</div>
          </div>
        </header>
        
        <main className="content-area">
          {renderContent()}
        </main>
      </div>
      
      {/* Order View Modal */}
      {viewOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setViewOrderModal(false)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Order Details</h3>
              <button className="close-btn" onClick={() => setViewOrderModal(false)}>×</button>
            </div>
            
            <div className="order-details">
              <div className="order-info-grid">
                <div className="info-item">
                  <span className="info-label">Order ID:</span>
                  <span className="info-value">{selectedOrder.orderId}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Customer:</span>
                  <span className="info-value">{selectedOrder.customerName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Product:</span>
                  <span className="info-value">{selectedOrder.productName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Quantity:</span>
                  <span className="info-value">{selectedOrder.quantity}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Unit Price:</span>
                  <span className="info-value">${selectedOrder.price}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total Amount:</span>
                  <span className="info-value total-amount">${selectedOrder.total}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className={`info-value status-badge ${selectedOrder.status.toLowerCase()}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Order Date:</span>
                  <span className="info-value">{selectedOrder.date}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Estimated Delivery:</span>
                  <span className="info-value">{selectedOrder.estimatedDelivery}</span>
                </div>
              </div>
              
              <div className="order-actions">
                {selectedOrder.status === 'Processing' && (
                  <button 
                    className="complete-order-btn"
                    onClick={() => {
                      updateOrderStatus(selectedOrder._id, 'Completed')
                      setViewOrderModal(false)
                    }}
                  >
                    ✓ Mark as Completed
                  </button>
                )}
                <button className="close-order-btn" onClick={() => setViewOrderModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Customer View Modal */}
      {viewCustomerModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setViewCustomerModal(false)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>👤 Customer Details</h3>
              <button className="close-btn" onClick={() => setViewCustomerModal(false)}>×</button>
            </div>
            
            <div className="order-details">
              <div className="order-info-grid">
                <div className="info-item">
                  <span className="info-label">Full Name:</span>
                  <span className="info-value">{selectedCustomer.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Username:</span>
                  <span className="info-value">{selectedCustomer.username}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email Address:</span>
                  <span className="info-value">{selectedCustomer.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Account Type:</span>
                  <span className={`info-value status-badge ${selectedCustomer.role?.toLowerCase() || 'user'}`}>
                    {selectedCustomer.role || 'User'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Customer ID:</span>
                  <span className="info-value">CUST-{String(selectedCustomer._id).slice(-6).toUpperCase()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Registration Date:</span>
                  <span className="info-value">{new Date(selectedCustomer.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total Orders:</span>
                  <span className="info-value">{realOrders.filter(order => order.customerName === selectedCustomer.name).length}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total Spent:</span>
                  <span className="info-value total-amount">${realOrders.filter(order => order.customerName === selectedCustomer.name && order.status === 'Completed').reduce((sum, order) => sum + order.total, 0)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Account Status:</span>
                  <span className="info-value status-badge active">Active</span>
                </div>
              </div>
              
              <div className="customer-orders-section">
                <h4>Recent Orders</h4>
                <div className="customer-orders-list">
                  {realOrders.filter(order => order.customerName === selectedCustomer.name).slice(0, 3).map(order => (
                    <div key={order._id} className="customer-order-item">
                      <span className="order-id">{order.orderId}</span>
                      <span className="order-product">{order.productName}</span>
                      <span className="order-amount">${order.total}</span>
                      <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
                    </div>
                  ))}
                  {realOrders.filter(order => order.customerName === selectedCustomer.name).length === 0 && (
                    <div className="no-orders">No orders found for this customer</div>
                  )}
                </div>
              </div>
              
              <div className="order-actions">
                <button className="close-order-btn" onClick={() => setViewCustomerModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Supplier View Modal */}
      {viewSupplierModal && selectedSupplier && (
        <div className="modal-overlay" onClick={() => setViewSupplierModal(false)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🚚 Supplier Details</h3>
              <button className="close-btn" onClick={() => setViewSupplierModal(false)}>×</button>
            </div>
            
            <div className="order-details">
              <div className="order-info-grid">
                <div className="info-item">
                  <span className="info-label">Supplier Name:</span>
                  <span className="info-value">{selectedSupplier.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Contact Email:</span>
                  <span className="info-value">{selectedSupplier.contact}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Product Categories:</span>
                  <span className="info-value">{selectedSupplier.products}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className={`info-value status-badge ${selectedSupplier.status.toLowerCase()}`}>
                    {selectedSupplier.status}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Supplier ID:</span>
                  <span className="info-value">SUP-{String(selectedSupplier.id).padStart(3, '0')}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Partnership Since:</span>
                  <span className="info-value">2024-01-15</span>
                </div>
              </div>
              
              <div className="order-actions">
                <button 
                  className="edit-btn"
                  onClick={() => {
                    openModal('edit-supplier', selectedSupplier)
                    setViewSupplierModal(false)
                  }}
                >
                  ✏️ Edit Supplier
                </button>
                <button className="close-order-btn" onClick={() => setViewSupplierModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalType === 'add-product' && 'Add New Product'}
                {modalType === 'edit-product' && 'Edit Product'}
                {modalType === 'update-stock' && 'Update Stock'}
                {modalType === 'add-supplier' && 'Add New Supplier'}
                {modalType === 'edit-supplier' && 'Edit Supplier'}
                {modalType === 'add-customer' && 'Add New Customer'}
                {modalType === 'edit-customer' && 'Edit Customer'}
                {modalType === 'add-order' && 'Add New Order'}
              </h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              {(modalType === 'add-product' || modalType === 'edit-product') && (
                <>
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  />
                  <input
                    type="url"
                    placeholder="Image URL (optional)"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Stock Quantity"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Minimum Level"
                    value={formData.minLevel || ''}
                    onChange={(e) => setFormData({...formData, minLevel: e.target.value})}
                    required
                  />
                </>
              )}
              
              {modalType === 'update-stock' && (
                <>
                  <p>Product: {selectedItem?.name}</p>
                  <p>Current Stock: {selectedItem?.stock}</p>
                  <input
                    type="number"
                    placeholder="New Stock Quantity"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    required
                  />
                </>
              )}
              
              {(modalType === 'add-supplier' || modalType === 'edit-supplier') && (
                <>
                  <input
                    type="text"
                    placeholder="Supplier Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Contact Email"
                    value={formData.contact || ''}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Product Categories"
                    value={formData.products || ''}
                    onChange={(e) => setFormData({...formData, products: e.target.value})}
                    required
                  />
                </>
              )}
              
              {(modalType === 'add-customer' || modalType === 'edit-customer') && (
                <>
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </>
              )}
              
              {modalType === 'add-order' && (
                <>
                  <select
                    value={formData.customer || ''}
                    onChange={(e) => setFormData({...formData, customer: e.target.value})}
                    required
                    style={{padding: '0.8rem', background: 'rgba(45, 45, 45, 0.8)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '8px', color: '#fff'}}
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.name}>{customer.name}</option>
                    ))}
                  </select>
                  <select
                    value={formData.product || ''}
                    onChange={(e) => setFormData({...formData, product: e.target.value})}
                    required
                    style={{padding: '0.8rem', background: 'rgba(45, 45, 45, 0.8)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '8px', color: '#fff'}}
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.name}>{product.name} - ${product.price}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    required
                  />
                </>
              )}
              
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="submit-btn">Save</button>
              </div>
            </form>
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

export default AdminDashBoard