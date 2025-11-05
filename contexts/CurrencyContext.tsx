import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';

// Mock currency conversion rates relative to USD
const conversionRates: { [key: string]: number } = {
    'USD': 1,
    'EUR': 0.92,
    'SAR': 3.75,
    'AED': 3.67,
};

const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'SAR': 'ر.س',
    'AED': 'د.إ',
}

interface CurrencyContextType {
    currency: string;
    setCurrency: (currency: string) => void;
    formatPrice: (usdPrice: number) => string;
    convertPrice: (usdPrice: number) => number;
    currencies: string[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currency, setCurrency] = useState<string>('USD');

    useEffect(() => {
        const storedCurrency = localStorage.getItem('currency');
        if (storedCurrency && conversionRates[storedCurrency]) {
            setCurrency(storedCurrency);
        }
    }, []);

    const handleSetCurrency = (newCurrency: string) => {
        if (conversionRates[newCurrency]) {
            localStorage.setItem('currency', newCurrency);
            setCurrency(newCurrency);
        }
    };
    
    const convertPrice = (usdPrice: number): number => {
        const rate = conversionRates[currency] || 1;
        return usdPrice * rate;
    };

    const formatPrice = (usdPrice: number): string => {
        const converted = convertPrice(usdPrice);
        const symbol = currencySymbols[currency] || '$';
        
        if (currency === 'SAR' || currency === 'AED') {
             return `${converted.toFixed(2)} ${symbol}`;
        }
        return `${symbol}${converted.toFixed(2)}`;
    };

    const currencies = Object.keys(conversionRates);

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, formatPrice, convertPrice, currencies }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
