import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Building2,
  Plus,
  MapPin,
  Home,
  DollarSign,
  Search,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { mockProperties, type Property } from "./mock-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useEffect } from "react";
import { getDashboardSummary } from "../lib/services/dashboard";
import {
  createProperty,
  getProperties,
  deleteProperty,
  updateProperty,
} from "../lib/services/properties";

export function PropertiesView() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    property_type: "apartment" as "apartment" | "house" | "commercial",
    country: "Kenya",
    city: "",
    area: "",
    address: "",
    notes: "",
    number_of_units: "", // keep as string for input
    default_rent: "",
    default_deposit: "",
    unit_code_prefix: "A",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    property_type: "apartment" as "apartment" | "house" | "commercial",
    country: "Kenya",
    city: "",
    area: "",
    address: "",
    notes: "",
    number_of_units: "", // keep string for inputs
    default_rent: "",
    default_deposit: "",
    unit_code_prefix: "A",
  });

  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );

  const openEditDialog = (property: any) => {
    setEditError(null);
    setSelectedProperty(property);

    setEditForm({
      id: String(property.id),
      name: property.name || "",
      property_type: (property.property_type || "apartment") as any,
      country: property.country || "Kenya",
      city: property.city || "",
      area: property.area || "",
      address: property.address || "",
      notes: property.notes || "",

      // ✅ editing won't auto-create units by default
      number_of_units: "",
      default_rent: "",
      default_deposit: "",
      unit_code_prefix: "A",
    });

    setIsEditDialogOpen(true);
  };

  useEffect(() => {
    (async () => {
      const s = await getDashboardSummary();
      setSummary(s);
      console.log("Dashboard summary:", s);
      const props = await getProperties();
      setProperties(props.properties ?? props);
    })();
  }, []);

  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalUnits = summary?.totals?.units ?? 0;
  const totalOccupied = summary?.totals?.occupied_units ?? 0;
  const totalRevenue = properties.reduce((sum, p) => sum + p.total_rent, 0); //we'll keep mock data for now, but ideally this should come from the summary API

  const handleAddProperty = async () => {
    setFormError(null);

    // basic validation
    if (!form.name.trim()) {
      setFormError("Property name is required.");
      return;
    }

    const unitsNum =
      form.number_of_units.trim() === "" ? null : Number(form.number_of_units);

    if (unitsNum !== null) {
      if (!Number.isFinite(unitsNum) || unitsNum <= 0) {
        setFormError("Number of units must be greater than 0.");
        return;
      }
      if (form.default_rent.trim() === "" || Number(form.default_rent) <= 0) {
        setFormError(
          "Default rent is required when number of units is provided.",
        );
        return;
      }
    }

    const payload: any = {
      name: form.name.trim(),
      property_type: form.property_type,
      country: form.country.trim() || "Kenya",
      city: form.city.trim() || undefined,
      area: form.area.trim() || undefined,
      address: form.address.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    if (unitsNum !== null) {
      payload.number_of_units = unitsNum;
      payload.default_rent = Number(form.default_rent);
      if (form.default_deposit.trim() !== "") {
        payload.default_deposit = Number(form.default_deposit);
      }
      if (form.unit_code_prefix.trim() !== "") {
        payload.unit_code_prefix = form.unit_code_prefix.trim();
      }
    }

    try {
      setSaving(true);
      await createProperty(payload);

      // refresh list (simple approach)
      const updated = await getProperties();
      setProperties(updated.properties ?? updated); // depends on your backend response shape

      setIsAddDialogOpen(false);
    } catch (e: any) {
      setFormError(e?.message ?? "Failed to create property.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditProperty = async () => {
    setEditError(null);

    if (!editForm.name.trim()) {
      setEditError("Property name is required.");
      return;
    }

    // Optional: allow adding new units during edit
    const unitsNum =
      editForm.number_of_units.trim() === ""
        ? null
        : Number(editForm.number_of_units);

    if (unitsNum !== null) {
      if (!Number.isFinite(unitsNum) || unitsNum <= 0) {
        setEditError("Number of units must be greater than 0.");
        return;
      }
      if (
        editForm.default_rent.trim() === "" ||
        Number(editForm.default_rent) <= 0
      ) {
        setEditError(
          "Default rent is required when number of units is provided.",
        );
        return;
      }
    }

    const payload: any = {
      name: editForm.name.trim(),
      property_type: editForm.property_type,
      country: editForm.country.trim() || "Kenya",
      city: editForm.city.trim() || undefined,
      area: editForm.area.trim() || undefined,
      address: editForm.address.trim() || undefined,
      notes: editForm.notes.trim() || undefined,
    };

    // If your backend supports adding units on update, include these.
    // If not supported, remove this block.
    if (unitsNum !== null) {
      payload.number_of_units = unitsNum;
      payload.default_rent = Number(editForm.default_rent);
      if (editForm.default_deposit.trim() !== "") {
        payload.default_deposit = Number(editForm.default_deposit);
      }
      if (editForm.unit_code_prefix.trim() !== "") {
        payload.unit_code_prefix = editForm.unit_code_prefix.trim();
      }
    }

    try {
      setEditSaving(true);
      await updateProperty(editForm.id, payload);

      // refresh list
      const updated = await getProperties();
      setProperties(updated.properties ?? updated);

      setIsEditDialogOpen(false);
      setSelectedProperty(null);
    } catch (e: any) {
      setEditError(e?.message ?? "Failed to update property.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteProperty = (id: string) => {
    deleteProperty(id);
    setProperties(properties.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Properties</h1>
          <p className="text-muted-foreground">
            Manage your property portfolio
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Property</DialogTitle>
              <DialogDescription>
                Enter the details of your new property
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {/* Property Name (required) */}
              <div className="space-y-2">
                <Label htmlFor="name">Property Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Sunset Apartments"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type</Label>
                <Select
                  value={form.property_type}
                  onValueChange={(value) =>
                    setForm((p) => ({ ...p, property_type: value as any }))
                  }
                >
                  <SelectTrigger id="property_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="Kenya"
                    value={form.country}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, country: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Nairobi"
                    value={form.city}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, city: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="area">Area</Label>
                  <Input
                    id="area"
                    placeholder="e.g., Westlands"
                    value={form.area}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, area: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="e.g., Plot 123, Main Road"
                    value={form.address}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, address: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  placeholder="Any extra info about the property..."
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                />
              </div>

              {/* Unit auto-create */}
              <div className="space-y-2">
                <Label htmlFor="number_of_units">
                  Number of Units (optional)
                </Label>
                <Input
                  id="number_of_units"
                  type="number"
                  min={1}
                  placeholder="e.g., 12"
                  value={form.number_of_units}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, number_of_units: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  If you enter units, the backend can auto-create units using
                  default rent.
                </p>
              </div>

              {/* Only show these if number_of_units is provided */}
              {form.number_of_units.trim() !== "" && (
                <div className="space-y-4 rounded-lg border p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="default_rent">
                        Default Rent (required)
                      </Label>
                      <Input
                        id="default_rent"
                        type="number"
                        min={1}
                        placeholder="e.g., 25000"
                        value={form.default_rent}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            default_rent: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default_deposit">
                        Default Deposit (optional)
                      </Label>
                      <Input
                        id="default_deposit"
                        type="number"
                        min={0}
                        placeholder="e.g., 25000"
                        value={form.default_deposit}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            default_deposit: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit_code_prefix">
                      Unit Code Prefix (optional)
                    </Label>
                    <Input
                      id="unit_code_prefix"
                      placeholder="A"
                      value={form.unit_code_prefix}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          unit_code_prefix: e.target.value,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Example: prefix A → A-001, A-002 ... (depending on your
                      backend logic)
                    </p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleAddProperty} disabled={saving}>
                {saving ? "Saving..." : "Add Property"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* edit dialod */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>Update the property details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {editError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {editError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit_name">Property Name</Label>
              <Input
                id="edit_name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_property_type">Property Type</Label>
              <Select
                value={editForm.property_type}
                onValueChange={(value) =>
                  setEditForm((p) => ({ ...p, property_type: value as any }))
                }
              >
                <SelectTrigger id="edit_property_type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit_country">Country</Label>
                <Input
                  id="edit_country"
                  value={editForm.country}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, country: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_city">City</Label>
                <Input
                  id="edit_city"
                  value={editForm.city}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, city: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit_area">Area</Label>
                <Input
                  id="edit_area"
                  value={editForm.area}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, area: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_address">Address</Label>
                <Input
                  id="edit_address"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_notes">Notes (optional)</Label>
              <Input
                id="edit_notes"
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </div>

            {/* Optional: add units during edit (only if your backend supports it) */}
            <div className="space-y-2">
              <Label htmlFor="edit_number_of_units">Add Units (optional)</Label>
              <Input
                id="edit_number_of_units"
                type="number"
                min={1}
                value={editForm.number_of_units}
                onChange={(e) =>
                  setEditForm((p) => ({
                    ...p,
                    number_of_units: e.target.value,
                  }))
                }
              />
            </div>

            {editForm.number_of_units.trim() !== "" && (
              <div className="space-y-4 rounded-lg border p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit_default_rent">
                      Default Rent (required)
                    </Label>
                    <Input
                      id="edit_default_rent"
                      type="number"
                      min={1}
                      value={editForm.default_rent}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          default_rent: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_default_deposit">
                      Default Deposit (optional)
                    </Label>
                    <Input
                      id="edit_default_deposit"
                      type="number"
                      min={0}
                      value={editForm.default_deposit}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          default_deposit: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_unit_code_prefix">
                    Unit Code Prefix (optional)
                  </Label>
                  <Input
                    id="edit_unit_code_prefix"
                    value={editForm.unit_code_prefix}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        unit_code_prefix: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={editSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleEditProperty} disabled={editSaving}>
              {editSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Properties</CardTitle>
            <Building2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{properties.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Units</CardTitle>
            <Home className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              {totalOccupied} occupied
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">per month</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProperties.map((property) => {
          const occupancyRate = Math.round(
            (property.occupied_units / property.units) * 100,
          );

          return (
            <Card key={property.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{property.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <MapPin className="size-3" />
                      {property.location}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => openEditDialog(property)}
                      >
                        <Edit className="size-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteProperty(property.id)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="outline">{property.type}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Units</span>
                  <span>
                    {property.occupied_units} / {property.units}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span>{occupancyRate}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 transition-all"
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">
                    Monthly Revenue
                  </span>
                  {/* <span className="text-lg">
                    ${property.total_rent.toLocaleString()}
                  </span> */}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProperties.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No properties found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
