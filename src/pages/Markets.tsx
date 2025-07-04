
import React from 'react';
import { TradingProvider } from '../contexts/TradingContext';
import { TradingChart } from '../components/trading/TradingChart';
import { OrderBook } from '../components/trading/OrderBook';
import { OptionsChain } from '../components/trading/OptionsChain';
import { OrderPanel } from '../components/trading/OrderPanel';
import { PositionsPanel } from '../components/trading/PositionsPanel';
import { MarketDataTable } from '../components/trading/MarketDataTable';
import { ConnectionStatus } from '../components/trading/ConnectionStatus';

const TradingDashboard: React.FC = () => {
    const currentSymbol = 'BTC-USDT';

    return (
        <TradingProvider>
            <div className="min-h-screen bg-black text-white">
                {/* Header */}
                <div className="bg-gray-900 border-b border-gray-800 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-6">
                            <h1 className="text-xl font-bold">Delta Exchange</h1>
                            <nav className="flex space-x-4">
                                <button className="px-3 py-1 bg-blue-600 rounded text-sm">Trade</button>
                                <button className="px-3 py-1 text-gray-400 hover:text-white text-sm">Chart</button>
                                <button className="px-3 py-1 text-gray-400 hover:text-white text-sm">Markets</button>
                                <button className="px-3 py-1 text-gray-400 hover:text-white text-sm">Portfolio</button>
                            </nav>
                        </div>
                        <div className="flex items-center space-x-4">
                            <ConnectionStatus />
                            <div className="text-sm">
                                <span className="text-gray-400">Balance: </span>
                                <span className="text-green-400 font-semibold">$17,042</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Trading Interface */}
                <MarketDataTable />

            </div>
        </TradingProvider>
    );
};

export default TradingDashboard;
