// Comprehensive Sample Data for Kara-Saaram Premix Products
const sampleProducts = [
    {
        name: 'Traditional Sambar Premix',
        category: 'Traditional Sambar',
        price: '150.00',
        servings: '4',
        description: 'Authentic Chettinadu traditional sambar premix made with stone-ground spices. Perfect for 4 servings. Includes toor dal, tamarind, and traditional spices.',
        quantity: '50',
        image: 'traditional-sambar.jpg'
    },
    {
        name: 'Vegetable Sambar Premix',
        category: 'Vegetable Sambar',
        price: '140.00',
        servings: '4',
        description: 'Healthy and delicious vegetable sambar with mixed vegetables and traditional spices. Perfect for 4 servings.',
        quantity: '45',
        image: 'vegetable-sambar.jpg'
    },
    {
        name: 'Tamarind Sambar Premix',
        category: 'Tamarind Sambar',
        price: '145.00',
        servings: '4',
        description: 'Tangy tamarind sambar with rich flavor and authentic spices. Perfect for 4 servings.',
        quantity: '40',
        image: 'tamarind-sambar.jpg'
    },
    {
        name: 'Traditional Rasam Mix',
        category: 'Traditional Rasam',
        price: '80.00',
        servings: '6',
        description: 'Classic traditional rasam with tamarind, tomatoes, and aromatic spices. Ready in 10 minutes.',
        quantity: '60',
        image: 'traditional-rasam.jpg'
    },
    {
        name: 'Lemon Rasam Mix',
        category: 'Lemon Rasam',
        price: '75.00',
        servings: '6',
        description: 'Refreshing lemon rasam with fresh lemon juice and traditional spices. Perfect for summer meals.',
        quantity: '55',
        image: 'lemon-rasam.jpg'
    },
    {
        name: 'Pepper Rasam Mix',
        category: 'Pepper Rasam',
        price: '85.00',
        servings: '6',
        description: 'Spicy pepper rasam with black pepper and traditional herbs. Great for cold relief.',
        quantity: '35',
        image: 'pepper-rasam.jpg'
    },
    {
        name: 'Garlic Rasam Mix',
        category: 'Garlic Rasam',
        price: '90.00',
        servings: '6',
        description: 'Aromatic garlic rasam with fresh garlic pods and traditional spices.',
        quantity: '40',
        image: 'garlic-rasam.jpg'
    },
    {
        name: 'Tomato Rasam Mix',
        category: 'Tomato Rasam',
        price: '70.00',
        servings: '6',
        description: 'Tangy tomato rasam with ripe tomatoes and traditional spices.',
        quantity: '45',
        image: 'tomato-rasam.jpg'
    },
    {
        name: 'Chicken Curry Premix',
        category: 'Chicken Curry',
        price: '180.00',
        servings: '5',
        description: 'Rich and flavorful chicken curry premix with authentic spices. Perfect for 5 servings.',
        quantity: '30',
        image: 'chicken-curry.jpg'
    },
    {
        name: 'Vegetable Curry Premix',
        category: 'Vegetable Curry',
        price: '120.00',
        servings: '5',
        description: 'Mixed vegetable curry with farm-fresh vegetables and authentic spices.',
        quantity: '50',
        image: 'vegetable-curry.jpg'
    },
    {
        name: 'Fish Curry Premix',
        category: 'Fish Curry',
        price: '200.00',
        servings: '4',
        description: 'Traditional fish curry with coastal spices and fresh fish flavors.',
        quantity: '25',
        image: 'fish-curry.jpg'
    },
    {
        name: 'Egg Curry Premix',
        category: 'Egg Curry',
        price: '100.00',
        servings: '4',
        description: 'Simple and delicious egg curry with minimal spices. Perfect for quick meals.',
        quantity: '40',
        image: 'egg-curry.jpg'
    },
    {
        name: 'Paneer Curry Premix',
        category: 'Paneer Curry',
        price: '160.00',
        servings: '4',
        description: 'Rich paneer curry with cottage cheese and traditional spices.',
        quantity: '35',
        image: 'paneer-curry.jpg'
    },
    {
        name: 'Biryani Masala Mix',
        category: 'Biryani',
        price: '250.00',
        servings: '6',
        description: 'Premium biryani masala with aromatic spices and basmati rice flavor.',
        quantity: '20',
        image: 'biryani-masala.jpg'
    },
    {
        name: 'Vegetable Pulao Mix',
        category: 'Pulao',
        price: '130.00',
        servings: '4',
        description: 'Fluffy vegetable pulao with mild spices and ghee flavor.',
        quantity: '30',
        image: 'vegetable-pulao.jpg'
    },
    {
        name: 'Tomato Rice Mix',
        category: 'Tomato Rice',
        price: '90.00',
        servings: '4',
        description: 'Tangy tomato rice with perfect blend of spices.',
        quantity: '45',
        image: 'tomato-rice.jpg'
    },
    {
        name: 'Lemon Rice Mix',
        category: 'Lemon Rice',
        price: '85.00',
        servings: '4',
        description: 'Refreshing lemon rice with citrus flavor and mild spices.',
        quantity: '40',
        image: 'lemon-rice.jpg'
    },
    {
        name: 'Curd Rice Mix',
        category: 'Curd Rice',
        price: '75.00',
        servings: '4',
        description: 'Cool and soothing curd rice with mild tempering spices.',
        quantity: '55',
        image: 'curd-rice.jpg'
    },
    {
        name: 'Tomato Soup Mix',
        category: 'Tomato Soup',
        price: '60.00',
        servings: '4',
        description: 'Rich and creamy tomato soup with garden-fresh vegetables.',
        quantity: '35',
        image: 'tomato-soup.jpg'
    },
    {
        name: 'Vegetable Soup Mix',
        category: 'Vegetable Soup',
        price: '55.00',
        servings: '6',
        description: 'Healthy mixed vegetable soup with nutritional vegetables.',
        quantity: '40',
        image: 'vegetable-soup.jpg'
    },
    {
        name: 'Chicken Soup Mix',
        category: 'Chicken Soup',
        price: '120.00',
        servings: '4',
        description: 'Hearty chicken soup with rich chicken broth and vegetables.',
        quantity: '25',
        image: 'chicken-soup.jpg'
    },
    {
        name: 'Mushroom Soup Mix',
        category: 'Mushroom Soup',
        price: '140.00',
        servings: '4',
        description: 'Earthy mushroom soup with fresh mushrooms and herbs.',
        quantity: '30',
        image: 'mushroom-soup.jpg'
    },
    {
        name: 'Sweet Corn Soup Mix',
        category: 'Sweet Corn Soup',
        price: '80.00',
        servings: '4',
        description: 'Sweet and creamy corn soup with sweet corn kernels.',
        quantity: '35',
        image: 'corn-soup.jpg'
    },
    {
        name: 'Tea Premix',
        category: 'Tea',
        price: '45.00',
        servings: '20',
        description: 'Traditional Tamil Nadu tea premix with authentic spices and herbs.',
        quantity: '80',
        image: 'tea-premix.jpg'
    },
    {
        name: 'Coffee Premix',
        category: 'Coffee',
        price: '95.00',
        servings: '15',
        description: 'Rich coffee premix with South Indian filter coffee blend.',
        quantity: '60',
        image: 'coffee-premix.jpg'
    },
    {
        name: 'Badam Milk Mix',
        category: 'Badam Milk',
        price: '110.00',
        servings: '8',
        description: 'Nutritious badam milk premix with almonds and cardamom.',
        quantity: '25',
        image: 'badam-milk.jpg'
    },
    {
        name: 'Idli Mix',
        category: 'Idli Mix',
        price: '90.00',
        servings: '8',
        description: 'Soft and fluffy idli premix. Just add water and steam for perfect idlis.',
        quantity: '40',
        image: 'idli-mix.jpg'
    },
    {
        name: 'Dosa Mix',
        category: 'Dosa Mix',
        price: '85.00',
        servings: '6',
        description: 'Crispy dosa premix with fermented rice batter and traditional spices.',
        quantity: '35',
        image: 'dosa-mix.jpg'
    },
    {
        name: 'Upma Mix',
        category: 'Upma Mix',
        price: '70.00',
        servings: '4',
        description: 'Quick and easy upma premix with roasted vermicelli and mild spices.',
        quantity: '45',
        image: 'upma-mix.jpg'
    },
    {
        name: 'Poha Mix',
        category: 'Poha Mix',
        price: '65.00',
        servings: '4',
        description: 'Traditional flattened rice poha with peanuts and curry leaves.',
        quantity: '50',
        image: 'poha-mix.jpg'
    },
    {
        name: 'Chettinadu Special Masala',
        category: 'Chettinadu Special',
        price: '300.00',
        servings: '3',
        description: 'Premium Chettinadu special spice blend for authentic Tamil Nadu cuisine. Secret family recipe.',
        quantity: '15',
        image: 'chettinadu-special.jpg'
    },
    {
        name: 'Kongunadu Special Mix',
        category: 'Kongunadu Special',
        price: '280.00',
        servings: '3',
        description: 'Traditional Kongunadu region special spice blend with unique flavor profile.',
        quantity: '20',
        image: 'kongunadu-special.jpg'
    },
    {
        name: 'Madurai Special Premix',
        category: 'Madurai Special',
        price: '320.00',
        servings: '2',
        description: 'Exclusive Madurai special premix with temple recipe spices.',
        quantity: '10',
        image: 'madurai-special.jpg'
    },
    {
        name: 'Tirunelveli Special Mix',
        category: 'Tirunelveli Special',
        price: '290.00',
        servings: '2',
        description: 'Traditional Tirunelveli special with halwa ingredients and aromatic spices.',
        quantity: '12',
        image: 'tirunelveli-special.jpg'
    },
    {
        name: 'Kanyakumari Special Blend',
        category: 'Kanyakumari Special',
        price: '275.00',
        servings: '2',
        description: 'Coastal Kanyakumari special with fish curry spices and coconut flavor.',
        quantity: '18',
        image: 'kanyakumari-special.jpg'
    }
];

// Function to get random sample product
const getRandomSample = () => {
    return sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
};

// Function to get sample by category
const getSampleByCategory = (category) => {
    return sampleProducts.filter(product => product.category === category);
};

// Function to get all categories
const getAllCategories = () => {
    return [...new Set(sampleProducts.map(product => product.category))];
};

module.exports = {
    sampleProducts,
    getRandomSample,
    getSampleByCategory,
    getAllCategories
};
