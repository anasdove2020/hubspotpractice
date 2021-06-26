require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const querystring = require('querystring');
const session = require('express-session');
const NodeCache = require('node-cache');
const userDb = require('./db/user');
const hubspot = require('./hubspot/hubspot');

// Init App
const app = express();

const accessTokenCache = new NodeCache();

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const REDIRECT_URI = `http://localhost:3000/oauth-callback`;

const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=425c4640-0ed2-4e44-9908-2eccc8b06611&redirect_uri=http://localhost:3000/oauth-callback&scope=contacts`;

const refreshTokenStore = {};

app.use(session({
    secret: Math.random().toString(36).substring(2),
    resave: false,
    saveUninitialized: true
}));

const isAuthorized = (userId) => {
    return refreshTokenStore[userId] ? true : false;
};

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
            // accessTokenCache.set(userId, responseBody.data.access_token, 5);
            console.log('======= Getting Refresh Token');
            console.log('======= New Access Token' + responseBody.data.access_token);
            return responseBody.data.access_token;
        } catch (e) {
            console.error(e);
        }
    }
};

// ROUTING - HOME

app.get('/', async (req, res) => {
    if (isAuthorized(req.sessionID)) {
        const accessToken = await getToken(req.sessionID);
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };

        const owners = await hubspot.getOwners(accessToken);

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

app.get('/oauth-callback', async (req, res) => {
    const authCodeProof = {
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: req.query.code
    };

    try {
        const responseBody = await axios.post('https://api.hubapi.com/oauth/v1/token', querystring.stringify(authCodeProof));
        refreshTokenStore[req.sessionID] = responseBody.data.refresh_token;
        accessTokenCache.set(req.sessionID, responseBody.data.access_token, Math.round(responseBody.data.expires_in * 0.75));
        // accessTokenCache.set(req.sessionID, responseBody.data.access_token, 5);
        res.redirect('/');
    } catch (e) {
        console.error(e);
    }
});

app.post('/syncuser', async (req, res) => {
    const accessToken = await getToken(req.sessionID);
    const { firstname, lastname, email, phone } = req.body;
    var user = {
        company: 'test',
        email: email,
        firstname: firstname,
        lastname: lastname,
        phone: phone,
        website: 'test',
    }
    await hubspot.syncUser(accessToken, user);
    res.redirect('/');
});

app.get('/hubspotaccount', async (req, res) => {
    if (isAuthorized(req.sessionID)) {
        const accessToken = await getToken(req.sessionID);
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };

        const owners = await hubspot.getOwners(accessToken);

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

            res.render('hubspot/hubspot', {
                contacts: contactModels
            });
        } catch (e) {
            console.error(e);
        }
    } else {
        res.render('home', { authUrl });
    }
});

app.get('/token', async (req, res) => {
    if (isAuthorized(req.sessionID)) {
        const accessToken = await getToken(req.sessionID);
        res.render('token/token', {
            token: accessToken
        });
    } else {
        res.render('home', { authUrl });
    }
});

app.get('/logout', (req, res) => {
    refreshTokenStore[req.sessionID] = null;
    res.redirect('/');
});

// ROUTING - USER

app.get('/users', async (req, res) => {
    const users = await userDb.getUsers();
    res.render('users/userlist', { users });
});

app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    const user = await userDb.getUserById(id);
    res.render('users/userdetail', { user });
});

// Start Server
app.listen(3000, () => console.log(`Listening on http://localhost:3000`));