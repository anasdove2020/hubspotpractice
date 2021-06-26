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

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const AUTH_URL = process.env.AUTH_URL;

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(session({
    secret: Math.random().toString(36).substring(2),
    resave: false,
    saveUninitialized: true
}));

const accessTokenCache = new NodeCache();
const refreshTokenStore = {};

const isAuthorized = (userId) => {
    return refreshTokenStore[userId] ? true : false;
};

const getToken = async (userId) => {
    if (accessTokenCache.get(userId)) {
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
            return responseBody.data.access_token;
        } catch (e) {
            console.error(e);
        }
    }
};

app.get('/', async (req, res) => {
    if (isAuthorized(req.sessionID)) {
        const accessToken = await getToken(req.sessionID);
        res.render('home', { accessToken });
    } else {
        res.render('home', { AUTH_URL });
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

app.post('/sync-contact', async (req, res) => {
    if (isAuthorized(req.sessionID)) {
        const accessToken = await getToken(req.sessionID);
        const { firstname, lastname, email, phone } = req.body;
        var contact = {
            company: 'test',
            email: email,
            firstname: firstname,
            lastname: lastname,
            phone: phone,
            website: 'test',
        }
        await hubspot.syncUser(accessToken, contact);
        res.redirect('/hubspot-contacts');
    } else {
        res.render('home', { AUTH_URL });
    }
});

app.get('/hubspot-contacts', async (req, res) => {
    if (isAuthorized(req.sessionID)) {
        const accessToken = await getToken(req.sessionID);
        const owners = await hubspot.getOwners(accessToken);
        const contacts = await hubspot.getContacts(accessToken, owners);
        res.render('hubspot/hubspot', { contacts });
    } else {
        res.render('home', { AUTH_URL });
    }
});

app.get('/modiv-contacts', async (req, res) => {
    if (isAuthorized(req.sessionID)) {
        const contacts = await userDb.getUsers();
        res.render('modiv/modivlist', { contacts });
    } else {
        res.render('home', { AUTH_URL });
    }
});

app.get('/modiv-contacts/:id', async (req, res) => {
    if (isAuthorized(req.sessionID)) {
        const { id } = req.params;
        const contact = await userDb.getUserById(id);
        res.render('modiv/modivdetail', { contact });
    } else {
        res.render('home', { AUTH_URL });
    }
});

app.get('/token', async (req, res) => {
    if (isAuthorized(req.sessionID)) {
        const accessToken = await getToken(req.sessionID);
        res.render('token/token', { accessToken });
    } else {
        res.render('home', { AUTH_URL });
    }
});

app.get('/logout', (req, res) => {
    refreshTokenStore[req.sessionID] = null;
    res.redirect('/');
});

app.listen(3000, () => console.log(`Listening on http://localhost:3000`));