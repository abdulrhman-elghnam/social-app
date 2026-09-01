import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const AuthLogin = ({ children }: React.PropsWithChildren) => {
    const token = useAuthStore((state) => state.token);
    
    if (token) {
        return <Navigate to="/feed" replace />;
    }
    
    return <>{children}</>;
};

export default AuthLogin;
