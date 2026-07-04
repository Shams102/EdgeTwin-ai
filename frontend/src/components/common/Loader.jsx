export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-primary-500/20" />
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" />
      </div>
      <p className="mt-4 text-sm text-gray-400">{text}</p>
    </div>
  );
}
