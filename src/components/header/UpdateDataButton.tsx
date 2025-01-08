import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface UpdateDataButtonProps {
  onUpdate: () => Promise<void>;
  isLoading: boolean;
}

export const UpdateDataButton = ({ onUpdate, isLoading }: UpdateDataButtonProps) => {
  return (
    <Button 
      onClick={onUpdate}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="fixed bottom-2 right-2 opacity-30 hover:opacity-100 transition-opacity duration-200 text-xs"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          Updating...
        </>
      ) : (
        'Update Data'
      )}
    </Button>
  );
};