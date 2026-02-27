import React from 'react';
import { cn } from "@/lib/utils";

interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const PageLayout = ({ children, className, ...props }: PageLayoutProps) => {
    return (
        <div className={cn("max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8", className)} {...props}>
            {children}
        </div>
    );
}

export default PageLayout;
