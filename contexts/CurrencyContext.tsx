import React, {
    createContext,
    useState,
    useEffect,
    ReactNode,
    useContext,
} from "react";

const conversionRates: { [key: string]: number } = {
    USD: 1,
    EGP: 49.5,
    EUR: 0.88,
    SAR: 3.75,
    AED: 3.67,
    KWD: 0.306,
    BHD: 0.377,
    QAR: 3.64,
    OMR: 0.385,
    JOD: 0.709,
    IQD: 1310,
    DZD: 130,
    MAD: 9,
    TND: 2.95,
    LYD: 5.45,
    SYP: 13000,
    LBP: 89500,
    YER: 250,
    SDG: 600,
    SOS: 571,
    MRU: 40,
};

const currencySymbols: { [key: string]: string } = {
    USD: "$",
    EGP: "ج.م",
    EUR: "€",
    SAR: "ر.س",
    AED: "د.إ",
    KWD: "د.ك",
    BHD: "د.ب",
    QAR: "ر.ق",
    OMR: "ر.ع",
    JOD: "د.أ",
    IQD: "د.ع",
    DZD: "د.ج",
    MAD: "د.م",
    TND: "د.ت",
    LYD: "د.ل",
    SYP: "ل.س",
    LBP: "ل.ل",
    YER: "ر.ي",
    SDG: "ج.س",
    SOS: "ش.ص",
    MRU: "أ.م",
};

interface CurrencyContextType {
    currency: string;
    setCurrency: (currency: string) => void;
    formatPrice: (usdPrice: number) => string;
    convertPrice: (usdPrice: number) => number;
    currencies: string[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
    undefined
);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [currency, setCurrency] = useState<string>("SAR");

    useEffect(() => {
        const storedCurrency = localStorage.getItem("currency");

        if (storedCurrency && conversionRates[storedCurrency]) {
            setCurrency(storedCurrency);
        }
    }, []);

    const handleSetCurrency = (newCurrency: string) => {
        if (!conversionRates[newCurrency]) return;

        localStorage.setItem("currency", newCurrency);
        setCurrency(newCurrency);
    };

    const convertPrice = (usdPrice: number): number => {
        return usdPrice * (conversionRates[currency] ?? 1);
    };

    const formatPrice = (usdPrice: number): string => {
        const converted = convertPrice(usdPrice);
        const symbol = currencySymbols[currency] ?? "$";

        const arabicCurrencies = [
            "EGP",
            "SAR",
            "AED",
            "KWD",
            "BHD",
            "QAR",
            "OMR",
            "JOD",
            "IQD",
            "DZD",
            "MAD",
            "TND",
            "LYD",
            "SYP",
            "LBP",
            "YER",
            "SDG",
            "SOS",
            "MRU",
        ];

        return arabicCurrencies.includes(currency)
            ? `${converted.toFixed(1)} ${symbol}`
            : `${symbol}${converted.toFixed(1)}`;
    };

    const currencies = Object.keys(conversionRates);

    return (
        <CurrencyContext.Provider
            value={{
                currency,
                setCurrency: handleSetCurrency,
                formatPrice,
                convertPrice,
                currencies,
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);

    if (!context) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }

    return context;
};