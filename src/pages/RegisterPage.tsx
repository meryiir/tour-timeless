import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-card shadow-elevated animate-fade-in-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-xl font-bold text-foreground mb-2">
            <MapPin className="h-6 w-6 text-primary" />Wanderlust
          </Link>
          <h1 className="font-display text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join thousands of happy travelers</p>
        </div>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1.5 block">First Name</label><Input placeholder="John" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Last Name</label><Input placeholder="Doe" /></div>
          </div>
          <div><label className="text-sm font-medium mb-1.5 block">Email</label><Input type="email" placeholder="you@example.com" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Password</label><Input type="password" placeholder="••••••••" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Confirm Password</label><Input type="password" placeholder="••••••••" /></div>
          <Button className="w-full" size="lg">Create Account</Button>
        </form>
        <p className="text-sm text-center text-muted-foreground mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
