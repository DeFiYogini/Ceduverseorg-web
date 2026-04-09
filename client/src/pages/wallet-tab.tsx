import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateWalletModal } from "@/components/wallet/create-wallet-modal";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { useState } from "react";
import {
  Wallet, Copy, CheckCircle2, Shield, Award, ExternalLink, Loader2, Hexagon,
} from "lucide-react";

type Profile = {
  id: string;
  fullName: string | null;
  walletAddress: string | null;
};

type UserAchievement = {
  id: string;
  achievementId: string;
  earnedAt: string;
  contractAddress: string | null;
  tokenId: string | null;
  achievement: {
    id: string;
    name: string;
    description: string | null;
    type: string;
    icon: string | null;
  };
};

export function WalletTab({ profile }: { profile: Profile | null }) {
  const [copied, setCopied] = useState(false);

  const { data: userAchievements = [] } = useQuery<UserAchievement[]>({
    queryKey: ["/api/me/achievements"],
  });

  const nftAchievements = userAchievements.filter(
    (a) => a.contractAddress || a.achievement?.type === "diploma" || a.achievement?.type === "certificate"
  );

  const copyAddress = () => {
    if (profile?.walletAddress) {
      navigator.clipboard.writeText(profile.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6" data-testid="wallet-tab">
      <div>
        <h2 className="text-2xl font-serif font-bold text-cedu-ink">Billetera Web3</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tu billetera blockchain para diplomas NFT y logros verificables.
        </p>
      </div>

      {profile?.walletAddress ? (
        <>
          <Card className="border-cedu-green/30 bg-cedu-green/[0.03]" data-testid="card-wallet-connected">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-cedu-green/10 flex items-center justify-center flex-shrink-0">
                  <Wallet className="h-6 w-6 text-cedu-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-cedu-ink">Billetera vinculada</p>
                    <Badge variant="outline" className="bg-cedu-green/10 text-cedu-green border-cedu-green/20 text-[10px]">
                      Activa
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-cedu-ink-muted truncate" data-testid="text-wallet-address-full">
                      {profile.walletAddress}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 flex-shrink-0"
                      onClick={copyAddress}
                      data-testid="button-copy-wallet-address"
                    >
                      {copied ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-cedu-green" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card data-testid="card-token-balance">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-cedu-blue/10 flex items-center justify-center">
                    <Hexagon className="h-5 w-5 text-cedu-blue" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-serif">0 CEDU</p>
                    <p className="text-xs text-muted-foreground">Tokens CEDU</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-nft-count">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-cedu-violet/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-cedu-violet" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-serif">{nftAchievements.length}</p>
                    <p className="text-xs text-muted-foreground">NFTs / Diplomas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {nftAchievements.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-lg font-serif font-semibold text-cedu-ink flex items-center gap-2">
                <Award className="h-5 w-5 text-cedu-violet" />
                Diplomas y Logros NFT
              </h3>
              {nftAchievements.map((a) => (
                <Card key={a.id} className="hover:shadow-sm transition-shadow" data-testid={`nft-card-${a.id}`}>
                  <CardContent className="py-4 px-5">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-xl bg-cedu-violet/10 flex items-center justify-center flex-shrink-0">
                        <Award className="h-5 w-5 text-cedu-violet" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-cedu-ink truncate">{a.achievement?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Obtenido el {new Date(a.earnedAt).toLocaleDateString("es-MX")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {a.achievement?.type === "diploma" && (
                          <Badge className="bg-cedu-green/10 text-cedu-green border-0">Diploma</Badge>
                        )}
                        {a.achievement?.type === "certificate" && (
                          <Badge className="bg-cedu-blue/10 text-cedu-blue border-0">Certificado</Badge>
                        )}
                        {a.contractAddress && (
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Shield className="h-3 w-3" />
                            Blockchain
                          </Badge>
                        )}
                      </div>
                    </div>
                    {a.contractAddress && (
                      <div className="mt-3 pt-3 border-t border-black/[0.04]">
                        <p className="text-[11px] text-muted-foreground font-mono truncate">
                          Contract: {a.contractAddress}
                          {a.tokenId && ` • Token #${a.tokenId}`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Award className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="text-base font-serif font-bold text-cedu-ink">Sin diplomas NFT aún</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Completa cursos y aprueba las evaluaciones para obtener tus primeros diplomas verificables en blockchain.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="bg-cedu-cream/50 rounded-xl p-4 border border-black/[0.06]">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-cedu-blue flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-cedu-ink">Seguridad</p>
                <p className="text-xs text-muted-foreground">
                  Tu clave privada nunca se almacena en nuestros servidores. Solo tú tienes control sobre tu billetera.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <Card className="border-dashed" data-testid="card-wallet-empty">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-cedu-blue/10 flex items-center justify-center mx-auto mb-4">
              <Wallet className="h-8 w-8 text-cedu-blue" />
            </div>
            <h3 className="text-xl font-serif font-bold text-cedu-ink mb-2">Crea tu Billetera Web3</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Vincula una billetera blockchain para que tus diplomas y logros sean verificables como NFTs. 
              Es gratis y seguro — tu clave privada nunca sale de tu dispositivo.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <CreateWalletModal onWalletCreated={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/me/profile"] });
              }} />
              <ConnectWalletButton onConnected={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/me/profile"] });
              }} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
