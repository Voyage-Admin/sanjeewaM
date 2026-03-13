import { 
    Department, 
    SubDepartment, 
    Category, 
    SubCategory, 
    Bin, 
    Rack,
    Warehouse 
} from '../db_sync.js';

// Helper to get model by name
const getModel = (type) => {
    switch (type) {
        case 'departments': return Department;
        case 'sub-departments': return SubDepartment;
        case 'categories': return Category;
        case 'sub-categories': return SubCategory;
        case 'bins': return Bin;
        case 'racks': return Rack;
        default: return null;
    }
};

export const getAll = async (req, res) => {
    const { type } = req.params;
    const Model = getModel(type);
    if (!Model) return res.status(400).json({ message: 'Invalid entity type' });

    try {
        let include = [];
        if (type === 'sub-departments') include = [{ model: Department }];
        if (type === 'sub-categories') include = [{ model: Category }];
        if (type === 'bins' || type === 'racks') include = [{ model: Warehouse }];

        const data = await Model.findAll({ include });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const create = async (req, res) => {
    const { type } = req.params;
    const Model = getModel(type);
    if (!Model) return res.status(400).json({ message: 'Invalid entity type' });

    try {
        const item = await Model.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const update = async (req, res) => {
    const { type, id } = req.params;
    const Model = getModel(type);
    if (!Model) return res.status(400).json({ message: 'Invalid entity type' });

    try {
        const item = await Model.findByPk(id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        
        await item.update(req.body);
        res.json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const remove = async (req, res) => {
    const { type, id } = req.params;
    const Model = getModel(type);
    if (!Model) return res.status(400).json({ message: 'Invalid entity type' });

    try {
        const item = await Model.findByPk(id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        
        await item.destroy();
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
