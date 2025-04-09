"use client";

import * as React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ServiceType, Service } from "~/types/services";

export interface AddServiceButtonProps {
  /** Callback function when a service is selected */
  onServiceSelect?: (serviceId: string) => void;
  /** Callback function when adding a new account to existing service */
  onAddAccount?: (serviceId: string) => void;
  /** List of available services to display */
  availableServices?: Service[];
  /** Currently active services */
  activeServices?: string[];
  /** Whether authentication is in progress */
  isAuthenticating?: boolean;
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
  isAuthenticating = false,
}: AddServiceButtonProps) {
  // State for dialog
  const [isOpen, setIsOpen] = React.useState(false);

  // Memoize handlers to prevent unnecessary re-renders
  const handleOpenDialog = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleCloseDialog = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelect = React.useCallback(
    (serviceId: string) => {
      onServiceSelect?.(serviceId);
      setIsOpen(false);
    },
    [onServiceSelect],
  );

  const handleAddAccount = React.useCallback(
    (serviceId: string) => {
      onAddAccount?.(serviceId);
      setIsOpen(false);
    },
    [onAddAccount],
  );

  // Memoize filtered services to prevent recalculation on every render
  const { newServices, connectedServices } = React.useMemo(() => {
    // Filter available services to only show those not yet connected
    const newServices = availableServices.filter(
      (service) => !activeServices.includes(service.id),
    );

    // Services that are already connected but can have additional accounts
    const connectedServices = availableServices.filter((service) =>
      activeServices.includes(service.id),
    );

    return { newServices, connectedServices };
  }, [availableServices, activeServices]);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={handleOpenDialog}
        title="Add cloud storage service"
      >
        <PlusCircle className="h-4 w-4" />
        <span className="sr-only">Add cloud storage service</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Cloud Storage</DialogTitle>
            <DialogDescription>
              Connect to your cloud storage services
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {newServices.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium dark:text-gray-200">
                  Add New Service
                </h3>
                <div className="space-y-2">
                  {newServices.map((service) => (
                    <Button
                      key={service.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleSelect(service.id)}
                    >
                      {service.icon && (
                        <span className="mr-2 flex h-4 w-4 items-center justify-center">
                          {service.icon}
                        </span>
                      )}
                      <span>{service.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {connectedServices.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium dark:text-gray-200">
                  Add Another Account
                </h3>
                <div className="space-y-2">
                  {connectedServices.map((service) => (
                    <Button
                      key={`add-${service.id}`}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleAddAccount(service.id)}
                      disabled={isAuthenticating}
                    >
                      {service.icon && (
                        <span className="mr-2 flex h-4 w-4 items-center justify-center">
                          {service.icon}
                        </span>
                      )}
                      <span>Another {service.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
