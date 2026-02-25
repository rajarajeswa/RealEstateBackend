const { DataTypes } = require('sequelize');
const sequelize = require('../db/db-connection');

const Address = sequelize.define('Address', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    label: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'e.g., Home, Office, Other'
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Recipient name'
    },
    phone: {
        type: DataTypes.STRING(15),
        allowNull: true,
        comment: 'Contact phone number'
    },
    addressLine1: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'House/Flat no., Building name'
    },
    addressLine2: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Street, Area, Landmark'
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    state: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    pincode: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'addresses',
    timestamps: true
});

module.exports = { Address };
