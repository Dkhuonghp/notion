import React from 'react';

const HomePageLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className='h-full pt-20'>
            {children}
        </main>
    );
};

export default HomePageLayout;
