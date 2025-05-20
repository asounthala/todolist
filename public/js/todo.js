document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("add-task-form");
    const taskTextbox = document.getElementById("task-textbox");
    const notDoneButton = document.querySelector(".notDoneButton");
    const doneButton = document.querySelector(".doneButton");

    /* ---------------------------- Adding a task ---------------------------- */

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const taskDescription = taskTextbox.value.trim();
        const deadline = document.querySelector("#deadlinePicker").value;

        if (!taskDescription) {
            alert("Please enter a task description.");
            return;
        }

        try {
            console.log("Adding task: " + taskDescription + deadline); // DEBUGGING
            const response = await fetch("/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description: taskDescription, deadline }),
            });

            if (!response.ok) {
                console.error("Failed to add task");
                return;
            }

            const newTask = await response.json();
            addTaskToDOM(newTask);

            // Clear the textbox after successfully adding 
            taskTextbox.value = "";
        } catch (error) {
            console.error("Error adding task:", error);
        }
    });


    /* ---------------------------- Checkbox for task ---------------------------- */

    document.querySelectorAll(".check-box-button").forEach(checkbox => {
        checkbox.addEventListener("change", async (event) => {
            const taskId = event.target.dataset.id;
            const isDone = event.target.checked;

            try {
                console.log("Sending to /toggleDone:", { id: taskId, isDone: isDone }); // DEBUGGING
                const response = await fetch("/toggleDone", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: taskId, isDone })
                });

                if (response.ok) {
                    const taskDescription = event.target.closest(".task-container").querySelector(".task-description");
                    if (isDone) {
                        taskDescription.classList.add("task-done");
                    } else {
                        taskDescription.classList.remove("task-done");
                    }
                } else {
                    console.error("Failed to update task status");
                    event.target.checked = !isDone; // Revert checkbox state if the request fails
                    alert("Failed to update task status");
                }
            } catch (error) {
                console.error("Error:", error);
            }
        });
    });

    /* ---------------------------- Deleting a task ---------------------------- */

    document.querySelectorAll(".delete-button").forEach(button => {
        button.addEventListener("click", async (event) => {
            const taskId = event.target.closest(".delete-button").dataset.id;

            // Make sure it actually grabs an ID
            if (!taskId) {
                console.error("Task ID is undefined!");
                alert("Crap! Failed to delete task!");
                return;
            }

            try {
                console.log("Sending to /delete:", { id: taskId });
                const response = await fetch("/delete", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: taskId })
                });

                console.log(response);
                if (response.ok) {
                    event.target.closest(".task-container").remove();
                } else {
                    console.error("Failed to delete task");
                    alert("Shoot! Failed to delete task!");
                }
            } catch (error) {
                console.error("Error:", error);
            }
        });
    });


    /* ---------------------------- Filter task by done ---------------------------- */
    document.querySelector(".doneButton").addEventListener("click", async () => {
        try {
            const doneButton = document.querySelector(".doneButton");
            const notDoneButton = document.querySelector(".notDoneButton");

            // Toggle the active filter state
            const isFilteringDone = doneButton.getAttribute("id") === "active-filter";

            if (isFilteringDone) { // Reset to show all tasks
                doneButton.removeAttribute("id");
                notDoneButton.removeAttribute("id");
                await fetchAndRenderTasks("/tasks/all", "POST");
            } else { // Set filter to show only done tasks
                doneButton.setAttribute("id", "active-filter");
                notDoneButton.removeAttribute("id");
                await fetchAndRenderTasks("/tasks/done", "POST");
            }
        } catch (error) {
            console.error("Error handling filter toggle:", error);
        }
    });

    /* ---------------------------- Filter task by not done ---------------------------- */
    document.querySelector(".notDoneButton").addEventListener("click", async () => {
        try {
            const notDoneButton = document.querySelector(".notDoneButton");
            const doneButton = document.querySelector(".doneButton");
            const isFilteringNotDone = notDoneButton.getAttribute("id") === "active-filter";

            if (isFilteringNotDone) { // Reset to show all tasks
                notDoneButton.removeAttribute("id");
                doneButton.removeAttribute("id");
                await fetchAndRenderTasks("/tasks/all", "POST");
            } else { // Filter to show only not-done tasks
                notDoneButton.setAttribute("id", "active-filter");
                doneButton.removeAttribute("id");
                await fetchAndRenderTasks("/tasks/not-done", "POST");
            }
        } catch (error) {
            console.error("Error handling filter toggle:", error);
        }
    });

    /* ---------------------------- Filter task by deadline ---------------------------- */
    document.querySelector(".sortDeadlineButton").addEventListener("click", async () => {
        try {
            notDoneButton.removeAttribute("id");
            doneButton.removeAttribute("id");
            sortDeadlineButton = document.querySelector(".sortDeadlineButton");
            await fetchAndRenderTasks("/tasks/deadline", "POST");
        } catch (error) {
            console.error("Error handling filter toggle:", error);
        }
    });

    /* ---------------------------- Filter task by overdue ---------------------------- */
    document.querySelector(".overdueButton").addEventListener("click", async () => {
        try {
            notDoneButton.removeAttribute("id");
            doneButton.removeAttribute("id");
            overdueButton = document.querySelector(".overdueButton");
            await fetchAndRenderTasks("/tasks/overdue", "POST");
        } catch (error) {
            console.error("Error handling filter toggle:", error);
        }
    });

    /* ---------------------------- Helper functions ---------------------------- */

    // Helper function to add a task to the DOM
    function addTaskToDOM(task) {

        // Select the parent container for tasks
        const taskContainer = document.querySelector(".task-list-container");

        // Create the task element using a basic div structure
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-container");
        taskElement.dataset.id = task.id;

        // Add the checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("check-box-button");
        checkbox.dataset.id = task.id;
        checkbox.checked = task.isDone; 

        // Create a container for task details
        const taskDetails = document.createElement("div");
        taskDetails.classList.add("task-details");

        // Add the task description
        const description = document.createElement("span");
        description.textContent = task.description;
        description.classList.add("task-description");
        if (task.isDone) {
            description.classList.add("task-done");
        }

        // Add the deadline when its available
        const deadline = document.createElement("span");
        if(task.deadline) {
            const formattedDate = formatDate(task.deadline);
            deadline.textContent = `Due: ${formattedDate}`;
            deadline.classList.add("task-deadline");
        } 

        // Append the description and deadline to task details
        taskDetails.appendChild(description);
        taskDetails.appendChild(deadline);

        // Add the delete button
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-button");
        deleteButton.innerHTML = `<img id="trash" src="/images/trash-icon.svg" alt="trash icon" />`;
        deleteButton.dataset.id = task.id;

        // Append the elements to the task element
        taskElement.appendChild(checkbox);
        taskElement.appendChild(taskDetails);
        taskElement.appendChild(deleteButton);

        // Append the task element to the task container
        taskContainer.appendChild(taskElement);

        // Add event listeners
        attachTaskEvents(checkbox, deleteButton, taskElement);
    }


    // Helper function to add event listeners to new tasks
    function attachTaskEvents(checkbox, deleteButton, taskElement) {

        // Event listener for the checkbox
        checkbox.addEventListener("change", async (event) => {
            const taskId = event.target.dataset.id;
            const isDone = event.target.checked;

            try {
                console.log("Sending to /toggleDone:", { id: taskId, isDone: isDone }); // DEBUGGING
                const response = await fetch("/toggleDone", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: taskId, isDone }),
                });

                if (response.ok) {
                    const taskDescription = event.target.closest(".task-container").querySelector(".task-description");
                    if (isDone) {
                        taskDescription.classList.add("task-done");
                    } else {
                        taskDescription.classList.remove("task-done");
                    }
                } else {
                    console.error("Failed to update task status");
                    event.target.checked = !isDone; // Revert checkbox state if the request fails
                    alert("Failed to update task status");
                }
            } catch (error) {
                console.error("Error updating task status:", error);
                event.target.checked = !isDone; // Revert checkbox state on error
            }
        });

        // Event listener for the delete button
        deleteButton.addEventListener("click", async (event) => {
            const taskId = event.target.closest(".delete-button").dataset.id;

            // Make sure it actually grabs an ID
            if (!taskId) {
                console.error("Task ID is undefined!");
                return;
            }

            try {
                const response = await fetch("/delete", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: taskId }),
                });

                if (response.ok) {
                    taskElement.remove();
                } else {
                    console.error("Failed to delete task");
                }
            } catch (error) {
                console.error("Error deleting task:", error);
            }
        });
    }

    // Helper function to render task
    function renderTasks(tasks) {
        const taskContainer = document.querySelector(".task-list-container");
        taskContainer.innerHTML = "";

        tasks.forEach(task => {
            addTaskToDOM(task);
        });
    }


    // Helper function to fetch and render tasks
    async function fetchAndRenderTasks(endpoint, method) {
        try {
            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) {
                console.error(`Failed to fetch tasks from ${endpoint}`);
                return;
            }
            const tasks = await response.json();
            renderTasks(tasks);
        } catch (error) {
            console.error(`Error fetching tasks from ${endpoint}:`, error);
        }
    }

    // Helper function to format date to MM/DD
    function formatDate(date) {
        if (date) {
            const unformattedDate = new Date(date);
            formattedDate = `${unformattedDate.getMonth() + 1}-${unformattedDate.getDate()}`;
            return formattedDate;
        }
        return "";
    }
});