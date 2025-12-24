// Text extraction and analysis utilities

export const extractPageContent = (): string => {
  // For demo, we'll simulate page content extraction
  // In actual extension, this would use content script to get page text
  
  // Try to get content from the current page
  const article = document.querySelector('article');
  const main = document.querySelector('main');
  const body = document.body;
  
  let content = '';
  
  if (article) {
    content = article.innerText;
  } else if (main) {
    content = main.innerText;
  } else {
    // Get all paragraph and heading text
    const elements = body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
    content = Array.from(elements)
      .map(el => (el as HTMLElement).innerText)
      .join('\n');
  }
  
  // Clean up the content
  content = content
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
  
  return content || getDemoContent();
};

export const getPageInfo = () => {
  return {
    title: document.title || 'Current Page',
    url: window.location.href,
    favicon: getFavicon(),
  };
};

const getFavicon = (): string => {
  const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
  return link?.href || `${window.location.origin}/favicon.ico`;
};

// Demo content for testing
const getDemoContent = (): string => {
  return `
    Senior Software Engineer - Full Stack
    
    About the Role:
    We are looking for a Senior Software Engineer to join our growing team. 
    You will be responsible for designing, developing, and maintaining our core platform.
    
    Requirements:
    - 5+ years of experience in software development
    - Strong proficiency in React, TypeScript, and Node.js
    - Experience with cloud platforms (AWS, GCP, or Azure)
    - Knowledge of database systems (PostgreSQL, MongoDB)
    - Familiarity with CI/CD pipelines and DevOps practices
    - Excellent problem-solving and communication skills
    - Experience with Agile methodologies
    
    Nice to Have:
    - Experience with microservices architecture
    - Knowledge of Docker and Kubernetes
    - GraphQL experience
    - Machine learning or AI background
    
    Benefits:
    - Competitive salary and equity
    - Health, dental, and vision insurance
    - Flexible work arrangements
    - Professional development budget
    - Unlimited PTO
    
    We are an equal opportunity employer and value diversity at our company.
    Join us in building the future of technology!
  `;
};
