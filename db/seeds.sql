USE employees_DB;

INSERT INTO department (name)
VALUES ("Sales");
INSERT INTO department (name)
VALUES ("Engineering");
INSERT INTO department (name)
VALUES ("Finance");
INSERT INTO department (name)
VALUES ("Legal");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", 100000, 1);
INSERT INTO role (title, salary, department_id)
VALUES ("Engineer", 125000, 2);
INSERT INTO role (title, salary, department_id)
VALUES ("Engineer", 115000, 2);
INSERT INTO role (title, salary, department_id)
VALUES ("Accountant", 130000, 3);
INSERT INTO role (title, salary, department_id)
VALUES ("Legal Team", 145000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Jack", "Loveday", 2, 3);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("James", "Loveday", 1, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Emily", "Ricker", 3, null);
