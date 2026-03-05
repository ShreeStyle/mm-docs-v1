import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Plus, 
    Search, 
    Filter,
    Download,
    Upload,
    Edit2,
    Trash2,
    MoreVertical,
    Package,
    DollarSign,
    Tag,
    Calendar,
    Grid,
    List,
    X,
    Save,
    Layers
} from 'lucide-react';
import '../styles/CatalogPage.css';

const API_URL = 'http://localhost:5000/api';

const CatalogPage = () => {
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [catalogItems, setCatalogItems] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([
        { id: 'all', name: 'All Products', count: 0, icon: '📦' },
        { id: 'services', name: 'Services', count: 0, icon: '🛠️' },
        { id: 'subscriptions', name: 'Subscriptions', count: 0, icon: '🔄' },
        { id: 'software', name: 'Software', count: 0, icon: '💻' },
        { id: 'marketing', name: 'Marketing', count: 0, icon: '📢' },
        { id: 'consulting', name: 'Consulting', count: 0, icon: '💼' }
    ]);

    // Fetch products from API
    useEffect(() => {
        fetchProducts();
    }, [selectedCategory]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const category = selectedCategory === 'all' ? '' : selectedCategory;
            
            const response = await axios.get(`${API_URL}/catalog/products`, {
                params: { category },
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                setCatalogItems(response.data.products);
                updateCategoryCounts(response.data.products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            // Use sample data as fallback
            const sampleItems = [
                {
                    _id: '1',
                    name: 'Professional Website Design',
                    sku: 'WEB-001',
                    category: 'services',
                    price: 2500,
                    pricingModel: 'one-time',
                    description: 'Custom responsive website design with up to 5 pages',
                    updatedAt: new Date('2026-02-15'),
                    inStock: true
                },
                {
                    _id: '2',
                    name: 'Monthly SEO Package',
                    sku: 'SEO-MONTHLY',
                    category: 'subscriptions',
                    price: 499,
                    pricingModel: 'monthly',
                    description: 'Comprehensive SEO services including keyword research and optimization',
                    updatedAt: new Date('2026-02-20'),
                    inStock: true
                }
            ];
            setCatalogItems(sampleItems);
            updateCategoryCounts(sampleItems);
        } finally {
            setLoading(false);
        }
    };

    const updateCategoryCounts = (items) => {
        const counts = items.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {});
        
        setCategories(prev => prev.map(cat => ({
            ...cat,
            count: cat.id === 'all' ? items.length : (counts[cat.id] || 0)
        })));
    };

    const filteredItems = catalogItems.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.sku.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleAddItem = async (newItem) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/catalog/products`, newItem, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                fetchProducts();
                setShowAddModal(false);
            }
        } catch (error) {
            console.error('Error adding product:', error);
            alert(error.response?.data?.message || 'Error adding product');
        }
    };

    const handleEditItem = async (updatedItem) => {
        try {
            const token = localStorage.getItem('token');
            const itemId = updatedItem._id || updatedItem.id;
            const response = await axios.put(`${API_URL}/catalog/products/${itemId}`, updatedItem, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                fetchProducts();
                setShowEditModal(false);
                setEditingItem(null);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            alert(error.response?.data?.message || 'Error updating product');
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.delete(`${API_URL}/catalog/products/${itemId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data.success) {
                    fetchProducts();
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Error deleting product');
            }
        }
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setShowEditModal(true);
    };

    const formatPrice = (price, model) => {
        const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
        
        const modelSuffix = {
            'one-time': '',
            'monthly': '/mo',
            'yearly': '/yr',
            'hourly': '/hr'
        };
        
        return `${formatted}${modelSuffix[model] || ''}`;
    };

    return (
        <div className="catalog-page">
            {/* Category Sidebar */}
            <aside className="catalog-sidebar">
                <div className="sidebar-header">
                    <h3>Categories</h3>
                    <button 
                        className="add-category-btn"
                        onClick={() => setShowCategoryModal(true)}
                    >
                        <Plus size={16} />
                    </button>
                </div>
                <ul className="category-list">
                    {categories.map(category => (
                        <li key={category.id}>
                            <button
                                className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                <span className="category-icon">{category.icon}</span>
                                <span className="category-name">{category.name}</span>
                                <span className="category-count">{category.count}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Main Content */}
            <main className="catalog-main">
                {/* Header */}
                <div className="catalog-header">
                    <div className="header-left">
                        <h1>Product & Service Catalog</h1>
                        <p>Manage your products, services, and pricing</p>
                    </div>
                    <div className="header-right">
                        <button className="btn-secondary" onClick={() => alert('Import CSV')}>
                            <Upload size={18} />
                            Import CSV
                        </button>
                        <button className="btn-secondary" onClick={() => alert('Export')}>
                            <Download size={18} />
                            Export
                        </button>
                        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                            <Plus size={18} />
                            Add Product
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="catalog-toolbar">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search products by name or SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="toolbar-actions">
                        <button className="filter-btn">
                            <Filter size={18} />
                            Filters
                        </button>
                        <div className="view-toggle">
                            <button
                                className={viewMode === 'grid' ? 'active' : ''}
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                className={viewMode === 'list' ? 'active' : ''}
                                onClick={() => setViewMode('list')}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Info */}
                <div className="results-info">
                    <p>Showing <strong>{filteredItems.length}</strong> of <strong>{catalogItems.length}</strong> products</p>
                </div>

                {/* Catalog Items */}
                {loading ? (
                    <div className="loading-state">
                        <Package size={48} />
                        <p>Loading products...</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="catalog-grid">
                        {filteredItems.map(item => {
                            const itemId = item._id || item.id;
                            const itemDate = item.updatedAt || item.lastUpdated;
                            return (
                            <div key={itemId} className="catalog-card">
                                <div className="card-header">
                                    <div className="card-icon">
                                        <Package size={24} />
                                    </div>
                                    <button className="card-menu">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                                <div className="card-body">
                                    <h3>{item.name}</h3>
                                    <p className="sku">SKU: {item.sku}</p>
                                    <p className="description">{item.description}</p>
                                    <div className="card-meta">
                                        <span className="category-tag">
                                            <Tag size={12} />
                                            {categories.find(c => c.id === item.category)?.name || item.category}
                                        </span>
                                        <span className="price-tag">
                                            <DollarSign size={12} />
                                            {formatPrice(item.price, item.pricingModel)}
                                        </span>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <span className="last-updated">
                                        <Calendar size={12} />
                                        {new Date(itemDate).toLocaleDateString()}
                                    </span>
                                    <div className="card-actions">
                                        <button 
                                            className="btn-icon"
                                            onClick={() => openEditModal(item)}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            className="btn-icon btn-danger"
                                            onClick={() => handleDeleteItem(itemId)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="catalog-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>SKU</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Last Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map(item => {
                                    const itemId = item._id || item.id;
                                    const itemDate = item.updatedAt || item.lastUpdated;
                                    return (
                                    <tr key={itemId}>
                                        <td>
                                            <div className="product-cell">
                                                <Package size={20} />
                                                <div>
                                                    <strong>{item.name}</strong>
                                                    <span className="description">{item.description}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td><code>{item.sku}</code></td>
                                        <td>
                                            <span className="category-badge">
                                                {categories.find(c => c.id === item.category)?.name}
                                            </span>
                                        </td>
                                        <td><strong>{formatPrice(item.price, item.pricingModel)}</strong></td>
                                        <td>{new Date(itemDate).toLocaleDateString()}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button 
                                                    className="btn-icon"
                                                    onClick={() => openEditModal(item)}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    className="btn-icon btn-danger"
                                                    onClick={() => handleDeleteItem(itemId)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Empty State */}
                {filteredItems.length === 0 && (
                    <div className="empty-state">
                        <Package size={64} />
                        <h3>No products found</h3>
                        <p>Try adjusting your search or filters, or add a new product to get started.</p>
                        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                            <Plus size={18} />
                            Add Your First Product
                        </button>
                    </div>
                )}
            </main>

            {/* Add/Edit Product Modal */}
            {(showAddModal || showEditModal) && (
                <ProductModal
                    item={editingItem}
                    categories={categories}
                    onSave={showAddModal ? handleAddItem : handleEditItem}
                    onClose={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        setEditingItem(null);
                    }}
                />
            )}

            {/* Add Category Modal */}
            {showCategoryModal && (
                <CategoryModal
                    onClose={() => setShowCategoryModal(false)}
                    onSave={(newCategory) => {
                        setCategories([...categories, { ...newCategory, count: 0 }]);
                        setShowCategoryModal(false);
                    }}
                />
            )}
        </div>
    );
};

// Product Modal Component
const ProductModal = ({ item, categories, onSave, onClose }) => {
    const [formData, setFormData] = useState(item || {
        name: '',
        sku: '',
        category: 'services',
        price: '',
        pricingModel: 'one-time',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            price: parseFloat(formData.price)
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{item ? 'Edit Product' : 'Add New Product'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Product Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g., Website Design Service"
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>SKU *</label>
                                <input
                                    type="text"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                                    placeholder="e.g., WEB-001"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    required
                                >
                                    {categories.filter(c => c.id !== 'all').map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Price *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Pricing Model *</label>
                                <select
                                    value={formData.pricingModel}
                                    onChange={(e) => setFormData({...formData, pricingModel: e.target.value})}
                                    required
                                >
                                    <option value="one-time">One-time</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                    <option value="hourly">Hourly</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Describe your product or service..."
                                rows="4"
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            <Save size={18} />
                            {item ? 'Update Product' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Category Modal Component
const CategoryModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        icon: '📦'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: formData.name.toLowerCase().replace(/\s+/g, '-')
        });
    };

    const emojiOptions = ['📦', '🛠️', '🔄', '💻', '📢', '💼', '🎨', '📱', '🏗️', '🔧'];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Category</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Category Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g., Custom Services"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Icon</label>
                            <div className="emoji-picker">
                                {emojiOptions.map(emoji => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        className={`emoji-option ${formData.icon === emoji ? 'selected' : ''}`}
                                        onClick={() => setFormData({...formData, icon: emoji})}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            <Save size={18} />
                            Add Category
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CatalogPage;
