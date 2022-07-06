import fs from 'fs';
import readline from 'readline';
import {google} from 'googleapis';
import axios from 'axios';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/contacts'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
export function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}


export const getAllResourceNames = () => new Promise((resolve, reject) => {
  const credentials = JSON.parse(fs.readFileSync('credentials.json'));
  authorize(credentials, (auth) => {
      const service = google.people({version: 'v1', auth});
      service.people.connections.list({
          resourceName: 'people/me',
          pageSize: 600,
          personFields: 'names',
      }, (err, res) => {
          if (err) {
              reject('The API returned an error: ' + err);
          }
          const connections = res.data.connections;
          if (connections) { 
              const resourceNames = connections.map((c) => c.resourceName);
              resolve(resourceNames);
          } else {
              reject('no connections found.');
          }
      }); 
  });
});

export const deleteContacts = (resourceNames) => new Promise((resolve, reject) => {
    const credentials = JSON.parse(fs.readFileSync('credentials.json'));
    authorize(credentials, (auth) => {
        const service = google.people({version: 'v1', auth});
        service.people.batchDeleteContacts({
          requestBody: {
            resourceNames
          }
        }, (err) => {
          if (err) {
              reject('The API returned an error: ' + err);
          }
          resolve(null);
        })
    });
});

export const createContacts = (person) => new Promise((resolve, reject) => {
  const credentials = JSON.parse(fs.readFileSync('credentials.json'));
  authorize(credentials, (auth) => {
      const service = google.people({version: 'v1', auth});
      service.people.batchCreateContacts({
        requestBody: {
          contacts: [{
            contactPerson: {
              names: [{
                "familyName": person.lastName,
                "givenName": person.firstName,
                "unstructuredName": person.fullName
              }],
              phoneNumbers: [{
                type: 'main',
                value: person.mobileNumber
              }],
              emailAddresses: [{
                type: 'home',
                value: person.email
              }],
              organizations: [{
                type: 'work',
                current: true,
                name: person.company,
                department: person.department,
                title: person.jobTitle
              }],
              addresses: [{
                type: 'home',
                streetAddress: person.address1,
                extendedAddress: person.address2,
                city: person.city,
                region: person.state,
                postalCode: person.zipcode
              }],
              urls: [{
                type: 'home',
                value: person.website
              }]
            }
          }],
          readMask: 'names'
        },
      }, 
      async (err, res) => {
        if (err) {
          console.dir(err);
          reject('The API returned an error: ' + err);
        }
        const resourceName = res.data.createdPeople[0].requestedResourceName;

        if (person.photoUrl) {
          const service = google.people({version: 'v1', auth});
          const response = await axios.get(person.photoUrl, { responseType: 'arraybuffer' });
          const photoBytes = Buffer.from(response.data, 'binary').toString('base64');

          await service.people.updateContactPhoto({
            resourceName,
            requestBody: {
              photoBytes
            }
          })
        }
        resolve(res);
    })
  });
});