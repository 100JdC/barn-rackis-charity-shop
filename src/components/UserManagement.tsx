
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { storage } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/types/item";

interface UserManagementProps {
  userRole: UserRole;
  onBack: () => void;
}

interface RegisteredUser {
  id: string;
  username: string;
  role: string;
  registeredAt: string;
}

export const UserManagement = ({ userRole, onBack }: UserManagementProps) => {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userRole === 'admin') {
      loadUsers();
    }
  }, [userRole]);

  const loadUsers = async () => {
    try {
      const registeredUsers = await storage.getUsers();
      
      setUsers(registeredUsers.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        registeredAt: user.registeredAt
      })));
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (userRole !== 'admin') {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-600">Access denied. Admin privileges required.</p>
          <Button onClick={onBack} className="mt-4">
            Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Registered Users ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-4">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-center py-4 text-gray-600">No registered users found</p>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-gray-600">
                    Registered: {new Date(user.registeredAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">
                    {user.role}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
