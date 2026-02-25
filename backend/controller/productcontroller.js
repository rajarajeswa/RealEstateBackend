const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const { Sequelize, Op } = require('sequelize');
const { Premix } = require('../model/premix');

// Add new product
const addProduct = async (req, res) => {
    try {
        const form = new formidable.IncomingForm({
            maxFileSize: 5 * 1024 * 1024, // 5MB
            keepExtensions: true
        });
        
        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(400).json({ 
                    success: false,
                    message: "Error parsing form data"
                });
            }
            
            try {
                // Extract form data (formidable v3 returns arrays)
                const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
                const price = Array.isArray(fields.price) ? fields.price[0] : fields.price;
                const serving = Array.isArray(fields.serving) ? fields.serving[0] : fields.serving;
                const category = Array.isArray(fields.category) ? fields.category[0] : fields.category;
                const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
                const quantity = Array.isArray(fields.quantity) ? fields.quantity[0] : fields.quantity;
                const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
                
                // Basic validation
                if (!name || !price || !serving || !category || !description || !quantity || !imageFile) {
                    return res.status(400).json({
                        success: false,
                        message: "All fields are required"
                    });
                }
                
                // Handle image upload
                const uploadDir = path.join(__dirname, '../uploads');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                
                const fileName = `${Date.now()}_${imageFile.originalFilename}`;
                const imagePath = `/uploads/${fileName}`;
                const newPath = path.join(uploadDir, fileName);
                
                fs.renameSync(imageFile.filepath, newPath);
                
                // Create product in database
                const product = await Premix.create({
                    name: name.trim(),
                    price: parseFloat(price),
                    serving: parseInt(serving),
                    category: category.trim(),
                    description: description.trim(),
                    quantity: parseInt(quantity),
                    image: imagePath
                });
                
                return res.status(201).json({
                    success: true,
                    message: "Product added successfully",
                    product: {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        category: product.category,
                        image: product.image
                    }
                });
                
            } catch (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: "Error saving product",
                    error: error.message
                });
            }
        });
        
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get products by category
const getProductsByCategory = (categoryType) => {
    return async (req, res) => {
        try {
            const categoryMap = {
                'sambar': ['Traditional Sambar', 'Vegetable Sambar', 'Tamarind Sambar', 'Drumstick Sambar', 'Palak Sambar'],
                'rasam': ['Traditional Rasam', 'Lemon Rasam', 'Pepper Rasam', 'Garlic Rasam', 'Tomato Rasam'],
                'curry': ['Chicken Curry', 'Vegetable Curry', 'Fish Curry', 'Egg Curry', 'Paneer Curry'],
                'speciality': ['Chettinadu Special','Madurai Special','Kongunadu Special','Kanyakumari Special','Tirunelveli Special']
            };
            
            const categories = categoryMap[categoryType] || [];
            
            const products = await Premix.findAll({
                where: {
                    category: {
                        [Op.in]: categories
                    }
                },
                attributes: ['id', 'name', 'price', 'category', 'image', 'description', 'quantity', 'serving']
            });
            
            return res.status(200).json({
                success: true,
                message: "Products fetched successfully",
                products
            });
            
        } catch (error) {
            console.error('Error fetching products:', error);
            return res.status(500).json({
                success: false,
                message: "Error fetching products",
                error: error.message
            });
        }
    };
};

// Update product stock
const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        
        if (quantity === undefined || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid quantity is required'
            });
        }
        
        const product = await Premix.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        await product.update({ quantity: parseInt(quantity) });
        
        return res.json({
            success: true,
            message: 'Stock updated successfully',
            product: {
                id: product.id,
                name: product.name,
                quantity: product.quantity
            }
        });
    } catch (error) {
        console.error('Update stock error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update stock',
            error: error.message
        });
    }
};

// Decrement stock (when adding to cart)
const decrementStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity = 1 } = req.body;
        
        const product = await Premix.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        const newQuantity = Math.max(0, product.quantity - parseInt(quantity));
        await product.update({ quantity: newQuantity });
        
        return res.json({
            success: true,
            message: 'Stock decremented',
            quantity: newQuantity
        });
    } catch (error) {
        console.error('Decrement stock error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to decrement stock',
            error: error.message
        });
    }
};

// Increment stock (when removing from cart)
const incrementStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity = 1 } = req.body;
        
        const product = await Premix.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        const newQuantity = product.quantity + parseInt(quantity);
        await product.update({ quantity: newQuantity });
        
        return res.json({
            success: true,
            message: 'Stock incremented',
            quantity: newQuantity
        });
    } catch (error) {
        console.error('Increment stock error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to increment stock',
            error: error.message
        });
    }
};

// Delete product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Premix.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Delete the image file if it exists
        if (product.image) {
            const imagePath = path.join(__dirname, '..', product.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        await product.destroy();
        
        return res.json({
            success: true,
            message: 'Product deleted successfully',
            productId: id
        });
    } catch (error) {
        console.error('Delete product error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
};

// Get all products (for admin)
const getAllProducts = async (req, res) => {
    try {
        const products = await Premix.findAll({
            attributes: ['id', 'name', 'price', 'category', 'image', 'description', 'quantity', 'serving', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        
        return res.status(200).json({
            success: true,
            message: "All products fetched successfully",
            products
        });
    } catch (error) {
        console.error('Error fetching all products:', error);
        return res.status(500).json({
            success: false,
            message: "Error fetching products",
            error: error.message
        });
    }
};

module.exports = { 
    addProduct, 
    getProductsByCategory,
    updateStock,
    decrementStock,
    incrementStock,
    deleteProduct,
    getAllProducts
};