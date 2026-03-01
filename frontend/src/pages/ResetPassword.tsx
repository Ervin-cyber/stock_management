import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Logo from '@/components/Logo';

const schema = z.object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "The passwords don't match!",
    path: ["confirmPassword"],
});

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: { newPassword: '', confirmPassword: '' }
    });

    const onSubmit = async (values: z.infer<typeof schema>) => {
        if (!token) {
            toast.error('Invalid or missing reset token!');
            return;
        }

        try {
            setIsLoading(true);
            await resetPassword({ token, newPassword: values.newPassword });
            
            setIsSuccess(true);
            toast.success('Password reset successfully!');
            

            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (error) {
            toast.error('Failed to reset password. The link might be expired.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token && !isSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center space-y-4">
                    <h2 className="text-xl font-bold text-rose-600">Invalid Link</h2>
                    <p className="text-sm text-slate-600">This password reset link is invalid or missing the token.</p>
                    <Button asChild className="w-full mt-4"><Link to="/login">Go to Login</Link></Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    <Logo />
                    <h2 className="text-2xl font-bold text-slate-900 mt-4">Create New Password</h2>
                    <p className="text-sm text-slate-500">Please enter your new password below.</p>
                </div>

                {isSuccess ? (
                    <div className="text-center space-y-4 py-4">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900">All done!</h3>
                        <p className="text-sm text-slate-600">Your password has been changed successfully. Redirecting to login...</p>
                        <Button asChild className="w-full mt-4" variant="outline">
                            <Link to="/login">Log in now</Link>
                        </Button>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            
                            {/* ÚJ JELSZÓ */}
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="pr-10" {...field} />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" className="pr-10" {...field} />
                                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : 'Reset Password'}
                            </Button>
                        </form>
                    </Form>
                )}
            </div>
        </div>
    );
}