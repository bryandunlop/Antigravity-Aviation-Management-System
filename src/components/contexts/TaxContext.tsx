import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SIFLRates {
    effectiveDate: string;
    terminalCharge: number;
    mileageRates: {
        tier1: number; // 0-500
        tier2: number; // 501-1500
        tier3: number; // Over 1500
    };
}

interface TaxContextType {
    currentRates: SIFLRates;
    updateRates: (newRates: SIFLRates) => void;
}

const defaultRates: SIFLRates = {
    effectiveDate: '2025-07-01',
    terminalCharge: 53.62, // 2025 H2
    mileageRates: {
        tier1: 0.2933,
        tier2: 0.2237,
        tier3: 0.2150
    }
};

const TaxContext = createContext<TaxContextType | undefined>(undefined);

export function TaxProvider({ children }: { children: ReactNode }) {
    const [currentRates, setCurrentRates] = useState<SIFLRates>(defaultRates);

    const updateRates = (newRates: SIFLRates) => {
        setCurrentRates(newRates);
        // In a real app, this would persist to backend
        console.log('Updated SIFL Rates:', newRates);
    };

    return (
        <TaxContext.Provider value={{ currentRates, updateRates }}>
            {children}
        </TaxContext.Provider>
    );
}

export function useTaxContext() {
    const context = useContext(TaxContext);
    if (context === undefined) {
        throw new Error('useTaxContext must be used within a TaxProvider');
    }
    return context;
}
