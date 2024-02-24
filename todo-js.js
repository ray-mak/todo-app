const taskContainer = document.getElementsByClassName("task-container");
const darkModeBtn = document.getElementById("darkmode-container");
const circle = document.getElementsByClassName("circle");
const deleteTaskBtn = document.getElementsByClassName("cross-icon");
const todoContainer = document.querySelector(".todo-container");
const allFilter = document.getElementById("all");
const activeFilter = document.getElementById("active");
const completedFilter = document.getElementById("completed");
const filter = document.getElementsByClassName("filter");
const input = document.getElementById("input");
const clearCompletedBtn = document.getElementById("clear");

//save tasks to localstorage
let taskData = JSON.parse(localStorage.getItem("data"));
if (!Array.isArray(taskData)) {
    taskData = [];
}
//add new task
const addTask = () => {
    const taskObj = {
        completed: false,
        id: Date.now(),
        title: input.value,
    };
    taskData.push(taskObj);
    localStorage.setItem("data", JSON.stringify(taskData));
    todoContainer.innerHTML += `
        <div id="${taskObj.id}" class="task-container" draggable="true">
            <div class="circle-div">
                <div class="circle"></div>
            </div>
            <p class="task">${taskObj.title}</p>
            <img class="cross-icon" src="images/icon-cross.svg" alt="icon of an X, click to remove task"/>
        </div>`; 
}

const updateTaskContainer = () => {
    taskData.forEach(
        ({completed, id, title}) => {
            const isCompleted = completed ? "completed" : "";
            todoContainer.innerHTML += `
            <div id="${id}" class="task-container ${isCompleted}" draggable="true">
                <div class="circle-div">
                    <div class="circle"></div>
                </div>
                <p class="task">${title}</p>
                <img class="cross-icon" src="images/icon-cross.svg" alt="icon of an X, click to remove task"/>
            </div>`
    })
}

if (taskData.length) {
    updateTaskContainer();
    console.log(taskData)
}

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        addTask();
        input.value = "";
        showAll();
    }
})

//clear completed tasks
const clearCompleted = () => {
    for (let i = 0; i < taskContainer.length; i++) {
        if (taskContainer[i].classList.contains("completed")) {
            const taskId = Number(taskContainer[i].id);
            const taskIndex = taskData.findIndex((item) => item.id === taskId);
            taskData.splice(taskIndex, 1);
            localStorage.setItem("data", JSON.stringify(taskData));
            taskContainer[i].remove();
            i--;
        }
    }
}

clearCompletedBtn.addEventListener("click", clearCompleted)
//drag and drop
const draggables = document.querySelectorAll(".task-container");

todoContainer.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("task-container")){
        e.target.classList.add("dragging")
    }
})

todoContainer.addEventListener("dragend", (e) => {
    if (e.target.classList.contains("task-container")) {
        e.target.classList.remove("dragging")
    }
})

todoContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragPosition(todoContainer, e.clientY);         //parameters, current container and Y position of mouse on screen
    const draggable = document.querySelector(".dragging");
    if (afterElement == null) {
        todoContainer.appendChild(draggable);
    } else {
        todoContainer.insertBefore(draggable, afterElement)
    }  
})

            //used to determine mouse position when dragging element. Will return which element is after the element we're dragging
            //reduce explained. First parameter is the function, second parameter is the starting point
            //callback function takes a couple of parameters, what we are accumulating(accumulator, what we're reducing down to), and each individual item
            //second parameter of reduce is the "default" value passed into the accumulator
function getDragPosition(container, y) {        
    const draggableElements = [...container.querySelectorAll(".task-container:not(.dragging)")];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }
        } else {
            return closest
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element          
}

//apply all, active, or completed filters
activeFilter.addEventListener("click", () => {
    allFilter.classList.remove("selected");
    completedFilter.classList.remove("selected");
    activeFilter.classList.add("selected");
    for (let i = 0; i < taskContainer.length; i++) {
        if (taskContainer[i].classList.contains("completed")) {
            taskContainer[i].classList.add("hide");
        } else {
            taskContainer[i].classList.remove("hide");
        }
    }
})

completedFilter.addEventListener("click", () => {
    activeFilter.classList.remove("selected");
    allFilter.classList.remove("selected");
    completedFilter.classList.add("selected");
    for (let i = 0; i < taskContainer.length; i++) {
        if (taskContainer[i].classList.contains("completed")) {
            taskContainer[i].classList.remove("hide");
        } else {
            taskContainer[i].classList.add("hide");
        }
    }
})

const showAll = () => {
    activeFilter.classList.remove("selected");
    completedFilter.classList.remove("selected");
    allFilter.classList.add("selected");
    for (let i = 0; i < taskContainer.length; i++){
        taskContainer[i].classList.remove("hide")
    }
}


allFilter.addEventListener("click", showAll);

//Delete tasts and show message when all tasks are cleared
todoContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("cross-icon")) {
        const taskId = Number(e.target.closest(".task-container").id);
        const taskIndex = taskData.findIndex((item) => item.id === taskId);
        if (taskIndex !== -1) {
            taskData.splice(taskIndex, 1);
            localStorage.setItem("data", JSON.stringify(taskData));
        }
        e.target.closest(".task-container").remove();
    };
    if (taskContainer.length == 0) {
        todoContainer.innerHTML = `
        <p class="empty">No upcoming tasks.</p>`
    }
})

//Mark tasks completed. Also show cross icon when hovering over task
todoContainer.addEventListener("mouseover", (e) => {
    if (e.target.closest(".task-container")) {
        e.target.closest(".task-container").querySelector(".cross-icon").style.display = "block";
    }
})

todoContainer.addEventListener("mouseout", (e) => {
    if (e.target.closest(".task-container")) {
        e.target.closest(".task-container").querySelector(".cross-icon").style.display = "none";
    }
})

todoContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("circle")) {
        e.target.closest(".task-container").classList.toggle("completed");
        const taskId = Number(e.target.closest(".task-container").id);
        const taskIndex = taskData.findIndex((item) => item.id === taskId);
        if (taskIndex !== -1) {
            taskData[taskIndex].completed = !taskData[taskIndex].completed;
            localStorage.setItem("data", JSON.stringify(taskData));
        }
    }
})

//toggle darkmode and save darkmode preference
let darkMode = localStorage.getItem("darkMode");

const enableDarkMode = () => {
    document.body.classList.add("darkmode");
    localStorage.setItem("darkMode", "enabled");
}

const disableDarkMode = () => {
    document.body.classList.remove("darkmode");
    localStorage.setItem("darkMode", "disabled");
}

if (darkMode === "enabled") {
    enableDarkMode();
}

darkModeBtn.addEventListener("click", () => {
    darkMode = localStorage.getItem("darkMode");
    if (darkMode !== "enabled") {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
})


