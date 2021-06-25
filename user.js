const db = require('./index');

const getUsers = async () => {
    const {rows} = await db.query(`SELECT 
                        id, email, first_name, last_name, phone, dob, marital_status, occupation, broker_dealer_association,
                        has_investor_license, secondary_email, backup_with_holding 
                    FROM "Users" 
                    ORDER BY Id DESC
                    LIMIT 10`, null);
    
    return rows;
};

const getUserById = async(id) => {
    const {rows} = await db.query(`SELECT 
                        id, email, first_name, last_name, phone, dob, marital_status, occupation, broker_dealer_association,
                        has_investor_license, secondary_email, backup_with_holding 
                    FROM "Users" 
                    WHERE id = $1`, [id]);
    
    return rows[0];
}

module.exports = {
    getUsers,
    getUserById
};