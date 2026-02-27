import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthLayer = ({ children }: React.PropsWithChildren) => {
    if (localStorage.getItem('auth-storage')) {
        return (
            <div>
                {children}
            </div>
        );
    }
    else{
        return <Navigate to="/login" />
    }
}

export default AuthLayer;
