const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(":memory:");

// Funzione per creare le tabelle
function createTables() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE employees (
        id INTEGER PRIMARY KEY,
        firstname TEXT,
        lastname TEXT,
        date_of_birth DATE,
        address TEXT
      )
    `);

    db.run(`
      CREATE TABLE employee_contacts (
        id INTEGER PRIMARY KEY,
        employee_id INTEGER,
        kind TEXT CHECK (kind IN ('email', 'phone')),
        contact TEXT,
        FOREIGN KEY(employee_id) REFERENCES employees(id)
      )
    `);

    db.run(`
      CREATE TABLE activities (
        id INTEGER PRIMARY KEY,
        code TEXT,
        activity_kind TEXT,
        notes TEXT
      )
    `);

    db.run(`
      CREATE TABLE activity_employees (
        id INTEGER PRIMARY KEY,
        activity_id INTEGER,
        employee_id INTEGER,
        FOREIGN KEY(activity_id) REFERENCES activities(id),
        FOREIGN KEY(employee_id) REFERENCES employees(id)
      )
    `);
    //es 5
    db.run(`
    ALTER TABLE activity_employees
     ADD COLUMN completed BOOLEAN DEFAULT 0
    `);

    db.run(`
      CREATE TABLE duties (
        id INTEGER PRIMARY KEY,
        code TEXT,
        description TEXT
      )
    `);
    //ex 1:
    db.run(`
      CREATE TABLE employee_duties (
        id INTEGER PRIMARY KEY,
        employee_id INTEGER,
        duty_id INTEGER,
        FOREIGN KEY(employee_id) REFERENCES employees(id),
        FOREIGN KEY(duty_id) REFERENCES duties(id)
      )
    `);
    //es 3:
    db.run(`
      CREATE TABLE employee_contacts_view (
        employee_id INTEGER,
    employee_lastname TEXT,
    kind TEXT,
    contact TEXT,
    FOREIGN KEY(employee_id) REFERENCES employees(id)
      )
    `);
  });
}

// Funzione per inserire dati fittizi
function insertDatiFintiData() {
  db.serialize(() => {
    db.run(
      `INSERT INTO employees (firstname, lastname, date_of_birth, address) VALUES ('Mario', 'Rossi', '1980-01-01', 'Via Roma 123')`
    );
    db.run(
      `INSERT INTO employees (firstname, lastname, date_of_birth, address) VALUES ('vlad', 'topchin', '2003-07-04', 'Via Roma 123')`
    );

    db.run(
      `INSERT INTO employee_contacts (employee_id, kind, contact) VALUES (1, 'email', 'mario.rossi@example.com')`
    );
    db.run(
      `INSERT INTO employee_contacts (employee_id, kind, contact) VALUES (2, 'email', 'vlad.topchin@example.com')`
    );

    db.run(
      `INSERT INTO employees (firstname, lastname, date_of_birth, address) VALUES ('John', 'Doe', '1975-05-20', '123 Main St')`
    );

    db.run(
      `INSERT INTO employee_contacts (employee_id, kind, contact) VALUES (3, 'email', 'john.doe@example.com')`
    );
  });
}

createTables();
insertDatiFintiData();
//es 2:
function getCognomiDipendenti() {
  db.all(
    `
      SELECT DISTINCT e.lastname
      FROM employees e
      INNER JOIN employee_contacts ec ON e.id = ec.employee_id
      WHERE ec.kind = 'email'
      AND ec.contact LIKE '%' || e.firstname || '.' || e.lastname || '@%'
      `,
    (err, rows) => {
      if (err) {
        console.error("Errore durante l'esecuzione della query:", err);
      } else {
        if (rows.length > 0) {
          console.log(
            "Elenco dei cognomi dei dipendenti con contatti email corretti:"
          );
          rows.forEach((row) => {
            console.log(row.lastname);
          });
        } else {
          console.log("Nessun dipendente trovato con i criteri specificati.");
        }
      }
    }
  );
}

getCognomiDipendenti();
