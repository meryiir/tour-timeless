import { Search, Eye, Calendar, Phone, Mail, User as UserIcon, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, User, Booking } from "@/lib/adminApi";
import { formatIsoDateOnly } from "@/lib/dateDisplay";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', page],
    queryFn: () => adminApi.getUsers(page, 20),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => 
      adminApi.updateUserStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({ title: "Success", description: "User status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({ title: "Success", description: "User deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const { data: userBookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['userBookings', selectedUser?.id],
    queryFn: () => selectedUser ? adminApi.getUserBookings(selectedUser.id, 0, 100) : null,
    enabled: !!selectedUser && isDetailsOpen,
  });

  const filtered = data?.content?.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = u.email.toLowerCase();
    if (search && !fullName.includes(search.toLowerCase()) && !email.includes(search.toLowerCase())) return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    return true;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

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
            <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
            <SelectItem value="ROLE_CLIENT">Client</SelectItem>
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
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Joined</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <span className="font-medium">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        u.role === "ROLE_ADMIN" ? "bg-primary/10 text-primary" :
                        "bg-muted text-muted-foreground"
                      }`}>{u.role === "ROLE_ADMIN" ? "Admin" : "Client"}</span>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${u.active ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                        {u.active ? "active" : "inactive"}
                      </span>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(u);
                            setIsDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: u.id, active: !u.active })}
                        >
                          {u.active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${u.firstName} ${u.lastName}?`)) {
                              deleteMutation.mutate(u.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information about the user and their bookings
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  User Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      Email
                    </p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      Phone
                    </p>
                    <p className="font-medium">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Role</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                      selectedUser.role === "ROLE_ADMIN" ? "bg-primary/10 text-primary" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {selectedUser.role === "ROLE_ADMIN" ? "Admin" : "Client"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                      selectedUser.active ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                    }`}>
                      {selectedUser.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Created At
                    </p>
                    <p className="font-medium">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  {selectedUser.updatedAt && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-medium">
                        {new Date(selectedUser.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bookings Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Bookings ({userBookings?.totalElements || 0})
                </h3>
                
                {isLoadingBookings ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : userBookings && userBookings.content.length > 0 ? (
                  <div className="space-y-3">
                    {userBookings.content.map((booking: Booking) => (
                      <div key={booking.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">Reference:</span>
                              <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                {booking.bookingReference}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{booking.activity?.title || 'N/A'}</p>
                              {booking.activity?.destination && (
                                <p className="text-sm text-muted-foreground">
                                  {booking.activity.destination.name}
                                </p>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Travel Date: </span>
                                <span className="font-medium">{formatIsoDateOnly(booking.travelDate)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Booking Date: </span>
                                <span className="font-medium">{formatIsoDateOnly(booking.bookingDate)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Guests: </span>
                                <span className="font-medium">{booking.numberOfPeople}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Total: </span>
                                <span className="font-medium">
                                  ${(typeof booking.totalPrice === 'number' 
                                    ? booking.totalPrice 
                                    : parseFloat(String(booking.totalPrice || '0'))).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            {booking.specialRequest && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Special Request: </span>
                                <span>{booking.specialRequest}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                              booking.status === 'CONFIRMED' ? 'bg-primary/10 text-primary' :
                              booking.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-600' :
                              booking.status === 'COMPLETED' ? 'bg-green-500/10 text-green-600' :
                              'bg-destructive/10 text-destructive'
                            }`}>
                              {booking.status}
                            </span>
                            {booking.createdAt && (
                              <span className="text-xs text-muted-foreground">
                                Created: {new Date(booking.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {userBookings.totalPages > 1 && (
                      <p className="text-sm text-muted-foreground text-center">
                        Showing {userBookings.content.length} of {userBookings.totalElements} bookings
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground border rounded-lg">
                    No bookings found for this user
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
