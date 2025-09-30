import React, { useState, useEffect } from 'react';
import { Subject, AITool } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Plus, Edit2, Trash2, Save, MessageCircle, Upload, Star, User, Users } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useLanguage } from '../contexts/LanguageContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { AdminManagement } from './AdminManagement';

interface CMSPanelProps {
  subjects: Subject[];
  aiTools: AITool[];
  onRefresh: () => void;
}

interface ToolFormData {
  subject_id: string;
  name: string;
  description: string;
  advantages: string;
  disadvantages: string;
  image_url: string;
  link_url: string;
}

interface Review {
  id: string;
  tool_id: string;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count: number;
}

interface Upload {
  id: string;
  tool_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  author_name: string;
  created_at: string;
}

export function CMSPanel({ subjects, aiTools, onRefresh }: CMSPanelProps) {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<AITool | null>(null);
  const [formData, setFormData] = useState<ToolFormData>({
    subject_id: '',
    name: '',
    description: '',
    advantages: '',
    disadvantages: '',
    image_url: '',
    link_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [activeTab, setActiveTab] = useState('tools');

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-291b20a9`;

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
    } else if (activeTab === 'uploads') {
      fetchUploads();
    }
  }, [activeTab]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${apiUrl}/reviews`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchUploads = async () => {
    try {
      const response = await fetch(`${apiUrl}/uploads`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      setUploads(data.uploads || []);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      subject_id: '',
      name: '',
      description: '',
      advantages: '',
      disadvantages: '',
      image_url: '',
      link_url: ''
    });
    setEditingTool(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (tool: AITool) => {
    setEditingTool(tool);
    setFormData({
      subject_id: tool.subject_id,
      name: tool.name,
      description: tool.description,
      advantages: tool.advantages.join('\n'),
      disadvantages: tool.disadvantages.join('\n'),
      image_url: tool.image_url,
      link_url: tool.link_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleChange = (field: keyof ToolFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.subject_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        subject_id: formData.subject_id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        advantages: formData.advantages.split('\n').filter(a => a.trim()).map(a => a.trim()),
        disadvantages: formData.disadvantages.split('\n').filter(d => d.trim()).map(d => d.trim()),
        image_url: formData.image_url.trim(),
        link_url: formData.link_url.trim()
      };

      const url = editingTool 
        ? `${apiUrl}/ai-tools/${editingTool.id}`
        : `${apiUrl}/ai-tools`;
      
      const method = editingTool ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingTool ? 'Tool updated successfully!' : 'Tool created successfully!');
        setIsDialogOpen(false);
        resetForm();
        onRefresh();
      } else {
        toast.error(data.error || 'Failed to save tool');
      }
    } catch (error) {
      console.error('Error saving tool:', error);
      toast.error('Failed to save tool. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (toolId: string) => {
    if (!confirm(t('cms.confirmDelete'))) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/ai-tools/${toolId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        toast.success('Tool deleted successfully!');
        onRefresh();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete tool');
      }
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast.error('Failed to delete tool. Please try again.');
    }
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || subjectId;
  };

  const getToolName = (toolId: string) => {
    const tool = aiTools.find(t => t.id === toolId);
    return tool?.name || 'Unknown Tool';
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm(t('cms.confirmDelete'))) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        toast.success(t('cms.deleteSuccess'));
        fetchReviews(); // Refresh the reviews list
      } else {
        const data = await response.json();
        toast.error(data.error || t('cms.deleteFailed'));
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(t('cms.deleteFailed'));
    }
  };

  const handleDeleteUpload = async (uploadId: string) => {
    if (!confirm(t('cms.confirmDelete'))) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/uploads/${uploadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        toast.success(t('cms.deleteSuccess'));
        fetchUploads(); // Refresh the uploads list
      } else {
        const data = await response.json();
        toast.error(data.error || t('cms.deleteFailed'));
      }
    } catch (error) {
      console.error('Error deleting upload:', error);
      toast.error(t('cms.deleteFailed'));
    }
  };

  const toolsBySubject = subjects.map(subject => ({
    subject,
    tools: aiTools.filter(tool => tool.subject_id === subject.id)
  }));

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">{t('cms.title')}</h2>
          <p className="text-glu-gray text-lg">
            Manage AI tools, reviews, and student uploads for GLU
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="bg-glu-orange text-white hover:bg-glu-orange/90">
                <Plus size={16} className="mr-2" />
                {t('cms.add')} Tool
              </Button>
            </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTool ? t('cms.edit') : t('cms.add')} AI Tool
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={formData.subject_id} onValueChange={(value) => handleChange('subject_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">{t('common.name')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., ChatGPT, Figma AI"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('common.description')} *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe what this AI tool does and how it helps students..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image_url">{t('common.image')} URL (optional)</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => handleChange('image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="link_url">AI Tool Website URL (optional)</Label>
                  <Input
                    id="link_url"
                    value={formData.link_url}
                    onChange={(e) => handleChange('link_url', e.target.value)}
                    placeholder="https://chatgpt.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="advantages">{t('tools.advantages')} (one per line)</Label>
                  <Textarea
                    id="advantages"
                    value={formData.advantages}
                    onChange={(e) => handleChange('advantages', e.target.value)}
                    placeholder={`Easy to use interface\nFast processing\nSupports multiple formats`}
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="disadvantages">{t('tools.disadvantages')} (one per line)</Label>
                  <Textarea
                    id="disadvantages"
                    value={formData.disadvantages}
                    onChange={(e) => handleChange('disadvantages', e.target.value)}
                    placeholder={`Requires subscription\nLimited free tier\nLearning curve`}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t('cms.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-glu-green text-white hover:bg-glu-green/90"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save size={16} />
                      <span>{editingTool ? 'Update' : 'Create'} Tool</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-5 bg-glu-light">
          <TabsTrigger value="tools" className="data-[state=active]:bg-glu-orange data-[state=active]:text-white">
            {t('cms.tools')}
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-glu-green data-[state=active]:text-white">
            {t('cms.reviews')}
          </TabsTrigger>
          <TabsTrigger value="uploads" className="data-[state=active]:bg-glu-orange data-[state=active]:text-white">
            {t('cms.uploads')}
          </TabsTrigger>
          <TabsTrigger value="admins" className="data-[state=active]:bg-glu-green data-[state=active]:text-white">
            {t('cms.admins')}
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-glu-orange data-[state=active]:text-white">
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-8">
          {/* Tools by Subject */}
          {toolsBySubject.map(({ subject, tools }) => (
            <Card key={subject.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{subject.name}</span>
                    <Badge className="bg-glu-orange text-white">{tools.length} tools</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tools.length > 0 ? (
                  <div className="space-y-4">
                    {tools.map((tool) => (
                      <div key={tool.id} className="flex items-center justify-between p-4 bg-glu-light">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{tool.name}</h4>
                          <p className="text-glu-gray text-sm line-clamp-2 mt-1">{tool.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-glu-gray">
                            <span>{tool.advantages.length} advantages</span>
                            <span>{tool.disadvantages.length} considerations</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(tool)}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(tool.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-glu-gray">
                    <p>No AI tools added for {subject.name} yet.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        resetForm();
                        setFormData(prev => ({ ...prev, subject_id: subject.id }));
                        setIsDialogOpen(true);
                      }}
                      className="mt-2"
                    >
                      <Plus size={14} className="mr-1" />
                      Add First Tool
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="text-glu-green" size={24} />
                <span>Student Reviews ({reviews.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-l-4 border-glu-green pl-4 py-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-glu-light flex items-center justify-center">
                            <User size={16} className="text-glu-gray" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{review.author_name}</p>
                            <div className="flex items-center space-x-2">
                              {renderStars(review.rating)}
                              <span className="text-sm text-glu-gray">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{getToolName(review.tool_id)}</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      <p className="text-sm text-glu-gray mt-2">
                        {review.helpful_count || 0} people found this helpful
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-glu-gray">
                  <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No reviews yet. Students will be able to leave reviews on AI tools.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uploads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="text-glu-orange" size={24} />
                <span>Student Uploads ({uploads.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uploads.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uploads.map((upload) => (
                    <div key={upload.id} className="bg-glu-light p-4 relative">
                      <div className="absolute top-2 right-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUpload(upload.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2 mb-3 pr-10">
                        <Upload size={16} className="text-glu-orange" />
                        <p className="font-medium text-gray-900 truncate">{upload.file_name}</p>
                      </div>
                      <p className="text-sm text-glu-gray mb-2">by {upload.author_name}</p>
                      <Badge variant="outline" className="mb-2">{getToolName(upload.tool_id)}</Badge>
                      <p className="text-xs text-glu-gray">
                        {new Date(upload.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-glu-gray">
                  <Upload size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No uploads yet. Students will be able to upload their work created with AI tools.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-6">
          <AdminManagement />
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-glu-orange mb-2">{subjects.length}</div>
                <p className="text-glu-gray">{t('cms.subjects')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-glu-green mb-2">{aiTools.length}</div>
                <p className="text-glu-gray">{t('cms.tools')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-glu-orange mb-2">{reviews.length}</div>
                <p className="text-glu-gray">{t('cms.reviews')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-glu-green mb-2">{uploads.length}</div>
                <p className="text-glu-gray">{t('cms.uploads')}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}