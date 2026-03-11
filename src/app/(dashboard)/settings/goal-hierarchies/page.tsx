"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Plus,
  GitBranch,
  ChevronRight,
  Loader2,
  Search,
  Archive,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Badge,
  Breadcrumb,
} from "@/components/ui";

interface GoalHierarchy {
  id: string;
  name: string;
  description: string | null;
  templateTypes: string[];
  isActive: boolean;
  _count?: {
    goalAreas: number;
  };
}

export default function GoalHierarchiesPage() {
  const [hierarchies, setHierarchies] = React.useState<GoalHierarchy[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showInactive, setShowInactive] = React.useState(false);

  const fetchHierarchies = React.useCallback(async () => {
    try {
      const response = await fetch("/api/goal-hierarchies");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setHierarchies(data.hierarchies || []);
    } catch (error) {
      console.error("Error fetching hierarchies:", error);
      toast.error("Failed to load goal hierarchies");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchHierarchies();
  }, [fetchHierarchies]);

  const handleDelete = async (hierarchy: GoalHierarchy) => {
    if (!confirm(`Are you sure you want to archive "${hierarchy.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/goal-hierarchies/${hierarchy.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Goal hierarchy archived");
      fetchHierarchies();
    } catch (error) {
      console.error("Error deleting hierarchy:", error);
      toast.error("Failed to archive goal hierarchy");
    }
  };

  const filteredHierarchies = hierarchies.filter((h) => {
    if (!showInactive && !h.isActive) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        h.name.toLowerCase().includes(query) ||
        h.description?.toLowerCase().includes(query) ||
        h.templateTypes.some((t) => t.toLowerCase().includes(query))
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb
            items={[
              { label: "Settings", href: "/settings" },
              { label: "Goal Hierarchies" },
            ]}
          />
          <h1 className="text-2xl font-bold mt-2">Goal Hierarchies</h1>
          <p className="text-muted-foreground mt-1">
            Manage cascading goal selections for care plans and treatment plans
          </p>
        </div>
        <Button asChild>
          <Link href="/settings/goal-hierarchies/new">
            <Plus className="h-4 w-4 mr-2" />
            New Hierarchy
          </Link>
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hierarchies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-gray-300"
          />
          Show archived
        </label>
      </div>

      {/* Hierarchies list */}
      {filteredHierarchies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No goal hierarchies found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchQuery
                ? "No hierarchies match your search. Try a different query."
                : "Create a goal hierarchy to define cascading goal selections for your care plans."}
            </p>
            {!searchQuery && (
              <Button asChild className="mt-4">
                <Link href="/settings/goal-hierarchies/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Hierarchy
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredHierarchies.map((hierarchy) => (
            <Card
              key={hierarchy.id}
              className={!hierarchy.isActive ? "opacity-60" : ""}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <GitBranch className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/settings/goal-hierarchies/${hierarchy.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {hierarchy.name}
                        </Link>
                        {!hierarchy.isActive && (
                          <Badge variant="warning">Archived</Badge>
                        )}
                      </div>
                      {hierarchy.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {hierarchy.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          {hierarchy.templateTypes.map((type) => (
                            <Badge key={type} variant="info" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                        {hierarchy._count && (
                          <span className="text-xs text-muted-foreground">
                            {hierarchy._count.goalAreas} goal areas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/settings/goal-hierarchies/${hierarchy.id}`}>
                        View
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(hierarchy)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
