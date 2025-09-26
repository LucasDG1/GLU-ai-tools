import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Plus, Edit2, Trash2, Save, Users, Shield } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Admin {
  id: string;
  name: string;
  email: string;
  created_at: string;
  is_super_admin: boolean;
}

interface AdminFormData {
  name: string;
  email: string;
  password: string;
}

export function AdminManagement() {
  const { t } = useLanguage();
  const { currentAdmin } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-291b20a9`;

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${apiUrl}/admins`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      setAdmins(data.admins || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to fetch administrators');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: ''
    });
    setEditingAdmin(null);
  };

  const openCreateDialog = () => {
    // Only super admins can create new administrators
    if (!currentAdmin?.is_super_admin) {
      toast.error(t('admin.onlySuperAdmin'));
      return;
    }
    
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (admin: Admin) => {
    // Check permissions: non-super admins can only edit themselves
    if (!currentAdmin?.is_super_admin && admin.id !== currentAdmin?.id) {
      toast.error(t('admin.onlyOwnAccount'));
      return;
    }
    
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '' // Don't prefill password for security
    });
    setIsDialogOpen(true);
  };

  const handleChange = (field: keyof AdminFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    if (!editingAdmin && !formData.password.trim()) {
      toast.error('Password is required for new administrators');
      return;
    }

    // Additional permission check for editing
    if (editingAdmin && !currentAdmin?.is_super_admin && editingAdmin.id !== currentAdmin?.id) {
      toast.error(t('admin.onlyOwnAccount'));
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: {
        name: string;
        email: string;
        password?: string;
      } = {
        name: formData.name.trim(),
        email: formData.email.trim()
      };

      // Only include password if it's provided
      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      const url = editingAdmin 
        ? `${apiUrl}/admins/${editingAdmin.id}`
        : `${apiUrl}/admins`;
      
      const method = editingAdmin ? 'PUT' : 'POST';

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
        toast.success(editingAdmin ? 'Administrator updated successfully!' : 'Administrator created successfully!');
        setIsDialogOpen(false);
        resetForm();
        fetchAdmins();
      } else {
        toast.error(data.error || 'Failed to save administrator');
      }
    } catch (error) {
      console.error('Error saving administrator:', error);
      toast.error('Failed to save administrator. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (adminId: string) => {
    const admin = admins.find(a => a.id === adminId);
    if (!admin) return;

    // Only super admins can delete other admins
    if (!currentAdmin?.is_super_admin) {
      toast.error(t('admin.onlyDeleteSuper'));
      return;
    }

    if (admin.is_super_admin) {
      toast.error(t('admin.cannotDelete'));
      return;
    }

    if (!confirm(t('cms.confirmDelete'))) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t('cms.deleteSuccess'));
        fetchAdmins();
      } else {
        toast.error(data.error || t('cms.deleteFailed'));
      }
    } catch (error) {
      console.error('Error deleting administrator:', error);
      toast.error(t('cms.deleteFailed'));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-glu-orange mx-auto mb-4"></div>
        <p className="text-glu-gray">{t('common.loading')}</p>
      </div>
    );
  }

  // Helper function to check if user can perform actions
  const canCreateAdmin = currentAdmin?.is_super_admin;
  const canEditAdmin = (admin: Admin) => currentAdmin?.is_super_admin || admin.id === currentAdmin?.id;
  const canDeleteAdmin = (admin: Admin) => currentAdmin?.is_super_admin && !admin.is_super_admin && admin.id !== currentAdmin?.id;

  return (
    <div className="space-y-6">
      {/* Permission Info Panel */}
      {!currentAdmin?.is_super_admin && (
        <Card className="border-glu-orange bg-gradient-to-r from-orange-50 to-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="text-glu-orange" size={20} />
              <div>
                <p className="font-medium text-gray-900">Limited Access</p>
                <p className="text-sm text-glu-gray">You can only view and edit your own account information.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="text-glu-green" size={24} />
              <span>{t('admin.title')} ({admins.length})</span>
            </CardTitle>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={openCreateDialog} 
                  disabled={!canCreateAdmin}
                  className="bg-glu-orange text-white hover:bg-glu-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!canCreateAdmin ? t('admin.onlySuperAdmin') : ''}
                >
                  <Plus size={16} className="mr-2" />
                  {t('admin.addAdmin')}
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingAdmin ? t('admin.editAdmin') : t('admin.addAdmin')}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('admin.name')} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Admin Name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('admin.email')} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="admin@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {t('admin.password')} {editingAdmin ? '(leave blank to keep current)' : '*'}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder={editingAdmin ? "Enter new password" : "Password"}
                      required={!editingAdmin}
                    />
                    {editingAdmin && editingAdmin.id === currentAdmin?.id && (
                      <p className="text-xs text-glu-gray">
                        You are editing your own account
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
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
                          <span>{editingAdmin ? 'Update' : 'Create'}</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {admins.length > 0 ? (
            <div className="space-y-4">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 bg-glu-light border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-glu-orange text-white flex items-center justify-center">
                      <Users size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <span>{admin.name}</span>
                        {admin.id === currentAdmin?.id && (
                          <Badge className="bg-blue-500 text-white">
                            You
                          </Badge>
                        )}
                        {admin.is_super_admin && (
                          <Badge className="bg-glu-green text-white">
                            <Shield size={12} className="mr-1" />
                            {t('admin.superAdmin')}
                          </Badge>
                        )}
                      </h4>
                      <p className="text-glu-gray text-sm">{admin.email}</p>
                      <p className="text-xs text-glu-gray">
                        {t('admin.created')}: {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(admin)}
                      disabled={!canEditAdmin(admin)}
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!canEditAdmin(admin) ? t('admin.onlyOwnAccount') : ''}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(admin.id)}
                      disabled={!canDeleteAdmin(admin)}
                      title={!canDeleteAdmin(admin) ? (admin.is_super_admin ? t('admin.cannotDelete') : t('admin.onlyDeleteSuper')) : ''}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-glu-gray">
              <Users size={48} className="mx-auto mb-3 opacity-50" />
              <p>{t('admin.noAdmins')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}