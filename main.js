const task_input = document.querySelector("input");
const date_input = document.querySelector(".schedule-date"); // added date input
const add_btn = document.querySelector(".add-task-button");
const todos_list_body = document.querySelector(".todos-list-body");
const alert_message = document.querySelector(".alert-message");
const delete_all_btn = document.querySelector(".delete-all-btn");
const priority_input = document.querySelector(".priority-input");
let usedPriorities = [];

let todos = JSON.parse(localStorage.getItem("todos")) || [];

window.addEventListener("DOMContentLoaded", () => {
  showAllTodos();
  if (!todos.length) {
    displayTodos([]);
  }
});

//get random unique id
function getRandomId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
function updatePriorityDropdown() {
  const priorityOptions = priority_input.querySelectorAll("option");

  // Iterate through each option and check if its value is in the usedPriorities array
  for (const option of priorityOptions) {
    if (usedPriorities.includes(option.value)) {
      option.disabled = true; // Disable the option if it's in usedPriorities
    } else {
      option.disabled = false; // Enable the option if it's not in usedPriorities
    }
  }
}

function addToDo(task_input, date_input, priority_input) {
  const currentDate = new Date().toISOString().split("T")[0]; // Get current date

  // Set the min attribute of the date input to the current date
  date_input.setAttribute("min", currentDate);

  // Check if the task text is empty
  if (task_input.value.trim() === "") {
    showAlertMessage("Please enter a task", "error");
    return; // Exit the function if task text is empty
  }

  const taskPriority = priority_input.value;

  if (usedPriorities.includes(taskPriority)) {
    showAlertMessage("Priority already used. Please choose a different priority.", "error");
    return; // Exit the function if the priority is not unique
  }

  // Check if the due date is in the past
  if (date_input.value < currentDate) {
    showAlertMessage("Due date cannot be in the past", "error");
    return; // Exit the function if the due date is in the past
  }

  // Check if the same priority already exists in the todos array
  const isPriorityUnique = !todos.some((todo) => todo.priority === taskPriority);

  if (!isPriorityUnique) {
    showAlertMessage("Priority already exists. Please choose a different priority.", "error");
    return; // Exit the function if the priority is not unique
  }

  // Add the used priority to the list
  usedPriorities.push(taskPriority);

  let task = {
    id: getRandomId(),
    task: task_input.value.trim(), // Trim whitespace from task text
    dueDate: date_input.value,
    priority: taskPriority, // Get the priority value
    completed: false,
    status: "pending",
  };

  todos.push(task);

  saveToLocalStorage();
  showAllTodos();

  task_input.value = "";
  date_input.value = "";
  priority_input.value = ""; // Clear the priority input field
  showAlertMessage("Task added successfully", "success");
}





task_input.addEventListener("keyup", (e) => {
  if (e.keyCode === 13 && task_input.value.length > 0) {
    addToDo(task_input, date_input); // Added date input
    saveToLocalStorage();
    task_input.value = "";
    showAllTodos();
  }
});

add_btn.addEventListener("click", () => {
  if (task_input.value === "") {
    showAlertMessage("Please enter a task", "error");
  } else {
    addToDo(task_input, date_input, priority_input); // Include priority input
    saveToLocalStorage();
    showAllTodos();
    task_input.value = "";
    date_input.value = "";
    priority_input.value = ""; // Clear the priority input field
    showAlertMessage("Task added successfully", "success");
  }
});

delete_all_btn.addEventListener("click", clearAllTodos);

//show all todos
function showAllTodos() {
  todos_list_body.innerHTML = "";
  if (todos.length === 0) {
    todos_list_body.innerHTML = `<tr><td colspan="6" class="text-center">No task found</td></tr>`;
    return;
  }

  // Sort tasks by priority (ascending)
  todos.sort((a, b) => a.priority - b.priority);
  

  todos.forEach((todo) => {
    todos_list_body.innerHTML += `
            <tr class="todo-item" data-id="${todo.id}">
                <td>${todo.task}</td>
                <td>${todo.dueDate || "No due date"}</td>
                <td>${todo.priority}</td>
                <td>${todo.status}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editTodo('${
                      todo.id
                    }')">
                        <i class="bx bx-edit-alt bx-bx-xs"></i>    
                    </button>
                    <button class="btn btn-success btn-sm" onclick="toggleStatus('${
                      todo.id
                    }')">
                        <i class="bx bx-check bx-xs"></i>
                    </button>
                    <button class="btn btn-error btn-sm" onclick="deleteTodo('${
                      todo.id
                    }')">
                        <i class="bx bx-trash bx-xs"></i>
                    </button>
                </td>
            </tr>
        `;
  });
  
}

//save todos to local storage
function saveToLocalStorage() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

//show alert message
function showAlertMessage(message, type) {
  let alert_box = `
        <div class="alert alert-${type} shadow-lg mb-5 w-full">
            <div>
                <span>
                    ${message}
                </span>
            </div>
        </div>
    `;
  alert_message.innerHTML = alert_box;
  alert_message.classList.remove("hide");
  alert_message.classList.add("show");
  setTimeout(() => {
    alert_message.classList.remove("show");
    alert_message.classList.add("hide");
  }, 3000);
}

//delete todo
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveToLocalStorage();
  showAlertMessage("Todo deleted successfully", "success");
  showAllTodos();
}

//edit todo
function editTodo(id) {
  let todo = todos.find((todo) => todo.id === id);
  task_input.value = todo.task;
  todos = todos.filter((todo) => todo.id !== id);
  add_btn.innerHTML = "<i class='bx bx-check bx-sm'></i>";
  saveToLocalStorage();
  add_btn.addEventListener("click", () => {
    add_btn.innerHTML = "<i class='bx bx-plus bx-sm'></i>";
    showAlertMessage("Todo updated successfully", "success");
  });
}

//clear all todos
function clearAllTodos() {
  if (todos.length > 0) {
    todos = [];
    saveToLocalStorage();
    showAlertMessage("All todos cleared successfully", "success");
    showAllTodos();
  } else {
    showAlertMessage("No todos to clear", "error");
  }
}
function toggleStatus(id) {
  let todo = todos.find((todo) => todo.id === id);
  todo.completed = !todo.completed;

  // Update the status based on completion
  if (todo.completed) {
    todo.status = "completed";
  } else {
    todo.status = "pending";
  }

  saveToLocalStorage();
  showAllTodos();
}


function filterTodos(status) {
  let filteredTodos;
  switch (status) {
    case "all":
      filteredTodos = todos;
      break;
    case "pending":
      filteredTodos = todos.filter((todo) => !todo.completed);
      break;
    case "completed":
      filteredTodos = todos.filter((todo) => todo.completed);
      break;
  }
  displayTodos(filteredTodos);
}

function displayTodos(todosArray) {
  todos_list_body.innerHTML = "";
  if (todosArray.length === 0) {
    todos_list_body.innerHTML = `<tr><td colspan="5" class="text-center">No task found</td></tr>`;
    return;
  }
  todosArray.forEach((todo) => {
    todos_list_body.innerHTML += `
            <tr class="todo-item" data-id="${todo.id}">
                <td>${todo.task}</td>
                <td>${todo.dueDate || "No due date"}</td>
                <td>${todo.priority}</td>
                <td>${todo.status}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editTodo('${
                      todo.id
                    }')">
                        <i class="bx bx-edit-alt bx-bx-xs"></i>    
                    </button>
                    <button class="btn btn-success btn-sm" onclick="toggleStatus('${
                      todo.id
                    }')">
                        <i class="bx bx-check bx-xs"></i>
                    </button>
                    <button class="btn btn-error btn-sm" onclick="deleteTodo('${
                      todo.id
                    }')">
                        <i class="bx bx-trash bx-xs"></i>
                    </button>
                </td>
            </tr>
    `;
  });
}
