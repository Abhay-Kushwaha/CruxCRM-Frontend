"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Palette, Tag, FileText, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Axios from '@/lib/Axios';

interface Category {
  _id: string;
  title: string;
  description: string;
  color: string;
  createdAt: string;
  __v: number;
}

interface CategoryFormData {
  title: string;
  description: string;
  color: string;
}

const colorOptions = [
  { value: '#ff6b6b', label: 'Red' },
  { value: '#4ecdc4', label: 'Teal' },
  { value: '#45b7d1', label: 'Blue' },
  { value: '#96ceb4', label: 'Green' },
  { value: '#ffeaa7', label: 'Yellow' },
  { value: '#dda0dd', label: 'Purple' },
  { value: '#ff9ff3', label: 'Pink' },
  { value: '#fd79a8', label: 'Rose' },
  { value: '#fdcb6e', label: 'Orange' },
  { value: '#6c5ce7', label: 'Indigo' },
];

// Define a threshold for description length before "See More" appears
const DESCRIPTION_TRUNCATE_LENGTH = 120; // Characters

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    title: '',
    description: '',
    color: '#4ecdc4',
  });
  // State to manage which description in the grid is expanded
  const [expandedDescriptionId, setExpandedDescriptionId] = useState<string | null>(null);


  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await Axios.get('/category');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      const errorMessage = (error as any).response?.data?.message || 'Failed to fetch categories';
      toast.error('Error', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const createCategory = async (data: CategoryFormData) => {
    try {
      setLoading(true);
      const response = await Axios.post('/category/create', data);
      if (response.data.success) {
        toast.success('Success', {
          description: 'Category created successfully',
        });
        setIsCreateOpen(false);
        resetForm();
        fetchCategories();
      } else {
        const errorMessage = response.data.message || 'An unknown error occurred.';
        toast.error('Error creating category', {
          description: errorMessage,
        });
      }
    } catch (error) {
      const errorMessage = (error as any).response?.data?.message || 'Failed to create category';
      toast.error('Error', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const updateCategory = async (data: CategoryFormData) => {
    if (!selectedCategory) return;
    try {
      setLoading(true);
      const response = await Axios.put(`/category/updatecategory/${selectedCategory._id}`, data);
      if (response.data.success) {
        toast.success('Success', {
          description: 'Category updated successfully',
        });
        setIsUpdateOpen(false);
        resetForm();
        fetchCategories();
      } else {
        const errorMessage = response.data.message || 'An unknown error occurred.';
        toast.error('Error updating category', {
          description: errorMessage,
        });
      }
    } catch (error) {
      const errorMessage = (error as any).response?.data?.message || 'Failed to update category';
      toast.error('Error', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async () => {
    if (!selectedCategory) return;
    try {
      setLoading(true);
      const response = await Axios.delete(`/category/deletecategory/${selectedCategory._id}`);
      if (response.data.success) {
        toast.success('Success', {
          description: 'Category deleted successfully',
        });
        setDeleteDialogOpen(false);
        fetchCategories();
      } else {
        const errorMessage = response.data.message || 'An unknown error occurred.';
        toast.error('Error deleting category', {
          description: errorMessage,
        });
      }
    } catch (error) {
      const errorMessage = (error as any).response?.data?.message || 'Failed to delete category';
      toast.error('Error', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      color: '#4ecdc4',
    });
    setSelectedCategory(null);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      title: category.title,
      description: category.description,
      color: category.color,
    });
    setIsUpdateOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Toggle description expansion
  const toggleDescriptionExpansion = (id: string) => {
    setExpandedDescriptionId(prevId => (prevId === id ? null : id));
  };


  // New self-contained CategoryForm component
  const CategoryForm = ({ isUpdate = false, initialData, onSubmit, onClose, isLoading }: {
    isUpdate?: boolean;
    initialData: CategoryFormData;
    onSubmit: (data: CategoryFormData) => void;
    onClose: () => void;
    isLoading: boolean;
  }) => {
    const [localFormData, setLocalFormData] = useState<CategoryFormData>(initialData);
    const [showColorPicker, setShowColorPicker] = useState(false);

    useEffect(() => {
      // Update local form data when initialData changes (e.g., when opening edit dialog)
      setLocalFormData(initialData);
      // Hide custom color picker when initial data changes or dialog opens
      setShowColorPicker(false);
    }, [initialData]);

    const handleLocalInputChange = (field: keyof CategoryFormData, value: string) => {
      setLocalFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(localFormData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Title
          </Label>
          <Input
            id="title"
            placeholder="Enter category title"
            value={localFormData.title}
            onChange={(e) => handleLocalInputChange('title', e.target.value)}
            className="w-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Enter category description"
            value={localFormData.description}
            onChange={(e) => handleLocalInputChange('description', e.target.value)}
            // Added max-h-48 and overflow-y-auto to limit height and add scrollbar
            className="w-full min-h-[100px] max-h-48 resize-y overflow-y-auto"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Color
          </Label>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => {
                  handleLocalInputChange('color', color.value);
                  setShowColorPicker(false); // Hide custom picker if a preset is chosen
                }}
                className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                  localFormData.color === color.value
                    ? 'border-gray-800 dark:border-gray-200 shadow-lg'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.label}
              />
            ))}
            {/* Custom Color Input Toggle */}
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-all duration-200 hover:scale-110 ${
                showColorPicker ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              title="Custom Color"
            >
              <Palette className="w-4 h-4" />
            </button>
          </div>

          {/* Custom Color Picker */}
          {showColorPicker && (
            <div className="mt-4 flex items-center gap-2">
              <Input
                type="color"
                id="custom-color"
                value={localFormData.color}
                onChange={(e) => handleLocalInputChange('color', e.target.value)}
                className="w-12 h-12 p-0 border rounded-md cursor-pointer"
                title="Choose custom color"
              />
              <Input
                type="text"
                value={localFormData.color}
                onChange={(e) => handleLocalInputChange('color', e.target.value)}
                placeholder="#RRGGBB"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowColorPicker(false)}
                title="Close custom color picker"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: localFormData.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Selected: {localFormData.color}
            </span>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
            type="button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !localFormData.title.trim()}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Processing...' : isUpdate ? 'Update Category' : 'Create Category'}
          </Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Categories Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your lead categories efficiently
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Create Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Category
                </DialogTitle>
              </DialogHeader>
              <CategoryForm
                initialData={{ title: '', description: '', color: '#4ecdc4' }}
                onSubmit={createCategory}
                onClose={() => setIsCreateOpen(false)}
                isLoading={loading}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories Grid */}
        {loading && categories.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Categories Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by creating your first category
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Category
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => {
              const isDescriptionLong = category.description.length > DESCRIPTION_TRUNCATE_LENGTH;
              const isExpanded = expandedDescriptionId === category._id;

              return (
                <Card key={category._id} className="group hover:shadow-lg transition-all duration-300 border-l-4 dark:bg-gray-800" style={{ borderLeftColor: category.color }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {category.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="-mt-4">
                    <p className={`text-gray-600 dark:text-gray-400 text-sm mb-3 ${!isExpanded && 'line-clamp-2'}`}>
                      {isExpanded ? category.description : category.description.substring(0, DESCRIPTION_TRUNCATE_LENGTH) + (isDescriptionLong ? '...' : '')}
                    </p>
                    {isDescriptionLong && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => toggleDescriptionExpansion(category._id)}
                        className="p-0 h-auto text-blue-600 dark:text-blue-400 hover:no-underline "
                      >
                       <span className='text-sm/6'>
                         {isExpanded ? 'See Less' : 'See More'}
                        </span>
                      </Button>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Update Dialog */}
        <Dialog open={isUpdateOpen} onOpenChange={(open) => {
          setIsUpdateOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Update Category
              </DialogTitle>
            </DialogHeader>
            {selectedCategory && (
              <CategoryForm
                isUpdate={true}
                initialData={{
                  title: selectedCategory.title,
                  description: selectedCategory.description,
                  color: selectedCategory.color,
                }}
                onSubmit={updateCategory}
                onClose={() => setIsUpdateOpen(false)}
                isLoading={loading}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Delete Category
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the category "{selectedCategory?.title}"?
                This action cannot be undone and may affect related leads.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteCategory}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}