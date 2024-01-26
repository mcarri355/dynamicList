import React, { useReducer, useEffect, useState } from 'react';
import './App.css';


const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TASKS':
      return action.payload;
    case 'ADD_TASK':
      return [...state, action.payload];
    case 'REMOVE_TASK':
      return state.filter(task => task.id !== action.payload);
    case 'UPDATE_TASK':
      return state.map(task =>
        task.id === action.payload.id ? { ...task, ...action.payload.updatedTask } : task
      );
    default:
      return state;
  }
};

const categoryReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CATEGORIES':
      return action.payload;
    case 'ADD_CATEGORY':
      return [...state, action.payload];
    case 'REMOVE_CATEGORY':
      return state.filter(category => category.id !== action.payload);
    default:
      return state;
  }
};

const App = () => {
  const initialTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const initialCategories = JSON.parse(localStorage.getItem('categories')) || [];

  const [tasks, dispatchTasks] = useReducer(taskReducer, initialTasks);
  const [categories, dispatchCategories] = useReducer(categoryReducer, initialCategories);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newTaskState, newTaskDispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'SET_NEW_TASK':
        return { ...state, ...action.payload };
      case 'RESET_NEW_TASK':
        return { name: '', description: '', category: '' };
      default:
        return state;
    }
  }, { name: '', description: '', category: '' });

  const { name, description, category } = newTaskState;
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

  const handleAddTask = () => {
    if (!name || !description || !category) {
      alert("Please fill in all fields (Name, Description, and Category) to add a task.");
      return;
    }

    if (editingTaskId !== null) {
      dispatchTasks({
        type: 'UPDATE_TASK',
        payload: { id: editingTaskId, updatedTask: { name, description, category } },
      });
      setEditingTaskId(null);
    } else {
      dispatchTasks({ type: 'ADD_TASK', payload: { name, description, category, id: Date.now() } });
    }

    newTaskDispatch({ type: 'RESET_NEW_TASK' });
  };

  const handleRemoveTask = taskId => {
    dispatchTasks({ type: 'REMOVE_TASK', payload: taskId });
    if (editingTaskId === taskId) {
      setEditingTaskId(null);
      newTaskDispatch({ type: 'RESET_NEW_TASK' });
    }
  };

  const handleEditTask = task => {
    setEditingTaskId(task.id);
    newTaskDispatch({ type: 'SET_NEW_TASK', payload: task });
  };

  const handleAddCategory = newCategory => {
    if (newCategory) {
      dispatchCategories({ type: 'ADD_CATEGORY', payload: { name: newCategory, id: Date.now() } });
    }
  };

  const handleRemoveCategory = categoryId => {
    dispatchCategories({ type: 'REMOVE_CATEGORY', payload: categoryId });
  };

  const handleCategoryChange = e => {
    setSelectedCategory(e.target.value);
  };

  const filteredTasks = selectedCategory === 'All'
    ? tasks
    : tasks.filter(task => task.category === selectedCategory);

  return (
    <div className='container'>
      <div className='createContainer'>
        <h2>Task Creation</h2>
        <div>
          <input
            type="text"
            maxLength={10}
            placeholder="Task Name"
            value={name}
            onChange={e => newTaskDispatch({ type: 'SET_NEW_TASK', payload: { name: e.target.value } })}
          />
          <input
            type="text"
            maxLength={10}
            placeholder="Task Description"
            value={description}
            onChange={e => newTaskDispatch({ type: 'SET_NEW_TASK', payload: { description: e.target.value } })}
          />
          <select
            value={category}
            onChange={e => newTaskDispatch({ type: 'SET_NEW_TASK', payload: { category: e.target.value } })}
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
            <button onClick={() => {
              setEditingTaskId(null);
              newTaskDispatch({ type: 'RESET_NEW_TASK' });
            }}>Cancel Edit</button>
          )}
        </div>
        <div>
          <h2>Category Creation</h2>
          <div>
            <input
              maxLength={10}
              type="text"
              placeholder="New Category"
              onChange={e => newTaskDispatch({ type: 'SET_NEW_TASK', payload: { category: e.target.value } })}
            />
            <br />
            <button onClick={() => handleAddCategory(newTaskState.category)}>Add Category</button>
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
                  <button className='editBtn' onClick={() => handleEditTask(task)}>Edit</button>
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
