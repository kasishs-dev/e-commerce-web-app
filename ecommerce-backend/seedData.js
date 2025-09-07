// backend/seedData.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

const sampleProducts = [
  {
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 149.99,
    category: 'Electronics',
    brand: 'Sony',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center',
    countInStock: 15,
    rating: 4.5,
    numReviews: 23,
  },
  {
    name: 'Smartphone',
    description: 'Latest smartphone with advanced camera features',
    price: 899.99,
    category: 'Electronics',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center',
    countInStock: 8,
    rating: 4.8,
    numReviews: 45,
  },
  {
    name: 'Running Shoes',
    description: 'Comfortable running shoes for athletes',
    price: 129.99,
    category: 'Sports',
    brand: 'Nike',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center',
    countInStock: 20,
    rating: 4.3,
    numReviews: 15,
  },
  {
    name: 'Coffee Maker',
    description: 'Automatic coffee maker with timer',
    price: 79.99,
    category: 'Home',
    brand: 'KitchenAid',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&crop=center',
    countInStock: 12,
    rating: 4.2,
    numReviews: 8,
  },
  {
    name: 'Smart Watch',
    description: 'Feature-rich smartwatch with health monitoring',
    price: 249.99,
    category: 'Electronics',
    brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center',
    countInStock: 10,
    rating: 4.6,
    numReviews: 32,
  },
  {
    name: 'Backpack',
    description: 'Durable backpack for everyday use',
    price: 59.99,
    category: 'Fashion',
    brand: 'JanSport',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center',
    countInStock: 25,
    rating: 4.4,
    numReviews: 18,
  }
];

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany();
    await User.deleteMany();
    console.log('✅ Cleared existing data');

    // Create users
    const createdUsers = await User.insertMany(
      await Promise.all(sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      })))
    );
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log('🎉 Database seeded successfully!');
    console.log('📧 Admin login: admin@example.com / password123');
    console.log('📧 User login: john@example.com / password123');
    console.log('📧 User login: jane@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();