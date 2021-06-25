const Pool = require('pg').Pool;

// Init PG
const pool = new Pool({
    user: 'oawiqaazxigull',
    host: 'ec2-54-242-43-231.compute-1.amazonaws.com',
    database: 'd5j6ia96ldd8jj',
    password: '18c4d36cef19a71be956f24c22eab68514354240a284eb9b7cd900e1b421ab64',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params)
};