import bcrypt from 'bcrypt';
import { User, sequelize } from './db_sync.js';

const seedAdmin = async () => {
    try {
        await sequelize.authenticate();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('19960327', salt);

        const [user, created] = await User.findOrCreate({
            where: { email: 'admin@gmail.com' },
            defaults: {
                name: 'System Admin',
                password: hashedPassword,
                role: 'ADMIN',
                credit_limit: 0
            }
        });

        if (created) {
            console.log('\n✅ Admin user seeded successfully:\nEmail: admin@gmail.com\nPassword: 19960327\n');
        } else {
            console.log('\n⚡ Admin user already exists.\n');
        }
        process.exit(0);
    } catch (error) {
        console.error('Failed to seed DB:', error);
        process.exit(1);
    }
};

seedAdmin();
