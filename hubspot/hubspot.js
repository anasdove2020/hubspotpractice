const axios = require('axios');
const HUBSPOT_URI = 'https://api.hubapi.com';

const getOwners = async (accessToken) => {
    const headers = getHeader(accessToken);
    const url = `${HUBSPOT_URI}/crm/v3/owners`;
    try {
        const resp = await axios.get(url, { headers });
        return resp.data.results;
    } catch (e) {
        console.log('Error');
    }
};

const getContacts = async (accessToken, owners) => {
    const headers = getHeader(accessToken);
    const url = `${HUBSPOT_URI}/contacts/v1/lists/all/contacts/all?count=40&property=lastname&property=firstname&property=email&property=hubspot_owner_id`;
    try {
        const resp = await axios.get(url, { headers });
        const data = resp.data;

        let contactModels = [];

        data.contacts.map(async (contact) => {
            let contactModel = {
                firstname: contact.properties.firstname.value,
                lastname: contact.properties.lastname.value,
                email: contact.properties.email.value
            };

            if (contact.properties.hubspot_owner_id) {
                contactModel.ownerId = contact.properties.hubspot_owner_id.value;
                const owner = owners.find(fi => fi.id === contactModel.ownerId);
                if (owner) {
                    contactModel.ownerName = `${owner.firstName} ${owner.lastName}`;
                } else {
                    contactModel.ownerName = null
                }
            } else {
                contactModel.ownerId = null;
                contactModel.ownerName = null;
            }

            contactModels.push(contactModel);

            return contact;
        });

        return contactModels;
    } catch (e) {
        console.log('Error');
    }
};

const syncUser = async (accessToken, user) => {
    const headers = getHeader(accessToken);
    const url = `${HUBSPOT_URI}/crm/v3/objects/contacts`;
    try {
        const resp = await axios.post(url, {
            properties: {
                company: user.company,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                phone: user.phone,
                users_phone: user.phone,
                website: user.website,
                hubspot_owner_id: 85931368 // TODO: HARDCODED. NEED TO GET USER LOGIN ID.
            }
        }, { headers });
        console.log(resp);
    } catch (e) {
        console.log('Error');
    }
};

const getHeader = (accessToken) => {
    return {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };
}

module.exports = {
    getOwners,
    getContacts,
    syncUser
}