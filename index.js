import 'dotenv/config';
import { createContacts, getPeople } from './apis/index.js';
import { peopleToContacts } from './utils/index.js';

/**
 * get all people from notion
 */
console.log(`querying notion`);
console.log(`...`)
const people = await getPeople();
console.log(`found ${people.length} people in notion`);
const contacts = peopleToContacts(people);

/**
 * save all people to google contacts
 */
console.log(`creating google contacts using people from notion`);
console.log(`...`);
// await createContacts(contacts.slice(0, 200));
// await createContacts(contacts.slice(200));
await createContacts(contacts);
console.log(`done`);
