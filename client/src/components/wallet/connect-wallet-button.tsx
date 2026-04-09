import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link2, Check, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

interface ConnectWalletButtonProps {
  onConnected?: (address: string) => void;
}

export function ConnectWalletButton({ onConnected }: ConnectWalletButtonProps) {
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState("");

  const hasProvider = typeof window !== "undefined" && !!window.ethereum;

  const handleConnect = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask no detectado",
        description:
          "Instala MetaMask u otro proveedor de wallet compatible para conectar tu billetera.",
        variant: "destructive",
      });
      return;
    }

    setConnecting(true);
    try {
      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No se obtuvo ninguna cuenta");
      }

      const address = accounts[0];

      await apiRequest("PATCH", "/api/me/profile", {
        walletAddress: address,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/me/profile"] });

      setConnected(true);
      setConnectedAddress(address);

      toast({
        title: "Wallet conectada",
        description: `Dirección ${address.slice(0, 6)}...${address.slice(-4)} vinculada a tu perfil.`,
      });

      onConnected?.(address);
    } catch (err: any) {
      const message =
        err.code === 4001
          ? "Conexión rechazada por el usuario."
          : err.message || "Error al conectar wallet";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  if (connected) {
    return (
      <Button variant="outline" disabled data-testid="button-wallet-connected">
        <Check className="w-4 h-4 mr-2 text-cedu-green" />
        {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
      </Button>
    );
  }

  if (!hasProvider) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          disabled
          data-testid="button-connect-wallet-disabled"
        >
          <AlertCircle className="w-4 h-4 mr-2 text-cedu-ink-muted" />
          Conectar Wallet
        </Button>
        <p className="text-xs text-cedu-ink-muted">
          No se detectó MetaMask ni otro proveedor de wallet compatible.
        </p>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleConnect}
      disabled={connecting}
      data-testid="button-connect-wallet"
    >
      <Link2 className="w-4 h-4 mr-2" />
      {connecting ? "Conectando..." : "Conectar Wallet"}
    </Button>
  );
}
