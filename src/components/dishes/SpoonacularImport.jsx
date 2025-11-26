import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Download, Loader2, Check, Database, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function SpoonacularImport({ open, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const queryClient = useQueryClient();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Enter a search query");
      return;
    }

    setIsSearching(true);
    try {
      const response = await base44.functions.invoke('spoonacularRecipes', {
        action: 'search',
        query: searchQuery,
        number: 20
      });

      setSearchResults(response.data.recipes || []);
      setTotalResults(response.data.totalResults || 0);
      toast.success(`Found ${response.data.recipes?.length || 0} recipes`);
    } catch (error) {
      toast.error("Search failed");
      console.error(error);
    }
    setIsSearching(false);
  };

  const toggleRecipe = (recipeId) => {
    setSelectedRecipes(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const handleImport = async () => {
    if (selectedRecipes.length === 0) {
      toast.error("Select at least one recipe");
      return;
    }

    setIsImporting(true);
    try {
      const response = await base44.functions.invoke('spoonacularRecipes', {
        action: 'bulk_import',
        recipeIds: selectedRecipes
      });

      toast.success(`Imported ${response.data.imported} recipes!`);
      queryClient.invalidateQueries(['dishes']);
      setSelectedRecipes([]);
      onClose();
    } catch (error) {
      toast.error("Import failed");
      console.error(error);
    }
    setIsImporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-soft)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Database className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            Import from Spoonacular
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Bar */}
          <div className="flex gap-3">
            <Input
              placeholder="Search recipes (e.g., pasta, chicken, vegan dessert)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
              style={{
                background: 'var(--bg-surface-alt)',
                borderColor: 'var(--border-soft)',
                color: 'var(--text-primary)'
              }}
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="gradient-accent text-white border-0"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Import Actions */}
          {searchResults.length > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: 'var(--bg-surface-alt)', borderColor: 'var(--border-soft)', border: '1px solid' }}>
              <div className="flex items-center gap-4">
                <p style={{ color: 'var(--text-secondary)' }}>
                  Found: <strong style={{ color: 'var(--text-primary)' }}>{totalResults}</strong> recipes
                </p>
                <Badge className="gradient-accent text-white border-0">
                  Selected: {selectedRecipes.length}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedRecipes(searchResults.map(r => r.id))}
                  style={{ borderColor: 'var(--border-soft)' }}
                >
                  Select All
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={isImporting || selectedRecipes.length === 0}
                  className="gradient-accent text-white border-0"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Import {selectedRecipes.length}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Search Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((recipe) => (
              <Card
                key={recipe.id}
                className="p-4 cursor-pointer transition-all hover:scale-[1.02]"
                style={{
                  background: selectedRecipes.includes(recipe.id)
                    ? 'var(--bg-surface-alt)'
                    : 'var(--bg-page)',
                  border: selectedRecipes.includes(recipe.id)
                    ? '2px solid var(--accent-from)'
                    : '1px solid var(--border-soft)'
                }}
                onClick={() => toggleRecipe(recipe.id)}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Checkbox
                      checked={selectedRecipes.includes(recipe.id)}
                      onCheckedChange={() => toggleRecipe(recipe.id)}
                      className="mt-1"
                    />
                  </div>
                  
                  {recipe.image && (
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {recipe.title}
                    </h4>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {recipe.cuisines?.slice(0, 2).map(cuisine => (
                        <Badge key={cuisine} className="text-xs"
                          style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA' }}>
                          {cuisine}
                        </Badge>
                      ))}
                      {recipe.dishTypes?.slice(0, 2).map(type => (
                        <Badge key={type} className="text-xs"
                          style={{ background: 'rgba(251, 146, 60, 0.2)', color: '#FB923C' }}>
                          {type}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <div>⏱️ {recipe.readyInMinutes} min</div>
                      <div>🍽️ {recipe.servings} servings</div>
                    </div>
                    
                    {selectedRecipes.includes(recipe.id) && (
                      <div className="mt-2 flex items-center gap-1 text-xs"
                        style={{ color: 'var(--accent-from)' }}>
                        <Check className="w-3 h-3" />
                        Selected for import
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {searchResults.length === 0 && !isSearching && (
            <div className="text-center py-12">
              <Database className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Search Recipes
              </h3>
              <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
                Find and import recipes from Spoonacular database
              </p>
              <a
                href="https://spoonacular.com/food-api"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm"
                style={{ color: 'var(--accent-from)' }}
              >
                About Spoonacular API
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}