import { users } from "@/data/mockData";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = users.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Email</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Bookings</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{u.avatar}</div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      u.role === "admin" ? "bg-primary/10 text-primary" :
                      u.role === "moderator" ? "bg-secondary/10 text-secondary" :
                      "bg-muted text-muted-foreground"
                    }`}>{u.role}</span>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${u.status === "active" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>{u.status}</span>
                  </td>
                  <td className="p-4 hidden lg:table-cell text-muted-foreground">{u.bookingsCount}</td>
                  <td className="p-4 hidden lg:table-cell text-muted-foreground">{u.joinedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
