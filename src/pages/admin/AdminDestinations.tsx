import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { destinations as mockDest } from "@/data/mockData";

export default function AdminDestinations() {
  const [items, setItems] = useState(mockDest);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} destinations</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Destination</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Add Destination</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setDialogOpen(false); }}>
              <Input placeholder="Destination Name" />
              <Input placeholder="Country" />
              <Textarea placeholder="Description" />
              <div className="p-8 border-2 border-dashed border-border rounded-xl text-center text-muted-foreground text-sm">Drop image here</div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((d) => (
          <div key={d.id} className="rounded-xl bg-card shadow-card overflow-hidden">
            <img src={d.image} alt={d.name} className="w-full aspect-[4/3] object-cover" />
            <div className="p-4">
              <h3 className="font-display font-semibold mb-1">{d.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{d.activityCount} activities</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1"><Edit className="h-3 w-3 mr-1" />Edit</Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => setItems(items.filter((i) => i.id !== d.id))}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
