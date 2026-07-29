import React from 'react';
import { 
  ShieldCheck, ShieldAlert, Truck, CheckCircle, XCircle, 
  ArrowRight, FileText, Anchor, DollarSign, Calendar, RefreshCw 
} from 'lucide-react';
import { Order, User } from '../types';

interface OrdersPanelProps {
  orders: Order[];
  currentUser: User | null;
  onOrderAction: (orderId: string, action: 'deposit' | 'ship' | 'release' | 'cancel') => Promise<void>;
}

export default function OrdersPanel({
  orders,
  currentUser,
  onOrderAction
}: OrdersPanelProps) {
  if (!currentUser) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'escrow_deposited': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'shipped': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'escrow_released': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-gray-500 bg-gray-50 border-gray-100';
    }
  };

  const getStepActive = (currentStatus: string, step: string) => {
    const sequence = ['pending', 'escrow_deposited', 'shipped', 'escrow_released'];
    const currentIndex = sequence.indexOf(currentStatus);
    const stepIndex = sequence.indexOf(step);

    if (currentStatus === 'cancelled') return 'cancelled';
    if (currentIndex >= stepIndex) return 'completed';
    if (currentIndex + 1 === stepIndex) return 'next';
    return 'upcoming';
  };

  return (
    <div className="w-full" id="orders-panel">
      
      {/* Panel Header */}
      <div className="text-left mb-6">
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
          🛡️ Secured Escrow Contracts
        </h2>
        <p className="text-xs text-gray-500">
          AgriRED Trade Escrow safeguards funds. Payout is released to sellers only when phytosanitary papers verify.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-100 rounded-2xl p-12 text-center">
          <ShieldAlert className="w-9 h-9 text-gray-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-gray-800">No active trade contracts found</h4>
          <p className="text-xs text-gray-500 mt-1">Navigate to the Marketplace to initiate orders and launch contract flows.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isBuyer = order.buyerId === currentUser.id;
            const isSeller = order.sellerId === currentUser.id;

            return (
              <div 
                key={order.id}
                className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs hover:shadow-md transition-all text-left"
              >
                {/* Header of Contract card */}
                <div className="bg-gray-50/70 px-4.5 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-red-50 text-red-500 font-extrabold px-2 py-0.5 rounded-sm font-mono uppercase">
                      Contract #{order.id}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase font-mono">
                      {isBuyer ? '🟢 BUYER VIEW' : '🔵 SELLER VIEW'}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Body of Contract */}
                <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Specs */}
                  <div className="lg:col-span-4 space-y-3">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase font-mono text-gray-400">Commodity Cargo / Product</span>
                      <h4 className="text-sm font-extrabold text-gray-900 leading-snug">{order.productTitle}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 pt-1">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase font-mono text-gray-400">Quantity Lot</span>
                        <p className="text-xs font-bold text-gray-800">{order.quantity.toLocaleString()} kg</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-extrabold uppercase font-mono text-gray-400">Target Value</span>
                        <p className="text-xs font-black text-red-500">${order.totalAmount.toLocaleString()} USD</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-50 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Contract Buyer:</span>
                        <span className="font-bold text-gray-700">{order.buyerName} {isBuyer && '(You)'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Contract Exporter:</span>
                        <span className="font-bold text-gray-700">{order.sellerName} {isSeller && '(You)'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Progress Steps */}
                  <div className="lg:col-span-5 flex flex-col justify-center">
                    <span className="text-[9px] font-extrabold uppercase font-mono text-gray-400 mb-4 block">
                      Escrow Secure Timeline Progress
                    </span>

                    <div className="flex items-center w-full">
                      {[
                        { id: 'pending', label: '1. Approve', icon: FileText },
                        { id: 'escrow_deposited', label: '2. Escrow Locked', icon: ShieldCheck },
                        { id: 'shipped', label: '3. Dispatched', icon: Truck },
                        { id: 'escrow_released', label: '4. Pay Release', icon: CheckCircle }
                      ].map((step, index, arr) => {
                        const Icon = step.icon;
                        const state = getStepActive(order.status, step.id);

                        return (
                          <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center flex-1 relative">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                state === 'completed' 
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : state === 'next'
                                  ? 'bg-amber-100 border-amber-500 text-amber-600 animate-pulse'
                                  : state === 'cancelled'
                                  ? 'bg-red-50 border-red-300 text-red-400'
                                  : 'bg-white border-gray-200 text-gray-300'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="text-[9px] font-bold text-gray-600 mt-2 text-center whitespace-nowrap leading-none">
                                {step.label}
                              </span>
                            </div>
                            {index < arr.length - 1 && (
                              <div className={`h-0.5 flex-1 mx-1 -mt-4 transition-colors ${
                                getStepActive(order.status, arr[index+1].id) === 'completed' || state === 'completed'
                                  ? 'bg-emerald-400'
                                  : 'bg-gray-100'
                              }`} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right actions panel */}
                  <div className="lg:col-span-3 bg-gray-50 rounded-xl p-4 flex flex-col justify-between border border-gray-100">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase font-mono text-gray-400 block mb-1">
                        🔒 Safe Payout Log
                      </span>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                        {order.escrowDetails}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-150 flex flex-col gap-2">
                      {/* Buyer Actions */}
                      {isBuyer && order.status === 'pending' && (
                        <button
                          onClick={() => onOrderAction(order.id, 'deposit')}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Deposit Funds to Escrow</span>
                        </button>
                      )}

                      {isBuyer && order.status === 'shipped' && (
                        <button
                          onClick={() => onOrderAction(order.id, 'release')}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Release Escrow to Seller</span>
                        </button>
                      )}

                      {/* Seller Actions */}
                      {isSeller && order.status === 'escrow_deposited' && (
                        <button
                          onClick={() => onOrderAction(order.id, 'ship')}
                          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Dispatch Cargo & Invoice</span>
                        </button>
                      )}

                      {/* General Cancel Action */}
                      {(order.status === 'pending' || order.status === 'escrow_deposited') && (
                        <button
                          onClick={() => onOrderAction(order.id, 'cancel')}
                          className="w-full py-1.5 border border-gray-200 hover:border-red-300 text-gray-400 hover:text-red-500 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Contract</span>
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
