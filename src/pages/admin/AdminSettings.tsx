import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FadeInSection from "@/components/FadeInSection";

export default function AdminSettings() {
  return (
    <div className="max-w-2xl space-y-8">
      <FadeInSection>
        <div className="p-6 rounded-xl bg-card shadow-card space-y-4">
          <h3 className="font-display text-lg font-semibold">General Settings</h3>
          <div><label className="text-sm font-medium mb-1.5 block">Site Name</label><Input defaultValue="Wanderlust" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Tagline</label><Input defaultValue="Discover Your Next Adventure" /></div>
          <div className="p-6 border-2 border-dashed border-border rounded-xl text-center text-sm text-muted-foreground">Upload Logo</div>
        </div>
      </FadeInSection>

      <FadeInSection delay={0.1}>
        <div className="p-6 rounded-xl bg-card shadow-card space-y-4">
          <h3 className="font-display text-lg font-semibold">Contact Information</h3>
          <div><label className="text-sm font-medium mb-1.5 block">Email</label><Input defaultValue="hello@wanderlust.com" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Phone</label><Input defaultValue="+1 (555) 123-4567" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Address</label><Textarea defaultValue="123 Travel Street, New York, NY 10001" /></div>
        </div>
      </FadeInSection>

      <FadeInSection delay={0.2}>
        <div className="p-6 rounded-xl bg-card shadow-card space-y-4">
          <h3 className="font-display text-lg font-semibold">Social Links</h3>
          <div><label className="text-sm font-medium mb-1.5 block">Facebook</label><Input placeholder="https://facebook.com/..." /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Instagram</label><Input placeholder="https://instagram.com/..." /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Twitter</label><Input placeholder="https://twitter.com/..." /></div>
          <div><label className="text-sm font-medium mb-1.5 block">YouTube</label><Input placeholder="https://youtube.com/..." /></div>
        </div>
      </FadeInSection>

      <FadeInSection delay={0.3}>
        <div className="p-6 rounded-xl bg-card shadow-card space-y-4">
          <h3 className="font-display text-lg font-semibold">Homepage Banner</h3>
          <div><label className="text-sm font-medium mb-1.5 block">Banner Title</label><Input defaultValue="Discover Your Next Adventure" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Banner Subtitle</label><Input defaultValue="Curated travel experiences that turn moments into memories." /></div>
          <div className="p-6 border-2 border-dashed border-border rounded-xl text-center text-sm text-muted-foreground">Upload Banner Image</div>
        </div>
      </FadeInSection>

      <Button size="lg">Save Settings</Button>
    </div>
  );
}
