const mysql = require(`mysql-await`); 

var connPool = mysql.createPool({
  connectionLimit: 5, 
  host: "",
  user: "",
  database: "",
  password: "", 
});

/* ---------------------------- Add a new task ---------------------------- */
async function addTask(taskDescription, deadline) {
    const insertQuery = `
        INSERT INTO tasks(description, deadline)
        VALUES (?, ?);
    `;

    const selectQuery = `
        SELECT *
        FROM tasks
        WHERE id = ?;
    `;

    if(!deadline) {
        deadline = null;
    }

    try {
        const result = await connPool.awaitQuery(insertQuery, [taskDescription, deadline]);
        const newTaskId = result.insertId;
        const [newTask] = await connPool.awaitQuery(selectQuery, [newTaskId]);
        return newTask; // Returns the task object
    } catch (error) {
        console.error("Error adding task:", error.message);
        throw error;
    }
}

/* ---------------------------- Get all tasks ---------------------------- */
async function getTasks() {
    const query = `
        SELECT *
        FROM tasks;
    `;

    try {
        return await connPool.awaitQuery(query);
    } catch (error) {
        console.error("Error fetching tasks:", error.message);
        throw error;
    }
}

/* ---------------------------- Mark task as done ---------------------------- */
async function toggleTaskDone(isDone, id) {
    const query = `
    UPDATE tasks
    SET isDone = ?
    WHERE id = ?;
    `;

    try {
        const result = await connPool.awaitQuery(query, [isDone, id]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error toggling task status:", error.message);
        throw error;
    }
}

/* ---------------------------- Delete a task ---------------------------- */
async function deleteTask(id) {
    const query = `
    DELETE FROM tasks
    WHERE id = ?;
    `;

    try {
        const result = await connPool.awaitQuery(query, [id]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error deleting task:", error.message);
        throw error;
    }
}

/* ------------------------ Filter tasks by 'done' or 'not done' ---------------------------- */

async function getTasksByStatus(isDone) {
    const query = `
    SELECT *
    FROM tasks
    WHERE isDone = ?;
    `;

    try {
        return await connPool.awaitQuery(query, [isDone]);
    } catch (error) {
        console.log("Error fetching tasks by status:", error.message);
        throw error;
    }
}

/* ------------------------ Sort task by deadline ---------------------------- */

async function getSortedTasksByDeadline() {
    const query = `
        SELECT * 
        FROM tasks
        ORDER BY deadline ASC;
    `;

    try {
        return await connPool.awaitQuery(query);
    } catch (error) {
        console.log("Error fetching tasks by deadline:", error.message);
        throw error;
    }
}

/* ------------------------ Sort task by deadline ---------------------------- */

async function getOverdueTasks() {
    const query = `
        SELECT *
        FROM tasks
        WHERE deadline < ?
        AND isDone = false;
    `;

    const today = new Date();
    try {
        return await connPool.awaitQuery(query, [today]);
    } catch (error) {
        console.log("Error fetching tasks by overdue:", error.message);
        throw error;
    }
}


/* ---------------------------- Exports ---------------------------- */
module.exports = {
    addTask,
    getTasks,
    toggleTaskDone,
    deleteTask,
    getTasksByStatus,
    getSortedTasksByDeadline,
    getOverdueTasks
};