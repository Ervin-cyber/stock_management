import { useUsers, useUserMutations } from '../hooks/useUsers';
import { useAuthStore } from '@/store/authStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function UsersTable() {
    const { data: users, isLoading } = useUsers();
    const { updateUser, isUpdating } = useUserMutations();

    const currentUser = useAuthStore(state => state.user);

    if (isLoading) return <div>Loading users...</div>;

    const handleRoleChange = (userId: string, newRole: string) => {
        updateUser({ id: userId, data: { role: newRole } });
    };

    const handleStatusChange = (userId: string, newStatus: boolean) => {
        updateUser({ id: userId, data: { active: newStatus } });
    };

    return (
        <div className="rounded-md border bg-white shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users?.map((user: any) => {
                        const isMe = user.id === currentUser?.id;

                        return (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                    {user.name} {isMe && <Badge variant="outline">Me</Badge>}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>


                                <TableCell>
                                    <select
                                        className="border rounded p-1 text-sm"
                                        value={user.role}
                                        disabled={isMe || isUpdating}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    >
                                        <option value="ADMIN">Admin</option>
                                        <option value="MANAGER">Manager</option>
                                        <option value="VIEWER">Viewer</option>
                                    </select>
                                </TableCell>

                                <TableCell>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4"
                                            checked={user.active}
                                            disabled={isMe || isUpdating}
                                            onChange={(e) => handleStatusChange(user.id, e.target.checked)}
                                        />
                                        <span>
                                            {user.active ?
                                                <Badge className="bg-green-500">Active</Badge> :
                                                <Badge variant="destructive">Inactive</Badge>
                                            }
                                        </span>
                                    </label>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}