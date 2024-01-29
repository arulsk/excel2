const Sequelize = require('sequelize');
const ExcelJS = require('exceljs');
const path = require('path');

const sequelize = new Sequelize('company', 'root', 'Arulk1535@29', {
  host: 'localhost',
  dialect: 'mysql',
});

const UserDetails = sequelize.define('user_Details', {
  user_id: {
    type: Sequelize.INTEGER,
    primaryKey : true,
    allowNull: false,
  },
  first_Name: {
    type: Sequelize.STRING,
  },
  last_Name: {
    type: Sequelize.STRING,
  },
  age: {
    type: Sequelize.INTEGER,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
});

const UserCountry = sequelize.define('user_country', {
  country_id : {
    type: Sequelize.INTEGER,
    autoIncrement  :true,
    primaryKey : true,
    allowNull: false,
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    forignKey : true
  },
  country: {
    type: Sequelize.STRING,
  },
});

const filePath = path.join(__dirname, 'output.xlsx');

const readExcel = async () => {
  const workbook = new ExcelJS.Workbook();

  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1);

    await sequelize.sync();

    worksheet.eachRow({ includeEmpty: false, skipHeader: true, from: 2 }, async (row, rowNumber) => {
      const rowData = row.values;

      try {
        const userDetails = await UserDetails.create({
          user_id: rowData[1],
          first_Name: rowData[2],
          last_Name: rowData[3],
          age: rowData[4],
          email: rowData[5],
        });

        await UserCountry.create({
          user_id: userDetails.user_id,
          country: rowData[6], 
        });

        console.log(`Row inserted into userDetails and user_country tables`);
      } catch (error) {
        console.error(`Error inserting row: ${error.message}`);
      }
    });

    console.log('Data successfully inserted into userDetails and user_country tables');
  } catch (error) {
    console.error('Error:', error.message);
  } 
};

readExcel();
