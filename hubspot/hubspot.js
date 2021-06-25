const axios = require('axios');
const HUBSPOT_URI = 'https://api.hubapi.com/crm/v3';

const getOwners = async (accessToken) => {
    const headers = getHeader(accessToken);
    const owners = `${HUBSPOT_URI}/owners`;
    try {
        const resp = await axios.get(owners, { headers });
        return resp.data.results;
    } catch (e) {
        console.log('Error');
    }
};

const syncUser = async (accessToken, user) => {
    const headers = getHeader(accessToken);
    const addContact = `${HUBSPOT_URI}/objects/contacts`;
    try {
        const resp = await axios.post(addContact, {
            properties: {
                company: user.company,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                phone: user.phone,
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
    syncUser
}