import { FocusDock } from '@/components/FocusDock';
import { Helmet } from 'react-helmet';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>FocusDock - Save, Summarize & Extract Keywords</title>
        <meta name="description" content="FocusDock helps you save webpages as tasks, extract ATS-friendly keywords from job descriptions, and summarize page content into concise bullet points." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Demo page content */}
        <div className="max-w-3xl px-6 py-12" style={{ marginRight: '380px' }}>
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-xl">F</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">FocusDock</h1>
                <p className="text-muted-foreground">Chrome Extension Demo</p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              This is a demo of FocusDock, a Chrome extension that helps you stay focused 
              and organized. The sidebar on the right shows the extension interface.
            </p>
          </header>

          {/* Demo Job Description */}
          <article className="prose prose-slate max-w-none">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Senior Software Engineer - Full Stack
            </h2>
            
            <section className="mb-6">
              <h3 className="text-lg font-medium text-foreground mb-2">About the Role</h3>
              <p className="text-muted-foreground leading-relaxed">
                We are looking for a Senior Software Engineer to join our growing team. 
                You will be responsible for designing, developing, and maintaining our core platform.
                This is an exciting opportunity to work on challenging problems and make a real impact.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-medium text-foreground mb-2">Requirements</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>5+ years of experience in software development</li>
                <li>Strong proficiency in React, TypeScript, and Node.js</li>
                <li>Experience with cloud platforms (AWS, GCP, or Azure)</li>
                <li>Knowledge of database systems (PostgreSQL, MongoDB)</li>
                <li>Familiarity with CI/CD pipelines and DevOps practices</li>
                <li>Excellent problem-solving and communication skills</li>
                <li>Experience with Agile methodologies</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-medium text-foreground mb-2">Nice to Have</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Experience with microservices architecture</li>
                <li>Knowledge of Docker and Kubernetes</li>
                <li>GraphQL experience</li>
                <li>Machine learning or AI background</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-medium text-foreground mb-2">Benefits</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Competitive salary and equity</li>
                <li>Health, dental, and vision insurance</li>
                <li>Flexible work arrangements</li>
                <li>Professional development budget</li>
                <li>Unlimited PTO</li>
              </ul>
            </section>

            <section className="mb-6">
              <p className="text-muted-foreground leading-relaxed">
                We are an equal opportunity employer and value diversity at our company.
                Join us in building the future of technology! Our team is passionate about
                creating innovative solutions and fostering a collaborative environment.
              </p>
            </section>
          </article>

          {/* Instructions */}
          <div className="mt-12 p-6 rounded-2xl bg-muted/50 border border-border">
            <h3 className="font-semibold text-foreground mb-3">Try FocusDock Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><strong>To-Do:</strong> Save this page as a task with priority and notes</li>
              <li><strong>Summary:</strong> Get a concise summary of the job description</li>
              <li><strong>ATS:</strong> Extract keywords to optimize your resume</li>
              <li><strong>Chat:</strong> Use natural commands like "show my tasks" or "summarize"</li>
            </ul>
          </div>
        </div>

        {/* FocusDock Sidebar */}
        <FocusDock />
      </div>
    </>
  );
};

export default Index;
