import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createRetrospective } from '@/lib/api';
import { TEMPLATE_CONFIGS, type TemplateType } from '@/types/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CreateRetrospectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateRetrospectiveModal: React.FC<CreateRetrospectiveModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);

  const createMutation = useMutation({
    mutationFn: createRetrospective,
    onSuccess: (data) => {
      onSuccess();
      setTitle('');
      setSelectedTemplate(null);
      // Navigate to the new retrospective
      window.location.href = `/retrospective/${data.id}`;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedTemplate) return;

    createMutation.mutate({
      title: title.trim(),
      templateType: selectedTemplate,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Retrospective</DialogTitle>
          <DialogDescription>
            Choose a template and give your retrospective a name to get started
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Retrospective Title</Label>
            <Input
              id="title"
              placeholder="e.g., Sprint 23 Retrospective"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Select Template</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(TEMPLATE_CONFIGS).map(([key, config]) => (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate === key
                      ? 'ring-2 ring-primary ring-offset-2'
                      : ''
                  }`}
                  onClick={() => setSelectedTemplate(key as TemplateType)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{config.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {config.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex flex-wrap gap-1">
                      {config.columns.map((column) => (
                        <div
                          key={column}
                          className="px-2 py-1 bg-muted rounded text-xs"
                        >
                          {column}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !selectedTemplate || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Retrospective'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRetrospectiveModal;
