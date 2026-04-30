import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCasino } from '../context/CasinoContext';
import { X, Wallet, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { login } from '../lib/firebase';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose }) => {
  const { state, withdraw } = useCasino();
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    setErrorMsg('');

    const result = await withdraw(amount, address);

    if (result.success) {
      setStatus('success');
      setTxHash(result.hash || '');
    } else {
      setStatus('error');
      setErrorMsg(result.error || 'UNKNOWN_ERROR');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.9, opacity: 0, rotate: 5 }}
          className="relative w-full max-w-md bg-white border-8 border-black p-6 shadow-[20px_20px_0px_rgba(0,0,0,1)]"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black text-white p-1 hover:bg-red-600 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <Wallet className="text-blue-600" size={32} />
            <h2 className="text-3xl font-black uppercase italic leading-tight">Withdrawal Portal</h2>
          </div>

          {!state.user ? (
            <div className="py-8 flex flex-col items-center text-center space-y-6">
              <div className="bg-yellow-100 border-2 border-yellow-600 p-4 text-xs font-bold uppercase">
                IDENTITY VERIFICATION REQUIRED FOR OFF-CHAIN LIQUIDATION
              </div>
              <p className="text-sm font- friendly leading-tight">
                To process "real" withdrawals to external addresses, we must link your progress to a secure identity. 
              </p>
              <button 
                onClick={() => login()}
                className="w-full bg-black text-white font-black py-4 border-4 border-blue-500 shadow-[8px_8px_0px_rgba(59,130,246,1)] hover:scale-105 transition-transform flex items-center justify-center gap-2 text-xl"
              >
                <Wallet className="text-blue-400" /> AUTHENTICATE NOW
              </button>
            </div>
          ) : status === 'idle' || status === 'error' ? (
            <form onSubmit={handleWithdraw} className="space-y-4">
              {status === 'error' && (
                <div className="bg-red-100 border-2 border-red-600 text-red-600 p-3 font-bold text-xs uppercase animate-shake">
                  ERROR: {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500">Destination Address (CUSTOM COIN ADDR)</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  placeholder="0x... or DOPAMINE_ADDR_..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-gray-100 border-4 border-black p-3 font-mono text-xs focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                 <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase text-gray-500">Amount to Liquidate</label>
                    <span className="text-[10px] font-bold text-blue-600 cursor-pointer hover:underline" onClick={() => setAmount(state.balance)}>MAX: ${state.balance}</span>
                 </div>
                 <div className="relative">
                    <input 
                      type="number" 
                      required
                      min={1}
                      max={state.balance}
                      value={amount || ''}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-gray-100 border-4 border-black p-3 font-black text-2xl focus:bg-white focus:outline-none transition-colors pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-gray-400">$</span>
                 </div>
              </div>

              <button 
                type="submit"
                disabled={status === 'processing'}
                className="w-full bg-blue-600 text-white font-black py-4 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:bg-blue-500 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-xl"
              >
                INITIATE TRANSFER <ArrowRight />
              </button>
            </form>
          ) : status === 'processing' ? (
            <div className="py-12 flex flex-col items-center text-center space-y-6">
              <Loader2 size={64} className="text-blue-600 animate-spin" />
              <div>
                <h3 className="text-2xl font-black uppercase">Hashing Blockchain...</h3>
                <p className="text-xs text-gray-500 font-bold mt-2">COMMITTING YOUR DOPAMINE TO THE LEDGER</p>
              </div>
              <div className="w-full bg-gray-200 h-2 border-2 border-black">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3 }}
                  className="h-full bg-blue-600"
                />
              </div>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-green-500 rounded-full border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <ShieldCheck size={48} className="text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black uppercase text-green-600">Transfer Secured!</h3>
                <p className="text-xs text-gray-500 font-bold mt-2">DOPAMINE COINS ARE IN TRANSIT TO YOUR NODE</p>
              </div>
              
              <div className="w-full bg-black text-green-400 p-3 font-mono text-[8px] break-all border-2 border-green-400 text-left">
                TX_HASH: {txHash}
              </div>

              <button 
                onClick={onClose}
                className="w-full bg-black text-white font-black py-3 border-2 border-white hover:bg-gray-800 transition-colors"
              >
                RETURN TO LOBBY
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
