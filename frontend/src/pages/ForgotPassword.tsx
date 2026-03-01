import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { forgotPassword } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2, KeyRound } from 'lucide-react';
import Logo from '@/components/Logo';

const schema = z.object({ email: z.string().email("Invalid email address") });

export default function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: { email: '' }
    });

    const onSubmit = async (values: z.infer<typeof schema>) => {
        try {
            setIsLoading(true);
            await forgotPassword(values.email);
            setIsSent(true);
            toast.success('Reset link sent to your email.');
        } catch (error) {
            toast.error('Failed to send reset link.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    <Logo />
                    <h2 className="text-2xl font-bold text-slate-900 mt-4">Reset Password</h2>
                    <p className="text-sm text-slate-500">Enter your email to receive a reset link.</p>
                </div>

                {isSent ? (
                    <div className="text-center space-y-4">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                            <KeyRound className="h-6 w-6 text-emerald-600" />
                        </div>
                        <p className="text-sm text-slate-600">Check your inbox! We've sent a password reset link to <span className="font-medium text-slate-900">{form.getValues('email')}</span>.</p>
                        <Button asChild className="w-full mt-4" variant="outline">
                            <Link to="/login">Back to Login</Link>
                        </Button>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email address</FormLabel>
                                        <FormControl><Input type="email" placeholder="peter@mail.com" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
                            </Button>
                        </form>
                    </Form>
                )}
                
                {!isSent && (
                    <div className="text-center text-sm text-slate-600">
                        Remember your password? <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">Log in</Link>
                    </div>
                )}
            </div>
        </div>
    );
}