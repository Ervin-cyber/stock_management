import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, MailCheck } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Register() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error(`The passwords don't match!`);
            return;
        }

        if (formData.password.length < 6) {
            toast.error('The password must be at least 6 characters long!');
            return;
        }

        try {
            setIsLoading(true);


            await registerUser({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            setIsSuccess(true);
            toast.success('Successful registration!');

        } catch (error: any) {
            const errorMessage = error.response?.data?.error?.message || 'An error occurred during registration.';
            toast.error('Registration failed', { description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center space-y-6">
                    <div className="flex justify-center">
                        <MailCheck className="h-16 w-16 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Check your email account!</h2>
                    <p className="text-slate-600">
                        We have sent a confirmation link to <span className="font-semibold text-slate-900">{formData.email}</span>.
                        Please click the button in the email to activate your account.
                    </p>
                    <Button asChild className="w-full" variant="outline">
                        <Link to="/login">Back to Login</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    <Logo />
                    <h2 className="text-2xl font-bold text-slate-900 mt-4">Create your account</h2>
                    <p className="text-sm text-slate-500">Enter your details to connect.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Full Name</label>
                            <input
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="E.g. Peter Parker"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">Email address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="peter@mail.com"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Registration...
                            </>
                        ) : (
                            'Registration'
                        )}
                    </Button>
                </form>

                <div className="text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
                        Log in!
                    </Link>
                </div>
            </div>
        </div>
    );
}