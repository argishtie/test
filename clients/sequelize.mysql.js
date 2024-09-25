import { Sequelize } from 'sequelize';
import fs from 'fs';

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE, DB_SSL } = process.env;

const sequelize = new Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
	host: DB_HOST,
	port: DB_PORT,
	dialect: 'mysql',
	logging: false,
	dialectOptions: {
		ssl: {
			ca: fs.readFileSync(DB_SSL).toString()
		}
	}
});

(async () => {
	try {
		await sequelize.authenticate();
		console.log('Connection has been established successfully. 🟢 ');
	} catch (error) {
		console.error('Unable to connect to the database 🔴:', error);
	}
})();

export default sequelize;
