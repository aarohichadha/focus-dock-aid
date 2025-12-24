import { KeywordResult } from '@/types';

// Common skill keywords to look for
const SKILL_PATTERNS = [
  'javascript', 'typescript', 'python', 'java', 'c\\+\\+', 'c#', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin',
  'react', 'angular', 'vue', 'svelte', 'next\\.?js', 'nuxt', 'node\\.?js', 'express', 'fastify', 'django', 'flask',
  'spring', 'rails', 'laravel', '.net', 'asp\\.net',
  'html', 'css', 'sass', 'scss', 'less', 'tailwind', 'bootstrap', 'material.?ui',
  'sql', 'nosql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'firebase',
  'rest', 'graphql', 'grpc', 'websocket', 'api',
  'testing', 'jest', 'mocha', 'cypress', 'selenium', 'tdd', 'bdd',
  'machine learning', 'deep learning', 'ai', 'nlp', 'computer vision', 'tensorflow', 'pytorch',
  'data analysis', 'data science', 'statistics', 'analytics',
];

const TOOL_PATTERNS = [
  'git', 'github', 'gitlab', 'bitbucket', 'svn',
  'docker', 'kubernetes', 'k8s', 'helm', 'terraform', 'ansible', 'jenkins', 'circleci', 'travis',
  'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel', 'netlify', 'digitalocean',
  'jira', 'confluence', 'trello', 'asana', 'notion', 'slack', 'teams',
  'vs ?code', 'intellij', 'webstorm', 'vim', 'emacs',
  'figma', 'sketch', 'adobe', 'photoshop', 'illustrator',
  'postman', 'insomnia', 'swagger', 'openapi',
  'datadog', 'splunk', 'grafana', 'prometheus', 'new relic',
  'linux', 'unix', 'windows', 'macos',
  'ci/cd', 'devops', 'sre', 'infrastructure',
];

const ROLE_PATTERNS = [
  'engineer', 'developer', 'architect', 'lead', 'senior', 'junior', 'staff', 'principal',
  'manager', 'director', 'vp', 'cto', 'ceo', 'founder',
  'full.?stack', 'frontend', 'backend', 'mobile', 'ios', 'android', 'devops', 'sre', 'platform',
  'data engineer', 'data scientist', 'ml engineer', 'ai engineer',
  'product manager', 'project manager', 'scrum master', 'agile coach',
  'designer', 'ux', 'ui', 'product designer',
  'qa', 'quality', 'test', 'automation',
];

const SOFT_SKILL_PATTERNS = [
  'communication', 'leadership', 'teamwork', 'collaboration', 'problem.?solving',
  'critical thinking', 'analytical', 'creative', 'innovative', 'adaptable',
  'time management', 'organization', 'attention to detail', 'self.?motivated',
  'mentoring', 'coaching', 'presenting', 'public speaking',
  'agile', 'scrum', 'kanban', 'lean',
  'remote', 'async', 'cross.?functional', 'stakeholder',
];

const extractMatches = (text: string, patterns: string[]): string[] => {
  const matches: Set<string> = new Set();
  const lowerText = text.toLowerCase();
  
  for (const pattern of patterns) {
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
    const found = lowerText.match(regex);
    if (found) {
      // Normalize and add
      found.forEach(match => {
        matches.add(match.charAt(0).toUpperCase() + match.slice(1).toLowerCase());
      });
    }
  }
  
  return Array.from(matches);
};

const extractNGrams = (text: string, n: number): string[] => {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
  
  const ngrams: Map<string, number> = new Map();
  
  for (let i = 0; i <= words.length - n; i++) {
    const ngram = words.slice(i, i + n).join(' ');
    ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1);
  }
  
  return Array.from(ngrams.entries())
    .filter(([_, count]) => count >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ngram]) => ngram.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
};

export const extractKeywords = (text: string): KeywordResult => {
  const skills = extractMatches(text, SKILL_PATTERNS);
  const tools = extractMatches(text, TOOL_PATTERNS);
  const roles = extractMatches(text, ROLE_PATTERNS);
  const softSkills = extractMatches(text, SOFT_SKILL_PATTERNS);
  
  // Get suggested keywords from top bigrams and trigrams
  const bigrams = extractNGrams(text, 2);
  const trigrams = extractNGrams(text, 3);
  
  // Combine and dedupe suggestions
  const allExtracted = new Set([...skills, ...tools, ...roles, ...softSkills]);
  const suggested = [...bigrams, ...trigrams]
    .filter(phrase => !allExtracted.has(phrase.toLowerCase()))
    .slice(0, 8);
  
  return {
    skills: skills.slice(0, 15),
    tools: tools.slice(0, 10),
    roles: roles.slice(0, 8),
    softSkills: softSkills.slice(0, 8),
    suggested: suggested,
  };
};

export const countKeywords = (result: KeywordResult): number => {
  return result.skills.length + result.tools.length + result.roles.length + result.softSkills.length;
};
