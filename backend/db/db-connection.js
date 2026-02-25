const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('premix', 'root', '', {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: console.log
});

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL database: premix');
        console.log('📊 Database info:');
        console.log(`   - Database: premix`);
        console.log(`   - Host: localhost`);
        console.log(`   - Port: 3306`);
        console.log(`   - Dialect: mysql`);
        
        // Test query
        const [results] = await sequelize.query('SELECT 1 as test');
        console.log('✅ Query test successful:', results);
        
        return true;
    } catch (err) {
        console.error('❌ Database connection failed:');
        console.error('   Error:', err.message);
        console.log('\n💡 Troubleshooting tips:');
        console.log('   1. Make sure MySQL is running');
        console.log('   2. Check if database "premix" exists');
        console.log('   3. Verify MySQL credentials (root, no password)');
        console.log('   4. Ensure MySQL port 3306 is accessible');
        console.log('   5. Create database with: CREATE DATABASE premix;');
        
        return false;
    }
};

// Test connection immediately
testConnection();

module.exports = sequelize;
