import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, User, KeyRound } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { updateProfile } from '@/api/users.api';

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
}).refine(data => {
    if (data.newPassword && data.newPassword.length < 6) return false;
    return true;
}, { message: "New password must be at least 6 characters", path: ["newPassword"] })
    .refine(data => {
        if (data.newPassword && !data.currentPassword) return false;
        return true;
    }, { message: "Current password is required", path: ["currentPassword"] });


export default function Profile() {
    const [isLoading, setIsLoading] = useState(false);

    const user = useAuthStore((state) => state.user);
    const setAuth = useAuthStore((state) => state.setAuth);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            currentPassword: '',
            newPassword: ''
        }
    });

    const onSubmit = async (values: z.infer<typeof profileSchema>) => {
        try {
            setIsLoading(true);

            const payload: any = { name: values.name };
            if (values.currentPassword && values.newPassword) {
                payload.currentPassword = values.currentPassword;
                payload.newPassword = values.newPassword;
            }

            const response = await updateProfile(payload);

            setAuth(response.token, response.user);

            toast.success('Profile updated successfully!');

            form.setValue('currentPassword', '');
            form.setValue('newPassword', '');

        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to update profile.';
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <User className="h-6 w-6 text-slate-600" />
                        <div>
                            <CardTitle>My Profile</CardTitle>
                            <CardDescription>Update your personal information here.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Peter Parker" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input value={user?.email || ''} disabled className="bg-slate-50 text-slate-500" />
                                </FormControl>
                                <p className="text-[13px] text-slate-400">Email addresses cannot be changed.</p>
                            </FormItem>

                            <div className="pt-6 mt-6 border-t border-slate-200">
                                <h3 className="text-sm font-medium flex items-center gap-2 mb-4 text-slate-800">
                                    <KeyRound className="h-4 w-4 text-slate-500" />
                                    Change Password <span className="text-slate-400 font-normal">(Optional)</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}