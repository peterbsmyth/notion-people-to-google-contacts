import 'dotenv/config';
import fs from 'fs';
import {Client} from '@notionhq/client';
import { createContacts, deleteContacts, getAllResourceNames } from './google.js';
const notion = new Client({ auth: process.env.NOTION_API_KEY });

Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});
/**
 * get all people from notion
 */
// get paginated results
// const response = await notion.databases.query({
//     database_id: '06d2fc4af3ed4eab855f4f5b81311cb8',
//     page_size: 1000
// })
// console.log(response.results[0])
// console.log(Object.keys(response.results[0]));


// const person = response.results[0].properties;
const response = await notion.pages.retrieve({
    page_id: '9199f0d2e7ec43eba33bd8b4cb6f5f8c',
});

const person = response.properties;


const contact = {
    firstName: person['first name'].rich_text?.[0]?.plain_text.capitalize() ?? undefined,
    lastName: person['last name'].rich_text?.[0]?.plain_text.capitalize() ?? undefined,
    mobileNumber: person['mobile number']['phone_number'] ?? undefined,
    email: person['e-mail'].email ?? undefined,
    company: person['company'].rich_text?.[0]?.plain_text ?? undefined,
    department: person['department'].rich_text?.[0]?.plain_text ?? undefined,
    jobTitle: person['job title'].rich_text?.[0]?.plain_text ?? undefined,
    address1: person['address 1'].rich_text?.[0]?.plain_text ?? undefined,
    address2: person['address 2'].rich_text?.[0]?.plain_text ?? undefined,
    city: person['city'].rich_text?.[0]?.plain_text.capitalize() ?? undefined,
    state: person['state'].rich_text?.[0]?.plain_text.toUpperCase() ?? undefined,
    zipcode: person['zipcode'].rich_text?.[0]?.plain_text ?? undefined,
    website: person['website']?.url ?? null,
    photoUrl: response.icon?.file?.url ?? undefined
}
/**
 * delete all google contacts
 */
// get all contact resource names
// const resourceNames = await getAllResourceNames();

// delete all contacts
// await deleteContacts(resourceNames);

// save all people to google contacts
await createContacts(contact);