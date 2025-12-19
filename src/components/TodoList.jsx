import React, { useState } from 'react'
import './css/TodoList.css'

const TodoList = () => {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Update inventory system', completed: false, priority: 'high' },
    { id: 2, text: 'Review customer orders', completed: true, priority: 'medium' },
    { id: 3, text: 'Check stock levels', completed: false, priority: 'low' }
  ])
  const [newTodo, setNewTodo] = useState('')
  const [priority, setPriority] = useState('medium')

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: newTodo,
        completed: false,
        priority: priority
      }])
      setNewTodo('')
    }
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#f44336'
      case 'medium': return '#FF9800'
      case 'low': return '#4CAF50'
      default: return '#ccc'
    }
  }

  return (
    <div className="todo-container">
      <div className="todo-header">
        <h2>📝 To-Do List</h2>
        <p>Keep track of your tasks</p>
      </div>

      <div className="add-todo">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button onClick={addTodo} className="add-btn">Add</button>
      </div>

      <div className="todo-stats">
        <div className="stat">
          <span className="stat-number">{todos.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat">
          <span className="stat-number">{todos.filter(t => !t.completed).length}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat">
          <span className="stat-number">{todos.filter(t => t.completed).length}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      <div className="todo-list">
        {todos.map(todo => (
          <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <div className="todo-content">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="todo-checkbox"
              />
              <span className="todo-text">{todo.text}</span>
              <span 
                className="priority-badge"
                style={{ backgroundColor: getPriorityColor(todo.priority) }}
              >
                {todo.priority}
              </span>
            </div>
            <button onClick={() => deleteTodo(todo.id)} className="delete-btn">🗑️</button>
          </div>
        ))}
      </div>

      {todos.length === 0 && (
        <div className="empty-state">
          <p>No tasks yet. Add one above! 🎉</p>
        </div>
      )}
    </div>
  )
}

export default TodoList