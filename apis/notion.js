import {Client} from '@notionhq/client';
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// get paginated results
export async function getPeople(start_cursor)  {
    try {
        const response = await notion.databases.query({
            database_id: '06d2fc4af3ed4eab855f4f5b81311cb8',
            page_size: 100,
            start_cursor
        });
        let people = response.results;

        if (response.next_cursor) {
            people = people.concat(await getPeople(response.next_cursor));
        }
        return people;
    } catch (error) {
        return console.error(error);
    }
}

export async function getPerson(page_id) {
    try {
        const person = await notion.pages.retrieve({
            page_id,
        });

        return person;
    } catch (error) {
        return console.error(error);
    }
}