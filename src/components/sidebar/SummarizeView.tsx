import { useState, useEffect } from 'react';
import { FileText, Copy, Check, RefreshCw, Loader2 } from 'lucide-react';
import { SummaryResult } from '@/types';
import { storage } from '@/utils/storage';
import { extractPageContent, getPageInfo } from '@/utils/textExtractor';
import { summarizeText } from '@/utils/summarizer';

export const SummarizeView = () => {
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageInfo = getPageInfo();

  useEffect(() => {
    // Check for cached summary
    const cached = storage.getCachedSummary(pageInfo.url);
    if (cached) {
      setSummary(cached);
    }
  }, [pageInfo.url]);

  const handleSummarize = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate a small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const content = extractPageContent();
      if (!content || content.length < 100) {
        setError('Not enough content to summarize on this page.');
        setIsLoading(false);
        return;
      }

      const result = summarizeText(content, pageInfo.title);
      setSummary(result);
      storage.cacheSummary(pageInfo.url, result);
    } catch (err) {
      setError('Failed to summarize page. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!summary) return;

    const text = summary.bullets.map(b => `• ${b}`).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Page Summary</h2>
          {summary && (
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          )}
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border border-border mb-3">
          <p className="text-sm font-medium text-foreground truncate">
            {pageInfo.title}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {pageInfo.url}
          </p>
        </div>

        <button
          onClick={handleSummarize}
          disabled={isLoading}
          className="action-button action-button-primary w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Summarizing...
            </>
          ) : summary ? (
            <>
              <RefreshCw className="w-4 h-4" />
              Re-summarize
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Summarize Page
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {error ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : summary ? (
          <div className="space-y-1">
            {summary.bullets.map((bullet, index) => (
              <div
                key={index}
                className="bullet-point animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="bullet-dot" />
                <p className="text-sm text-foreground leading-relaxed">{bullet}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No summary yet</h3>
            <p className="text-sm text-muted-foreground">
              Click the button above to summarize this page
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
