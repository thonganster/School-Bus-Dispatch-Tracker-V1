import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  PlusSquare, 
  Download, 
  Check, 
  Copy, 
  Wifi, 
  WifiOff, 
  Tablet, 
  Tv, 
  Sparkles,
  ExternalLink,
  Loader2,
  FolderArchive
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { downloadWebsiteZip, downloadSourceZip } from '../utils/downloader';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isOnline,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [downloadingWeb, setDownloadingWeb] = useState(false);
  const [downloadingWebStatus, setDownloadingWebStatus] = useState('');
  const [downloadingSource, setDownloadingSource] = useState(false);
  const [downloadingSourceStatus, setDownloadingSourceStatus] = useState('');

  const handleDownloadWeb = async () => {
    if (downloadingWeb) return;
    setDownloadingWeb(true);
    setDownloadingWebStatus('Starting...');
    try {
      await downloadWebsiteZip((status) => setDownloadingWebStatus(status));
    } catch (err) {
      console.error('Download failed', err);
      setDownloadingWebStatus('Error, please retry');
    } finally {
      setTimeout(() => {
        setDownloadingWeb(false);
        setDownloadingWebStatus('');
      }, 3000);
    }
  };

  const handleDownloadSource = async () => {
    if (downloadingSource) return;
    setDownloadingSource(true);
    setDownloadingSourceStatus('Starting...');
    try {
      await downloadSourceZip((status) => setDownloadingSourceStatus(status));
    } catch (err) {
      console.error('Download failed', err);
      setDownloadingSourceStatus('Error, please retry');
    } finally {
      setTimeout(() => {
        setDownloadingSource(false);
        setDownloadingSourceStatus('');
      }, 3000);
    }
  };

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-white overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Tablet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Use Offline on your iPad
              </h2>
              <p className="text-xs text-slate-400">
                Install as a full-screen app & operate without internet
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          {/* Status banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center gap-2.5">
              {isOnline ? (
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
              ) : (
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              )}
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  {isOnline ? 'Network Connected & Service Worker Active' : 'Offline Mode Active'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isOnline
                    ? 'All app assets are precached. You can disconnect Wi-Fi anytime!'
                    : 'The app is running offline from your iPad storage.'}
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              Offline Ready
            </span>
          </div>

          {/* iPad 3-Step Guide */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              How to add to iPad Home Screen (Takes 5 seconds):
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {/* Step 1 */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-black flex items-center justify-center text-xs mb-2">
                    1
                  </div>
                  <p className="font-bold text-slate-200 mb-1">Open in Safari</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Open this app link in the Safari browser on your iPad.
                  </p>
                </div>
                <div className="mt-3 text-slate-500 text-[10px] flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Safari Browser
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-black flex items-center justify-center text-xs mb-2">
                    2
                  </div>
                  <p className="font-bold text-slate-200 mb-1">Tap Share</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Tap the <strong>Share</strong> button (square with arrow up) at top right of Safari.
                  </p>
                </div>
                <div className="mt-3 text-sky-400 text-[10px] flex items-center gap-1 font-semibold">
                  <Share2 className="w-3 h-3" /> Share Icon
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs mb-2">
                    3
                  </div>
                  <p className="font-bold text-slate-200 mb-1">Add to Home Screen</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Scroll down and tap <strong>"Add to Home Screen"</strong>, then tap <strong>Add</strong>.
                  </p>
                </div>
                <div className="mt-3 text-emerald-400 text-[10px] flex items-center gap-1 font-semibold">
                  <PlusSquare className="w-3 h-3" /> Home Screen
                </div>
              </div>
            </div>
          </div>

          {/* Quick Copy Link for iPad */}
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-300 block">
                Open on iPad via AirDrop, Email or Messages:
              </span>
              <span className="text-[11px] text-slate-500 truncate block max-w-sm font-mono mt-0.5">
                {currentUrl}
              </span>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-extrabold text-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-slate-950" />
                  <span>Copied Link!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy App Link</span>
                </>
              )}
            </button>
          </div>

          {/* Chrome / Android / Desktop Direct Install Button (if browser supports beforeinstallprompt) */}
          {isInstallable && (
            <div className="pt-2">
              <button
                onClick={install}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-sm transition-colors shadow-lg shadow-emerald-950/50"
              >
                <Download className="w-4 h-4" />
                Direct Install to Device Now
              </button>
            </div>
          )}

          {/* Direct ZIP Downloads for Permanent Ownership */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                Download Files Directly (No Google Account Needed)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">100% Offline Ready</span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              If you don't want to rely on Google AI Studio, you can download the entire application right now and save it permanently on your computer or iPad:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadWeb}
                disabled={downloadingWeb}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-md text-center cursor-pointer disabled:opacity-70"
              >
                {downloadingWeb ? (
                  <>
                    <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                    <span>{downloadingWebStatus || 'Downloading...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 shrink-0" />
                    <span>Download Built Website (ZIP)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadSource}
                disabled={downloadingSource}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs transition-colors text-center cursor-pointer disabled:opacity-70"
              >
                {downloadingSource ? (
                  <>
                    <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                    <span>{downloadingSourceStatus || 'Downloading...'}</span>
                  </>
                ) : (
                  <>
                    <FolderArchive className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Download Source Code (ZIP)</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium pt-0.5">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>Standard Universal ZIP format: double-click to unzip on any Windows 10/11 or macOS computer.</span>
            </div>

            {/* Microsoft & SharePoint / PowerApps Information */}
            <div className="mt-3 p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
              <div className="font-bold text-sky-300 flex items-center gap-1.5">
                <span>Can you host on OneDrive, SharePoint, or PowerApps?</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li><strong className="text-slate-200">OneDrive:</strong> OneDrive is cloud file storage, not a web server. It cannot run web applications directly.</li>
                <li><strong className="text-slate-200">SharePoint:</strong> Yes! You can embed this app in any SharePoint page using an <strong>Embed Web Part</strong> with an <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">&lt;iframe&gt;</code>, or deploy the static files via a SharePoint App / SPFx web part.</li>
                <li><strong className="text-slate-200">Microsoft PowerApps:</strong> Yes! In PowerApps Canvas Apps, you can display this app using a <strong>Web / HTML component</strong> or custom PCF control.</li>
                <li><strong className="text-slate-200">Microsoft Azure Static Web Apps:</strong> (Best Microsoft option) Free forever with your Microsoft school account to host PWAs with custom domains.</li>
              </ul>
            </div>
          </div>

          {/* Offline & TV Projection Tips */}
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Tv className="w-4 h-4 text-sky-400" />
              <span>Projecting from iPad to TV:</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              When launched from your iPad Home Screen, the app runs completely full-screen without Safari browser address bars or tabs. Connect to your TV using <strong>Apple AirPlay Screen Mirroring</strong> or an <strong>HDMI adapter</strong>. All bus status changes persist on your iPad even when offline.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
