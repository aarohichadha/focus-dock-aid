import { SummaryResult } from '@/types';

// Simple heuristic-based summarizer
export const summarizeText = (text: string, pageTitle: string): SummaryResult => {
  // Clean the text
  const cleanText = text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
  
  // Split into sentences
  const sentences = cleanText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 300);
  
  if (sentences.length === 0) {
    return {
      bullets: ['Unable to extract meaningful content from this page.'],
      pageTitle,
    };
  }
  
  // Score sentences based on various factors
  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0;
    
    // Position score - earlier sentences often contain key info
    if (index < 3) score += 3;
    else if (index < 10) score += 2;
    else score += 1;
    
    // Length score - medium length sentences are often better
    if (sentence.length > 50 && sentence.length < 200) score += 2;
    
    // Contains numbers (often factual)
    if (/\d+/.test(sentence)) score += 1;
    
    // Contains key phrases
    const keyPhrases = [
      'important', 'key', 'main', 'primary', 'significant', 'essential',
      'you will', 'we are', 'this is', 'includes', 'features',
      'requirement', 'responsibility', 'benefit', 'offer',
      'must have', 'looking for', 'ideal candidate',
    ];
    
    for (const phrase of keyPhrases) {
      if (sentence.toLowerCase().includes(phrase)) {
        score += 2;
        break;
      }
    }
    
    // Penalize sentences that are just lists or fragments
    if (sentence.split(' ').length < 5) score -= 2;
    
    // Penalize sentences with too many special characters
    if ((sentence.match(/[^a-zA-Z0-9\s.,!?]/g) || []).length > 5) score -= 1;
    
    return { sentence, score, index };
  });
  
  // Sort by score and take top sentences
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    // Re-sort by original position to maintain flow
    .sort((a, b) => a.index - b.index);
  
  // Format as bullets
  const bullets = topSentences.map(({ sentence }) => {
    // Clean up the sentence
    let bullet = sentence
      .replace(/^\s*[-•*]\s*/, '') // Remove existing bullet points
      .replace(/^\s*\d+[.)]\s*/, '') // Remove numbered list markers
      .trim();
    
    // Capitalize first letter
    bullet = bullet.charAt(0).toUpperCase() + bullet.slice(1);
    
    // Ensure it ends properly
    if (!/[.!?]$/.test(bullet)) {
      bullet += '.';
    }
    
    return bullet;
  });
  
  // Deduplicate similar bullets
  const uniqueBullets = bullets.filter((bullet, index) => {
    const lowerBullet = bullet.toLowerCase();
    return !bullets.slice(0, index).some(
      prev => {
        const lowerPrev = prev.toLowerCase();
        // Check for significant overlap
        const overlap = lowerBullet.split(' ').filter(w => lowerPrev.includes(w)).length;
        return overlap > lowerBullet.split(' ').length * 0.7;
      }
    );
  });
  
  // Return between 3 and 10 bullets
  const finalBullets = uniqueBullets.slice(0, Math.max(3, Math.min(10, uniqueBullets.length)));
  
  if (finalBullets.length < 3 && sentences.length > 0) {
    // If we couldn't extract enough, just take first few sentences
    return {
      bullets: sentences.slice(0, 6).map(s => {
        let b = s.trim();
        b = b.charAt(0).toUpperCase() + b.slice(1);
        if (!/[.!?]$/.test(b)) b += '.';
        return b;
      }),
      pageTitle,
    };
  }
  
  return {
    bullets: finalBullets,
    pageTitle,
  };
};
