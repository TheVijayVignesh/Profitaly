import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import CreateContestForm from '@/features/fantasy-grounds/components/CreateContestForm';

const CreateCompetition: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        navigate('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/fantasy-grounds')} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Create Competition</h1>
      </div>

      <CreateContestForm />
    </div>
  );
};

export default CreateCompetition;
