import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login'; // Figyelj, hogy jó legyen az import útvonalad!
import { describe, it, expect } from 'vitest';

describe('Login Component', () => {
    it('Should render the login form correctly', () => {

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const emailInput = screen.getByLabelText(/email/i);
        expect(emailInput).toBeInTheDocument();

        const passwordInput = screen.getByLabelText(/password/i);
        expect(passwordInput).toBeInTheDocument();

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        expect(submitButton).toBeInTheDocument();
    });
});