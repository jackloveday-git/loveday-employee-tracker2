// server.js by Jack Loveday

// Import dependencies
const mysql = require("mysql2");
const inquirer = require("inquirer");
require("console.table");
require("dotenv").config();

// Setup .env
const secure = process.env;


// Setup SQL Connection
const connection = mysql.createConnection({
    host: secure.DB_HOST,
    user: secure.DB_USER,
    password: secure.DB_PASS,
    database: "employees_DB"
});

// Run Connection then run our app
connection.connect((err) => {
    if (err) throw err;
    console.log(`
    ---------------------------
    Welcome to Employee Manager
    ---------------------------
    `)

    // Run initial inquirer
    initialPrompt();
});

// First prompt for the user
function initialPrompt() {

    // Use of inquirer
    inquirer
        .prompt({
            type: "list",
            name: "task",
            message: "Select an option: ",
            choices: [
                "View Employees",
                "View Employees by Department",
                "Add Employee",
                "Remove Employees",
                "Update Employee Role",
                "Add Role",
                "End"]
        })
        .then(function ({ task }) {
            switch (task) {
                // View Employees option
                case "View Employees":
                    allEmployees();
                    break;

                // View Employees by Department option
                case "View Employees by Department":
                    employeeDepartment();
                    break;

                // Add Employee option
                case "Add Employee":
                    addEmployee();
                    break;

                // Remove Employees option
                case "Remove Employees":
                    deleteEmployee();
                    break;

                // Update Employees option
                case "Update Employee Role":
                    updateEmployeeRole();
                    break;

                // Add role option
                case "Add Role":
                    addRole();
                    break;

                // End option
                case "End":
                    connection.end();
                    break;
            }
        });
}

// View Employees by Department Function
function employeeDepartment() {
    console.log("Viewing employees by department\n");

    // Enter SQL Query
    var query =
        `
        SELECT d.id, d.name, r.salary AS budget
        FROM employee e
        LEFT JOIN role r
	    ON e.role_id = r.id
        LEFT JOIN department d
        ON d.id = r.department_id
        GROUP BY d.id, d.name
        `

    // Send Query to our SQL
    connection.query(query, (err, res) => {
        if (err) throw err;
        const depts = res.map(data => ({
            value: data.id, name: data.name
        }));
        console.table(res);
        console.log("Department view succeed!\n");
        departmentInput(depts);
    });
}

// View all Employees
function allEmployees() {
    console.log("Viewing employees\n");

    // Enter SQL Query
    var query =
        `
        SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM employee e
        LEFT JOIN role r
	    ON e.role_id = r.id
        LEFT JOIN department d
        ON d.id = r.department_id
        LEFT JOIN employee m
	    ON m.id = e.manager_id
        `

    // Send Query to our SQL
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.table(res);
        console.log("Employees viewed!\n");
        initialPrompt();
    });

}

// Add a new Employee
function addEmployee() {
    console.log("Inserting an employee!")

    // Enter SQL Query
    var query =
        `
        SELECT r.id, r.title, r.salary 
        FROM role r
        `

    // Send Query to our SQL
    connection.query(query, function (err, res) {
        if (err) throw err;
        const roleInput = res.map(({ id, title, salary }) => ({
            value: id, title: `${title}`, salary: `${salary}`
        }));

        console.table(res);
        inputInsert(roleInput);
    });
}

// User input for Department
function departmentInput(depts) {
    inquirer
        .prompt([
            {
                type: "list",
                name: "departmentId",
                message: "Which department would you choose?",
                choices: depts
            }
        ])
        .then((answer) => {
            console.log("answer ", answer.departmentId);
            var query =
                `
                SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department 
                FROM employee e
                JOIN role r
	            ON e.role_id = r.id
                JOIN department d
                ON d.id = r.department_id
                WHERE d.id = ?
                `

            connection.query(query, answer.departmentId, function (err, res) {
                if (err) throw err;
                console.table("response ", res);
                console.log(res.affectedRows + "Employees are viewed!\n");
                initialPrompt();
            });
        });
}

function inputInsert(roleInput) {

    // Inquirer prompt
    inquirer
        .prompt([
            {
                type: "input",
                name: "first_name",
                message: "What is the employee's first name?"
            },
            {
                type: "input",
                name: "last_name",
                message: "What is the employee's last name?"
            },
            {
                type: "list",
                name: "roleId",
                message: "What is the employee's role?",
                choices: roleInput
            },
        ])

        // Then insert the data
        .then((answer) => {
            console.log(answer);
            var query = `INSERT INTO employee SET ?`
            connection.query(query,
                {
                    first_name: answer.first_name,
                    last_name: answer.last_name,
                    role_id: answer.roleId,
                    manager_id: answer.managerId,
                },

                // Check for any errors
                function (err, res) {
                    if (err) throw err;
                    console.table(res);
                    console.log(res.insertedRows + "Inserted successfully!\n");
                    initialPrompt();
                });
        });
}

// Delete Employee
function deleteEmployee() {
    console.log("Deleting an employee");
    var query =
        `SELECT e.id, e.first_name, e.last_name
      FROM employee e`

    // Get query for employee
    connection.query(query, function (err, res) {
        if (err) throw err;
        const selectedDelete = res.map(({ id, first_name, last_name }) => ({
            value: id, name: `${id} ${first_name} ${last_name}`
        }));
        console.table(res);
        promptDelete(selectedDelete);
    });
}

function promptDelete(selectedDelete) {

    // Delete prompt
    inquirer
        .prompt([
            {
                type: "list",
                name: "employeeId",
                message: "Which employee do you want to remove?",
                choices: selectedDelete
            }
        ])
        .then(function (answer) {
            var query = `DELETE FROM employee WHERE ?`;
            connection.query(query, { id: answer.employeeId }, function (err, res) {
                if (err) throw err;
                console.table(res);
                console.log(res.affectedRows + "Deleted!\n");
                initialPrompt();
            });
        });
}

// Update Employee Role
function updateEmployeeRole() {
    employeeList();
}

// Employee list function
function employeeList() {
    console.log("Updating an employee");

    var query =
        `
        SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM employee e
        JOIN role r
	    ON e.role_id = r.id
        JOIN department d
        ON d.id = r.department_id
        JOIN employee m
	    ON m.id = e.manager_id
        `

    connection.query(query, function (err, res) {
        if (err) throw err;
        const employeeChoices = res.map(({ id, first_name, last_name }) => ({
            value: id, name: `${first_name} ${last_name}`
        }));
        console.table(res);
        console.log("employeeList To Update!\n")
        roleArray(employeeChoices);
    });
}

// Role array
function roleArray(employeeChoices) {
    console.log("Updating an role");
    var query =
        `
        SELECT r.id, r.title, r.salary 
        FROM role r
        `

    let roleInput;
    connection.query(query, function (err, res) {
        if (err) throw err;
        roleInput = res.map(({ id, title, salary }) => ({
            value: id, title: `${title}`, salary: `${salary}`
        }));
        console.table(res);
        console.log("roleArray to Update!\n")
        promptEmployeeRole(employeeChoices, roleInput);
    });
}

// Prompt user for employee role
function promptEmployeeRole(employeeChoices, roleInput) {
    inquirer
        .prompt([
            {
                type: "list",
                name: "employeeId",
                message: "Which employee do you want to set with the role?",
                choices: employeeChoices
            },
            {
                type: "list",
                name: "roleId",
                message: "Which role do you want to update?",
                choices: roleInput
            },
        ])
        .then(function (answer) {
            var query = `UPDATE employee SET role_id = ? WHERE id = ?`
            connection.query(query,
                [answer.roleId,
                answer.employeeId
                ],
                function (err, res) {
                    if (err) throw err;
                    console.table(res);
                    console.log(res.affectedRows + "Updated successfully!");
                    initialPrompt();
                });
        });
}

// Add new role prompt
function promptAddRole(depts) {
    inquirer
        .prompt([
            {
                type: "input",
                name: "roleTitle",
                message: "Role title?"
            },
            {
                type: "input",
                name: "roleSalary",
                message: "Role Salary"
            },
            {
                type: "list",
                name: "departmentId",
                message: "Department?",
                choices: depts
            },
        ])
        .then(function (answer) {
            var query = `INSERT INTO role SET ?`
            connection.query(query, {
                title: answer.title,
                salary: answer.salary,
                department_id: answer.departmentId
            },
                function (err, res) {
                    if (err) throw err;

                    console.table(res);
                    console.log("Role Inserted!");

                    initialPrompt();
                });

        });
}

// Add a Role
function addRole() {
    var query =
        `
        SELECT d.id, d.name, r.salary AS budget
        FROM employee e
        JOIN role r
        ON e.role_id = r.id
        JOIN department d
        ON d.id = r.department_id
        GROUP BY d.id, d.name
        `

    connection.query(query, function (err, res) {
        if (err) throw err;
        const depts = res.map(({ id, name }) => ({
            value: id, name: `${id} ${name}`
        }));
        console.table(res);
        console.log("Department array!");
        promptAddRole(depts);
    });
}