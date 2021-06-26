const db = require('./index');

const getUsers = async () => {
    const {rows} = await db.query(`SELECT US.id AS "UserId", US.email AS "Email", US.first_name AS "FirstName", US.last_name AS "LastName",
                                        US.phone AS "Phone", US.dob AS "DateOfBirth", US.marital_status AS "MaritalStatus", US.occupation AS "Occupation",
                                        US.broker_dealer_association AS "BrokerDealerAssociation", US.has_investor_license AS "HasInvestorLicense",
                                        US.secondary_email AS "SecondaryEmail", US.backup_with_holding AS "BackupWithHolding", US.citizenship_id AS "CitizenshipId", CTZ.type AS "CitizenshipType",
                                        US.address_id AS "AddressId", RESADD.street AS "ResidentAddressStreet", RESADD.city AS "ResidentAddressCity"
                                    FROM
                                        "Users" US
                                        LEFT JOIN "Citizenships" CTZ
                                            ON US.citizenship_id = CTZ.id
                                        LEFT JOIN "Addresses" RESADD
                                            ON US.address_id = RESADD.id
                                    ORDER BY US.Id DESC LIMIT 10;`, null);
    
    return rows;
};

const getUserById = async(id) => {
    const {rows} = await db.query(`SELECT US.id AS "UserId", US.email AS "Email", US.first_name AS "FirstName", US.last_name AS "LastName",
                                        US.phone AS "Phone", US.dob AS "DateOfBirth", US.marital_status AS "MaritalStatus", US.occupation AS "Occupation",
                                        US.broker_dealer_association AS "BrokerDealerAssociation", US.has_investor_license AS "HasInvestorLicense",
                                        US.secondary_email AS "SecondaryEmail", US.backup_with_holding AS "BackupWithHolding", US.citizenship_id AS "CitizenshipId", CTZ.type AS "CitizenshipType",
                                        US.address_id AS "AddressId", RESADD.street AS "ResidentAddressStreet", RESADD.city AS "ResidentAddressCity"
                                    FROM
                                        "Users" US
                                        LEFT JOIN "Citizenships" CTZ
                                            ON US.citizenship_id = CTZ.id
                                        LEFT JOIN "Addresses" RESADD
                                            ON US.address_id = RESADD.id
                                    WHERE US.id = $1`, [id]);
    
    return rows[0];
}

module.exports = {
    getUsers,
    getUserById
};