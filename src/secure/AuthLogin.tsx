import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthLogin = ({children}:React.PropsWithChildren) => {
    if (localStorage.getItem('auth-storage')) {
        return (
            <Navigate to="/home" />
        );
    } else {
        return <>
        {children}
        </>
    }
}

export default AuthLogin;
