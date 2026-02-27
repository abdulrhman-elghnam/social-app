import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthSetting = ({children}:React.PropsWithChildren) => {
    if(localStorage.getItem("auth-storage"))
    {
        return (
            {children}
        );
    }
    return (
        <div>
            <Navigate to="/login" />
        </div>
    );
}

export default AuthSetting;
