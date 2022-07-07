Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});

Object.defineProperty(String.prototype, 'capitalizeAll', {
    value: function() {
        return this.toLowerCase()
            .split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');
    },
    enumerable: false
});



export const peopleToContacts = (people) => people.map(({ properties, icon }) => ({
    fullName: properties['full name'].title?.[0].plain_text.capitalizeAll() ?? undefined,
    contactPerson: {
        names: [{
            "familyName": properties['last name'].rich_text?.[0]?.plain_text.capitalize() ?? undefined,
            "givenName": properties['first name'].rich_text?.[0]?.plain_text.capitalize() ?? undefined,
            "unstructuredName": properties['full name'].title?.[0]?.plain_text.capitalizeAll() ?? undefined
        }],
        phoneNumbers: [{
            type: 'main',
            value: properties['mobile number']['phone_number'] ?? undefined,
        }],
        emailAddresses: [{
            value: properties['e-mail'].email ?? undefined,
        }],
        organizations: [{
            type: 'work',
            current: true,
            name: properties['company'].rich_text?.[0]?.plain_text ?? undefined,
            department: properties['department'].rich_text?.[0]?.plain_text ?? undefined,
            title: properties['job title'].rich_text?.[0]?.plain_text ?? undefined,
        }],
        addresses: [{
            type: 'home',
            streetAddress: properties['address 1'].rich_text?.[0]?.plain_text ?? undefined,
            extendedAddress: properties['address 2'].rich_text?.[0]?.plain_text ?? undefined,
            city: properties['city'].rich_text?.[0]?.plain_text.capitalize() ?? undefined,
            region: properties['state'].rich_text?.[0]?.plain_text.toUpperCase() ?? undefined,
            postalCode: properties['zipcode'].rich_text?.[0]?.plain_text ?? undefined,
        }],
        urls: [{
            type: 'home',
            value: properties['website']?.url ?? null,
        }],
        biographies: [{
            contentType: 'TEXT_PLAIN',
            value: properties['whats up'].rich_text?.[0]?.plain_text ?? undefined
        }]
    },
    photoUrl: icon?.file?.url ?? icon?.external?.url ?? undefined
}));