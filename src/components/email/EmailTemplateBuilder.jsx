import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Code } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EmailTemplateBuilder({ template, onSave, onCancel }) {
  const [formData, setFormData] = useState(template || {
    name: '',
    slug: '',
    subject: '',
    html_content: '',
    variables: [],
    category: 'transactional'
  });
  const [showPreview, setShowPreview] = useState(false);
  const [newVariable, setNewVariable] = useState('');

  const addVariable = () => {
    if (newVariable && !formData.variables.includes(newVariable)) {
      setFormData({
        ...formData,
        variables: [...formData.variables, newVariable]
      });
      setNewVariable('');
    }
  };

  const removeVariable = (variable) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter(v => v !== variable)
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
            Template Name
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Welcome Email"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
            Slug (unique identifier)
          </label>
          <Input
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="welcome_email"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
          Category
        </label>
        <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="transactional">Transactional</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="notification">Notification</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
          Subject Line
        </label>
        <Input
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Welcome to DishCore!"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
          Variables
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newVariable}
            onChange={(e) => setNewVariable(e.target.value)}
            placeholder="user_name"
            onKeyPress={(e) => e.key === 'Enter' && addVariable()}
          />
          <Button onClick={addVariable}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.variables?.map(variable => (
            <Badge key={variable} variant="outline" className="cursor-pointer"
              onClick={() => removeVariable(variable)}>
              {`{{${variable}}}`} ×
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            HTML Content
          </label>
          <Button size="sm" variant="outline" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <Code className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
        </div>
        {showPreview ? (
          <Card className="p-4" style={{ background: 'var(--background)' }}>
            <div dangerouslySetInnerHTML={{ __html: formData.html_content }} />
          </Card>
        ) : (
          <Textarea
            value={formData.html_content}
            onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
            rows={15}
            className="font-mono text-sm"
            placeholder="<html>...</html>"
          />
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={onCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)} className="flex-1 gradient-accent text-white border-0">
          Save Template
        </Button>
      </div>
    </div>
  );
}