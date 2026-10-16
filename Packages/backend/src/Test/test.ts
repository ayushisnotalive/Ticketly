import { db } from "../DB/db.ts";

async function main() {
  const { rows } = await db.query(
    'SELECT * FROM events WHERE city = $1',
    ['Kolkata']
  );

  console.log(rows);
  await db.end(); 
}
main();