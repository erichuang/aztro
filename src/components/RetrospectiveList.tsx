import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Users, Clock } from 'lucide-react';
import { getRetrospectives } from '@/lib/api';
import { getUserInitials } from '@/lib/auth';
import { TEMPLATE_CONFIGS } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import CreateRetrospectiveModal from './CreateRetrospectiveModal';
import Header from './Header';

const RetrospectiveList: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: retrospectives = [], isLoading, refetch } = useQuery({
    queryKey: ['retrospectives'],
    queryFn: getRetrospectives,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Retrospectives</h1>
            <p className="text-muted-foreground mt-2">
              Collaborate with your team to reflect and improve
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Retrospective
          </Button>
        </div>

        {retrospectives.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No retrospectives yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first retrospective to start collaborating with your team
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Retrospective
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {retrospectives.map((retrospective) => (
              <Card
                key={retrospective.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => window.location.href = `/retrospective/${retrospective.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{retrospective.title}</CardTitle>
                      <CardDescription>
                        {TEMPLATE_CONFIGS[retrospective.templateType].name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(retrospective.updatedAt)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {retrospective.participants.length} participants
                      </span>
                    </div>
                    <div className="flex -space-x-2">
                      {retrospective.participants.slice(0, 3).map((participant) => (
                        <Avatar
                          key={participant.id}
                          className="w-8 h-8 border-2 border-background"
                        >
                          <AvatarFallback
                            style={{ backgroundColor: participant.color }}
                            className="text-xs font-medium text-black"
                          >
                            {getUserInitials(participant.name)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {retrospective.participants.length > 3 && (
                        <div className="w-8 h-8 bg-muted border-2 border-background rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-muted-foreground">
                            +{retrospective.participants.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateRetrospectiveModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          refetch();
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
};

export default RetrospectiveList;
