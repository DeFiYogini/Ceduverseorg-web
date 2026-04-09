import { useState } from "react";
import { Wallet } from "ethers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Plus,
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldAlert,
  Wallet as WalletIcon,
} from "lucide-react";

interface CreateWalletModalProps {
  onWalletCreated?: (address: string) => void;
}

export function CreateWalletModal({ onWalletCreated }: CreateWalletModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [walletData, setWalletData] = useState<{
    address: string;
    mnemonic: string[];
  } | null>(null);
  const [seedRevealed, setSeedRevealed] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [seedCopied, setSeedCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCreate = () => {
    const wallet = Wallet.createRandom();
    const mnemonic = wallet.mnemonic?.phrase.split(" ") || [];
    setWalletData({
      address: wallet.address,
      mnemonic,
    });
    setSeedRevealed(false);
    setAddressCopied(false);
    setSeedCopied(false);
    setSaved(false);
  };

  const handleCopyAddress = async () => {
    if (!walletData) return;
    await navigator.clipboard.writeText(walletData.address);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const handleCopySeed = async () => {
    if (!walletData) return;
    await navigator.clipboard.writeText(walletData.mnemonic.join(" "));
    setSeedCopied(true);
    setTimeout(() => setSeedCopied(false), 2000);
  };

  const handleSaveToProfile = async () => {
    if (!walletData) return;
    setSaving(true);
    try {
      await apiRequest("PATCH", "/api/me/profile", {
        walletAddress: walletData.address,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/me/profile"] });
      setSaved(true);
      toast({
        title: "Billetera guardada",
        description: "Tu dirección de wallet se ha vinculado a tu perfil.",
      });
      onWalletCreated?.(walletData.address);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setWalletData(null);
      setSeedRevealed(false);
      setAddressCopied(false);
      setSeedCopied(false);
      setSaved(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-cedu-blue"
          data-testid="button-create-wallet"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear billetera
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" data-testid="modal-create-wallet">
        <DialogHeader>
          <DialogTitle className="font-serif text-cedu-ink flex items-center gap-2">
            <WalletIcon className="w-5 h-5 text-cedu-blue" />
            Crear Billetera Web3
          </DialogTitle>
          <DialogDescription className="text-cedu-ink-muted">
            Genera una billetera para vincular tus logros y certificados en
            blockchain.
          </DialogDescription>
        </DialogHeader>

        {!walletData ? (
          <div className="space-y-4 py-2">
            <div className="bg-cedu-blue-light rounded-md p-4 space-y-2">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-5 h-5 text-cedu-blue mt-0.5 shrink-0" />
                <div className="text-sm text-cedu-ink-soft">
                  <p className="font-semibold mb-1">Antes de continuar</p>
                  <ul className="list-disc pl-4 space-y-1 text-cedu-ink-muted">
                    <li>
                      Se generará una frase semilla de 12 palabras que es la
                      única forma de recuperar tu billetera.
                    </li>
                    <li>
                      Ceduverse no almacena tu frase semilla ni tus claves
                      privadas.
                    </li>
                    <li>
                      Guarda tu frase semilla en un lugar seguro y nunca la
                      compartas con nadie.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <Button
              onClick={handleCreate}
              className="w-full bg-cedu-blue"
              data-testid="button-generate-wallet"
            >
              <WalletIcon className="w-4 h-4 mr-2" />
              Generar Billetera
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-cedu-ink-soft">
                Dirección de tu billetera
              </p>
              <div className="flex items-center gap-2">
                <code
                  className="flex-1 bg-muted rounded-md px-3 py-2 text-xs font-mono text-cedu-ink break-all"
                  data-testid="text-wallet-address"
                >
                  {walletData.address}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyAddress}
                  data-testid="button-copy-address"
                >
                  {addressCopied ? (
                    <Check className="w-4 h-4 text-cedu-green" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-cedu-ink-soft">
                  Frase semilla (12 palabras)
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSeedRevealed(!seedRevealed)}
                    data-testid="button-toggle-seed"
                  >
                    {seedRevealed ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCopySeed}
                    data-testid="button-copy-seed"
                  >
                    {seedCopied ? (
                      <Check className="w-4 h-4 text-cedu-green" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div
                className="grid grid-cols-3 gap-2"
                data-testid="grid-seed-phrase"
              >
                {walletData.mnemonic.map((word, i) => (
                  <div
                    key={i}
                    className="bg-muted rounded-md px-2 py-1.5 text-center relative"
                  >
                    <span className="text-[10px] text-cedu-ink-muted absolute left-1.5 top-0.5">
                      {i + 1}
                    </span>
                    <span
                      className={`text-xs font-mono text-cedu-ink transition-all ${
                        seedRevealed ? "" : "blur-sm select-none"
                      }`}
                      data-testid={`text-seed-word-${i}`}
                    >
                      {word}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-destructive/10 rounded-md p-3">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-xs text-destructive">
                  Guarda esta frase semilla de forma segura. Es la única manera
                  de recuperar tu billetera. Ceduverse nunca te pedirá tu frase
                  semilla.
                </p>
              </div>
            </div>

            <Button
              onClick={handleSaveToProfile}
              disabled={saving || saved}
              className="w-full bg-cedu-blue"
              data-testid="button-save-wallet"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Guardada en tu perfil
                </>
              ) : saving ? (
                "Guardando..."
              ) : (
                "Guardar en mi perfil"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
