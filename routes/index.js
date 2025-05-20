const express = require('express');
const router = express.Router();
const sql = require('../data')

/* ---------------------------- GET: main page with tasks ---------------------------- */
router.get("/", async (req, res) => {
    try {
        const tasks = await sql.getTasks();

        // format task deadline
        for(let task of tasks) {
            task.deadline = formatDate(task.deadline);
        }

        res.render("index", { title: "My Todo List", tasks });
    } catch (error) {
        console.error("Error fetching tasks:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

/* ---------------------------- POST: add a new task ---------------------------- */
router.post("/add", async (req, res) => {
    const { description , deadline} = req.body;
    if (!description || description.trim() === "") { 
        console.log("hit")
        return res.status(400).send("Task description is required");
    }

    try {
        const newTask = await sql.addTask(description.trim(), deadline);
        res.status(200).json(newTask); // Return the task as JSON
    } catch (error) {
        console.error("Error adding task", error.message);
        res.status(500).send("Internal Server Error");
    }
});

/* ---------------------------- POST: toggle a task's done status  ---------------------------- */
router.post("/toggleDone", async (req, res) => {

    // console.log("Received in /toggleDone:", req.body); // Debug incoming data
    const { id, isDone } = req.body;

    if (!id || typeof isDone === 'undefined') {
        return res.status(400).send("Task ID and done status are required");
    }

    try {
        const results = await sql.toggleTaskDone(isDone, id);
        return res.status(200).send(results);
    } catch (error) {
        console.error("Error toggling task:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

/* ---------------------------- POST: delete a task ---------------------------- */
router.delete("/delete", async (req, res) => {

    // console.log("Received in /delete:", req.body); // Debug incoming data
    const { id } = req.body;
    if (!id) {
        return res.status(400).send("Task ID is required");
    }

    try {
        await sql.deleteTask(id);
        res.status(200).send({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

/* ---------------------------- POST: filter task by done or not done ---------------------------- */
router.post("/tasks/done", async (req, res) => {
    try {
        const doneTasks = await sql.getTasksByStatus(true);
        res.status(200).json(doneTasks);
    } catch (error) {
        console.error("error fetching filtered task:", error.message);
        res.status(500).send("Internal Server Error");
    }
}); 

/* ---------------------------- POST: filter task by not done ---------------------------- */
router.post("/tasks/not-done", async (req, res) => {
    try {
        const doneTasks = await sql.getTasksByStatus(false);
        res.status(200).json(doneTasks);
    } catch (error) {
        console.error("error fetching filtered task:", error.message);
        res.status(500).send("Internal Server Error");
    }
}); 

/* ---------------------------- POST: filter all tasks---------------------------- */
router.post("/tasks/all", async (req, res) => {
    try {
        const tasks = await sql.getTasks();
        res.status(200).json(tasks);
    } catch (error) {
        console.error("error fetching filtered task:", error.message);
        res.status(500).send("Internal Server Error");
    }
}); 

/* ---------------------------- POST: filter all tasks---------------------------- */
router.post("/tasks/deadline", async (req, res) => {
    try {
        const sortedTasks = await sql.getSortedTasksByDeadline();
        res.status(200).json(sortedTasks);
    } catch (error) {
        console.error("error fetching sorted deadline task:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

/* ---------------------------- POST: filter all overdue---------------------------- */
router.post("/tasks/overdue", async (req, res) => {
    try {
        const overdueTasks = await sql.getOverdueTasks();
        res.status(200).json(overdueTasks);
    } catch (error) {
        console.error("error fetching overdue task:", error.message);
        res.status(500).send("Internal Server Error");
    }
});


/* ---------------------------- Helper functions ---------------------------- */
function formatDate(date) {
    if (date) {
        const unformattedDate = new Date(date);
        formattedDate = `${unformattedDate.getMonth() + 1}-${unformattedDate.getDate()}`;
        return formattedDate;
    }
    return "";
}


module.exports = router;