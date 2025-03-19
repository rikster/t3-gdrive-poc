"use client";

import * as React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type ServiceType } from "~/lib/session";

export interface Service {
  id: string;
  name: string;
  icon?: React.ReactNode;
}

export interface AddServiceButtonProps {
  /** Callback function when a service is selected */
  onServiceSelect?: (serviceId: string) => void;
  /** Callback function when adding a new account to existing service */
  onAddAccount?: (serviceId: string) => void;
  /** List of available services to display */
  availableServices?: Service[];
  /** Currently active services */
  activeServices?: string[];
}

const defaultServices: Service[] = [
  { id: "google", name: "Google Drive" },
  { id: "onedrive", name: "OneDrive" },
  { id: "dropbox", name: "Dropbox" },
];

export function AddServiceButton({
  onServiceSelect,
  onAddAccount,
  availableServices = defaultServices,
  activeServices = [],
}: AddServiceButtonProps) {
  const handleSelect = React.useCallback(
    (serviceId: string) => {
      onServiceSelect?.(serviceId);
    },
    [onServiceSelect],
  );

  const handleAddAccount = React.useCallback(
    (serviceId: string) => {
      onAddAccount?.(serviceId);
    },
    [onAddAccount],
  );

  // Filter available services to only show those not yet connected
  const newServices = availableServices.filter(
    (service) => !activeServices.includes(service.id),
  );

  // Services that are already connected but can have additional accounts
  const connectedServices = availableServices.filter((service) =>
    activeServices.includes(service.id),
  );

  return (
    <div className="relative inline-block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only">Add cloud storage service</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-[200px]">
          {newServices.length > 0 && (
            <>
              <DropdownMenuLabel>Add New Service</DropdownMenuLabel>
              {newServices.map((service) => (
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
            </>
          )}

          {newServices.length > 0 && connectedServices.length > 0 && (
            <DropdownMenuSeparator />
          )}

          {connectedServices.length > 0 && (
            <>
              <DropdownMenuLabel>Add Another Account</DropdownMenuLabel>
              {connectedServices.map((service) => (
                <DropdownMenuItem
                  key={`add-${service.id}`}
                  onClick={() => handleAddAccount(service.id)}
                >
                  {service.icon && (
                    <span className="mr-2 flex h-4 w-4 items-center justify-center">
                      {service.icon}
                    </span>
                  )}
                  <span>Another {service.name}</span>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
