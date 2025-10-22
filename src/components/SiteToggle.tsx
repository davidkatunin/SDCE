interface SiteToggleProps {
  siteName: string;
  siteIcon: React.ReactNode;
  isBlocked: boolean;
  onToggle: (siteName: string, isBlocked: boolean) => void;
}

export function SiteToggle({ siteName, siteIcon, isBlocked, onToggle }: SiteToggleProps) {
  const handleClick = () => {
    onToggle(siteName, !isBlocked);
  };

  return (
    <div className="flex items-center justify-between w-full py-2 px-2 border-1 border-gray-700 bg-white/4 rounded-lg transition-colors duration-200 hover:bg-white/10">
      <div className="flex items-center gap-2">
        {siteIcon}
        <p className="text-white text-sm">{siteName}</p>
      </div>
      <button
        onClick={handleClick}
        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-all duration-200 ${
          isBlocked ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-600'
        }`}
        role="switch"
        aria-checked={isBlocked}
        aria-label={`Toggle ${siteName} blocking`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            isBlocked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
