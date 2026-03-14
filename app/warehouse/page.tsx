'use client'

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";


function Card({ loc, isOverlay }: { loc: any; isOverlay?: boolean }) {
  return (
    <div className={`bg-white border rounded-lg p-4 shadow-sm transition-all ${
      isOverlay ? "border-blue-500 shadow-lg scale-105 cursor-grabbing" : "border-gray-200 hover:shadow-md cursor-grab"
    }`}>
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-gray-800 text-sm">{loc.name}</span>
        {isOverlay && <span className="text-xs text-blue-600 font-medium animate-pulse">Moving</span>}
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div 
          className="h-full rounded-full transition-all duration-700" 
          style={{ width: `${loc.pct_utilized}%`, backgroundColor: loc.color }} 
        />
      </div>
      <div className="text-xs text-gray-500">{loc.pct_utilized}% utilized</div>
    </div>
  );
}

function DraggableCard({ loc }: { loc: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: loc.id });
  const style = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card loc={loc} />
    </div>
  );
}

function DroppableZone({ id, children }: any) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`rounded-lg transition-all p-1 ${isOver ? "bg-blue-50 ring-2 ring-blue-300 ring-dashed" : ""}`}>
      {children}
    </div>
  );
}

// --- Main Component ---

export default function WarehouseMap() {
  const [locations, setLocations] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [movement, setMovement] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  async function fetchWarehouses() {
    setLoading(true);
    const { data } = await supabase.from("warehouses").select("*").order("id");
    setLocations(data || []);
    setLoading(false);
  }

  const activeLocation = locations.find((l) => l.id === activeId);

  function handleDragStart(event: any) {
    setActiveId(event.active.id);
  }

  async function handleDragEnd(event: any) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const from = locations.find((l) => l.id === active.id);
    const to = locations.find((l) => l.id === over.id);

    if (from && to) {
      setMovement(`${from.name} → ${to.name}`);
      
      // OPTIONAL: Log this transfer in your internal_transfers table
      // In a real app, you'd likely open a modal here to ask "Which product and how much?"
      // For now, we'll just simulate the UI feedback.
      
      setTimeout(() => setMovement(null), 3000);
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Warehouse Map</h1>
        <button onClick={fetchWarehouses} className="text-xs text-gray-500 hover:text-black">
          {loading ? "Updating..." : "Refresh Status"}
        </button>
      </div>

      <div className="h-12 mb-4">
        {movement ? (
          <div className="flex items-center justify-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 py-2 rounded-md animate-in fade-in zoom-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Stock Transfer: <span className="font-bold">{movement}</span>
          </div>
        ) : (
          <div className="text-center text-sm text-gray-400 border border-dashed border-gray-200 py-2 rounded-md">
            Drag a location card onto another to initiate a stock transfer
          </div>
        )}
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {locations.map((loc) => (
            <DroppableZone key={loc.id} id={loc.id}>
              <DraggableCard loc={loc} />
            </DroppableZone>
          ))}
        </div>

        <DragOverlay>
          {activeId && activeLocation ? (
            <Card loc={activeLocation} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}