const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db/db-connection'); 

const Premix = sequelize.define('Premix', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Product name cannot be empty'
            },
            len: {
                args: [1, 255],
                msg: 'Product name must be between 1 and 255 characters'
            }
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: {
                args: [0.01],
                msg: 'Price must be greater than 0'
            }
        }
    },
    serving: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: 'Serving must be at least 1'
            }
        }
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Category cannot be empty'
            },
            isIn: {
                args: [[
                    'Traditional Sambar', 'Vegetable Sambar', 'Tamarind Sambar', 'Drumstick Sambar', 'Palak Sambar',
                    'Traditional Rasam', 'Lemon Rasam', 'Pepper Rasam', 'Garlic Rasam', 'Tomato Rasam',
                    'Chicken Curry', 'Vegetable Curry', 'Fish Curry', 'Egg Curry', 'Paneer Curry',
                    'Biryani', 'Pulao', 'Tomato Rice', 'Lemon Rice', 'Curd Rice',
                    'Tomato Soup', 'Vegetable Soup', 'Chicken Soup', 'Mushroom Soup', 'Sweet Corn Soup',
                    'Tea', 'Coffee', 'Badam Milk', 'Horlicks', 'Boost',
                    'Kheer Mix', 'Payasam Mix', 'Halwa Mix', 'Pudding Mix', 'Custard Mix',
                    'Idli Mix', 'Dosa Mix', 'Upma Mix', 'Poha Mix', 'Oats Mix',
                    'Bhel Mix', 'Chaat Mix', 'Samosa Mix', 'Pakora Mix', 'Vada Mix',
                    'Chettinadu Special', 'Kongunadu Special', 'Madurai Special', 'Tirunelveli Special', 'Kanyakumari Special'
                ]],
                msg: 'Invalid category selected'
            }
        }
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Description cannot be empty'
            },
            len: {
                args: [10, 2000],
                msg: 'Description must be between 10 and 2000 characters'
            }
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'Quantity cannot be negative'
            }
        }
    }
}, {
    tableName: 'premixes',
    timestamps: true
});

// Sync the model with database
const syncDatabase = async () => {
    try {
        await sequelize.sync({ force: false });
        console.log(' Premix model synchronized with database');
    } catch (error) {
        console.error('Error syncing Premix model:', error);
    }
};

// Auto sync on import
syncDatabase();

module.exports = { Premix, syncDatabase };