import { useState, useEffect } from 'react';
import { Search, Copy, Check, RefreshCw, Loader2, Briefcase, Wrench, Users, Heart } from 'lucide-react';
import { KeywordResult } from '@/types';
import { storage } from '@/utils/storage';
import { extractPageContent, getPageInfo } from '@/utils/textExtractor';
import { extractKeywords, countKeywords } from '@/utils/keywordExtractor';

export const ATSView = () => {
  const [keywords, setKeywords] = useState<KeywordResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pageInfo = getPageInfo();

  useEffect(() => {
    // Check for cached keywords
    const cached = storage.getCachedKeywords(pageInfo.url);
    if (cached) {
      setKeywords(cached);
    }
  }, [pageInfo.url]);

  const handleExtract = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const content = extractPageContent();
      if (!content || content.length < 50) {
        setError('Not enough content to extract keywords from this page.');
        setIsLoading(false);
        return;
      }

      const result = extractKeywords(content);
      if (countKeywords(result) === 0) {
        setError('No relevant keywords found on this page.');
        setIsLoading(false);
        return;
      }

      setKeywords(result);
      storage.cacheKeywords(pageInfo.url, result);
    } catch (err) {
      setError('Failed to extract keywords. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCategory = async (category: string, items: string[]) => {
    const text = items.join(', ');
    await navigator.clipboard.writeText(text);
    setCopied(category);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = async () => {
    if (!keywords) return;
    const all = [
      ...keywords.skills,
      ...keywords.tools,
      ...keywords.roles,
      ...keywords.softSkills,
    ].join(', ');
    await navigator.clipboard.writeText(all);
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  const categories = keywords ? [
    { key: 'skills', label: 'Skills & Technologies', icon: Briefcase, items: keywords.skills },
    { key: 'tools', label: 'Tools & Platforms', icon: Wrench, items: keywords.tools },
    { key: 'roles', label: 'Roles & Levels', icon: Users, items: keywords.roles },
    { key: 'softSkills', label: 'Soft Skills', icon: Heart, items: keywords.softSkills },
  ] : [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">ATS Keywords</h2>
          {keywords && (
            <button
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied === 'all' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy All
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
          onClick={handleExtract}
          disabled={isLoading}
          className="action-button action-button-primary w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Extracting...
            </>
          ) : keywords ? (
            <>
              <RefreshCw className="w-4 h-4" />
              Re-extract
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Extract Keywords
            </>
          )}
        </button>

        {keywords && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Found {countKeywords(keywords)} keywords
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {error ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : keywords ? (
          <div className="space-y-5">
            {categories.map(({ key, label, icon: Icon, items }) => (
              items.length > 0 && (
                <div key={key} className="animate-fade-in-up">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="category-header !mb-0">{label}</span>
                    </div>
                    <button
                      onClick={() => handleCopyCategory(key, items)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {copied === key ? (
                        <Check className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((item, i) => (
                      <span key={i} className="keyword-chip">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )
            ))}

            {keywords.suggested.length > 0 && (
              <div className="animate-fade-in-up pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="category-header !mb-0 text-primary">
                    💡 Suggested Keywords
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Frequently appearing phrases you might want to include:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.suggested.map((item, i) => (
                    <span key={i} className="keyword-chip bg-primary/10 text-primary">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-muted/50 border border-border mt-4">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> These keywords are extracted heuristically. 
                Use them as inspiration for your resume, but tailor them to your actual experience.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No keywords yet</h3>
            <p className="text-sm text-muted-foreground">
              Click the button above to extract ATS-friendly keywords
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
