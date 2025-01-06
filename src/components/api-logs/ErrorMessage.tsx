interface ErrorMessageProps {
  error: string;
}

export const ErrorMessage = ({ error }: ErrorMessageProps) => (
  <div>
    <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
      <span className="text-red-400">⚠</span> Error
    </h3>
    <div className="bg-[#2A2B2D] p-4 rounded-lg text-sm font-mono text-red-300 border border-red-900/50">
      <p className="whitespace-pre-wrap">{error}</p>
    </div>
  </div>
);