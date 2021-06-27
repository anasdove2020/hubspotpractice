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
                                        US.annual_information AS "AnnualInformation",
                                        ACC.id AS "AccountId",
                                        INVQUEST.ncq2 AS "Question2", INVQUEST.ncq3 AS "Question3", INVQUEST.ncq4 AS "Question4", INVQUEST.ncq5 AS "Question5",
                                        INVQUEST.ncq6 AS "Question6", INVQUEST.ncq7 AS "Question7", INVQUEST.ncq8 AS "Question8", INVQUEST.ncq13 AS "Question13"
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
                                        LEFT JOIN "Accounts" ACC
                                            ON US.id = ACC.user_id
                                        LEFT JOIN "Investment_questionnaire" INVQUEST
                                            ON ACC.id = INVQUEST.account_id
                                    ORDER BY US.Id DESC LIMIT 20;`, null);
    
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
                                        US.annual_information AS "AnnualInformation",
                                        ACC.id AS "AccountId",
                                        INVQUEST.ncq2 AS "Question2", INVQUEST.ncq3 AS "Question3", INVQUEST.ncq4 AS "Question4", INVQUEST.ncq5 AS "Question5",
                                        INVQUEST.ncq6 AS "Question6", INVQUEST.ncq7 AS "Question7", INVQUEST.ncq8 AS "Question8", INVQUEST.ncq13 AS "Question13"
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
                                        LEFT JOIN "Accounts" ACC
                                            ON US.id = ACC.user_id
                                        LEFT JOIN "Investment_questionnaire" INVQUEST
                                            ON ACC.id = INVQUEST.account_id
                                    WHERE US.id = $1`, [id]);
    
    let row = rows[0];
    let annual2019 = 0;
    let annual2020 = 0;
    let employeeStatus = '';

    if (row.EmployeeStatusId) {
        if (row.EmployeeStatusId === 1) {
            employeeStatus = 'Employed'
        } else if (row.EmployeeStatusId === 2) {
            employeeStatus = 'Not Employed'
        } else if (row.EmployeeStatusId === 3) {
            employeeStatus = 'Retired'
        } else if (row.EmployeeStatusId === 4) {
            employeeStatus = 'Student'
        }
    }

    row.EmployeeStatus = employeeStatus;

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

    let question5Text = '';

    if (row.Question5) {
        if (row.Question5 === 1) {
            question5Text = 'I have no investment experience';
        } else if (row.Question5 === 2) {
            question5Text = 'I have very little investment experience';
        } else if (row.Question5 === 3) {
            question5Text = 'I have normal or average investment experience';
        } else if (row.Question5 === 4) {
            question5Text = 'I have above average investment experience';
        } else if (row.Question5 === 5) {
            question5Text = 'I have substantial investment experience';
        }
    }

    row.Question5Text = question5Text;

    let question6Text = '';

    if (row.Question6) {
        if (row.Question6 === 1) {
            question6Text = 'Capital Preservation';
        } else if (row.Question6 === 2) {
            question6Text = 'Capital Preservation and Growth';
        } else if (row.Question6 === 3) {
            question6Text = 'Growth';
        }
    }

    row.Question6Text = question6Text;

    let question7Text = '';

    if (row.Question7) {
        if (row.Question7 === 1) {
            question7Text = '< 3 Years';
        } else if (row.Question7 === 2) {
            question7Text = '3-5 Years';
        } else if (row.Question7 === 3) {
            question7Text = '5-7 Years';
        } else if (row.Question7 === 4) {
            question7Text = '7+ Years';
        }
    }

    row.Question7Text = question7Text;

    let question8Text = '';

    if (row.Question8) {
        if (row.Question8 === 1) {
            question8Text = '1. I am not comfortable with any investment risk';
        } else if (row.Question8 === 2) {
            question8Text = '2. I am comfortable with very little investment risk';
        } else if (row.Question8 === 3) {
            question8Text = '3. I am comfortable with normal, or average investment risk';
        } else if (row.Question8 === 4) {
            question8Text = '4. I am comfortable with above average investment risk';
        } else if (row.Question8 === 5) {
            question8Text = '5. I am actively seeking higher risk/return investments';
        }
    }

    row.Question8Text = question8Text;

    return row;
}

module.exports = {
    getUsers,
    getUserById
};