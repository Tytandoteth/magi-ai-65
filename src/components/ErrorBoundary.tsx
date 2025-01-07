import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error);
    console.error("Error info:", errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Notify user through toast
    toast({
      variant: "destructive",
      title: "An error occurred",
      description: error.message
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload(); // Force a full reload to clear any bad state
  };

  private handleReport = () => {
    // Here you could implement error reporting to your backend
    console.log("Error report:", {
      error: this.state.error,
      errorInfo: this.state.errorInfo
    });
    
    toast({
      title: "Error Reported",
      description: "Thank you for helping us improve the application."
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p>{this.state.error?.message || "An unexpected error occurred"}</p>
            {this.state.errorInfo && (
              <pre className="mt-2 max-h-40 overflow-auto rounded bg-slate-950 p-4 text-sm text-slate-50">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
            <div className="mt-4 flex space-x-4">
              <Button 
                variant="outline" 
                onClick={this.handleReset}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button 
                variant="secondary"
                onClick={this.handleReport}
              >
                Report Issue
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}