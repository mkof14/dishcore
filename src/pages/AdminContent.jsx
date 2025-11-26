import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Utensils, Users, FileText, Trash2, Eye, ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminContent() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: dishes } = useQuery({
    queryKey: ['admin-dishes', searchQuery],
    queryFn: async () => {
      const all = await base44.entities.Dish.list();
      return searchQuery 
        ? all.filter(d => d.name?.toLowerCase().includes(searchQuery.toLowerCase()))
        : all;
    },
  });

  const { data: sharedContent } = useQuery({
    queryKey: ['admin-shared-content'],
    queryFn: () => base44.entities.SharedContent.list('-created_date', 50),
  });

  const { data: forumTopics } = useQuery({
    queryKey: ['admin-forum-topics'],
    queryFn: () => base44.entities.ForumTopic.list('-created_date', 50),
  });

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Content Management
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Manage recipes, posts, and user content
            </p>
          </div>
          <Link to={createPageUrl('Admin')}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="dishes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dishes">Recipes ({dishes?.length || 0})</TabsTrigger>
            <TabsTrigger value="shared">Shared Content ({sharedContent?.length || 0})</TabsTrigger>
            <TabsTrigger value="forum">Forum Topics ({forumTopics?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="dishes" className="space-y-4">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Recipe Library
                </h3>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" 
                    style={{ color: 'var(--text-muted)' }} />
                  <Input
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {dishes?.slice(0, 20).map((dish) => (
                  <div
                    key={dish.id}
                    className="p-4 rounded-2xl flex items-center justify-between"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-orange-400 to-pink-500">
                        {dish.image_url ? (
                          <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Utensils className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {dish.name}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                            {dish.calories} kcal
                          </Badge>
                          {dish.is_custom && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                              Custom
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="shared" className="space-y-4">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                Shared Content
              </h3>
              <div className="space-y-2">
                {sharedContent?.map((content) => (
                  <div
                    key={content.id}
                    className="p-4 rounded-2xl flex items-center justify-between"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="w-8 h-8 text-blue-400" />
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {content.title}
                        </p>
                        <div className="flex gap-2 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span>{content.content_type}</span>
                          <span>•</span>
                          <span>{content.views} views</span>
                          <span>•</span>
                          <span>{content.likes} likes</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="forum" className="space-y-4">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                Forum Topics
              </h3>
              <div className="space-y-2">
                {forumTopics?.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-4 rounded-2xl flex items-center justify-between"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-4">
                      <Users className="w-8 h-8 text-purple-400" />
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {topic.title}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                            {topic.category}
                          </Badge>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {topic.views} views • {topic.replies_count} replies
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}