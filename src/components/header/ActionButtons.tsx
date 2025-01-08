import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Wallet, Beaker } from "lucide-react";

interface ActionButtonsProps {
  onTestToken: () => Promise<void>;
  isTestingToken: boolean;
}

export const ActionButtons = ({ onTestToken, isTestingToken }: ActionButtonsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onTestToken}
        disabled={isTestingToken}
        className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 text-white/90 hover:opacity-90 transition-opacity duration-200 text-[10px] px-2 py-0.5"
      >
        {isTestingToken ? (
          <>
            <Loader2 className="mr-1 h-2.5 w-2.5 animate-spin" />
            Testing...
          </>
        ) : (
          <>
            <Beaker className="mr-1 h-2.5 w-2.5" />
            Test Token
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="bg-gradient-to-r from-[#40E0D0] via-[#89CFF0] to-[#FFB6C1] text-white/90 hover:opacity-100 transition-opacity duration-200 text-[10px] px-2 py-0.5"
        disabled
      >
        <Wallet className="mr-0.5 h-2.5 w-2.5" />
        Connect Wallet (Coming Soon)
      </Button>
    </div>
  );
};