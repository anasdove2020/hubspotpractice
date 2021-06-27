const db = require('./index');

const getUsers = async () => {
    const {rows} = await db.query(`SELECT US.id AS "UserId", US.email AS "Email", US.first_name AS "FirstName", US.last_name AS "LastName",
                                        US.phone AS "Phone", US.dob AS "DateOfBirth", US.marital_status AS "MaritalStatus", US.occupation AS "Occupation",
                                        US.broker_dealer_association AS "BrokerDealerAssociation", US.has_investor_license AS "HasInvestorLicense",
                                        US.secondary_email AS "SecondaryEmail", US.backup_with_holding AS "BackupWithHolding", US.citizenship_id AS "CitizenshipId", CTZ.type AS "CitizenshipType",
                                        US.address_id AS "AddressId", RESADD.street AS "ResidentAddressStreet", RESADD.city AS "ResidentAddressCity", RESADD.zip AS "ResidentAddressZip",
                                        RESADD.country_id AS "ResidentAddressCountryId", RESADDCOUNTRY.name AS "ResidentAddressCountryName",
                                        RESADD.state_id AS "ResidentAddressStateId", RESADDSTATE.abbr AS "ResidentAddressStateAbbr",
                                        US.employee_status_id AS "EmployeeStatusId", US.employer_name AS "EmployerName",
                                        US.employer_address_id AS "EmployerAddressId", EMPADD.street AS "EmployerAddressStreet", EMPADD.city AS "EmployerAddressCity", EMPADD.zip AS "EmployerAddressZip",
                                        EMPADD.country_id AS "EmployerAddressCountryId", EMPADDCOUNTRY.name AS "EmployerAddressCountryName",
                                        EMPADD.state_id AS "EmployerAddressStateId", EMPADDSTATE.abbr AS "EmployerAddressStateAbbr",
                                        US.annual_information AS "AnnualInformation"
                                    FROM
                                        "Users" US
                                        LEFT JOIN "Citizenships" CTZ
                                            ON US.citizenship_id = CTZ.id
                                        LEFT JOIN "Addresses" RESADD
                                            ON US.address_id = RESADD.id
                                        LEFT JOIN "Countries" RESADDCOUNTRY
                                            ON RESADD.country_id = RESADDCOUNTRY.id
                                        LEFT JOIN "States" RESADDSTATE
                                            ON RESADD.state_id = RESADDSTATE.id
                                        LEFT JOIN "Addresses" EMPADD
                                            ON US.employer_address_id = EMPADD.id
                                        LEFT JOIN "Countries" EMPADDCOUNTRY
                                            ON EMPADD.country_id = EMPADDCOUNTRY.id
                                        LEFT JOIN "States" EMPADDSTATE
                                            ON EMPADD.state_id = EMPADDSTATE.id
                                    ORDER BY US.Id DESC LIMIT 10;`, null);
    
    return rows;
};

const getUserById = async(id) => {
    const {rows} = await db.query(`SELECT US.id AS "UserId", US.email AS "Email", US.first_name AS "FirstName", US.last_name AS "LastName",
                                        US.phone AS "Phone", US.dob AS "DateOfBirth", US.marital_status AS "MaritalStatus", US.occupation AS "Occupation",
                                        US.broker_dealer_association AS "BrokerDealerAssociation", US.has_investor_license AS "HasInvestorLicense",
                                        US.secondary_email AS "SecondaryEmail", US.backup_with_holding AS "BackupWithHolding", US.citizenship_id AS "CitizenshipId", CTZ.type AS "CitizenshipType",
                                        US.address_id AS "AddressId", RESADD.street AS "ResidentAddressStreet", RESADD.city AS "ResidentAddressCity", RESADD.zip AS "ResidentAddressZip",
                                        RESADD.country_id AS "ResidentAddressCountryId", RESADDCOUNTRY.name AS "ResidentAddressCountryName",
                                        RESADD.state_id AS "ResidentAddressStateId", RESADDSTATE.abbr AS "ResidentAddressStateAbbr",
                                        US.employee_status_id AS "EmployeeStatusId", US.employer_name AS "EmployerName",
                                        US.employer_address_id AS "EmployerAddressId", EMPADD.street AS "EmployerAddressStreet", EMPADD.city AS "EmployerAddressCity", EMPADD.zip AS "EmployerAddressZip",
                                        EMPADD.country_id AS "EmployerAddressCountryId", EMPADDCOUNTRY.name AS "EmployerAddressCountryName",
                                        EMPADD.state_id AS "EmployerAddressStateId", EMPADDSTATE.abbr AS "EmployerAddressStateAbbr",
                                        US.annual_information AS "AnnualInformation"
                                    FROM
                                        "Users" US
                                        LEFT JOIN "Citizenships" CTZ
                                            ON US.citizenship_id = CTZ.id
                                        LEFT JOIN "Addresses" RESADD
                                            ON US.address_id = RESADD.id
                                        LEFT JOIN "Countries" RESADDCOUNTRY
                                            ON RESADD.country_id = RESADDCOUNTRY.id
                                        LEFT JOIN "States" RESADDSTATE
                                            ON RESADD.state_id = RESADDSTATE.id
                                        LEFT JOIN "Addresses" EMPADD
                                            ON US.employer_address_id = EMPADD.id
                                        LEFT JOIN "Countries" EMPADDCOUNTRY
                                            ON EMPADD.country_id = EMPADDCOUNTRY.id
                                        LEFT JOIN "States" EMPADDSTATE
                                            ON EMPADD.state_id = EMPADDSTATE.id
                                    WHERE US.id = $1`, [id]);
    
    let row = rows[0];
    let annual2019 = 0;
    let annual2020 = 0;

    if (row.AnnualInformation) {
        if (row.AnnualInformation.income) {
            let income = row.AnnualInformation.income;
            let incomePropertyNames = Object.keys(income);
            incomePropertyNames.map(incomePropertyName => {
                if (incomePropertyName === '2019') {
                    annual2019 = income[incomePropertyName];
                }
                if (incomePropertyName === '2020') {
                    annual2020 = income[incomePropertyName];
                }
                return incomePropertyName;
            });
        }
    }

    row.AnnualInformation2019 = annual2019;
    row.AnnualInformation2020 = annual2020;

    return row;
}

module.exports = {
    getUsers,
    getUserById
};