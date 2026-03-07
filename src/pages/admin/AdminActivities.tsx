import { useState } from "react";
import { Search, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { activities as mockActivities, categories, destinations } from "@/data/mockData";
import type { Activity } from "@/data/mockData";

export default function AdminActivities() {
  const [items, setItems] = useState(mockActivities);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = items.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));

  const toggleStatus = (id: string) => {
    setItems(items.map((a) => a.id === id ? { ...a, status: a.status === "active" ? "inactive" : "active" } as Activity : a));
  };

  const deleteActivity = (id: string) => {
    setItems(items.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search activities..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Activity</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display">Add New Activity</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setDialogOpen(false); }}>
              <Input placeholder="Title" />
              <div className="grid grid-cols-2 gap-3">
                <Select><SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                <Select><SelectTrigger><SelectValue placeholder="Destination" /></SelectTrigger><SelectContent>{destinations.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select>
              </div>
              <Input placeholder="Short Description" />
              <Textarea placeholder="Full Description" className="min-h-[100px]" />
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="Price ($)" type="number" />
                <Input placeholder="Duration" />
                <Select><SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger><SelectContent>{["Easy", "Moderate", "Challenging", "Expert"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="p-8 border-2 border-dashed border-border rounded-xl text-center text-muted-foreground text-sm">
                <p>Drop images here or click to upload</p>
              </div>
              <Textarea placeholder="Itinerary (one step per line)" />
              <Input placeholder="Available dates (comma separated)" />
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Activity</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Activity</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Destination</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={a.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-medium">{a.title}</span>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground">{a.category}</td>
                  <td className="p-4 hidden lg:table-cell text-muted-foreground">{a.destination}</td>
                  <td className="p-4 font-medium">${a.price}</td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${a.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{a.status}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleStatus(a.id)}>
                        {a.status === "active" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteActivity(a.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
