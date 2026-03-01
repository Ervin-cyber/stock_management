import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/api/axios';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address format." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            setServerError(null);
            const response = await api.post('/auth/login', data);

            const { token, user } = response.data;
            setAuth(token, user);

            navigate('/');
        } catch (error: any) {
            const errorMessage = error.response?.data?.error?.message || "Unexpected server error occurred.";
            setServerError(errorMessage);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
            <Card className="w-100 shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <Logo />
                    <CardDescription>
                        Log in to the warehouse management system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {serverError && (
                                <div className="text-sm font-medium text-destructive (text-red-500) text-center">
                                    {serverError}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? "Please wait..." : "Sign in"}
                            </Button>
                        </form>
                    </Form>
                    <div className="text-center text-sm text-slate-600 mt-4">
                        Don't have an account yet?{' '}
                        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
                            Register here!
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}