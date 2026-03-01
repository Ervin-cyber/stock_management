import UsersTable from "@/components/UsersTable";
import { Users } from "lucide-react";

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <Users className="h-8 w-8 text-blue-600" />
                    User Management
                </h1>
                <p className="text-muted-foreground">
                    Here you can manage the accounts that have access to the system and their permissions.
                </p>
            </div>

            <UsersTable />
        </div>
    );
}