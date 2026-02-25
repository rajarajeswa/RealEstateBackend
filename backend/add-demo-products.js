const sequelize = require('./db/db-connection');
const { Premix } = require('./model/premix');

const demoProducts = [
    // Sambar Premix - 10 products (using Traditional Sambar, Vegetable Sambar, Tamarind Sambar categories)
    { name: 'Classic Sambar Powder', description: 'Traditional Tamil Brahmin style sambar powder with aromatic spices. Perfect for daily cooking.', price: 150, category: 'Traditional Sambar', serving: 4, quantity: 100 },
    { name: 'Andhra Style Sambar Mix', description: 'Spicy Andhra style sambar powder with extra red chilies. Serves 4-5 people.', price: 165, category: 'Traditional Sambar', serving: 5, quantity: 80 },
    { name: 'Kerala Sambar Powder', description: 'Coconut-based Kerala style sambar powder. Authentic taste of God\'s own country.', price: 175, category: 'Traditional Sambar', serving: 4, quantity: 60 },
    { name: 'Instant Sambar Mix', description: 'Ready-to-use instant sambar mix, just add water and vegetables. Quick and easy!', price: 120, category: 'Traditional Sambar', serving: 3, quantity: 150 },
    { name: 'Organic Sambar Powder', description: 'Made with 100% organic ingredients, no preservatives. Healthy choice for family.', price: 220, category: 'Traditional Sambar', serving: 4, quantity: 50 },
    { name: 'Drumstick Sambar Special', description: 'Special blend perfect for drumstick sambar. Rich and aromatic.', price: 180, category: 'Drumstick Sambar', serving: 4, quantity: 90 },
    { name: 'Tamil Nadu Special Sambar', description: 'Authentic Tamil Nadu home-style sambar powder. Traditional recipe.', price: 145, category: 'Traditional Sambar', serving: 4, quantity: 120 },
    { name: 'Vegetable Sambar Mix', description: 'Pre-mixed with dried vegetables for quick cooking. Just add water!', price: 190, category: 'Vegetable Sambar', serving: 4, quantity: 70 },
    { name: 'Idli Sambar Powder', description: 'Special powder for making tiffin sambar for idli/dosa. Perfect consistency.', price: 135, category: 'Traditional Sambar', serving: 3, quantity: 100 },
    { name: 'Palak Sambar Blend', description: 'Healthy spinach-infused sambar powder. Rich in iron and nutrients.', price: 200, category: 'Palak Sambar', serving: 4, quantity: 55 },

    // Rasam Premix - 10 products
    { name: 'Classic Rasam Powder', description: 'Traditional rasam powder with perfect blend of spices. Authentic taste.', price: 130, category: 'Traditional Rasam', serving: 4, quantity: 100 },
    { name: 'Pepper Rasam Mix', description: 'Extra pepper for cold and digestion benefits. Perfect for winter.', price: 145, category: 'Pepper Rasam', serving: 4, quantity: 80 },
    { name: 'Lemon Rasam Powder', description: 'Tangy lemon-flavored rasam powder. Refreshing and light.', price: 140, category: 'Lemon Rasam', serving: 4, quantity: 70 },
    { name: 'Instant Rasam Mix', description: 'Ready in 5 minutes, just add water. Quick meal solution.', price: 110, category: 'Traditional Rasam', serving: 3, quantity: 150 },
    { name: 'Garlic Rasam Powder', description: 'Extra garlic for immunity and flavor. Health benefits included.', price: 150, category: 'Garlic Rasam', serving: 4, quantity: 85 },
    { name: 'Tomato Rasam Mix', description: 'Rich tomato-based rasam powder. Tangy and delicious.', price: 135, category: 'Tomato Rasam', serving: 4, quantity: 90 },
    { name: 'Jeera Rasam Mix', description: 'Cumin-rich rasam for digestion. Perfect after heavy meals.', price: 125, category: 'Traditional Rasam', serving: 4, quantity: 100 },
    { name: 'Spicy Rasam Powder', description: 'Extra spicy rasam for those who love heat. Authentic flavor.', price: 140, category: 'Traditional Rasam', serving: 4, quantity: 75 },
    { name: 'Herbal Rasam Mix', description: 'Infused with medicinal herbs. Great for health.', price: 175, category: 'Traditional Rasam', serving: 4, quantity: 40 },
    { name: 'Organic Rasam Powder', description: '100% organic spices, no additives. Pure and natural.', price: 200, category: 'Traditional Rasam', serving: 4, quantity: 50 },

    // Curry Premix - 10 products
    { name: 'Madras Curry Powder', description: 'Classic Madras style curry powder. Versatile blend.', price: 140, category: 'Chicken Curry', serving: 4, quantity: 100 },
    { name: 'Chettinad Chicken Mix', description: 'Fiery Chettinad style chicken curry powder. Rich and spicy.', price: 165, category: 'Chicken Curry', serving: 4, quantity: 80 },
    { name: 'Special Chicken Curry', description: 'Special blend for chicken curry. Restaurant style taste.', price: 155, category: 'Chicken Curry', serving: 5, quantity: 90 },
    { name: 'Mutton Curry Mix', description: 'Rich spice blend for mutton preparations. Perfect for special occasions.', price: 175, category: 'Chicken Curry', serving: 5, quantity: 70 },
    { name: 'Fish Curry Powder', description: 'Perfect blend for seafood curries. Coastal flavors.', price: 160, category: 'Fish Curry', serving: 4, quantity: 60 },
    { name: 'Vegetable Curry Powder', description: 'Mild blend perfect for vegetable curries. Family friendly.', price: 130, category: 'Vegetable Curry', serving: 4, quantity: 120 },
    { name: 'Egg Curry Mix', description: 'Special spices for egg curry. Quick and tasty.', price: 135, category: 'Egg Curry', serving: 4, quantity: 100 },
    { name: 'Paneer Butter Masala', description: 'Creamy paneer curry spice blend. Restaurant style.', price: 170, category: 'Paneer Curry', serving: 4, quantity: 65 },
    { name: 'Prawn Curry Powder', description: 'Seafood specialty curry powder. Coastal delicacy.', price: 165, category: 'Fish Curry', serving: 4, quantity: 55 },
    { name: 'Mixed Vegetable Curry', description: 'All-purpose vegetable curry powder. Daily cooking essential.', price: 125, category: 'Vegetable Curry', serving: 4, quantity: 110 },

    // Speciality Premix - 10 products (using Biryani, Rice varieties, and regional specials)
    { name: 'Hyderabadi Biryani Masala', description: 'Authentic Hyderabadi biryani spice blend. Royal taste.', price: 180, category: 'Biryani', serving: 6, quantity: 80 },
    { name: 'Ambur Biryani Mix', description: 'Famous Ambur style biryani powder. Traditional recipe.', price: 175, category: 'Biryani', serving: 6, quantity: 70 },
    { name: 'Tomato Rice Powder', description: 'Instant tomato rice seasoning. Quick and tasty.', price: 120, category: 'Tomato Rice', serving: 3, quantity: 120 },
    { name: 'Lemon Rice Mix', description: 'Instant lemon rice seasoning. Tangy and refreshing.', price: 115, category: 'Lemon Rice', serving: 3, quantity: 150 },
    { name: 'Curd Rice Seasoning', description: 'Special seasoning for curd rice. Traditional taste.', price: 100, category: 'Curd Rice', serving: 3, quantity: 150 },
    { name: 'Vegetable Pulao Mix', description: 'Complete pulao spice blend. Easy one-pot meal.', price: 140, category: 'Pulao', serving: 4, quantity: 90 },
    { name: 'Chettinadu Chicken Masala', description: 'Authentic Chettinadu specialty blend. Fiery and flavorful.', price: 185, category: 'Chettinadu Special', serving: 5, quantity: 60 },
    { name: 'Kongunadu Special Mix', description: 'Unique Kongunadu region spices. Traditional flavors.', price: 170, category: 'Kongunadu Special', serving: 4, quantity: 50 },
    { name: 'Madurai Special Curry', description: 'Famous Madurai style curry powder. Bold flavors.', price: 165, category: 'Madurai Special', serving: 4, quantity: 70 },
    { name: 'Kanyakumari Fish Fry', description: 'Coastal Kanyakumari fish fry masala. Crispy and spicy.', price: 155, category: 'Kanyakumari Special', serving: 4, quantity: 80 }
];

async function addDemoProducts() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // Sync the model
        await sequelize.sync();
        console.log('✅ Database synced');

        // Add all demo products
        let added = 0;
        let skipped = 0;
        for (const product of demoProducts) {
            const existing = await Premix.findOne({ where: { name: product.name } });
            if (!existing) {
                await Premix.create(product);
                console.log(`✅ Added: ${product.name} (${product.category})`);
                added++;
            } else {
                console.log(`⏭️ Already exists: ${product.name}`);
                skipped++;
            }
        }

        console.log(`\n🎉 Demo products complete!`);
        console.log(`   Added: ${added}`);
        console.log(`   Skipped: ${skipped}`);
        console.log(`   Total: ${demoProducts.length} (10 per category)`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addDemoProducts();