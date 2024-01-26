import React, { useReducer, useState, useEffect } from 'react';
import './App.css';

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TASK':
      return [...state, action.payload];
    case 'REMOVE_TASK':
      return state.filter(task => task.id !== action.payload);
    case 'UPDATE_TASK':
      return state.map(task =>
        task.id === action.payload.id ? { ...task, ...action.payload.updatedTask } : task
      );
    case 'SET_TASKS':
      return action.payload;
    default:
      return state;
  }
};

const categoryReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_CATEGORY':
      return [...state, action.payload];
    case 'REMOVE_CATEGORY':
      return state.filter(category => category.id !== action.payload);
    case 'SET_CATEGORIES':
      return action.payload;
    default:
      return state;
  }
};

const App = () => {
  const initialTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const initialCategories = JSON.parse(localStorage.getItem('categories')) || [];

  const [tasks, dispatchTasks] = useReducer(taskReducer, initialTasks);
  const [categories, dispatchCategories] = useReducer(categoryReducer, initialCategories);
  const [newTask, setNewTask] = useState({ name: '', description: '', category: '' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const storedCategories = JSON.parse(localStorage.getItem('categories')) || [];
    dispatchTasks({ type: 'SET_TASKS', payload: storedTasks });
    dispatchCategories({ type: 'SET_CATEGORIES', payload: storedCategories });
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [tasks, categories]);

  const filteredTasks = selectedCategory === 'All'
    ? tasks
    : tasks.filter(task => task.category === selectedCategory);

  const handleCategoryChange = e => {
    setSelectedCategory(e.target.value);
  };

  const handleAddTask = () => {
    if (!newTask.name || !newTask.description || !newTask.category) {
      alert("Please fill in all fields (Name, Description, and Category) to add a task.");
      return;
    }

    if (editingTaskId !== null) {
      dispatchTasks({
        type: 'UPDATE_TASK',
        payload: { id: editingTaskId, updatedTask: newTask },
      });
      setEditingTaskId(null);
    } else {
      dispatchTasks({ type: 'ADD_TASK', payload: { ...newTask, id: Date.now() } });
    }
    setNewTask({ name: '', description: '', category: '' });
  };

  const handleRemoveTask = taskId => {
    dispatchTasks({ type: 'REMOVE_TASK', payload: taskId });
    if (editingTaskId === taskId) {
      setEditingTaskId(null);
      setNewTask({ name: '', description: '', category: '' });
    }
  };

  const handleEditTask = task => {
    setEditingTaskId(task.id);
    setNewTask({ ...task });
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setNewTask({ name: '', description: '', category: '' });
  };

  const handleRemoveCategory = categoryId => {
    dispatchCategories({ type: 'REMOVE_CATEGORY', payload: categoryId });
  };

  const handleAddCategory = newCategory => {
    if (newCategory) {
      dispatchCategories({ type: 'ADD_CATEGORY', payload: { name: newCategory, id: Date.now() } });
    }
  };

  return (
    <div className='container'>
      <div className='createContainer'>
        <h2>Task Creation</h2>
        <div>
          <input
            type="text"
            maxLength={10}
            placeholder="Task Name"
            value={newTask.name}
            onChange={e => setNewTask({ ...newTask, name: e.target.value })}
          />
          <input
            type="text"
            maxLength={10}
            placeholder="Task Description"
            value={newTask.description}
            onChange={e => setNewTask({ ...newTask, description: e.target.value })}
          />
          <select
            value={newTask.category}
            onChange={e => setNewTask({ ...newTask, category: e.target.value })}
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <br />
          <button onClick={handleAddTask}>
            {editingTaskId !== null ? 'Update Task' : 'Add Task'}
          </button>
          {editingTaskId !== null && (
            <button onClick={handleCancelEdit}>Cancel Edit</button>
          )}
        </div>
        <div>
          <h2>Category Creation</h2>
          <div>
            <input
              maxLength={10}
              type="text"
              placeholder="New Category"
              onChange={e => setNewTask({ ...newTask, category: e.target.value })}
            />
            <br />
            <button onClick={() => handleAddCategory(newTask.category)}>Add Category</button>
          </div>
        </div>
      </div>
      <div className='manageContainer'>
        <div>
          <h2>Task Manager</h2>
          <p>Filter by Category:</p>
          <select value={selectedCategory} onChange={handleCategoryChange}>
            <option value="All">All</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <ul className='tasks'>
            {filteredTasks.map(task => (
              <li key={task.id} className='tasksList'>
                {task.name} - {task.description} - {task.category}
                <div className='taskBtns'>
                  <button className='removeBtn' onClick={() => handleRemoveTask(task.id)}>Remove</button>
                  <button className= 'editBtn' onClick={() => handleEditTask(task)}>Edit</button>
                </div>
              </li>
            ))}
          </ul>  
        </div>
        <div>
          <h2>Category Manager</h2>
          <ul className='categories'>
            {categories.map(category => (
              <li className='categoriesList' key={category.id}>
                {category.name}
                <button className='removeBtn' onClick={() => handleRemoveCategory(category.id)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
