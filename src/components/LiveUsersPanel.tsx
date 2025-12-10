import { Monitor, Smartphone } from 'lucide-react';
import { useLiveUsers } from '@/hooks/useLiveUserCount';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const LiveUsersPanel = () => {
  const users = useLiveUsers();
  
  const desktopUsers = users.filter(u => u.device === 'desktop');
  const mobileUsers = users.filter(u => u.device === 'mobile');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          {users.length} étudiant{users.length > 1 ? 's' : ''} connecté{users.length > 1 ? 's' : ''} maintenant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun utilisateur connecté</p>
        ) : (
          <>
            {/* Desktop users */}
            {desktopUsers.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Monitor className="h-4 w-4" />
                  Desktop ({desktopUsers.length})
                </div>
                <ScrollArea className="max-h-32">
                  <div className="space-y-1">
                    {desktopUsers.map((user) => (
                      <div 
                        key={user.odliysfuq} 
                        className="flex items-center gap-2 text-sm py-1 px-2 rounded-md bg-muted/50"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Mobile users */}
            {mobileUsers.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Smartphone className="h-4 w-4" />
                  Mobile ({mobileUsers.length})
                </div>
                <ScrollArea className="max-h-32">
                  <div className="space-y-1">
                    {mobileUsers.map((user) => (
                      <div 
                        key={user.odliysfuq} 
                        className="flex items-center gap-2 text-sm py-1 px-2 rounded-md bg-muted/50"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveUsersPanel;
