export const contactsToContactPhotos = (contacts, createdPeople) => 
    contacts.map(({ fullName, photoUrl }, i) => {    
        const unstructuredName = createdPeople[i].person.names[0].unstructuredName;
        if (fullName !== unstructuredName) {
            console.dir('mismatch!');
            console.dir(`fullName: ${fullName}`);
            console.dir(`unstructuredName: ${unstructuredName}`);
        }
        return {
            confirmedMatch: fullName == unstructuredName,
            fullName, 
            resourceName: createdPeople[i].requestedResourceName,
            photoUrl
        };
    })
    .filter(({ confirmedMatch, photoUrl }) => confirmedMatch && photoUrl);