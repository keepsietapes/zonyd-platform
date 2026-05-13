const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = 'C:\\Users\\Ocelot\\.n8n\\database.sqlite';
const db = new sqlite3.Database(dbPath);

db.all("SELECT name, nodes, connections FROM workflow_entity", [], (err, rows) => {
  if (err) {
    console.error('Error al leer la base de datos:', err.message);
    process.exit(1);
  }
  if (rows.length === 0) {
    console.log('No se encontraron flujos.');
    process.exit(0);
  }
  rows.forEach((row) => {
    try {
        const workflow = {
            name: row.name,
            nodes: JSON.parse(row.nodes),
            connections: JSON.parse(row.connections)
        };
        const fileName = `workflow_REAL_${row.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        fs.writeFileSync(fileName, JSON.stringify(workflow, null, 2));
        console.log(`✅ Flujo extraído: ${fileName}`);
    } catch (e) {
        console.error(`Error al procesar el flujo ${row.name}:`, e.message);
    }
  });
  db.close();
});
