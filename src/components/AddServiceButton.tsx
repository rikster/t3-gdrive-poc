"use client";

import * as React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Service {
  id: string;
  name: string;
  icon?: React.ReactNode;
}

export interface AddServiceButtonProps {
  /** Callback function when a service is selected */
  onServiceSelect?: (serviceId: string) => void;
  /** List of available services to display */
  availableServices?: Service[];
}

const defaultServices: Service[] = [
  { id: "onedrive", name: "OneDrive" },
  { id: "dropbox", name: "Dropbox" },
  { id: "box", name: "Box" },
  { id: "sugarsync", name: "SugarSync" },
];

export function AddServiceButton({
  onServiceSelect,
  availableServices = defaultServices,
}: AddServiceButtonProps) {
  const handleSelect = React.useCallback(
    (serviceId: string) => {
      onServiceSelect?.(serviceId);
    },
    [onServiceSelect]
  );

  return (
    <div className="relative inline-block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only">Add cloud storage service</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-[200px]">
          {availableServices.map((service) => (
            <DropdownMenuItem
              key={service.id}
              onClick={() => handleSelect(service.id)}
            >
              {service.icon && (
                <span className="mr-2 flex h-4 w-4 items-center justify-center">
                  {service.icon}
                </span>
              )}
              <span>{service.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
