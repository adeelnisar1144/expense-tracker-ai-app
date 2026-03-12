
import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { User } from '../../types';
import { api } from '../../api';
import Logo from '../common/Logo';

const AuthWrapper: React.FC<{ children: React.ReactNode, title: string, subtitle: string }> = ({ children, title, subtitle }) => (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-sm">
            <Logo size="large" className="mb-10" />
             <div className="text-left mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
                <p className="text-gray-400 mt-2 text-lg">{subtitle}</p>
            </div>
            {children}
        </div>
    </div>
);

interface AuthProps {
    onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const user = mode === 'login' 
                ? await api.login(email, password)
                : await api.signup(email, email.split('@')[0], password);
            onLogin(user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthWrapper 
            title={mode === 'login' ? 'Welcome back' : 'Get started'}
            subtitle={mode === 'login' ? 'Sign in to continue' : 'Create your account'}
        >
            <form className="space-y-5" onSubmit={handleEmailAuth}>
                <Input id="email" type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} className="bg-brand-surface border-none text-white h-12 rounded-lg px-4" />
                <div className="relative">
                    <Input
                        id="password"
                        type={isPasswordVisible ? 'text' : 'password'}
                        placeholder="Password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="bg-brand-surface border-none text-white h-12 rounded-lg px-4 pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute inset-y-0 right-4 flex items-center text-gray-500"
                    >
                        {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                
                <Button type="submit" className="w-full h-12 rounded-lg text-lg font-bold" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin mx-auto" /> : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                </Button>
            </form>
            
            <p className="mt-8 text-center text-gray-500">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-brand-primary font-bold ml-2">
                    {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
            </p>
        </AuthWrapper>
    );
};

export default Auth;
