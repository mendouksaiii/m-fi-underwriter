import React, { useState, useEffect } from 'react';

interface ConnectWalletProps {
  onAddressChange?: (address: string | null) => void;
}

export function ConnectWallet({ onAddressChange }: ConnectWalletProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isSepolia = chainId === '0xaa36a7';

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;

    eth.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        onAddressChange?.(accounts[0]);
      }
    }).catch(() => {});

    eth.request({ method: 'eth_chainId' }).then((id: string) => setChainId(id)).catch(() => {});

    const handleAccountsChanged = (accounts: string[]) => {
      const addr = accounts[0] || null;
      setAddress(addr);
      onAddressChange?.(addr);
    };
    const handleChainChanged = (id: string) => setChainId(id);

    eth.on('accountsChanged', handleAccountsChanged);
    eth.on('chainChanged', handleChainChanged);

    return () => {
      eth.removeListener('accountsChanged', handleAccountsChanged);
      eth.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const connect = async () => {
    const eth = (window as any).ethereum;
    if (!eth) { alert('Install MetaMask to connect'); return; }

    try {
      const accounts = await eth.request({ method: 'eth_requestAccounts' });
      if (accounts[0]) {
        setAddress(accounts[0]);
        onAddressChange?.(accounts[0]);
      }

      const id = await eth.request({ method: 'eth_chainId' });
      setChainId(id);

      if (id !== '0xaa36a7') {
        try {
          await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xaa36a7' }] });
        } catch {}
      }
    } catch {}
  };

  const disconnect = () => {
    setAddress(null);
    onAddressChange?.(null);
    setIsDropdownOpen(false);
  };

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (!address) {
    return (
      <button onClick={connect} className="btn-neon btn-solid-cyan text-[10px] py-2 px-4">
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 py-2 px-4 border border-neon-cyan/30 rounded bg-neon-cyan/5 hover:bg-neon-cyan/10 transition-all"
      >
        <span className={`w-2 h-2 rounded-full ${isSepolia ? 'bg-neon-lime shadow-neon-lime' : 'bg-neon-pink shadow-neon-pink'} animate-blink`}></span>
        <span className="font-mono text-xs text-neon-cyan">{truncate(address)}</span>
        {!isSepolia && <span className="neon-tag tag-pink text-[9px] py-0 px-1">Wrong Net</span>}
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 neon-card p-3 z-50">
          <div className="font-mono text-[10px] text-neon-muted mb-2 tracking-widest">CONNECTED</div>
          <div className="font-mono text-xs text-neon-cyan mb-3 break-all">{address}</div>
          <div className="neon-divider mb-3"></div>
          <a
            href={`https://sepolia.etherscan.io/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-mono text-[11px] text-neon-muted hover:text-neon-cyan transition-colors mb-2 tracking-wider"
          >
            ↗ VIEW ON ETHERSCAN
          </a>
          <button
            onClick={disconnect}
            className="w-full mt-1 py-1.5 font-mono text-[11px] text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/10 transition-all tracking-wider"
          >
            DISCONNECT
          </button>
        </div>
      )}
    </div>
  );
}
