import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch todos when component loads
  useEffect(() => {
    fetchTodos()
  }, [])

  // Fetch all todos from Supabase
  async function fetchTodos() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTodos(data || [])
    } catch (error) {
      alert('Error loading todos: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Add a new todo
  async function addTodo() {
    if (!newTodo.trim()) return

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ task: newTodo, is_complete: false }])
        .select()

      if (error) throw error
      setTodos([data[0], ...todos])
      setNewTodo('')
    } catch (error) {
      alert('Error adding todo: ' + error.message)
    }
  }

  // Toggle todo completion
  async function toggleTodo(id, is_complete) {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_complete: !is_complete })
        .eq('id', id)

      if (error) throw error
      
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, is_complete: !is_complete } : todo
      ))
    } catch (error) {
      alert('Error updating todo: ' + error.message)
    }
  }

  // Delete a todo
  async function deleteTodo(id) {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) throw error
      setTodos(todos.filter(todo => todo.id !== id))
    } catch (error) {
      alert('Error deleting todo: ' + error.message)
    }
  }

  return (
    <div className="container">
      <h1>My Todo App</h1>
      <p>Built with Vercel + Supabase</p>

      {/* Add new todo */}
      <div className="add-todo">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>Add Todo</button>
      </div>

      {/* Todo list */}
      {loading ? (
        <p>Loading todos...</p>
      ) : (
        <div className="todos">
          {todos.length === 0 ? (
            <p className="empty">No todos yet. Add one above!</p>
          ) : (
            todos.map((todo) => (
              <div key={todo.id} className={`todo ${todo.is_complete ? 'completed' : ''}`}>
                <span 
                  onClick={() => toggleTodo(todo.id, todo.is_complete)}
                  className="task"
                >
                  {todo.task}
                </span>
                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <footer>
        <p>
          Powered by{' '}
          <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
            Vercel
          </a>
          {' '}+{' '}
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
            Supabase
          </a>
        </p>
      </footer>
    </div>
  )
}
