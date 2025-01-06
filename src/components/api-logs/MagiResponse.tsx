interface MagiResponseProps {
  response: {
    content: string;
  };
}

export const MagiResponse = ({ response }: MagiResponseProps) => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
        <span className="text-green-400">←</span> Magi Response
      </h3>
    </div>
    <div className="bg-[#2A2B2D] p-4 rounded-lg text-sm font-mono text-gray-300 border border-gray-800">
      <p className="whitespace-pre-wrap">{response.content}</p>
    </div>
  </div>
);