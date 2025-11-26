import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ShoppingCart, Sparkles, ArrowLeft, CheckCircle2, Share2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import GenerateGroceryDialog from "../components/grocery/GenerateGroceryDialog";

const CATEGORIES = [
  { id: 'produce', name: '🥬 Produce', color: 'text-green-600' },
  { id: 'meat_seafood', name: '🍗 Meat & Seafood', color: 'text-red-500' },
  { id: 'dairy_eggs', name: '🥛 Dairy & Eggs', color: 'text-blue-500' },
  { id: 'bakery', name: '🍞 Bakery', color: 'text-amber-600' },
  { id: 'pantry_staples', name: '🏺 Pantry Staples', color: 'text-orange-600' },
  { id: 'frozen', name: '❄️ Frozen', color: 'text-cyan-500' },
  { id: 'beverages', name: '🥤 Beverages', color: 'text-purple-500' },
  { id: 'condiments_sauces', name: '🧂 Condiments & Sauces', color: 'text-yellow-600' },
  { id: 'snacks', name: '🍪 Snacks', color: 'text-pink-500' },
  { id: 'other', name: '📦 Other', color: 'text-gray-600' }
];

export default function GroceryList() {
  const [newItem, setNewItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('produce');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const queryClient = useQueryClient();

  // Check if coming from meal plan
  const urlParams = new URLSearchParams(window.location.search);
  const planIdFromUrl = urlParams.get('plan');

  const { data: lists = [] } = useQuery({
    queryKey: ['groceryLists'],
    queryFn: () => base44.entities.GroceryList.list('-created_date'),
  });

  const { data: mealPlan } = useQuery({
    queryKey: ['mealPlan', planIdFromUrl],
    queryFn: async () => {
      if (!planIdFromUrl) return null;
      const plans = await base44.entities.MealPlan.list();
      return plans.find(p => p.id === planIdFromUrl);
    },
    enabled: !!planIdFromUrl,
  });

  const activeList = lists[0];

  // Auto-generate list from meal plan
  React.useEffect(() => {
    if (mealPlan && !activeList) {
      generateFromMealPlan();
    }
  }, [mealPlan]);

  const generateFromMealPlan = async () => {
    if (!mealPlan) return;

    const ingredientMap = {};
    
    for (const day of mealPlan.days) {
      for (const meal of day.meals || []) {
        // Fetch dish details to get ingredients
        try {
          const dishes = await base44.entities.Dish.list();
          const dish = dishes.find(d => d.id === meal.dish_id);
          
          if (dish?.ingredients) {
            dish.ingredients.forEach(ing => {
              const key = ing.name.toLowerCase();
              if (ingredientMap[key]) {
                ingredientMap[key].quantity += ` + ${ing.amount}`;
              } else {
                ingredientMap[key] = {
                  name: ing.name,
                  quantity: `${ing.amount} ${ing.unit || ''}`,
                  category: categorizeIngredient(ing.name)
                };
              }
            });
          }
        } catch (error) {
          console.error('Error fetching dish:', error);
        }
      }
    }

    const items = Object.values(ingredientMap).map(item => ({
      ...item,
      checked: false
    }));

    createListMutation.mutate({
      name: `Shopping for ${mealPlan.name}`,
      meal_plan_id: mealPlan.id,
      items
    });
  };

  const categorizeIngredient = (name) => {
    const lower = name.toLowerCase();
    if (lower.match(/chicken|beef|pork|fish|salmon|shrimp|turkey/)) return 'meat_seafood';
    if (lower.match(/milk|cheese|yogurt|cream|butter|egg/)) return 'dairy_eggs';
    if (lower.match(/bread|flour|rice|pasta|cereal/)) return 'bakery';
    if (lower.match(/lettuce|tomato|carrot|onion|pepper|spinach|broccoli|fruit/)) return 'produce';
    if (lower.match(/salt|sugar|oil|sauce|spice|vinegar/)) return 'condiments_sauces';
    if (lower.match(/frozen/)) return 'frozen';
    if (lower.match(/juice|soda|water|coffee|tea/)) return 'beverages';
    return 'pantry_staples';
  };

  const createListMutation = useMutation({
    mutationFn: (data) => base44.entities.GroceryList.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['groceryLists']);
      toast.success('List created!');
    },
  });

  const updateListMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GroceryList.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['groceryLists']);
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: (id) => base44.entities.GroceryList.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['groceryLists']);
      toast.success('List deleted!');
    },
  });

  const addItem = () => {
    if (!newItem.trim()) return;

    if (!activeList) {
      createListMutation.mutate({
        name: 'My Grocery List',
        items: [{
          name: newItem,
          quantity: '1',
          category: selectedCategory,
          checked: false
        }]
      });
    } else {
      const updatedItems = [
        ...activeList.items,
        {
          name: newItem,
          quantity: '1',
          category: selectedCategory,
          checked: false
        }
      ];
      updateListMutation.mutate({
        id: activeList.id,
        data: { ...activeList, items: updatedItems }
      });
    }

    setNewItem('');
  };

  const toggleItem = (index) => {
    if (!activeList) return;
    
    const updatedItems = [...activeList.items];
    updatedItems[index] = {
      ...updatedItems[index],
      checked: !updatedItems[index].checked
    };

    updateListMutation.mutate({
      id: activeList.id,
      data: { ...activeList, items: updatedItems }
    });
  };

  const removeItem = (index) => {
    if (!activeList) return;
    
    const updatedItems = activeList.items.filter((_, i) => i !== index);
    updateListMutation.mutate({
      id: activeList.id,
      data: { ...activeList, items: updatedItems }
    });
  };

  const shareList = async () => {
    if (!activeList) return;

    const checkedItems = activeList.items.filter(i => i.checked);
    const uncheckedItems = activeList.items.filter(i => !i.checked);
    
    let text = `🛒 ${activeList.name}\n\n`;
    
    if (uncheckedItems.length > 0) {
      text += '📋 To Buy:\n';
      uncheckedItems.forEach(item => {
        text += `☐ ${item.name} - ${item.quantity}\n`;
      });
      text += '\n';
    }
    
    if (checkedItems.length > 0) {
      text += '✅ Completed:\n';
      checkedItems.forEach(item => {
        text += `☑ ${item.name} - ${item.quantity}\n`;
      });
    }
    
    text += '\n🍽️ Created with DishCore';

    if (navigator.share) {
      try {
        await navigator.share({
          title: activeList.name,
          text: text,
        });
        toast.success('List shared!');
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(text);
        }
      }
    } else {
      copyToClipboard(text);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('List copied to clipboard!');
  };

  const itemsByCategory = activeList?.items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {}) || {};

  const checkedCount = activeList?.items.filter(item => item.checked).length || 0;
  const totalCount = activeList?.items.length || 0;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = createPageUrl('Dashboard')}
              className="w-12 h-12 rounded-2xl btn-secondary flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Smart Grocery List
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                AI-powered shopping assistant
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowGenerateDialog(true)}
              className="gradient-accent text-white border-0"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate from Recipes
            </Button>
            {activeList && (
              <>
                <Button
                  onClick={shareList}
                  variant="outline"
                  className="btn-secondary"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={() => deleteListMutation.mutate(activeList.id)}
                  variant="outline"
                  className="btn-secondary"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Progress */}
        {activeList && totalCount > 0 && (
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Shopping Progress
                </h3>
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {checkedCount} of {totalCount} items
              </span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--background)' }}>
              <div
                className="h-full gradient-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            {checkedCount === totalCount && totalCount > 0 && (
              <p className="mt-3 text-sm font-medium text-center" style={{ color: 'var(--accent-from)' }}>
                🎉 Shopping complete! Great job!
              </p>
            )}
          </Card>
        )}

        {/* Add Item */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Add Manual Item
          </h3>
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-xl"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)'
              }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              placeholder="Add item..."
              className="flex-1"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            />
            <Button
              onClick={addItem}
              className="gradient-accent text-white border-0"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Items by Category */}
        {!activeList || totalCount === 0 ? (
          <Card className="gradient-card border-0 p-12 rounded-3xl text-center">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--accent-from)' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Your list is empty
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
              Generate a smart list from recipes or add items manually
            </p>
            <Button
              onClick={() => setShowGenerateDialog(true)}
              className="gradient-accent text-white border-0"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Smart List
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {CATEGORIES.map(category => {
              const categoryItems = itemsByCategory[category.id] || [];
              if (categoryItems.length === 0) return null;

              const checkedInCategory = categoryItems.filter(i => i.checked).length;

              return (
                <Card key={category.id} className="gradient-card border-0 p-6 rounded-3xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${category.color}`}>
                      {category.name}
                    </h3>
                    <Badge variant="outline" style={{ borderColor: 'var(--border-soft)', color: 'var(--text-muted)' }}>
                      {checkedInCategory}/{categoryItems.length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {categoryItems.map((item, idx) => {
                      const globalIndex = activeList.items.findIndex(i => i === item);
                      return (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl transition-all"
                          style={{ 
                            background: item.checked ? 'var(--bg-page)' : 'var(--background)',
                            opacity: item.checked ? 0.7 : 1
                          }}>
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() => toggleItem(globalIndex)}
                          />
                          <div className="flex-1">
                            <p className={`font-medium ${item.checked ? 'line-through' : ''}`}
                              style={{ color: 'var(--text-primary)' }}>
                              {item.name}
                            </p>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                              {item.quantity}
                            </p>
                            {item.notes && (
                              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                💡 {item.notes}
                              </p>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeItem(globalIndex)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <GenerateGroceryDialog
        open={showGenerateDialog}
        onClose={() => setShowGenerateDialog(false)}
      />
    </div>
  );
}