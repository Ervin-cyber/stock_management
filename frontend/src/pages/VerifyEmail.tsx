import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmailToken } from '@/api/auth.api';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    
    const hasFetched = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid or missing token.');
            return;
        }

        if (hasFetched.current) return;
        hasFetched.current = true;

        verifyEmailToken(token)
            .then((res) => {
                setStatus('success');
                setMessage(res.message || 'Successful activation!');
            })
            .catch((err) => {
                setStatus('error');
                setMessage(err.response?.data?.error?.message || 'Error during activation.');
            });
    }, [token]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">
                
                {status === 'loading' && (
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        <h2 className="text-xl font-semibold">Email verification in progress...</h2>
                        <p className="text-slate-500">Please wait a moment.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center space-y-4">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                        <h2 className="text-2xl font-bold text-slate-800">Account Activated!</h2>
                        <p className="text-slate-600">{message}</p>
                        <Button asChild className="mt-4 w-full">
                            <Link to="/login">Continue to Login</Link>
                        </Button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center space-y-4">
                        <XCircle className="h-16 w-16 text-red-500" />
                        <h2 className="text-2xl font-bold text-slate-800">Activation Failed</h2>
                        <p className="text-slate-600">{message}</p>
                        <Button asChild variant="outline" className="mt-4 w-full">
                            <Link to="/login">Back to Login</Link>
                        </Button>
                    </div>
                )}

            </div>
        </div>
    );
}