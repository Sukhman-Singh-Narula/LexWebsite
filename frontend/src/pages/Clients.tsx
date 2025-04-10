import React from 'react';
import ClientGrid from '../components/ClientGrid';

interface ClientsPageProps {
    darkMode: boolean;
}

export default function Clients({ darkMode }: ClientsPageProps) {
    return (
        <div>
            <ClientGrid darkMode={darkMode} />
        </div>
    );
}