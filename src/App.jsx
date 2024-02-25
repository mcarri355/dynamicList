import React, { useReducer, useEffect, useState } from 'react';
import './App.css';

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'REMOVE_TASK':
      return { ...state, tasks: state.tasks.filter(task => task.id !== action.payload) };
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(task =>
        task.id === action.payload.id ? { ...task, ...action.payload.updatedTask } : task
      ) };
    case 'EDIT_TASK':
      return { ...state, editingTaskId: action.payload.editingTaskId, newTaskState: action.payload.newTaskState };
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

  const [tasksState, dispatchTasks] = useReducer(taskReducer, {
    tasks: initialTasks,
    editingTaskId: null,
    newTaskState: { name: '', description: '', category: '' },
  });
  const [categories, dispatchCategories] = useReducer(categoryReducer, initialCategories);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const storedCategories = JSON.parse(localStorage.getItem('categories')) || [];
    dispatchTasks({ type: 'SET_TASKS', payload: storedTasks });
    dispatchCategories({ type: 'SET_CATEGORIES', payload: storedCategories });
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasksState.tasks));
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [tasksState.tasks, categories]);

  const handleEditTask = task => {
    dispatchTasks({
      type: 'EDIT_TASK',
      payload: { editingTaskId: task.id, newTaskState: { name: task.name, description: task.description, category: task.category } },
    });
  };

  const handleAddTask = () => {
    if (!tasksState.newTaskState.name || !tasksState.newTaskState.description || !tasksState.newTaskState.category) {
      alert("Please fill in all fields (Name, Description, and Category) to add a task.");
      return;
    }

    if (tasksState.editingTaskId !== null) {
      dispatchTasks({
        type: 'UPDATE_TASK',
        payload: { id: tasksState.editingTaskId, updatedTask: { ...tasksState.newTaskState } },
      });
      dispatchTasks({ type: 'EDIT_TASK', payload: { editingTaskId: null, newTaskState: { name: '', description: '', category: '' } } });
    } else {
      dispatchTasks({ type: 'ADD_TASK', payload: { ...tasksState.newTaskState, id: Date.now() } });
    }

    dispatchTasks({ type: 'EDIT_TASK', payload: { editingTaskId: null, newTaskState: { name: '', description: '', category: '' } } });
  };

  const handleRemoveTask = taskId => {
    dispatchTasks({ type: 'REMOVE_TASK', payload: taskId });
    if (tasksState.editingTaskId === taskId) {
      dispatchTasks({ type: 'EDIT_TASK', payload: { editingTaskId: null, newTaskState: { name: '', description: '', category: '' } } });
    }
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
    ? tasksState.tasks
    : tasksState.tasks.filter(task => task.category === selectedCategory);

  return (
    <div className='container'>
      <div className='createContainer'>
        <h2>Task Creation</h2>
        <div>
          <input
            type="text"
            maxLength={10}
            placeholder="Task Name"
            value={tasksState.newTaskState.name}
            onChange={e => dispatchTasks({ type: 'EDIT_TASK', payload: { editingTaskId: tasksState.editingTaskId, newTaskState: { ...tasksState.newTaskState, name: e.target.value } } })}
          />
          <input
            type="text"
            maxLength={10}
            placeholder="Task Description"
            value={tasksState.newTaskState.description}
            onChange={e => dispatchTasks({ type: 'EDIT_TASK', payload: { editingTaskId: tasksState.editingTaskId, newTaskState: { ...tasksState.newTaskState, description: e.target.value } } })}
          />
          <select
            value={tasksState.newTaskState.category}
            onChange={e => dispatchTasks({ type: 'EDIT_TASK', payload: { editingTaskId: tasksState.editingTaskId, newTaskState: { ...tasksState.newTaskState, category: e.target.value } } })}
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
            {tasksState.editingTaskId !== null ? 'Update Task' : 'Add Task'}
          </button>
          {tasksState.editingTaskId !== null && (
            <button onClick={() => dispatchTasks({ type: 'EDIT_TASK', payload: { editingTaskId: null, newTaskState: { name: '', description: '', category: '' } } })}>Cancel Edit</button>
          )}
        </div>
        <div>
          <h2>Category Creation</h2>
          <div>
            <input
              maxLength={10}
              type="text"
              placeholder="New Category"
              onChange={e => dispatchTasks({ type: 'EDIT_TASK', payload: { editingTaskId: tasksState.editingTaskId, newTaskState: { ...tasksState.newTaskState, category: e.target.value } } })}
            />
            <br />
            <button onClick={() => handleAddCategory(tasksState.newTaskState.category)}>Add Category</button>
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
