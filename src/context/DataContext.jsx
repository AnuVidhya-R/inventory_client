import React, { createContext, useContext, useState, useEffect } from 'react'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  // Shared products state
  const [products, setProducts] = useState([])
  
  // Get default image based on category and product name
  const getDefaultImage = (category, productName = '') => {
    const name = productName.toLowerCase()
    
    // Specific product images
    if (name.includes('laptop')) return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop'
    if (name.includes('phone') || name.includes('case')) return 'https://images.unsplash.com/photo-1601593346740-925612772716?w=300&h=300&fit=crop'
    if (name.includes('mouse')) return 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop'
    if (name.includes('keyboard')) return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=300&fit=crop'
    if (name.includes('headphone')) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'
    if (name.includes('watch')) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'
    if (name.includes('camera')) return 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=300&fit=crop'
    if (name.includes('tablet')) return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop'
    
    // Category-based images
    const categoryImages = {
      'Electronics': [
        'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop'
      ],
      'Accessories': [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop'
      ],
      'Clothing': [
        'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=300&fit=crop'
      ],
      'Books': ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop'],
      'Home': ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop'],
      'Sports': ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop']
    }
    
    const images = categoryImages[category] || categoryImages['Electronics']
    const hash = productName.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
    return images[Math.abs(hash) % images.length]
  }

  // Fetch products from database
  const fetchProducts = async () => {
    try {
      const response = await fetch('https://inventory-server-1-atx9.onrender.com/inventix/products')
      if (response.ok) {
        const dbProducts = await response.json()
        // Add default products if database is empty
        if (dbProducts.length === 0) {
          const defaultProducts = [
            { 
              name: 'Laptop Pro', 
              category: 'Electronics', 
              stock: 45, 
              price: 999, 
              minLevel: 10,
              image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop&crop=center'
            },
            { 
              name: 'iPhone Case', 
              category: 'Accessories', 
              stock: 5, 
              price: 25, 
              minLevel: 20,
              image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=300&h=300&fit=crop&crop=center'
            },
            { 
              name: 'Wireless Mouse', 
              category: 'Electronics', 
              stock: 30, 
              price: 50, 
              minLevel: 15,
              image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop&crop=center'
            }
          ]
          // Add default products to database
          for (const product of defaultProducts) {
            await fetch('https://inventory-server-1-atx9.onrender.com/inventix/products', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(product)
            })
          }
          // Fetch again to get products with IDs
          const newResponse = await fetch('https://inventory-server-1-atx9.onrender.com/inventix/products')
          const newProducts = await newResponse.json()
          setProducts(newProducts.map(p => ({ ...p, id: p._id })))
        } else {
          setProducts(dbProducts.map(p => ({ 
            ...p, 
            id: p._id,
            image: p.image && p.image.trim() !== '' ? p.image : getDefaultImage(p.category, p.name)
          })))
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }
  
  useEffect(() => {
    fetchProducts()
  }, [])

  // Shared customers state
  const [customers, setCustomers] = useState([
    { id: 1, name: 'John Doe', email: 'john@email.com', phone: '+1-234-567-8900', orders: 5, totalSpent: 2450 },
    { id: 2, name: 'Jane Smith', email: 'jane@email.com', phone: '+1-234-567-8901', orders: 3, totalSpent: 1200 }
  ])

  // Shared orders state
  const [orders, setOrders] = useState([])

  // Add logged-in user to customers if not exists
  const addUserAsCustomer = (user) => {
    const existingCustomer = customers.find(c => c.name === user.name)
    if (!existingCustomer && user.role === 'user') {
      const newCustomer = {
        id: Date.now(),
        name: user.name,
        email: user.username + '@email.com',
        phone: '+1-000-000-0000',
        orders: 0,
        totalSpent: 0
      }
      setCustomers(prev => [...prev, newCustomer])
    }
  }

  // Place order function
  const placeOrder = (user, product, quantity = 1) => {
    const newOrder = {
      id: Date.now(),
      orderId: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      customerName: user.name,
      productName: product.name,
      quantity: quantity,
      price: product.price,
      total: product.price * quantity,
      status: 'Processing',
      date: new Date().toISOString().split('T')[0],
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
    
    setOrders(prev => [...prev, newOrder])
    
    // Update product stock
    setProducts(prev => prev.map(p => 
      p.id === product.id ? { ...p, stock: p.stock - quantity } : p
    ))
    
    // Update customer stats
    setCustomers(prev => prev.map(c => 
      c.name === user.name ? { 
        ...c, 
        orders: c.orders + 1, 
        totalSpent: c.totalSpent + newOrder.total 
      } : c
    ))
    
    return newOrder
  }

  const value = {
    products,
    setProducts,
    customers,
    setCustomers,
    orders,
    setOrders,
    addUserAsCustomer,
    placeOrder,
    fetchProducts
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}