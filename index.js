require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const querystring = require('querystring');
const session = require('express-session');
const NodeCache = require('node-cache');

// Init App
const app = express();

const accessTokenCache = new NodeCache();

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const REDIRECT_URI = `http://localhost:3000/oauth-callback`;
                 
const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=425c4640-0ed2-4e44-9908-2eccc8b06611&redirect_uri=http://localhost:3000/oauth-callback&scope=contacts`;

// TODO: Save it in database
const refreshTokenStore = {};

app.use(session({
    secret: Math.random().toString(36).substring(2),
    resave: false,
    saveUninitialized: true
}));

const isAuthorized = (userId) => {
    return refreshTokenStore[userId] ? true : false;
};

// OAuth Flow
// 1. Send user to authorization page. This kicks off initial request to OAuth Server

app.get('/', async (req, res) => {
    if (isAuthorized(req.sessionID)) {
        const accessToken = await getToken(req.sessionID);
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };

        const owners = await getOwners(accessToken);

        const contacts = `https://api.hubapi.com/contacts/v1/lists/all/contacts/all?count=40&property=lastname&property=firstname&property=email&property=hubspot_owner_id`;
        try {
            const resp = await axios.get(contacts, { headers });
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

            res.render('home', {
                token: accessToken,
                contacts: contactModels
            });
        } catch (e) {
            console.error(e);
        }
    } else {
        res.render('home', { authUrl });
    }
});

const getToken = async (userId) => {
    if (accessTokenCache.get(userId)) {
        console.log('======= Access Token: ' + accessTokenCache.get(userId));
        return accessTokenCache.get(userId);
    } else {
        try {
            const refreshTokenProof = {
                grant_type: 'refresh_token',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                refresh_token: refreshTokenStore[userId]
            };

            const responseBody = await axios.post('https://api.hubapi.com/oauth/v1/token', querystring.stringify(refreshTokenProof));
            refreshTokenStore[userId] = responseBody.data.refresh_token;
            accessTokenCache.set(userId, responseBody.data.access_token, Math.round(responseBody.data.expires_in * 0.75));
            console.log('======= Getting Refresh Token');
            console.log('======= New Access Token' + responseBody.data.access_token);
            return responseBody.data.access_token;
        } catch (e) {
            console.error(e);
        }
    }
};

const getOwners = async (accessToken) => {
    const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };
    const owners = `https://api.hubapi.com/crm/v3/owners`;
    try {
        const resp = await axios.get(owners, { headers });
        return resp.data.results;
    } catch (e) {
        console.log('Error');
    }
};

// 2. Get temporary authorization code from OAuth Server
// 3. Combine temporary auth code with app credentials and send back to OAuth Server

app.get('/oauth-callback', async (req, res) => {
    const authCodeProof = {
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: req.query.code
    };

    try {
        // 4. Get Access Tokens and Refresh Tokens
        const responseBody = await axios.post('https://api.hubapi.com/oauth/v1/token', querystring.stringify(authCodeProof));
        refreshTokenStore[req.sessionID] = responseBody.data.refresh_token;
        accessTokenCache.set(req.sessionID, responseBody.data.access_token, Math.round(responseBody.data.expires_in * 0.75));
        res.redirect('/');
    } catch(e) {
        console.error(e);
    }
});

// Start Server
app.listen(3000, () => console.log(`Listening on http://localhost:3000`));