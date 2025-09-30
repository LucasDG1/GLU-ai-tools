import React, { useState } from 'react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface BulkImportButtonProps {
  onImportComplete: () => void;
}

export function BulkImportButton({ onImportComplete }: BulkImportButtonProps) {
  const { t } = useLanguage();
  const [importing, setImporting] = useState(false);

  const handleBulkImport = async () => {
    try {
      setImporting(true);
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-291b20a9`;
      
      const response = await fetch(`${apiUrl}/bulk-import-tools`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${data.message} (${data.added} tools added)`);
        onImportComplete();
      } else {
        toast.error(data.error || 'Failed to import tools');
      }
    } catch (error) {
      console.error('Error importing tools:', error);
      toast.error('Failed to import tools');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Button 
      onClick={handleBulkImport}
      disabled={importing}
      className="bg-glu-green hover:bg-glu-green/90"
    >
      {importing ? 'Importing AI Tools...' : 'Import GLU AI Tools'}
    </Button>
  );
}