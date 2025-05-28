import { useState } from "react";
import { ArrowRight, BarChart3, ChevronDown, LineChart, BrainCircuit, BookOpen, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { marketIndices } from "@/services/mockData";
import { LoginDialog } from "@/components/LoginDialog";

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="glass-card p-6 transition-all hover:shadow-lg hover:border-finance-blue/30">
    <div className="text-finance-blue mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const MarketTicker = () => (
  <div className="bg-finance-dark/80 backdrop-blur-md text-white p-3 overflow-hidden">
    <div className="flex space-x-8 animate-[scroll_30s_linear_infinite]">
      {marketIndices.map(index => (
        <div key={index.name} className="flex items-center space-x-2 whitespace-nowrap">
          <span className="font-medium">{index.name}</span>
          <span>{index.value.toLocaleString()}</span>
          <span className={index.change >= 0 ? "text-finance-profit" : "text-finance-loss"}>
            {index.change >= 0 ? "+" : ""}{index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
          </span>
        </div>
      ))}
    </div>
  </div>
);

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <MarketTicker />
      
      <header className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block mb-4 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-finance-blue text-sm font-medium">
                Your Financial Journey Starts Here
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
                <span className="text-finance-blue">Invest</span> Smarter,{" "}
                <span className="text-finance-blue">Learn</span> Together
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto md:mx-0">
                Profitaly combines real-time stock analysis, virtual trading, and AI-powered guidance 
                to help you become a better investor.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <LoginDialog />
                <Button variant="outline" className="group">
                  Learn More <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-finance-blue to-finance-accent opacity-30 blur-xl rounded-xl animate-pulse-glow"></div>
                <div className="relative glass-card overflow-hidden rounded-xl p-6 aspect-[4/3]">
                  <img 
                    src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2940&auto=format&fit=crop" 
                    alt="Stock market dashboard" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Profitaly Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We combine cutting-edge technology with expert financial knowledge to help you make informed investment decisions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<LineChart size={32} />}
              title="Real-Time Stock Analysis"
              description="Search and analyze stocks from global markets with real-time data, charts, and news."
            />
            <FeatureCard 
              icon={<BrainCircuit size={32} />}
              title="AI-Powered Advisor"
              description="Get personalized stock suggestions and analysis based on your investor profile."
            />
            <FeatureCard 
              icon={<BarChart3 size={32} />}
              title="Practice Trading"
              description="Test your investment strategies with virtual money in real market conditions."
            />
            <FeatureCard 
              icon={<Trophy size={32} />}
              title="Fantasy Competitions"
              description="Compete with other investors in virtual trading leagues and win prizes."
            />
            <FeatureCard 
              icon={<BookOpen size={32} />}
              title="Learning Hub"
              description="Access educational resources to improve your investing knowledge and skills."
            />
            <FeatureCard 
              icon={<ChevronDown size={32} />}
              title="Community Insights"
              description="Learn from and connect with other investors in a supportive community."
            />
          </div>
          
          <div className="text-center mt-12">
            <Link to="/signup">
              <Button className="bg-finance-blue hover:bg-finance-blue/90 text-white px-8">Join Profitaly Today</Button>
            </Link>
          </div>
        </div>
      </section>
      
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <div className="glass-card p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-finance-blue/20 to-transparent"></div>
                <div className="relative">
                  <h3 className="text-2xl font-bold mb-4">Start your journey today</h3>
                  <p className="mb-6">
                    Join thousands of investors who are already using Profitaly to improve their financial knowledge and investment strategies.
                  </p>
                  <div className="flex space-x-4 mb-6">
                    <div className="bg-white/20 dark:bg-white/10 rounded-lg p-4 flex-1">
                      <div className="text-3xl font-bold text-finance-blue">10K+</div>
                      <div className="text-sm">Active Users</div>
                    </div>
                    <div className="bg-white/20 dark:bg-white/10 rounded-lg p-4 flex-1">
                      <div className="text-3xl font-bold text-finance-blue">98%</div>
                      <div className="text-sm">Satisfaction</div>
                    </div>
                    <div className="bg-white/20 dark:bg-white/10 rounded-lg p-4 flex-1">
                      <div className="text-3xl font-bold text-finance-blue">24/7</div>
                      <div className="text-sm">Support</div>
                    </div>
                  </div>
                  <LoginDialog />
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4">Ready to become a better investor?</h2>
              <p className="text-muted-foreground mb-6">
                Profitaly provides all the tools you need to understand financial markets, 
                practice trading strategies, and make smarter investment decisions.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Access real-time market data and analysis",
                  "Practice trading without risking real money",
                  "Learn from educational resources and tutorials",
                  "Connect with experienced investors",
                  "Get personalized investment recommendations"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-finance-blue/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-finance-blue"></div>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/features">
                <Button variant="outline">Explore All Features</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="bg-finance-dark text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo size="lg" />
              <p className="mt-4 text-gray-400">
                Making financial education and investment accessible to everyone.
              </p>
            </div>
            
            {[
              {
                title: "Platform",
                links: ["Features", "Pricing", "FAQ", "Testimonials"]
              },
              {
                title: "Company",
                links: ["About Us", "Blog", "Careers", "Contact"]
              },
              {
                title: "Resources",
                links: ["Learning Center", "API Documentation", "Help Center", "Privacy Policy"]
              }
            ].map((column, i) => (
              <div key={i}>
                <h4 className="font-bold text-lg mb-4">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-gray-400 hover:text-white transition">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-6 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Profitaly. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
