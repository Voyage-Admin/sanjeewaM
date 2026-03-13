import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Category from './category.model.js';

const SubCategory = sequelize.define('SubCategory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category_id: {
        type: DataTypes.UUID,
        references: {
            model: Category,
            key: 'id'
        }
    }
}, {
    timestamps: true,
    tableName: 'sub_categories'
});

Category.hasMany(SubCategory, { foreignKey: 'category_id' });
SubCategory.belongsTo(Category, { foreignKey: 'category_id' });

export default SubCategory;
